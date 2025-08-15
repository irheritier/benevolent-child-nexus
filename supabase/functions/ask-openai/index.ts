// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// import OpenAI from 'https://esm.sh/openai@4.0.0'
// import dbSchema from './schema.json' assert { type: "json" }

// // Configuration améliorée
// const AI_CONFIG = {
//   models: ["gpt-4o", "gpt-3.5-turbo"], // Modèles à essayer dans l'ordre
//   maxRetries: 2,
//   retryDelay: 1000 // 1 seconde
// }

// const openai = new OpenAI(Deno.env.get('OPENAI_API_KEY')!)
// const supabase = createClient(
//   Deno.env.get('SUPABASE_URL')!,
//   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
// )

// // Fonction helper pour exécuter des requêtes SQL sécurisées
// async function executeSafeQuery(query: string) {
//   // Validation de sécurité renforcée
//   const forbiddenKeywords = [
//     'INSERT', 'UPDATE', 'DELETE', 
//     'DROP', 'ALTER', 'GRANT', 
//     'REVOKE', 'TRUNCATE', 'CREATE'
//   ]
  
//   if (forbiddenKeywords.some(keyword => query.toUpperCase().includes(keyword))) {
//     throw new Error(`Requête non autorisée: contient ${forbiddenKeywords.join(', ')}`)
//   }

//   // Détection du type de requête
//   const isSelectQuery = query.trim().toUpperCase().startsWith('SELECT')
//   const tableMatch = query.match(/FROM\s+([a-z_]+)/i)

//   if (isSelectQuery && tableMatch) {
//     // Utilisation du client Supabase pour les SELECT simples
//     const table = tableMatch[1]
//     return await supabase.from(table).select('*')
//   }

//   // Fallback pour les requêtes complexes
//   const { data, error } = await supabase.rpc('execute_sql', { query })
//   if (error) throw error
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
//           // Nettoyage du SQL
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

// serve(async (req) => {
//   // Gestion CORS
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { 
//       headers: { 
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'POST',
//         'Access-Control-Allow-Headers': 'Content-Type' 
//       } 
//     })
//   }

//   try {
//     const { question } = await req.json()
    
//     // Prompt optimisé
//     const prompt = `
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

//     // Génération et exécution
//     const { sql: sqlQuery, modelUsed } = await generateSQL(prompt)
//     const { data } = await executeSafeQuery(sqlQuery)

//     return new Response(JSON.stringify({ 
//       question,
//       sql_generated: sqlQuery,
//       model_used: modelUsed,
//       results: data,
//       timestamp: new Date().toISOString()
//     }), { 
//       headers: { 
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*' 
//       } 
//     })

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
//         'Access-Control-Allow-Origin': '*' 
//       } 
//     })
//   }
// })

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.0.0'
import dbSchema from './schema.json' assert { type: "json" }

// Configuration améliorée
const AI_CONFIG = {
  models: ["gpt-4o", "gpt-3.5-turbo"],
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
  const forbiddenKeywords = [
    'INSERT', 'UPDATE', 'DELETE', 
    'DROP', 'ALTER', 'GRANT', 
    'REVOKE', 'TRUNCATE', 'CREATE'
  ]
  
  if (forbiddenKeywords.some(keyword => query.toUpperCase().includes(keyword))) {
    throw new Error(`Requête non autorisée: contient ${forbiddenKeywords.join(', ')}`)
  }

  // Détection des requêtes COUNT
  const isCountQuery = query.trim().toUpperCase().startsWith('SELECT COUNT')
  const tableMatch = query.match(/FROM\s+([a-z_]+)/i)

  if (isCountQuery && tableMatch) {
    const { count, error } = await supabase
      .from(tableMatch[1])
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return { data: count }
  }

  // Requêtes SELECT normales
  if (query.trim().toUpperCase().startsWith('SELECT') && tableMatch) {
    const { data, error } = await supabase.from(tableMatch[1]).select('*')
    if (error) throw error
    return { data }
  }

  // Fallback pour requêtes complexes
  const { data, error } = await supabase.rpc('execute_sql', { query })
  if (error) throw error
  return { data }
}

// Génération de SQL avec fallback
async function generateSQL(prompt: string) {
  for (const model of AI_CONFIG.models) {
    for (let attempt = 1; attempt <= AI_CONFIG.maxRetries; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 1000
        })

        let sql = response.choices[0]?.message?.content?.trim()
        if (sql) {
          sql = sql.replace(/^```sql|```$/g, '').trim()
          return { sql, modelUsed: model }
        }
      } catch (error) {
        console.error(`Tentative ${attempt} avec ${model} échouée:`, error.message)
        if (attempt < AI_CONFIG.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, AI_CONFIG.retryDelay))
        }
      }
    }
  }
  throw new Error("Tous les modèles AI ont échoué après plusieurs tentatives")
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
    console.error("Erreur génération réponse humaine:", error)
    return "Je n'ai pas pu formuler la réponse."
  }
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type' 
      } 
    })
  }

  try {
    const { question } = await req.json()
    
    // Prompt optimisé pour génération SQL
    const sqlPrompt = `
      Question: "${question}"
      Schéma: ${JSON.stringify({
        tables: dbSchema.tables,
        relationships: dbSchema.relationships
      })}
      Règles:
      1. ${dbSchema.gpt_instructions.security}
      2. Exemples: 
         - ${dbSchema.gpt_instructions.examples.requete_nutrition}
         - ${dbSchema.gpt_instructions.examples.requete_scolarisation}

      Génère UNIQUEMENT la requête SQL compatible PostgreSQL 15.
      Format attendu: SELECT... FROM... JOIN... WHERE...
    `

    // Génération et exécution SQL
    const { sql: sqlQuery, modelUsed } = await generateSQL(sqlPrompt)
    const { data } = await executeSafeQuery(sqlQuery)

    // Génération réponse humaine
    const humanAnswer = await generateHumanResponse(question, sqlQuery, data)

    return new Response(JSON.stringify({ 
      question,
      answer: humanAnswer,
      technical_details: {
        sql_generated: sqlQuery,
        model_used: modelUsed,
        raw_data: data,
        timestamp: new Date().toISOString()
      }
    }), { 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      } 
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ 
      error: "Erreur de traitement",
      details: process.env.DENO_ENV === "development" ? error.message : undefined,
      suggestion: "Vérifiez la syntaxe SQL ou contactez le support"
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      } 
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ask-openai' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

    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

*/


// gpt-4 

// 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

// new : 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

//  new :  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

// deepseek : sk-a3df0fc551844beaa5c584ccfc3d08b2
// deepseek heirweapon : sk-b5d65675bd124f2b890ebbeb69e65d52
