// supabase/functions/login/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from './supabase.ts'

serve(async (req) => {
  // 1. Gérer la méthode CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // 2. Vérifier que la méthode est POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Méthode non autorisée. Utilisez POST.' }),
        { 
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 3. Parser le corps de la requête
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email et mot de passe requis.' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 4. Tenter la connexion avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // 5. Gérer les erreurs d'authentification
    if (authError) {
      let errorMessage = 'Erreur de connexion'
      let statusCode = 401

      switch (authError.message) {
        case 'Invalid login credentials':
          errorMessage = 'Email ou mot de passe incorrect'
          break
        case 'Email not confirmed':
          errorMessage = 'Veuillez confirmer votre email avant de vous connecter'
          statusCode = 403
          break
        case 'Too many requests':
          errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard.'
          statusCode = 429
          break
        default:
          errorMessage = authError.message
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 6. Récupérer le rôle de l'utilisateur depuis la table 'users'
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, email, is_verified')
      .eq('id', authData.session.user.id)
      .single()

    if (userError) {
      console.error('Erreur récupération user:', userError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la récupération des informations utilisateur' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 7. Retourner une réponse réussie
    return new Response(
      JSON.stringify({
        message: 'Connexion réussie',
        session: authData.session,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        }
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    // 8. Gestion des erreurs inattendues
    console.error('Erreur inattendue:', error)
    return new Response(
      JSON.stringify({ error: 'Une erreur interne est survenue' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})