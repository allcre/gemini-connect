import type { YellowcakeData } from "@/types/profile";

// Raw song data from Spotify playlists
const rawSpotifySongs = [
  { "song_title": "Temperature", "artist_name": "Sean Paul" },
  { "song_title": "Guess featuring billie eilish", "artist_name": "Charli xcx, Billie Eilish" },
  { "song_title": "Gimme More", "artist_name": "Britney Spears" },
  { "song_title": "Get Busy", "artist_name": "Sean Paul" },
  { "song_title": "Womanizer", "artist_name": "Britney Spears" },
  { "song_title": "The Sweet Escape", "artist_name": "Gwen Stefani, Akon" },
  { "song_title": "Where Them Girls At (feat. Nicki Minaj & Flo Rida)", "artist_name": "David Guetta, Flo Rida, Nicki Minaj" },
  { "song_title": "Last Friday Night (T.G.I.F.)", "artist_name": "Katy Perry" },
  { "song_title": "Wannabe", "artist_name": "Spice Girls" },
  { "song_title": "Die Young", "artist_name": "Kesha" },
  { "song_title": "When I Grow Up", "artist_name": "The Pussycat Dolls" },
  { "song_title": "Don't Cha", "artist_name": "The Pussycat Dolls, Busta Rhymes" },
  { "song_title": "Cardboard Box", "artist_name": "FLO" },
  { "song_title": "Sexy And I Know It", "artist_name": "LMFAO" },
  { "song_title": "Give It To Me", "artist_name": "Timbaland, Justin Timberlake, Nelly Furtado" },
  { "song_title": "Jenny from the Block (feat. Jadakiss & Styles P.) - Track Masters Remix", "artist_name": "Jennifer Lopez, Jadakiss, Styles P" },
  { "song_title": "My Love (feat. T.I.)", "artist_name": "Justin Timberlake, T.I." },
  { "song_title": "Talk Dirty (feat. 2 Chainz)", "artist_name": "Jason Derulo, 2 Chainz" },
  { "song_title": "S&M", "artist_name": "Rihanna" },
  { "song_title": "Only Girl (In The World)", "artist_name": "Rihanna" },
  { "song_title": "bum crush v2", "artist_name": "Yazida, angelus" },
  { "song_title": "guy like you", "artist_name": "Yazida" },
  { "song_title": "POISON FLIP - LeeJi Remix", "artist_name": "berryblue, LeeJi" },
  { "song_title": "beReal", "artist_name": "Clark Rainbow" },
  { "song_title": "CLOVER", "artist_name": "Cannelle" },
  { "song_title": "obsessed", "artist_name": "Ilykimchi" },
  { "song_title": "Enjoy Yourself", "artist_name": "berryblue" },
  { "song_title": "Chainsaw", "artist_name": "Clark Rainbow" },
  { "song_title": "Mosquito", "artist_name": "PinkPantheress" },
  { "song_title": "Can't Get over Me", "artist_name": "Take Van" },
  { "song_title": "IN A MOOD", "artist_name": "berryblue" },
  { "song_title": "Illegal", "artist_name": "PinkPantheress" },
  { "song_title": "Stateside", "artist_name": "PinkPantheress" },
  { "song_title": "LUCKY", "artist_name": "Cannelle, 3mouth" },
  { "song_title": "Care", "artist_name": "Clark Rainbow" },
  { "song_title": "FILLE", "artist_name": "Cannelle" },
  { "song_title": "Daylight Blush", "artist_name": "Take Van" },
  { "song_title": "Tonight", "artist_name": "PinkPantheress" },
];

/**
 * Get hardcoded Spotify playlist songs formatted for YellowcakeData
 */
export function getHardcodedSpotifySongs(): Array<{ track_name: string; artist_name: string }> {
  return rawSpotifySongs.map(song => ({
    track_name: song.song_title,
    artist_name: song.artist_name,
  }));
}

/**
 * Get hardcoded Spotify data formatted for YellowcakeData
 * Extracts genres and artists from the song list
 */
export function getHardcodedSpotifyData(): Partial<YellowcakeData> {
  const playlistSongs = getHardcodedSpotifySongs();

  // Extract unique artists
  const artists = Array.from(new Set(playlistSongs.map(song => song.artist_name)));

  // Extract genres (this is a simplified version - in real data you'd get genres from Spotify API)
  // For demo purposes, we can infer some genres from the artist names
  const genres: string[] = []; // Would be populated from actual Spotify data

  return {
    playlistSongs,
    topArtists: artists,
    musicGenres: genres,
  };
}
