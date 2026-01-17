/**
 * Quick test to extract info from a single playlist
 */

import { extractPlaylistInfo } from './client';

async function testSinglePlaylist() {
  const playlistURL = 'https://open.spotify.com/playlist/2dGLmkK1lyuYxakT9sRfkr';

  console.log('🎵 Testing playlist extraction...');
  console.log(`URL: ${playlistURL}\n`);

  try {
    const playlistInfo = await extractPlaylistInfo(playlistURL, (progressEvent) => {
      console.log(`  [${progressEvent.stage}] ${progressEvent.message || ''}`);
      if (progressEvent.schema) {
        console.log(`  Schema: ${progressEvent.schema.join(', ')}`);
      }
    });

    console.log('\n✅ Playlist extraction complete!\n');
    console.log('='.repeat(80));
    console.log(`📀 Title: ${playlistInfo.playlist_title}`);
    console.log(`🔗 URL: ${playlistInfo.playlist_url}`);
    console.log(`🎼 Tracks: ${playlistInfo.track_count || playlistInfo.tracks.length}\n`);

    if (playlistInfo.tracks.length > 0) {
      console.log('Songs:');
      playlistInfo.tracks.forEach((track, index) => {
        console.log(`  ${index + 1}. ${track.track_name} - ${track.artist_name}`);
      });
    } else {
      console.log('⚠️  No tracks found');
    }

    return playlistInfo;
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    throw error;
  }
}

testSinglePlaylist().catch(console.error);
