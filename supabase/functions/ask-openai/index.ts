import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.0.0'
import dbSchema from './schema.json' with { type: "json" }

// Configuration améliorée GPT-4o mini
const AI_CONFIG = {
  models: ["gpt-4o-mini", "gpt-3.5-turbo"],
  maxRetries: 2,
  retryDelay: 1000
}

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!
})
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Fonction helper pour exécuter des requêtes SQL sécurisées
async function executeSafeQuery(query: string) {
  const logs: string[] = [];
  
  logs.push(`🔍 SQL reçu: ${query}`);

  const forbiddenKeywords = [
    'INSERT', 'UPDATE', 'DELETE', 
    'DROP', 'ALTER', 'GRANT', 
    'REVOKE', 'TRUNCATE', 'CREATE'
  ];

  if (forbiddenKeywords.some(keyword => query.toUpperCase().includes(keyword))) {
    logs.push("❌ Requête non autorisée détectée");
    throw new Error(`Requête non autorisée: contient ${forbiddenKeywords.join(', ')}`);
  }

  // Nettoyer le query
  const cleanQuery = query
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/;$/g, '')
    .trim();

  logs.push(`🧹 SQL nettoyé: ${cleanQuery}`);

  // Vérification que c'est bien une requête SELECT
  if (!cleanQuery.toUpperCase().startsWith('SELECT')) {
    logs.push("❌ Ce n'est pas une requête SELECT");
    throw new Error("Seules les requêtes SELECT sont autorisées");
  }

  logs.push("🚀 Exécution de la requête via RPC...");

  try {
    const { data, error } = await supabase.rpc('execute_sql', { query: cleanQuery });
    
    if (error) {
      logs.push(`❌ Erreur RPC: ${error.message}`);
      throw error;
    }

    logs.push("✅ Requête exécutée avec succès");
    logs.push(`📊 Nombre de résultats: ${Array.isArray(data) ? data.length : 'N/A'}`);
    
    return { data, logs };

  } catch (error: any) {
    logs.push(`💥 Erreur d'exécution: ${error.message}`);
    throw { message: error.message, logs };
  }
}

// Génération de SQL avec fallback
async function generateSQL(prompt: string) {
  const logs: string[] = [];
  
  for (const model of AI_CONFIG.models) {
    for (let attempt = 1; attempt <= AI_CONFIG.maxRetries; attempt++) {
      try {
        logs.push(`🔄 Tentative ${attempt} avec ${model}...`);
        
        const response = await openai.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 1000
        })

        let sql = response.choices[0]?.message?.content?.trim()
        if (sql) {
          sql = sql.replace(/^```sql|```$/g, '').trim()
          logs.push(`✅ SQL généré avec ${model}: ${sql}`);
          return { sql, modelUsed: model, logs }
        }
      } catch (error: any) {
        logs.push(`❌ Erreur avec ${model}: ${error.message}`);
        if (attempt < AI_CONFIG.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, AI_CONFIG.retryDelay))
        }
      }
    }
  }
  
  logs.push("💥 Tous les modèles AI ont échoué");
  throw new Error("Tous les modèles AI ont échoué après plusieurs tentatives");
}

// Génération de réponse humaine
async function generateHumanResponse(question: string, sql: string, data: any) {
  try {
    const prompt = `
      Transforme cette réponse technique en une réponse naturelle pour un humain.

      Question: "${question}"
      Requête SQL: ${sql}
      Résultats: ${JSON.stringify(data)}

      Règles:
      1. Sois concis (1-2 phrases maximum)
      2. Utilise un langage naturel
      3. Mets en valeur les chiffres importants
      4. Adapte le ton à la question

      Réponse:
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 150
    })

    return response.choices[0]?.message?.content?.trim() || "Voici les informations demandées."
  } catch (error: any) {
    return "Je n'ai pas pu formuler la réponse."
  }
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const executionLogs: string[] = [];
  const startTime = Date.now();

  try {
    executionLogs.push("📨 Requête reçue");
    
    const body = await req.json();
    const { question } = body;
    
    executionLogs.push(`❓ Question: ${question}`);

    if (!question) {
      executionLogs.push("❌ Question manquante");
      throw new Error("Le paramètre 'question' est requis");
    }

    // Prompt optimisé pour génération SQL
    const sqlPrompt = `
      Question: "${question}"
      Schéma: ${JSON.stringify({
        tables: (dbSchema as any).tables || {},
        relationships: (dbSchema as any).relationships || {}
      })}
      Règles:
      1. ${(dbSchema as any).gpt_instructions?.security || 'Seules les requêtes SELECT sont autorisées'}
      2. NE PAS METTRE de point-virgule (;) à la fin
      3. Exemples: 
         - ${(dbSchema as any).gpt_instructions?.examples?.requete_nutrition || 'SELECT * FROM nutrition_records'}
         - ${(dbSchema as any).gpt_instructions?.examples?.requete_scolarisation || 'SELECT * FROM children'}

      Génère UNIQUEMENT la requête SQL compatible PostgreSQL 15.
      Format: SELECT... FROM... [WHERE...]
    `

    executionLogs.push("🤖 Génération du SQL...");
    const { sql: sqlQuery, modelUsed, logs: genLogs } = await generateSQL(sqlPrompt);
    executionLogs.push(...genLogs);

    executionLogs.push("⚡ Exécution de la requête...");
    const { data, logs: execLogs } = await executeSafeQuery(sqlQuery);
    executionLogs.push(...execLogs);

    executionLogs.push("💬 Génération de la réponse humaine...");
    const humanAnswer = await generateHumanResponse(question, sqlQuery, data);

    const executionTime = Date.now() - startTime;
    executionLogs.push(`⏱️ Temps d'exécution total: ${executionTime}ms`);

    return new Response(JSON.stringify({ 
      success: true,
      question,
      answer: humanAnswer,
      technical_details: {
        sql_generated: sqlQuery.replace(/\\n/g, ' ').replace(/\s+/g, ' ').replace(/;$/g, '').trim(),
        model_used: modelUsed,
        raw_data: data,
        execution_time_ms: executionTime,
        timestamp: new Date().toISOString()
      },
      logs: executionLogs,
      debug: {
        cleaned_sql: sqlQuery.replace(/\\n/g, ' ').replace(/\s+/g, ' ').replace(/;$/g, '').trim()
      }
    }), { 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 200
    })

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    executionLogs.push(`💥 Erreur attrapée: ${error.message}`);
    executionLogs.push(`⏱️ Temps avant erreur: ${executionTime}ms`);

    if (error.logs) {
      executionLogs.push(...error.logs);
    }

    return new Response(JSON.stringify({ 
      success: false,
      error: "Erreur de traitement",
      details: error.message,
      logs: executionLogs,
      execution_time_ms: executionTime,
      timestamp: new Date().toISOString(),
      suggestion: "Vérifiez la syntaxe SQL ou contactez le support"
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      } 
    })
  }
})