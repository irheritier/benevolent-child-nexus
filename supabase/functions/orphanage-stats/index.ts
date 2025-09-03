import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface DashboardStats {
  orphanage: any;
  children: {
    total: number;
    byGender: { boys: number; girls: number };
    byAgeGroup: { [key: string]: number };
    newThisMonth: number;
  };
  nutrition: {
    malnutritionRate: number;
    byStatus: { [key: string]: number };
    averageBMI: number;
  };
  health: {
    vaccinationCoverage: number;
    commonDiseases: { name: string; count: number }[];
    chronicConditions: number;
  };
  capacity: {
    current: number;
    max: number;
    utilizationRate: number;
  };
  trends: {
    monthlyGrowth: { month: string; count: number }[];
    nutritionTrend: { month: string; rate: number }[];
  };
}

// Fonction pour décoder le JWT manuellement
function decodeJwt(token: string): any {
  try {
    const payloadBase64 = token.split('.')[1];
    // Ajouter le padding nécessaire pour base64
    const paddedPayload = payloadBase64.padEnd(payloadBase64.length + (4 - payloadBase64.length % 4) % 4, '=');
    const payloadJson = atob(paddedPayload);
    return JSON.parse(payloadJson);
  } catch (error) {
    console.error('Erreur décodage JWT:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Décoder le JWT manuellement pour obtenir l'user ID
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    const payload = decodeJwt(token);
    
    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Token JWT invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier l'expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return new Response(
        JSON.stringify({ error: 'Token expiré' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = payload.sub;

    // Créer le client Supabase avec la service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer l'orphelinat de l'utilisateur - NE PAS utiliser .single()
    const { data: userOrphanages, error: linkError } = await supabase
      .from('user_orphanage_links')
      .select('orphanage_id')
      .eq('user_id', userId)

    if (linkError) {
      console.error('Erreur récupération orphelinat:', linkError)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur de base de données',
          details: linkError.message,
          code: linkError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier si l'utilisateur a des orphelinats
    if (!userOrphanages || userOrphanages.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Aucun orphelinat trouvé pour cet utilisateur',
          details: 'Cet utilisateur n\'est lié à aucun orphelinat'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prendre le premier orphelinat (puisque vous dites qu'un user n'a qu'un seul orphelinat)
    const orphanageId = userOrphanages[0].orphanage_id;

    // Récupérer les données statistiques pour cet orphelinat
    const stats = await getDashboardStats(supabase, orphanageId)

    return new Response(
      JSON.stringify(stats),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getDashboardStats(supabase: any, orphanageId: string): Promise<DashboardStats> {
  // Récupérer les informations de l'orphelinat - NE PAS utiliser .single() ici non plus
  const { data: orphanages, error: orphanageError } = await supabase
    .from('orphanages')
    .select('*')
    .eq('id', orphanageId)

  if (orphanageError) {
    console.error('Erreur récupération orphelinat:', orphanageError)
    throw new Error(`Failed to fetch orphanage data: ${orphanageError.message}`)
  }

  if (!orphanages || orphanages.length === 0) {
    throw new Error('Orphelinat non trouvé')
  }

  const orphanage = orphanages[0];

  // Statistiques des enfants
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('id, gender, birth_date, entry_date, estimated_age')
    .eq('orphanage_id', orphanageId)

  if (childrenError) {
    console.error('Erreur récupération enfants:', childrenError)
    throw new Error(`Failed to fetch children data: ${childrenError.message}`)
  }

  const childrenIds = children?.map(c => c.id) || []

  // Statistiques nutritionnelles (les 100 derniers enregistrements)
  const { data: nutritionRecords, error: nutritionError } = await supabase
    .from('nutrition_records')
    .select('child_id, nutrition_status, bmi, date')
    .in('child_id', childrenIds)
    .order('date', { ascending: false })
    .limit(100)

  if (nutritionError) {
    console.error('Erreur records nutrition:', nutritionError)
  }

  // Statistiques de santé
  const { data: healthRecords, error: healthError } = await supabase
    .from('health_records')
    .select('child_id, vaccination_status_structured, chronic_conditions')
    .in('child_id', childrenIds)
    .limit(100)

  if (healthError) {
    console.error('Erreur records santé:', healthError)
  }

  // Maladies courantes
  const { data: diseases, error: diseasesError } = await supabase
    .from('child_diseases')
    .select('disease_id, diseases(name)')
    .in('child_id', childrenIds)

  if (diseasesError) {
    console.error('Erreur maladies:', diseasesError)
  }

  // Calculer les statistiques
  const childrenStats = calculateChildrenStats(children || [])
  const nutritionStats = calculateNutritionStats(nutritionRecords || [])
  const healthStats = calculateHealthStats(healthRecords || [], diseases || [])
  const capacityStats = calculateCapacityStats(orphanage, children || [])
  const trends = calculateTrends(children || [], nutritionRecords || [])

  return {
    orphanage,
    children: childrenStats,
    nutrition: nutritionStats,
    health: healthStats,
    capacity: capacityStats,
    trends
  }
}

function calculateChildrenStats(children: any[]) {
  const boys = children.filter(c => c.gender === 'M').length
  const girls = children.filter(c => c.gender === 'F').length
  
  // Groupes d'âge
  const ageGroups = {
    '0-2': 0,
    '3-5': 0,
    '6-12': 0,
    '13-17': 0,
    '18+': 0
  }

  children.forEach(child => {
    let age: number | null = null;
    
    if (child.birth_date) {
      const birthDate = new Date(child.birth_date)
      age = new Date().getFullYear() - birthDate.getFullYear()
    } else if (child.estimated_age) {
      age = child.estimated_age
    }
    
    if (age !== null) {
      if (age <= 2) ageGroups['0-2']++
      else if (age <= 5) ageGroups['3-5']++
      else if (age <= 12) ageGroups['6-12']++
      else if (age <= 17) ageGroups['13-17']++
      else ageGroups['18+']++
    }
  })

  // Enfants ajoutés ce mois-ci
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const newThisMonth = children.filter(c => {
    if (!c.entry_date) return false
    const entryDate = new Date(c.entry_date)
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
  }).length

  return {
    total: children.length,
    byGender: { boys, girls },
    byAgeGroup: ageGroups,
    newThisMonth
  }
}

function calculateNutritionStats(records: any[]) {
  const statusCount: { [key: string]: number } = {}
  let totalBMI = 0
  let malnourished = 0
  let validRecords = 0

  records.forEach(record => {
    if (record.nutrition_status) {
      statusCount[record.nutrition_status] = (statusCount[record.nutrition_status] || 0) + 1
      if (record.nutrition_status !== 'normal') malnourished++
    }
    if (record.bmi) {
      totalBMI += record.bmi
      validRecords++
    }
  })

  return {
    malnutritionRate: records.length > 0 ? (malnourished / records.length) * 100 : 0,
    byStatus: statusCount,
    averageBMI: validRecords > 0 ? totalBMI / validRecords : 0
  }
}

function calculateHealthStats(records: any[], diseases: any[]) {
  let vaccinated = 0
  let chronicConditions = 0
  const diseaseCount: { [key: string]: number } = {}

  records.forEach(record => {
    if (record.vaccination_status_structured?.status === 'complete') vaccinated++
    if (record.chronic_conditions && record.chronic_conditions.trim() !== '') chronicConditions++
  })

  diseases.forEach(disease => {
    const diseaseName = disease.diseases?.name || 'Unknown'
    diseaseCount[diseaseName] = (diseaseCount[diseaseName] || 0) + 1
  })

  const commonDiseases = Object.entries(diseaseCount)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    vaccinationCoverage: records.length > 0 ? (vaccinated / records.length) * 100 : 0,
    commonDiseases,
    chronicConditions
  }
}

function calculateCapacityStats(orphanage: any, children: any[]) {
  const totalCapacity = orphanage.child_capacity || 0
  const currentChildren = children.length

  return {
    current: currentChildren,
    max: totalCapacity,
    utilizationRate: totalCapacity > 0 ? (currentChildren / totalCapacity) * 100 : 0
  }
}

function calculateTrends(children: any[], nutritionRecords: any[]) {
  // Tendances mensuelles des nouveaux enfants (6 derniers mois)
  const monthlyGrowth: { month: string; count: number }[] = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = month.toLocaleString('default', { month: 'short', year: 'numeric' })
    
    const count = children.filter(c => {
      if (!c.entry_date) return false
      const entryDate = new Date(c.entry_date)
      return entryDate.getMonth() === month.getMonth() && 
             entryDate.getFullYear() === month.getFullYear()
    }).length
    
    monthlyGrowth.push({ month: monthName, count })
  }

  // Tendances nutritionnelles (3 derniers mois)
  const nutritionTrend: { month: string; rate: number }[] = []
  
  for (let i = 2; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = month.toLocaleString('default', { month: 'short' })
    
    const monthRecords = nutritionRecords.filter(r => {
      if (!r.date) return false
      const recordDate = new Date(r.date)
      return recordDate.getMonth() === month.getMonth() && 
             recordDate.getFullYear() === month.getFullYear()
    })
    
    const malnourished = monthRecords.filter(r => r.nutrition_status !== 'normal').length
    const rate = monthRecords.length > 0 ? (malnourished / monthRecords.length) * 100 : 0
    
    nutritionTrend.push({ month: monthName, rate })
  }

  return { monthlyGrowth, nutritionTrend }
}