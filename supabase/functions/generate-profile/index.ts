import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileGenerationRequest {
  type: "generate-profile" | "update-profile";
  userInfo: {
    displayName?: string;
    age?: number;
    location?: string;
    lookingFor?: string;
    targetAudience: string;
    additionalInfo?: string;
  };
  yellowcakeData?: {
    topRepos?: string[];
    musicGenres?: string[];
    recentReviews?: string[];
    sentimentAnalysis?: {
      overall: string;
      keywords: string[];
    };
    stats?: {
      totalCommits?: number;
      moviesWatched?: number;
      avgRating?: number;
      topArtist?: string;
      hoursListened?: number;
    };
  };
  existingProfile?: {
    bio?: string;
    promptAnswers?: Array<{ promptText: string; answerText: string }>;
  };
  chatMessage?: string; // For coach-based updates
}

const SYSTEM_PROMPT = `You are a witty, data-driven dating profile coach. Your job is to create engaging, authentic dating profiles that highlight someone's unique personality based on their data and preferences.

You have access to "Yellowcake" data - scraped insights from their GitHub, Letterboxd, and Spotify accounts. Use this data creatively to make profiles stand out.

Guidelines:
- Be genuine and avoid clichés
- Use humor when appropriate but keep it tasteful
- Highlight unique data points that make someone interesting
- Match the tone to who they're trying to attract
- Keep bios under 150 characters
- Make prompt answers feel personal and specific, not generic
- Fun facts should be punchy and memorable

When generating a profile, return a JSON object with this structure:
{
  "bio": "A witty, concise bio",
  "promptAnswers": [
    {
      "promptId": "shower-thought",
      "promptText": "A shower thought I recently had...",
      "answerText": "The answer"
    }
  ],
  "suggestedHighlights": ["Key trait 1", "Key trait 2"]
}

Available prompts to choose from:
- "shower-thought": "A shower thought I recently had..."
- "green-flag": "A green flag I look for..."
- "unpopular-opinion": "My most unpopular opinion..."
- "typical-sunday": "A typical Sunday looks like..."
- "never-shut-up": "I'll never shut up about..."
- "together-we-could": "Together we could..."
- "geek-out": "I geek out on..."
- "simple-pleasures": "My simple pleasures..."
- "love-language": "My love language is..."
- "proudest-moment": "I'm weirdly proud of..."
- "dating-me": "Dating me is like..."
- "worst-idea": "The worst idea I've ever had..."

Pick 3-4 prompts that best showcase the person's personality based on their data.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userInfo, yellowcakeData, existingProfile, chatMessage }: ProfileGenerationRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userPrompt = "";
    
    if (type === "generate-profile") {
      userPrompt = `Generate a dating profile for someone with these characteristics:

Target audience: ${userInfo.targetAudience}
${userInfo.lookingFor ? `Looking for: ${userInfo.lookingFor}` : ""}
${userInfo.additionalInfo ? `Additional info they shared: ${userInfo.additionalInfo}` : ""}

Their data insights (Yellowcake):
${yellowcakeData?.topRepos?.length ? `- GitHub repos: ${yellowcakeData.topRepos.join(", ")}` : ""}
${yellowcakeData?.stats?.totalCommits ? `- ${yellowcakeData.stats.totalCommits} commits this year` : ""}
${yellowcakeData?.recentReviews?.length ? `- Recent film reviews: ${yellowcakeData.recentReviews.join("; ")}` : ""}
${yellowcakeData?.stats?.moviesWatched ? `- ${yellowcakeData.stats.moviesWatched} movies logged` : ""}
${yellowcakeData?.stats?.avgRating ? `- Average rating: ${yellowcakeData.stats.avgRating}/5` : ""}
${yellowcakeData?.musicGenres?.length ? `- Music taste: ${yellowcakeData.musicGenres.join(", ")}` : ""}
${yellowcakeData?.stats?.topArtist ? `- Top artist: ${yellowcakeData.stats.topArtist}` : ""}
${yellowcakeData?.sentimentAnalysis ? `- Personality keywords: ${yellowcakeData.sentimentAnalysis.keywords.join(", ")}` : ""}

Create a compelling profile that would attract their target audience. Return valid JSON only.`;
    } else if (type === "update-profile" && chatMessage) {
      userPrompt = `The user wants to update their profile. Here's their current profile:

Bio: ${existingProfile?.bio || "Not set"}
Prompts: ${existingProfile?.promptAnswers?.map(p => `${p.promptText} → ${p.answerText}`).join("\n") || "None"}

Their request: "${chatMessage}"

Their data insights (for context):
${yellowcakeData?.topRepos?.length ? `- GitHub repos: ${yellowcakeData.topRepos.join(", ")}` : ""}
${yellowcakeData?.recentReviews?.length ? `- Recent film reviews: ${yellowcakeData.recentReviews.join("; ")}` : ""}
${yellowcakeData?.musicGenres?.length ? `- Music taste: ${yellowcakeData.musicGenres.join(", ")}` : ""}
${yellowcakeData?.stats?.topArtist ? `- Top artist: ${yellowcakeData.stats.topArtist}` : ""}

Update the profile based on their request. Return the complete updated profile as valid JSON.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    // Parse the JSON from the AI response
    let profileData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      profileData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ 
        error: "Failed to parse AI response",
        rawContent: content 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(profileData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Profile generation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
