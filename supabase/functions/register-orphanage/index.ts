import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DocumentData {
  url: string;
  path: string;
  uploaded_at: string;
  file_type: string;
  file_name: string;
  file_size: number;
}

interface OrphanageData {
  name: string;
  province: string;
  city: string;
  province_id?: string;
  city_id?: string;
  address?: string;
  location_gps?: string;
  contact_person: string;
  phone?: string;
  email?: string;
  description?: string;
  legal_status?: 'pending' | 'approved' | 'rejected';
  photo_url?: string;
  dhis2_orgunit_id?: string;
  created_by?: string;
  child_capacity?: number;
  children_total?: number;
  boys_count?: number;
  girls_count?: number;
  schooling_rate?: number;
  annual_disease_rate?: number;
  meals_per_day?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse multipart form data
    const formData = await req.formData()
    const documents: File[] = []
    const orphanageData: Partial<OrphanageData> = {}

    // Extract form fields and files
    for (const [key, value] of formData.entries()) {
      if (key === 'documents' && value instanceof File) {
        documents.push(value)
      } else if (typeof value === 'string') {
        // Convert numeric fields
        if (['child_capacity', 'children_total', 'boys_count', 'girls_count', 'meals_per_day'].includes(key)) {
          orphanageData[key as keyof OrphanageData] = value ? parseInt(value) : null
        } else if (['schooling_rate', 'annual_disease_rate'].includes(key)) {
          orphanageData[key as keyof OrphanageData] = value ? parseFloat(value) : null
        } else {
          orphanageData[key as keyof OrphanageData] = value || null
        }
      }
    }

    // Validate required fields
    const requiredFields = ['name', 'province', 'city', 'contact_person']
    const missingFields = requiredFields.filter(field => !orphanageData[field as keyof OrphanageData])
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const documentsData: DocumentData[] = []

    // Process uploaded documents
    if (documents.length > 0) {
      for (const file of documents) {
        try {
          // Validation du fichier (comme dans votre code React)
          const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
          const maxSize = 10 * 1024 * 1024 // 10MB
          
          if (!validTypes.includes(file.type)) {
            console.error(`Invalid file type: ${file.type}`)
            continue
          }
          
          if (file.size > maxSize) {
            console.error(`File too large: ${file.size}`)
            continue
          }

          // Read file as bytes
          const fileBytes = new Uint8Array(await file.arrayBuffer())
          
          // Generate unique filename (same logic as your React code)
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
          const filePath = `temp/${fileName}`

          // Upload to Supabase Storage (same bucket as your React code)
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('orphanage-documents')
            .upload(filePath, fileBytes, {
              contentType: file.type,
              upsert: false
            })

          if (uploadError) {
            console.error('Storage upload error:', uploadError)
            continue
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('orphanage-documents')
            .getPublicUrl(filePath)

          // Create document metadata (same format as your React code)
          const documentData: DocumentData = {
            legal_document : {
                url: urlData.publicUrl,
                path: filePath,
                uploaded_at: new Date().toISOString(),
                file_type: file.type.startsWith('image/') ? 'image' : 'pdf',
                file_name: file.name,
                file_size: file.size
            }
          }

          documentsData.push(documentData)

        } catch (fileError) {
          console.error('File processing error:', fileError)
          // Continue with other files even if one fails
        }
      }
    }

    // Prepare data for database insertion
    const orphanageInsertData = {
      name: orphanageData.name,
      province: orphanageData.province,
      city: orphanageData.city,
      province_id: orphanageData.province_id || null,
      city_id: orphanageData.city_id || null,
      address: orphanageData.address || null,
      location_gps: orphanageData.location_gps || null,
      contact_person: orphanageData.contact_person,
      phone: orphanageData.phone || null,
      email: orphanageData.email || null,
      description: orphanageData.description || null,
      legal_status: orphanageData.legal_status || 'pending',
      documents: documentsData.length > 0 ? documentsData[0] : null,
      photo_url: orphanageData.photo_url || null,
      dhis2_orgunit_id: orphanageData.dhis2_orgunit_id || null,
      created_by: orphanageData.created_by || null,
      child_capacity: orphanageData.child_capacity || null,
      children_total: orphanageData.children_total || null,
      boys_count: orphanageData.boys_count || null,
      girls_count: orphanageData.girls_count || null,
      schooling_rate: orphanageData.schooling_rate || null,
      annual_disease_rate: orphanageData.annual_disease_rate || null,
      meals_per_day: orphanageData.meals_per_day || null
    }

    // Insert into database
    const { data: insertedOrphanage, error: dbError } = await supabase
      .from('orphanages')
      .insert(orphanageInsertData)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Database insertion failed', details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Orphanage created successfully',
        data: insertedOrphanage
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})