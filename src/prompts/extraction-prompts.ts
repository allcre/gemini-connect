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
// LETTERBOXD EXTRACTION PROMPTS
// =============================================================================

/**
 * Prompt for extracting films and ratings from a Letterboxd user's films page
 *
 * Used by: src/integrations/yellowcake/client.ts - extractLetterboxdFilms()
 */
export const LETTERBOXD_FILMS_PROMPT =
  'Extract all films and their ratings from this Letterboxd page. For each film, extract the film title and rating (if rated). Return each film with keys "film_title" and "rating".';

// =============================================================================
// GITHUB EXTRACTION PROMPTS
// =============================================================================

/**
 * Prompt for extracting repositories from a GitHub user's repositories page
 *
 * Used by: src/integrations/yellowcake/client.ts - extractGitHubRepos()
 */
export const GITHUB_REPOS_PROMPT =
  'Extract all repositories from this GitHub page. Extract the repository names and descriptions. Return data with exact keys "name" and "description".';

// =============================================================================
// TWITTER/X EXTRACTION PROMPTS
// =============================================================================

/**
 * Prompt for extracting tweets from an X (Twitter) user's profile page
 *
 * Used by: src/integrations/yellowcake/client.ts - extractTweets()
 */
export const TWITTER_TWEETS_PROMPT =
  'Extract all tweets from this X (Twitter) profile page. For each tweet, extract the tweet text content. Return each tweet with key "text".';

// =============================================================================
// SUBSTACK EXTRACTION PROMPTS
// =============================================================================

/**
 * Prompt for extracting posts from a Substack author's profile page
 *
 * Used by: src/integrations/yellowcake/client.ts - extractSubstackPosts()
 */
export const SUBSTACK_POSTS_PROMPT =
  'Extract all posts from this Substack profile page. For each post, extract the post title and text content. Return each post with keys "title" and "text".';

// =============================================================================
// STEAM EXTRACTION PROMPTS
// =============================================================================

/**
 * Prompt for extracting recent games from a Steam user's profile page
 *
 * Used by: src/integrations/yellowcake/client.ts - extractSteamGames()
 */
export const STEAM_GAMES_PROMPT =
  'Extract all recent games from this Steam profile page. For each game, extract the game name and hours played (if available). Return each game with keys "game_name" and "hours_played" (hours_played can be a number, string, or null if not available).';
