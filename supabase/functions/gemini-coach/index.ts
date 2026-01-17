import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: Message[];
  yellowcakeData?: Record<string, unknown>;
  targetAudience?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { messages, yellowcakeData, targetAudience }: RequestBody = await req.json();
    console.log("Received request with", messages.length, "messages");

    // Build system prompt with context
    let systemPrompt = `You are a "Data-Driven Wingman" - an AI dating coach that helps users craft the perfect dating profile. You're witty, supportive, and use data insights to create compelling profiles.

Your personality:
- Friendly and encouraging
- Data-savvy but not robotic
- Uses emojis sparingly but effectively
- Gives specific, actionable advice

Your capabilities:
- Analyze user's digital footprint (GitHub repos, movie reviews, music taste)
- Generate witty, authentic bios
- Identify unique "best features" to highlight
- Match profile tone to target audience`;

    if (yellowcakeData) {
      systemPrompt += `\n\nUser's Data Insights (from their digital footprint):
${JSON.stringify(yellowcakeData, null, 2)}`;
    }

    if (targetAudience) {
      systemPrompt += `\n\nTarget Audience: ${targetAudience}`;
    }

    // Format messages for Gemini API
    const geminiMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "I understand! I'm your Data-Driven Wingman, ready to help craft the perfect profile. Let's get started!" }] },
      ...messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    console.log("Calling Gemini API...");

    // Retry logic with exponential backoff
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
        console.log(`Retry attempt ${attempt + 1}, waiting ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Gemini response received");

        const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 
          "I'm having trouble thinking right now. Can you try again?";

        return new Response(
          JSON.stringify({ message: assistantMessage }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Handle rate limiting specifically
      if (response.status === 429) {
        const errorText = await response.text();
        console.error("Gemini API rate limited:", response.status, errorText);
        lastError = new Error("API quota exceeded - please wait a moment and try again");
        continue; // Retry
      }

      // Other errors - don't retry
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    // All retries exhausted
    throw lastError || new Error("Failed after retries");
  } catch (error) {
    console.error("Error in gemini-coach:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isQuotaError = errorMessage.includes("quota") || errorMessage.includes("429");
    
    return new Response(
      JSON.stringify({ 
        error: isQuotaError 
          ? "Your Gemini API quota is exceeded. Please wait a minute or update your API key in project secrets."
          : errorMessage 
      }),
      {
        status: isQuotaError ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
