import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
};

const YELLOWCAKE_API_KEY = Deno.env.get("YELLOWCAKE_API_KEY");
const YELLOWCAKE_API_URL = "https://api.yellowcake.dev/v1/extract-stream";

interface YellowcakeRequest {
  url: string;
  prompt: string;
  throttle?: boolean;
  loginURL?: string;
  authorizedURLs?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!YELLOWCAKE_API_KEY) {
    return new Response(
      JSON.stringify({ error: "YELLOWCAKE_API_KEY is not configured on the server" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json() as YellowcakeRequest;

    console.log("📡 Proxying Yellowcake request:", body.url, body.prompt);

    // Forward request to Yellowcake API
    const yellowcakeResponse = await fetch(YELLOWCAKE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": YELLOWCAKE_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!yellowcakeResponse.ok) {
      const errorText = await yellowcakeResponse.text().catch(() => "Unknown error");
      console.error("❌ Yellowcake API error:", yellowcakeResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: `Yellowcake API error: ${yellowcakeResponse.status} ${yellowcakeResponse.statusText}`,
          details: errorText
        }),
        {
          status: yellowcakeResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!yellowcakeResponse.body) {
      return new Response(
        JSON.stringify({ error: "No response body from Yellowcake API" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the SSE response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = yellowcakeResponse.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Yellowcake proxy error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
