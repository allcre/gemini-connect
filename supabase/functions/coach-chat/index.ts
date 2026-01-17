import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CoachChatRequest {
  messages: ChatMessage[];
  currentProfile: any;
  yellowcakeData?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentProfile, yellowcakeData } = await req.json() as CoachChatRequest;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are the Gemini Coach - a witty, supportive "Data-Driven Wingman" for a dating app. Your personality is:
- Warm and encouraging, but also playfully honest
- You use data insights to give advice, but you're not robotic
- You reference their GitHub repos, movie taste, music etc. naturally
- You help optimize their profile for their target audience
- You can suggest specific tweaks to their bio, prompts, or highlights

Current User Profile:
${JSON.stringify(currentProfile, null, 2)}

Their Data:
${yellowcakeData ? JSON.stringify(yellowcakeData, null, 2) : "No data connected yet"}

IMPORTANT: When you suggest profile changes, include a JSON block at the end of your message with the exact changes. Format:
\`\`\`json:profile_update
{
  "field": "bio" | "promptAnswers" | "funFacts" | "dataInsights" | "bestFeatures",
  "action": "replace" | "add" | "remove",
  "data": { ... }
}
\`\`\`

Only include the JSON block if you're actually suggesting a concrete change they can apply. Otherwise, just chat normally.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "API credits depleted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("coach-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
