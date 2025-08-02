import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Contact form submission received");
    const formData: ContactFormData = await req.json();

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email to villa owner
    const ownerEmailResponse = await resend.emails.send({
      from: "Villa MareBlu <info@villamareblu.it>",
      to: ["macchiaforcato@gmail.com"],
      replyTo: formData.email,
      subject: `Nuova richiesta da Villa MareBlu: ${formData.subject}`,
      html: `
        <h2>Nuova richiesta di contatto</h2>
        <p><strong>Nome:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        ${formData.phone ? `<p><strong>Telefono:</strong> ${formData.phone}</p>` : ''}
        <p><strong>Oggetto:</strong> ${formData.subject}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><small>Questa email è stata inviata dal modulo di contatto di Villa MareBlu.</small></p>
      `,
    });

    // Send confirmation email to customer
    const confirmationEmailResponse = await resend.emails.send({
      from: "Villa MareBlu <info@villamareblu.it>",
      to: [formData.email],
      subject: "Conferma ricezione richiesta - Villa MareBlu",
      html: `
        <h2>Grazie per averci contattato!</h2>
        <p>Caro/a ${formData.firstName},</p>
        <p>Abbiamo ricevuto la tua richiesta e ti risponderemo entro 2 ore.</p>
        
        <h3>Riepilogo della tua richiesta:</h3>
        <p><strong>Oggetto:</strong> ${formData.subject}</p>
        <p><strong>Messaggio:</strong> ${formData.message}</p>
        
        <p>Per qualsiasi urgenza, puoi contattarci direttamente:</p>
        <ul>
          <li>Telefono: +39 3937767749</li>
          <li>Email: macchiaforcato@gmail.com</li>
        </ul>
        
        <p>Cordiali saluti,<br>
        Il team di Villa MareBlu</p>
        
        <hr>
        <p><small>Villa MareBlu - Via Marco Polo 112, 73053 Patù (LE)</small></p>
      `,
    });

    console.log("Emails sent successfully:", { ownerEmailResponse, confirmationEmailResponse });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);