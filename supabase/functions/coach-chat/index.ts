import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Coach Chat Edge Function
 *
 * This function handles the Gemini Coach AI chat feature.
 *
 * PROMPT REFERENCE: The system prompt is now sent from the frontend and defined in:
 * - src/prompts/ai-prompts.ts (COACH_SYSTEM_PROMPT, buildCoachSystemPrompt)
 *
 * The prompt is built client-side using buildCoachSystemPrompt() and passed in the request body.
 */

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
  systemPrompt: string;
  currentProfile?: any;
  yellowcakeData?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody: CoachChatRequest;
    try {
      requestBody = await req.json() as CoachChatRequest;
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: "Invalid request body. Expected JSON." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { messages, systemPrompt, currentProfile, yellowcakeData } = requestBody;

    // Log the system prompt to verify it's being received
    console.log("[Coach Function] Received systemPrompt length:", systemPrompt?.length);
    if (systemPrompt && systemPrompt.length < 500) {
      console.log("[Coach Function] SystemPrompt preview:", systemPrompt.substring(0, 500));
    }

    // Validate required fields
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages must be a non-empty array" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!systemPrompt || typeof systemPrompt !== "string") {
      return new Response(
        JSON.stringify({ error: "systemPrompt is required and must be a string" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate message structure
    const validMessages = messages.filter((msg) =>
      msg && typeof msg === "object" &&
      (msg.role === "user" || msg.role === "assistant") &&
      typeof msg.content === "string"
    );

    if (validMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid messages found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let requestPayload: unknown;
    try {
      requestPayload = {
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...validMessages,
        ],
        stream: true,
      };
      console.log("[Coach Function] Sending to AI gateway - system message length:", systemPrompt.length);
    } catch (payloadError) {
      console.error("Failed to construct request payload:", payloadError);
      return new Response(
        JSON.stringify({ error: "Failed to prepare request" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });
    } catch (fetchError) {
      console.error("Failed to fetch from AI gateway:", fetchError);
      return new Response(
        JSON.stringify({
          error: "Failed to connect to AI service. Please try again."
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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
