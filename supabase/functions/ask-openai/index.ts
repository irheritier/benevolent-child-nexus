import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.0.0'
import dbSchema from './schema.json' assert { type: "json" }

// Configuration améliorée GPT-4o mini heirweapon@gmail.com fraternell@centre.cd


const AI_CONFIG = {
  models: ["gpt-4o-mini", "gpt-3.5-turbo"],
  maxRetries: 2,
  retryDelay: 1000
}

const openai = new OpenAI(Deno.env.get('OPENAI_API_KEY')!)
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

  } catch (error) {
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
      } catch (error) {
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
  } catch (error) {
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
        tables: dbSchema.tables,
        relationships: dbSchema.relationships
      })}
      Règles:
      1. ${dbSchema.gpt_instructions.security}
      2. NE PAS METTRE de point-virgule (;) à la fin
      3. Exemples: 
         - ${dbSchema.gpt_instructions.examples.requete_nutrition}
         - ${dbSchema.gpt_instructions.examples.requete_scolarisation}

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

  } catch (error) {
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


// RESEND : re_gbBpDxdG_F2KzomRCHqtDAx8J5D7hTgEk

// Twilio Account SID : AC066140a60ecd813c9d85f70654bdd7d4
// TWILIO_AUTH_TOKEN : 3ba941e3585061a79211e84476ddd6d3
// TWILIO_PHONE_NUMBER : +243 842 354 044	


// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// import OpenAI from 'https://esm.sh/openai@4.0.0'
// import dbSchema from './schema.json' assert { type: "json" }

// // Configuration améliorée GPT-4o mini
// const AI_CONFIG = {
//   models: ["gpt-4o-mini", "gpt-3.5-turbo"],
//   maxRetries: 2,
//   retryDelay: 1000
// }

// const openai = new OpenAI(Deno.env.get('OPENAI_API_KEY')!)
// const supabase = createClient(
//   Deno.env.get('SUPABASE_URL')!,
//   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
// )

// // Fonction helper pour exécuter des requêtes SQL sécurisées
// async function executeSafeQuery(query: string) {

//   const forbiddenKeywords = [
//     'INSERT', 'UPDATE', 'DELETE', 
//     'DROP', 'ALTER', 'GRANT', 
//     'REVOKE', 'TRUNCATE', 'CREATE'
//   ]

//   if (forbiddenKeywords.some(keyword => query.toUpperCase().includes(keyword))) {
//     throw new Error(`Requête non autorisée: contient ${forbiddenKeywords.join(', ')}`)
//   }

//   // Nettoyer le query des \n, espaces multiples et point-virgule final
//   const cleanQuery = query.replace(/\\n/g, ' ').replace(/\s+/g, ' ').replace(/;$/g, '').trim();

//   // Vérification que c'est bien une requête SELECT
//   if (!cleanQuery.toUpperCase().startsWith('SELECT')) {
//     throw new Error("Seules les requêtes SELECT sont autorisées")
//   }

//   // Exécution directe via RPC avec la requête nettoyée


//   const { data, error } = await supabase.rpc('execute_sql', { query: cleanQuery })
//   if (error) throw "ICI "+error

//   return { data }

// }



// // Génération de SQL avec fallback
// async function generateSQL(prompt: string) {
//   for (const model of AI_CONFIG.models) {
//     for (let attempt = 1; attempt <= AI_CONFIG.maxRetries; attempt++) {
//       try {
//         const response = await openai.chat.completions.create({
//           model,
//           messages: [{ role: "user", content: prompt }],
//           temperature: 0.1,
//           max_tokens: 1000
//         })

//         let sql = response.choices[0]?.message?.content?.trim()
//         if (sql) {
//           sql = sql.replace(/^```sql|```$/g, '').trim()
//           return { sql, modelUsed: model }
//         }
//       } catch (error) {
//         console.error(`Tentative ${attempt} avec ${model} échouée:`, error.message)
//         if (attempt < AI_CONFIG.maxRetries) {
//           await new Promise(resolve => setTimeout(resolve, AI_CONFIG.retryDelay))
//         }
//       }
//     }
//   }
//   throw new Error("Tous les modèles AI ont échoué après plusieurs tentatives")
// }

// // Génération de réponse humaine
// async function generateHumanResponse(question: string, sql: string, data: any) {
//   try {

//     const prompt = `
//       Transforme cette réponse technique en une réponse naturelle pour un humain.

//       Question: "${question}"
//       Requête SQL: ${sql}
//       Résultats: ${JSON.stringify(data)}

//       Règles:
//       1. Sois concis (1-2 phrases maximum)
//       2. Utilise un langage naturel
//       3. Mets en valeur les chiffres importants
//       4. Adapte le ton à la question

//       Réponse:
//     `

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.3,
//       max_tokens: 150
//     })

//     return response.choices[0]?.message?.content?.trim() || "Voici les informations demandées."
//   } catch (error) {
//     console.error("Erreur génération réponse humaine:", error)
//     return "Je n'ai pas pu formuler la réponse."
//   }
// }

// serve(async (req) => {
//   // Gestion CORS améliorée

//   const corsHeaders = {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-info, *', // Permet tous les headers
//     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//     'Access-Control-Max-Age': '86400', // 24 hours
//   };

//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }
  

//   try {
//     const { question } = await req.json()
    
//     // Prompt optimisé pour génération SQL
//     const sqlPrompt = `
//       Question: "${question}"
//       Schéma: ${JSON.stringify({
//         tables: dbSchema.tables,
//         relationships: dbSchema.relationships
//       })}
//       Règles:
//       1. ${dbSchema.gpt_instructions.security}
//       2. Exemples: 
//          - ${dbSchema.gpt_instructions.examples.requete_nutrition}
//          - ${dbSchema.gpt_instructions.examples.requete_scolarisation}

//       Génère UNIQUEMENT la requête SQL compatible PostgreSQL 15.
//       Format attendu: SELECT... FROM... JOIN... WHERE...
//     `

//     // Génération et exécution SQL
//     const { sql: sqlQuery, modelUsed } = await generateSQL(sqlPrompt)
//     const { data } = await executeSafeQuery(sqlQuery)

//     // Génération réponse humaine
//     const humanAnswer = await generateHumanResponse(question, sqlQuery, data)

//       return new Response(JSON.stringify({ 
//         question,
//         answer: humanAnswer,
//         technical_details: {
//           sql_generated: sqlQuery.replace(/\\n/g, ' ').replace(/\s+/g, ' ').replace(/;$/g, '').trim(),
//           model_used: modelUsed,
//           raw_data: data,
//           timestamp: new Date().toISOString()
//         }
//       }), { 
//         headers: { 
//           'Content-Type': 'application/json',
//           ...corsHeaders // ← Ajoute les headers CORS ici aussi
//         } 
//       })

//   } catch (error) {
//     console.error('Error:', error)
//     return new Response(JSON.stringify({ 
//       error: "Erreur de traitement",
//       details: process.env.DENO_ENV === "development" ? error.message : undefined,
//       suggestion: "Vérifiez la syntaxe SQL ou contactez le support"
//     }), { 
//       status: 500,
//       headers: { 
//         'Content-Type': 'application/json',
//         ...corsHeaders // ← Et ici pour les erreurs aussi
//       } 

//     })
//   }
// })

// /* To invoke locally:

//   1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
//   2. Make an HTTP request:

//   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ask-openai' \
//     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//     --header 'Content-Type: application/json' \
//     --data '{"name":"Functions"}'

//     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

// */


// // gpt-4 

// // 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

// // new : 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

// //  new :  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

// // deepseek : sk-a3df0fc551844beaa5c584ccfc3d08b2
// // deepseek heirweapon : sk-b5d65675bd124f2b890ebbeb69e65d52
