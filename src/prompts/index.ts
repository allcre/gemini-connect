/**
 * Centralized Prompt Catalog
 *
 * All prompts for the Bio-Match application live here.
 * This includes:
 * - UI prompts (Hinge-style profile prompts users can choose from)
 * - AI prompts (system prompts for Gemini Coach, profile generation, etc.)
 * - Extraction prompts (for Yellowcake API data extraction)
 */

// UI Prompts - Hinge-style profile prompts
export * from './profile-catalog';

// AI Prompts - System prompts for AI interactions
export * from './ai-prompts';

// Extraction Prompts - Yellowcake API prompts
export * from './extraction-prompts';

