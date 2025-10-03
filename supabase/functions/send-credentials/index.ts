import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CredentialsRequest {
  email: string;
  phone?: string;
  password?: string;
  name: string;
  type: 'orphanage' | 'partner';
  organization_name?: string;
  status?: 'approved' | 'rejected';
  rejection_reason?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone, password, name, type, organization_name, status = 'approved', rejection_reason }: CredentialsRequest = await req.json();
    
    console.log(`Sending ${status} notification to ${email} for ${type}`);

    // Initialize services
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    const results = {
      email: null as any,
      sms: null as any,
    };

    // Send Email
    try {
      let subject: string;
      let emailContent: string;
      const organizationText = type === 'orphanage' ? name : (organization_name || name);

      if (status === 'rejected') {
        // Email de rejet
        subject = type === 'orphanage' 
          ? `Demande d'inscription rejetée`
          : `Demande de partenariat rejetée`;

        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Demande rejetée</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Bonjour <strong>${name}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 25px;">
                Nous regrettons de vous informer que votre demande ${type === 'orphanage' ? 'd\'inscription d\'orphelinat' : 'de partenariat'} 
                pour <strong>${organizationText}</strong> a été rejetée.
              </p>

              ${rejection_reason ? `
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
                  <h3 style="color: #dc3545; margin-top: 0;">Raison du rejet :</h3>
                  <p style="margin: 10px 0; color: #333;">${rejection_reason}</p>
                </div>
              ` : ''}

              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>💡 Que faire maintenant ?</strong><br>
                  Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus d'informations, n'hésitez pas à nous contacter.
                </p>
              </div>

              <p style="font-size: 14px; color: #6c757d; margin-top: 30px; text-align: center;">
                Pour toute question, contactez-nous.<br>
                Équipe SiMéOr - Système de Monitoring des Orphelinats
              </p>
            </div>
          </div>
        `;
      } else {
        // Email d'approbation (existant)
        subject = type === 'orphanage' 
          ? `Bienvenue - Votre compte orphelinat a été approuvé`
          : `Bienvenue - Votre compte partenaire a été approuvé`;

        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Félicitations ! 🎉</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Bonjour <strong>${name}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 25px;">
                Votre demande ${type === 'orphanage' ? 'd\'inscription d\'orphelinat' : 'de partenariat'} 
                pour <strong>${organizationText}</strong> a été approuvée avec succès !
              </p>

              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                <h3 style="color: #28a745; margin-top: 0;">Vos identifiants de connexion :</h3>
                <p style="margin: 10px 0;"><strong>Email :</strong> ${email}</p>
                <p style="margin: 10px 0;"><strong>Mot de passe temporaire :</strong> <code style="background: #f1f3f4; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
              </div>

              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>⚠️ Important :</strong> Pour votre sécurité, veuillez changer ce mot de passe lors de votre première connexion.
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app-url.lovable.app'}" 
                   style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Se connecter maintenant
                </a>
              </div>

              <p style="font-size: 14px; color: #6c757d; margin-top: 30px; text-align: center;">
                Si vous avez des questions, n'hésitez pas à nous contacter.<br>
                Équipe SiMéOr - Système de Monitoring des Orphelinats
              </p>
            </div>
          </div>
        `;
      }

      const emailResponse = await resend.emails.send({
        from: "SiMéOr <noreply@resend.dev>",
        to: [email],
        subject: subject,
        html: emailContent,
      });

      results.email = emailResponse;
      console.log('Email sent successfully:', emailResponse);
    } catch (emailError: any) {
      console.error('Email error:', emailError);
      results.email = { error: emailError?.message || 'Unknown email error' };
    }

    // Send SMS if phone number is provided
    if (phone && twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        let smsMessage: string;
        
        if (status === 'rejected') {
          smsMessage = type === 'orphanage' 
            ? `Désolé, votre demande d'inscription "${name}" a été rejetée. ${rejection_reason ? 'Raison: ' + rejection_reason : ''} Contactez-nous pour plus d'infos. - SiMéOr`
            : `Désolé, votre demande de partenariat "${organization_name || name}" a été rejetée. ${rejection_reason ? 'Raison: ' + rejection_reason : ''} Contactez-nous pour plus d'infos. - SiMéOr`;
        } else {
          smsMessage = type === 'orphanage' 
            ? `Félicitations ! Votre compte orphelinat "${name}" a été approuvé. Email: ${email} | Mot de passe: ${password} | Changez votre mot de passe lors de la 1ère connexion. - SiMéOr`
            : `Félicitations ! Votre compte partenaire "${organization_name || name}" a été approuvé. Email: ${email} | Mot de passe: ${password} | Changez votre mot de passe lors de la 1ère connexion. - SiMéOr`;
        }

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

        const smsResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: phone,
            From: twilioPhoneNumber,
            Body: smsMessage,
          }),
        });

        const smsData = await smsResponse.json();
        results.sms = smsData;
        console.log('SMS sent successfully:', smsData);
      } catch (smsError: any) {
        console.error('SMS error:', smsError);
        results.sms = { error: smsError?.message || 'Unknown SMS error' };
      }
    } else {
      results.sms = { skipped: 'No phone number or Twilio credentials' };
    }

    return new Response(
      JSON.stringify({
        success: true,
        results: results,
        message: 'Credentials sent successfully'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in send-credentials function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});