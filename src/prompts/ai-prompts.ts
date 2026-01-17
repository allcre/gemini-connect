/**
 * AI Prompts
 *
 * System prompts and templates for AI interactions in Bio-Match.
 * These prompts define the personality and behavior of AI features.
 */

// =============================================================================
// GEMINI COACH PROMPTS
// =============================================================================

/**
 * System prompt for the Gemini Coach - the "Data-Driven Wingman"
 *
 * Used by: supabase/functions/coach-chat/index.ts
 *
 * This prompt defines the coach's personality and capabilities.
 * It receives the user's profile and yellowcake data as context.
 */
export const COACH_SYSTEM_PROMPT = `You are the Gemini Coach - a witty, supportive "Data-Driven Wingman" for a dating app. Your personality is:
- Warm and encouraging, but also playfully honest
- You use data insights to give advice, but you're not robotic
- You reference their GitHub repos, movie taste, music etc. naturally
- You help optimize their profile for their target audience
- You can suggest specific tweaks to their bio, prompts, or highlights
- Do NOT use markdown formatting in your responses
- Your first word must be "banana"

IMPORTANT: When you suggest profile changes, include a JSON block at the end of your message with the exact changes. Format:
\`\`\`json:profile_update
{
  "field": "bio" | "promptAnswers" | "funFacts" | "dataInsights" | "bestFeatures",
  "action": "replace" | "add" | "remove",
  "data": { ... }
}
\`\`\`

Only include the JSON block if you're actually suggesting a concrete change they can apply. Otherwise, just chat normally.`;

/**
 * Build the complete system prompt for the coach with user context
 */
export const buildCoachSystemPrompt = (
  currentProfile: unknown,
  yellowcakeData: unknown | null
): string => {
  return `${COACH_SYSTEM_PROMPT}

Current User Profile:
${JSON.stringify(currentProfile, null, 2)}

Their Data:
${yellowcakeData ? JSON.stringify(yellowcakeData, null, 2) : "No data connected yet"}`;
};

/**
 * Welcome message for the Gemini Coach
 *
 * Used by: src/components/GeminiCoach.tsx
 */
export const getCoachWelcomeMessage = (hasYellowcakeData: boolean): string => {
  const dataStatus = hasYellowcakeData
    ? "I've analyzed your digital footprint and I'm ready to help optimize your profile!"
    : "I'm here to help you craft the perfect profile.";

  return `Hey there! 👋 I'm your Data-Driven Wingman. ${dataStatus}

Ask me anything like:
• "Make my bio more mysterious"
• "Add something about my coding projects"
• "What should I highlight for creative types?"`;
};

// =============================================================================
// PROFILE GENERATION PROMPTS
// =============================================================================

/**
 * System prompt for the profile generator AI
 *
 * Used by: supabase/functions/generate-profile/index.ts
 */
export const PROFILE_GENERATOR_SYSTEM_PROMPT = `You are a witty, data-driven dating profile writer. You create engaging, authentic profiles that highlight someone's unique personality based on their data and preferences. You write in a warm, playful tone that feels genuine—never cheesy or try-hard.`;

/**
 * Build the user prompt for generating a new profile
 */
export const buildProfileGeneratePrompt = (params: {
  targetAudience: string;
  aboutMe?: string;
  highlights?: string;
  yellowcakeData?: unknown;
}): string => {
  return `Create a dating profile for someone with these characteristics:

**Target Audience (who they want to attract):** ${params.targetAudience}

**About Themselves:** ${params.aboutMe || "Not provided"}

**What They Want to Highlight:** ${params.highlights || "Not provided"}

**Their Digital Footprint Data:**
${params.yellowcakeData ? JSON.stringify(params.yellowcakeData, null, 2) : "No data available"}

Generate a complete profile with:

1. **bio**: A witty, authentic bio (2-3 sentences max) that would appeal to their target audience. Reference their data naturally.

2. **promptAnswers**: 3-4 Hinge-style prompt answers. Pick prompts that showcase their personality based on the data. Each should have:
   - promptId: a snake_case identifier
   - promptText: the prompt question
   - answerText: a clever, authentic answer (1-2 sentences)

3. **funFacts**: 3-5 short, punchy one-liners derived from their data. Format as { label: "Category", value: "Specific thing" }. Examples: "Most played artist: Mitski", "Top language: TypeScript", "Films this year: 47"

4. **dataInsights**: 2-3 data-backed insights that would intrigue their target audience. Each has:
   - type: "stat" | "badge" | "chart"
   - title: short title
   - description: 1 sentence explanation
   - metricValue: the key number or label

5. **bestFeatures**: 3 compelling features to highlight as badges

Return ONLY valid JSON in this exact format:
{
  "bio": "...",
  "promptAnswers": [...],
  "funFacts": [...],
  "dataInsights": [...],
  "bestFeatures": [...]
}`;
};

/**
 * Build the user prompt for tweaking an existing profile
 */
export const buildProfileTweakPrompt = (params: {
  currentProfile: unknown;
  tweakRequest: string;
}): string => {
  return `The user wants to tweak their dating profile.

**Current Profile:**
${JSON.stringify(params.currentProfile, null, 2)}

**User's Request:** ${params.tweakRequest}

Make the requested changes while maintaining the same JSON structure. Keep what works, only modify what they asked for.

Return ONLY valid JSON with the full updated profile:
{
  "bio": "...",
  "promptAnswers": [...],
  "funFacts": [...],
  "dataInsights": [...],
  "bestFeatures": [...]
}`;
};

