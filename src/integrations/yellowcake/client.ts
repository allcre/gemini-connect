/**
 * Yellowcake API Client
 *
 * Handles extraction of data from websites using the Yellowcake API.
 * The API uses Server-Sent Events (SSE) for streaming responses.
 */

import {
  SPOTIFY_PLAYLIST_LINKS_PROMPT,
  SPOTIFY_PLAYLIST_SONGS_PROMPT,
} from '@/prompts';

// Use Supabase Edge Function as proxy to avoid CORS issues
// The API key is stored on the server side in the Edge Function
const YELLOWCAKE_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yellowcake-proxy`;

export interface YellowcakeExtractOptions {
  url: string;
  prompt: string;
  throttle?: boolean;
  loginURL?: string;
  authorizedURLs?: string[];
}

export interface YellowcakeProgressEvent {
  stage: 'initializing' | 'analyzing' | 'ready' | 'extracting' | 'complete';
  message?: string;
  schema?: string[];
  timestamp?: number;
  sessionId?: string;
}

export interface YellowcakeCompleteEvent {
  success: boolean;
  sessionId: string;
  data: Array<Record<string, unknown> | string>;
  metadata: {
    duration: number;
    url: string;
    prompt: string;
    itemCount: number;
  };
  timestamp: number;
}

export interface YellowcakeErrorEvent {
  success: false;
  error: string;
  sessionId?: string;
}

/**
 * Extract data from a URL using Yellowcake API
 *
 * @param options - Extraction options including URL and prompt
 * @param onProgress - Optional callback for progress events
 * @returns Promise resolving to the complete extraction result
 */
export async function extractWithYellowcake(
  options: YellowcakeExtractOptions,
  onProgress?: (event: YellowcakeProgressEvent) => void
): Promise<YellowcakeCompleteEvent> {
  console.log('📡 Making request to Supabase proxy:', YELLOWCAKE_API_URL);
  console.log('📝 Prompt:', options.prompt);
  console.log('🔗 URL:', options.url);

  const response = await fetch(YELLOWCAKE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      url: options.url,
      prompt: options.prompt,
      throttle: options.throttle,
      loginURL: options.loginURL,
      authorizedURLs: options.authorizedURLs,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unable to read error response');
    console.error('❌ Yellowcake API error:', response.status, response.statusText);
    console.error('Error response:', errorText);
    throw new Error(`Yellowcake API error: ${response.status} ${response.statusText}. ${errorText}`);
  }

  if (!response.body) {
    throw new Error('No response body from Yellowcake API');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completeResult: YellowcakeCompleteEvent | null = null;
  let errorResult: YellowcakeErrorEvent | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages (lines ending with \n\n)
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('event:')) {
          const eventType = line.substring(6).trim();

          // Look for the next data line
          if (i + 1 < lines.length && lines[i + 1].startsWith('data:')) {
            const dataLine = lines[i + 1].substring(5).trim();

            try {
              const data = JSON.parse(dataLine);

              if (eventType === 'progress') {
                const progressEvent: YellowcakeProgressEvent = data;
                if (onProgress) {
                  onProgress(progressEvent);
                }
              } else if (eventType === 'complete') {
                completeResult = data as YellowcakeCompleteEvent;
              } else if (eventType === 'error') {
                // Handle error events - may not always match the interface exactly
                if (typeof data === 'object' && data !== null) {
                  const record = data as Record<string, unknown>;
                  errorResult = {
                    success: false,
                    error: (record.error as string) ||
                      (record.message as string) ||
                      'An error occurred during extraction. Please try again.',
                    sessionId: record.sessionId as string,
                  };
                  // Don't throw yet - wait for stream to finish to see if we get a complete event
                  console.warn('Yellowcake error event received:', errorResult);
                } else {
                  errorResult = {
                    success: false,
                    error: String(data) || 'Unknown error',
                  };
                }
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', dataLine, e);
            }

            i++; // Skip the data line we just processed
          }
        } else if (line.startsWith('data:')) {
          // Handle data without explicit event type (defaults to 'message')
          const dataLine = line.substring(5).trim();

          try {
            const data = JSON.parse(dataLine);

            // Check if it's a complete result first
            if (data.success === true && data.data !== undefined) {
              completeResult = data as YellowcakeCompleteEvent;
            } else if (data.success === false) {
              // Handle error in data payload
              if (typeof data === 'object' && data !== null) {
                const record = data as Record<string, unknown>;
                errorResult = {
                  success: false,
                  error: (record.error as string) ||
                    (record.message as string) ||
                    'An error occurred during extraction. Please try again.',
                  sessionId: record.sessionId as string,
                };
              }
            } else if (data.stage) {
              // Assume it's a progress event if it has a stage field
              const progressEvent: YellowcakeProgressEvent = data;
              if (onProgress) {
                onProgress(progressEvent);
              }
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', dataLine, e);
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const lines = buffer.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('event:')) {
          const eventType = line.substring(6).trim();
          // Look for the next data line
          if (i + 1 < lines.length && lines[i + 1].startsWith('data:')) {
            const dataLine = lines[i + 1].substring(5).trim();
            try {
              const data = JSON.parse(dataLine);
              if (eventType === 'complete') {
                completeResult = data as YellowcakeCompleteEvent;
              } else if (eventType === 'error') {
                if (typeof data === 'object' && data !== null) {
                  const record = data as Record<string, unknown>;
                  errorResult = {
                    success: false,
                    error: (record.error as string) ||
                      (record.message as string) ||
                      JSON.stringify(data),
                    sessionId: record.sessionId as string,
                  };
                }
              }
            } catch (e) {
              // Ignore parse errors for incomplete buffers
            }
            i++; // Skip the data line
          }
        } else if (line.startsWith('data:')) {
          const dataLine = line.substring(5).trim();
          try {
            const data = JSON.parse(dataLine);
            if (data.success === true && data.data !== undefined) {
              completeResult = data as YellowcakeCompleteEvent;
            } else if (data.success === false) {
              if (typeof data === 'object' && data !== null) {
                const record = data as Record<string, unknown>;
                errorResult = {
                  success: false,
                  error: (record.error as string) ||
                    (record.message as string) ||
                    JSON.stringify(data),
                  sessionId: record.sessionId as string,
                };
              }
            }
          } catch (e) {
            // Ignore parse errors for incomplete buffers
          }
        }
      }
    }

    // Priority: complete result over error (in case we get both)
    if (completeResult) {
      return completeResult;
    }

    // If we have an error, throw it
    if (errorResult) {
      const errorMessage = errorResult.error || JSON.stringify(errorResult) || 'Unknown error';
      throw new Error(`Yellowcake extraction failed: ${errorMessage}`);
    }

    // No result and no error - something went wrong
    throw new Error('Yellowcake extraction completed but no result data or error was received');

    return completeResult;
  } finally {
    reader.releaseLock();
  }
}

/**
 * Extract Spotify playlist links from a user's playlist page
 *
 * @param spotifyUserURL - URL to the Spotify user's playlist page
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to array of playlist URLs
 */
export async function extractSpotifyPlaylistLinks(
  spotifyUserURL: string,
  onProgress?: (event: YellowcakeProgressEvent) => void
): Promise<string[]> {
  const result = await extractWithYellowcake(
    {
      url: spotifyUserURL,
      prompt: SPOTIFY_PLAYLIST_LINKS_PROMPT,
    },
    onProgress
  );

  // Extract playlist URLs from the result data
  const playlistLinks: string[] = [];

  if (result.data && Array.isArray(result.data)) {
    for (const item of result.data) {
      // Handle case where data is an array of URLs (strings)
      if (typeof item === 'string' && item.startsWith('http')) {
        playlistLinks.push(item);
        continue;
      }

      // Handle case where data is an object with playlist_url
      if (typeof item === 'object' && item !== null) {
        const record = item as Record<string, unknown>;
        if (typeof record.playlist_url === 'string') {
          playlistLinks.push(record.playlist_url);
        } else if (typeof record.url === 'string') {
          playlistLinks.push(record.url);
        }
      }
    }
  }

  return playlistLinks;
}

export interface PlaylistTrack {
  track_name: string;
  artist_name: string;
  track_url?: string;
}

export interface PlaylistInfo {
  playlist_url: string;
  playlist_title: string;
  tracks: PlaylistTrack[];
  track_count?: number;
}

/**
 * Extract playlist information (title and songs) from a Spotify playlist URL
 *
 * @param playlistURL - URL to the Spotify playlist
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to playlist information
 */
export async function extractPlaylistInfo(
  playlistURL: string,
  onProgress?: (event: YellowcakeProgressEvent) => void
): Promise<PlaylistInfo> {
  const result = await extractWithYellowcake(
    {
      url: playlistURL,
      prompt: SPOTIFY_PLAYLIST_SONGS_PROMPT,
    },
    onProgress
  );

  const tracks: PlaylistTrack[] = [];

  if (result.data && Array.isArray(result.data)) {
    for (const item of result.data) {
      if (typeof item === 'object' && item !== null) {
        const record = item as Record<string, unknown>;

        // Extract track information
        if (typeof record.track_name === 'string' || typeof record.artist_name === 'string') {
          const track: PlaylistTrack = {
            track_name: typeof record.track_name === 'string' ? record.track_name : 'Unknown Track',
            artist_name: typeof record.artist_name === 'string' ? record.artist_name : 'Unknown Artist',
          };

          if (typeof record.track_url === 'string') {
            track.track_url = record.track_url;
          }

          tracks.push(track);
        }
      }
    }
  }

  return {
    playlist_url: playlistURL,
    playlist_title: '', // Title not extracted
    tracks,
    track_count: tracks.length,
  };
}

/**
 * Extract information from multiple Spotify playlists
 *
 * @param playlistURLs - Array of Spotify playlist URLs
 * @param limit - Optional upper limit of playlists to scrape (defaults to all)
 * @param onProgress - Optional callback for progress updates per playlist
 * @returns Promise resolving to array of playlist information
 */
export async function extractMultiplePlaylistInfo(
  playlistURLs: string[],
  limit?: number,
  onProgress?: (playlistURL: string, event: YellowcakeProgressEvent) => void
): Promise<PlaylistInfo[]> {
  const playlists: PlaylistInfo[] = [];
  const playlistsToProcess = limit ? playlistURLs.slice(0, limit) : playlistURLs;

  for (const playlistURL of playlistsToProcess) {
    try {
      const playlistInfo = await extractPlaylistInfo(
        playlistURL,
        (event) => {
          if (onProgress) {
            onProgress(playlistURL, event);
          }
        }
      );
      playlists.push(playlistInfo);
    } catch (error) {
      console.error(`Failed to extract playlist info for ${playlistURL}:`, error);
      // Continue with other playlists even if one fails
      playlists.push({
        playlist_url: playlistURL,
        playlist_title: 'Error Loading Playlist',
        tracks: [],
        track_count: 0,
      });
    }
  }

  return playlists;
}

/**
 * Main function: Extract playlist URLs from a Spotify username and then
 * extract songs and artists from the first x playlists
 *
 * @param spotifyUsername - Spotify username (e.g., "allisoncretel-ca")
 * @param playlistLimit - Optional upper limit of playlists to scrape songs from (defaults to all)
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to array of playlist information with songs and artists
 */
export async function extractSpotifyPlaylistsFromUsername(
  spotifyUsername: string,
  playlistLimit?: number,
  onProgress?: (stage: 'links' | 'playlists', message: string, details?: { current?: number; total?: number }) => void
): Promise<PlaylistInfo[]> {
  // Construct Spotify playlist page URL
  const spotifyURL = `https://open.spotify.com/user/${spotifyUsername}/playlists`;

  if (onProgress) {
    onProgress('links', `Extracting playlist links from ${spotifyUsername}...`);
  }

  // Step 1: Extract all playlist links
  const playlistLinks = await extractSpotifyPlaylistLinks(
    spotifyURL,
    (progressEvent) => {
      if (onProgress) {
        onProgress('links', progressEvent.message || '');
      }
    }
  );

  if (playlistLinks.length === 0) {
    throw new Error(`No playlists found for username: ${spotifyUsername}`);
  }

  if (onProgress) {
    onProgress('links', `Found ${playlistLinks.length} playlists`, { total: playlistLinks.length });
  }

  // Step 2: Extract songs and artists from the first x playlists
  const playlistsToProcess = playlistLimit ? playlistLinks.slice(0, playlistLimit) : playlistLinks;

  if (onProgress) {
    onProgress('playlists', `Extracting songs and artists from ${playlistsToProcess.length} playlist(s)...`);
  }

  const playlistsInfo = await extractMultiplePlaylistInfo(
    playlistLinks,
    playlistLimit,
    (playlistURL, progressEvent) => {
      if (onProgress) {
        const currentIndex = playlistsToProcess.indexOf(playlistURL) + 1;
        onProgress('playlists', progressEvent.message || '', {
          current: currentIndex,
          total: playlistsToProcess.length,
        });
      }
    }
  );

  if (onProgress) {
    onProgress('playlists', 'Complete!', { current: playlistsInfo.length, total: playlistsInfo.length });
  }

  return playlistsInfo;
}
