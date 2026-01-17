-- Create profiles table for user dating profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE,
  name TEXT NOT NULL,
  age INTEGER,
  location TEXT,
  bio TEXT,
  target_audience TEXT,
  yellowcake_data JSONB DEFAULT '{}'::jsonb,
  best_features TEXT[] DEFAULT '{}',
  compatibility_score INTEGER DEFAULT 0,
  github_username TEXT,
  letterboxd_username TEXT,
  spotify_username TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  liked_feature TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, matched_user_id)
);

-- Create messages table for matched users
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_history table for Gemini Coach conversations
CREATE TABLE public.chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- For now, allow public access since we're skipping auth
-- In production, these would be tied to auth.uid()
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read on matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert on matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on matches" ON public.matches FOR UPDATE USING (true);

CREATE POLICY "Allow public read on messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on messages" ON public.messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on chat_history" ON public.chat_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert on chat_history" ON public.chat_history FOR INSERT WITH CHECK (true);

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

-- Storage policies for profile photos
CREATE POLICY "Public read access for profile photos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Public upload access for profile photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-photos');
CREATE POLICY "Public update access for profile photos" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-photos');
CREATE POLICY "Public delete access for profile photos" ON storage.objects FOR DELETE USING (bucket_id = 'profile-photos');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with sample profiles for discovery
INSERT INTO public.profiles (name, age, location, bio, target_audience, yellowcake_data, best_features, compatibility_score, github_username, letterboxd_username) VALUES
('Maya Chen', 26, 'San Francisco, CA', 'Code by day, cinema by night. My Letterboxd is basically my love language. Looking for someone to debug life''s edge cases with.', 'Thoughtful tech enthusiasts', 
'{"topRepos": [{"name": "neural-art-generator", "stars": 342, "language": "Python"}, {"name": "indie-film-api", "stars": 89, "language": "TypeScript"}], "musicGenres": ["Indie Folk", "Lo-fi", "Jazz Hop"], "recentReviews": [{"title": "Past Lives", "rating": 5, "type": "movie"}], "sentimentAnalysis": {"mood": "Contemplative", "score": 0.78}, "codingHours": 32, "movieHours": 14}'::jsonb,
ARRAY['A24 film connoisseur', 'Open source contributor', 'Cozy coffee shop energy'], 94, 'mayachen', 'maya_films'),

('Jordan Rivera', 28, 'Austin, TX', 'Full-stack human. Building startups, playlists, and hopefully something real. My GitHub activity graph is greener than my thumb.', 'Creative entrepreneurs',
'{"topRepos": [{"name": "startup-boilerplate", "stars": 1204, "language": "TypeScript"}, {"name": "music-viz-react", "stars": 567, "language": "JavaScript"}], "musicGenres": ["Electronic", "Synthwave", "Alternative Rock"], "recentReviews": [{"title": "Dune: Part Two", "rating": 4.5, "type": "movie"}], "sentimentAnalysis": {"mood": "Energetic", "score": 0.85}, "codingHours": 45, "movieHours": 8}'::jsonb,
ARRAY['1000+ GitHub stars', 'Festival energy', 'Actually replies to texts'], 87, 'jrivera', 'jordan_watches'),

('Alex Kim', 24, 'Brooklyn, NY', 'Pixel artist turned software engineer. My commit messages are poetry. Let''s get lost in a museum or a really good README.', 'Art-loving introverts',
'{"topRepos": [{"name": "pixel-art-editor", "stars": 2341, "language": "Rust"}, {"name": "generative-patterns", "stars": 432, "language": "Processing"}], "musicGenres": ["Ambient", "Classical Crossover", "Chillwave"], "recentReviews": [{"title": "Spider-Man: Across the Spider-Verse", "rating": 5, "type": "movie"}], "sentimentAnalysis": {"mood": "Creative", "score": 0.92}, "codingHours": 28, "movieHours": 18}'::jsonb,
ARRAY['Viral pixel art creator', 'Museum regular', 'Makes the best playlists'], 91, 'alexkim', 'alex_cinema');