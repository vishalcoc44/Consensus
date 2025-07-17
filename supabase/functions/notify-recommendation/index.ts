import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

// Placeholder for a real email sending service
const sendEmail = async (to: string, subject: string, html: string) => {
  console.log("--- SENDING EMAIL ---");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: \n${html}`);
  console.log("--- EMAIL SENT ---");
  // In a real application, you would integrate with a service like Resend,
  // Postmark, or SendGrid here.
  // Example with Resend:
  // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  // await resend.emails.send({ from: '...', to, subject, html });
  return Promise.resolve();
};

serve(async (req) => {
  try {
    const { record: recommendation } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Fetch the decision details to get the creator's email
    const { data: decision, error: decisionError } = await supabaseAdmin
      .from('decisions')
      .select('title, created_by, teams ( members:team_members (users (email)) )')
      .eq('id', recommendation.decision_id)
      .single();

    if (decisionError) throw decisionError;

    // 2. Get all team members' emails
    const team = Array.isArray(decision.teams) ? decision.teams[0] : decision.teams;
    const emails = team?.members?.map(m => m.users?.email).filter(Boolean) || [];
    if (emails.length === 0) {
      console.log("No team members to notify for decision:", recommendation.decision_id);
      return new Response("ok");
    }

    // 3. Construct and send the email
    const subject = `AI Recommendation Ready for: ${decision.title}`;
    const emailHtml = `
      <h1>AI Recommendation is Ready!</h1>
      <p>A new AI-powered recommendation has been generated for the decision: <strong>${decision.title}</strong>.</p>
      <h2>Recommendation: ${recommendation.recommended_option_text}</h2>
      <p>Confidence: ${recommendation.confidence_score}%</p>
      <p>Reasoning: ${recommendation.explanation}</p>
      <a href="${Deno.env.get('SITE_URL')}/decision/${recommendation.decision_id}">View the full details</a>
    `;

    await sendEmail(emails.join(','), subject, emailHtml);

    return new Response("ok");

  } catch (error) {
    console.error("Error in notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}); 