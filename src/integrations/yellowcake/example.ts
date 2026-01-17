/**
 * Example usage of Yellowcake API to extract Spotify playlist links and details
 *
 * This demonstrates the unified function that:
 * 1. Extracts all playlist links from a Spotify username
 * 2. Extracts songs and artists from the first x playlists
 */

import {
  extractSpotifyPlaylistsFromUsername,
  type PlaylistInfo,
} from './client';

async function exampleExtractPlaylistLinks() {
  const spotifyUsername = 'allisoncretel-ca';
  const playlistLimit = 2; // Change to a number to limit, or undefined for all playlists

  console.log('🎵 Starting Yellowcake extraction...');
  console.log(`Username: ${spotifyUsername}`);
  if (playlistLimit) {
    console.log(`Limit: First ${playlistLimit} playlists\n`);
  } else {
    console.log('Limit: All playlists\n');
  }

  try {
    const playlistsInfo = await extractSpotifyPlaylistsFromUsername(
      spotifyUsername,
      playlistLimit,
      (stage, message, details) => {
        if (stage === 'links') {
          console.log(`📋 [Links] ${message}`);
          if (details?.total) {
            console.log(`   Found ${details.total} playlists`);
          }
        } else if (stage === 'playlists') {
          const progress = details?.current && details?.total
            ? `[${details.current}/${details.total}]`
            : '';
          console.log(`🎼 [Playlists] ${progress} ${message}`);
        }
      }
    );

    console.log('\n\n✅ All playlist details extracted!\n');
    console.log('='.repeat(80));

    // Display results
    playlistsInfo.forEach((playlist, index) => {
      console.log(`\n📀 Playlist ${index + 1}: ${playlist.playlist_title}`);
      console.log(`   URL: ${playlist.playlist_url}`);
      console.log(`   Tracks: ${playlist.track_count || playlist.tracks.length}\n`);

      if (playlist.tracks.length > 0) {
        console.log('   Songs:');
        playlist.tracks.slice(0, 10).forEach((track, trackIndex) => {
          console.log(`     ${trackIndex + 1}. ${track.track_name} - ${track.artist_name}`);
        });
        if (playlist.tracks.length > 10) {
          console.log(`     ... and ${playlist.tracks.length - 10} more tracks`);
        }
      } else {
        console.log('   ⚠️  No tracks found');
      }
      console.log('-'.repeat(80));
    });

    return playlistsInfo;
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    throw error;
  }
}

// Run the example
exampleExtractPlaylistLinks().catch(console.error);

export { exampleExtractPlaylistLinks };
