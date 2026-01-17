/**
 * Extraction Prompts
 *
 * Prompts used for data extraction via the Yellowcake API.
 * These prompts instruct the scraper on what data to extract from various platforms.
 */

// =============================================================================
// SPOTIFY EXTRACTION PROMPTS
// =============================================================================

/**
 * Prompt for extracting playlist links from a Spotify user's playlist page
 *
 * Used by: src/integrations/yellowcake/client.ts - extractSpotifyPlaylistLinks()
 */
export const SPOTIFY_PLAYLIST_LINKS_PROMPT =
  'Extract all links to playlists on this page. Return each playlist link as a URL with the key "playlist_url".';

/**
 * Prompt for extracting songs and artists from a Spotify playlist
 *
 * Used by: src/integrations/yellowcake/client.ts - extractPlaylistInfo()
 */
export const SPOTIFY_PLAYLIST_SONGS_PROMPT =
  'All songs and their artists from this playlist';

// =============================================================================
// FUTURE EXTRACTION PROMPTS (PLACEHOLDERS)
// =============================================================================

/**
 * Prompt for extracting repository information from GitHub
 * Currently mocked - will be implemented when GitHub scraping is added
 */
export const GITHUB_REPOS_PROMPT =
  'Extract all public repositories with their name, description, primary language, and star count.';

/**
 * Prompt for extracting film reviews from Letterboxd
 * Currently mocked - will be implemented when Letterboxd scraping is added
 */
export const LETTERBOXD_REVIEWS_PROMPT =
  'Extract recent film reviews including the film title, rating (out of 5), and review text if available.';

/**
 * Prompt for extracting user stats from Letterboxd profile
 * Currently mocked - will be implemented when Letterboxd scraping is added
 */
export const LETTERBOXD_STATS_PROMPT =
  'Extract user statistics including total films watched, average rating, and favorite genres.';

