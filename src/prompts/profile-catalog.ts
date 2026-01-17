/**
 * Profile Prompt Catalog
 *
 * Hinge-style prompts that users can select for their dating profile.
 * These are the "questions" users answer to showcase their personality.
 */

export interface PromptOption {
  id: string;
  text: string;
  category: "personality" | "lifestyle" | "dating" | "fun" | "values";
}

export const PROMPT_CATALOG: PromptOption[] = [
  // Personality
  { id: "shower-thought", text: "A shower thought I recently had...", category: "personality" },
  { id: "controversial-opinion", text: "My most controversial opinion is...", category: "personality" },
  { id: "nerd-about", text: "I get way too nerdy about...", category: "personality" },
  { id: "fun-fact", text: "A fun fact about me is...", category: "personality" },
  { id: "weirdly-proud", text: "Something I'm weirdly proud of...", category: "personality" },

  // Lifestyle
  { id: "typical-sunday", text: "My typical Sunday looks like...", category: "lifestyle" },
  { id: "cant-live-without", text: "I can't live without...", category: "lifestyle" },
  { id: "hidden-talent", text: "My hidden talent is...", category: "lifestyle" },
  { id: "comfort-show", text: "My comfort show is...", category: "lifestyle" },
  { id: "go-to-karaoke", text: "My go-to karaoke song is...", category: "lifestyle" },

  // Dating
  { id: "green-flag", text: "A green flag I look for...", category: "dating" },
  { id: "perfect-first-date", text: "The perfect first date would be...", category: "dating" },
  { id: "looking-for-someone", text: "I'm looking for someone who...", category: "dating" },
  { id: "together-we-could", text: "Together, we could...", category: "dating" },
  { id: "key-to-my-heart", text: "The key to my heart is...", category: "dating" },

  // Fun
  { id: "hot-take", text: "My hot take is...", category: "fun" },
  { id: "guilty-pleasure", text: "My guilty pleasure is...", category: "fun" },
  { id: "would-rather", text: "I would rather... than...", category: "fun" },
  { id: "most-likely-to", text: "I'm most likely to...", category: "fun" },
  { id: "worst-idea", text: "The worst idea I've ever had was...", category: "fun" },

  // Values
  { id: "believe-in", text: "Something I believe in is...", category: "values" },
  { id: "geek-out", text: "I geek out on...", category: "values" },
  { id: "change-one-thing", text: "If I could change one thing about the world...", category: "values" },
  { id: "proud-moment", text: "A moment I'm proud of...", category: "values" },
  { id: "learning", text: "I'm currently learning...", category: "values" },
];

/**
 * Get a prompt by its ID
 */
export const getPromptById = (id: string): PromptOption | undefined => {
  return PROMPT_CATALOG.find(p => p.id === id);
};

/**
 * Get all prompts in a specific category
 */
export const getPromptsByCategory = (category: PromptOption["category"]): PromptOption[] => {
  return PROMPT_CATALOG.filter(p => p.category === category);
};

/**
 * Get all available prompt categories
 */
export const PROMPT_CATEGORIES: PromptOption["category"][] = [
  "personality",
  "lifestyle",
  "dating",
  "fun",
  "values",
];

