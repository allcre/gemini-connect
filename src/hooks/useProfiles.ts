import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Use generated types from Supabase
export type Profile = Tables<"profiles"> & {
  yellowcake_data: {
    topRepos?: { name: string; stars: number; language: string }[];
    musicGenres?: string[];
    recentReviews?: { title: string; rating: number; type: string }[];
    sentimentAnalysis?: { mood: string; score: number };
    codingHours?: number;
    movieHours?: number;
  } | null;
};

export type Match = Tables<"matches">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

// Fetch all profiles for discovery
export const useProfiles = () => {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });
};

// Fetch a single profile
export const useProfile = (id: string) => {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!id,
  });
};

// Create a new profile
export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: ProfileInsert) => {
      const { data, error } = await supabase
        .from("profiles")
        .insert(profile)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

// Update a profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProfileUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile", data.id] });
    },
  });
};

// Create a match (like)
export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      matchedUserId,
      likedFeature,
    }: {
      userId: string;
      matchedUserId: string;
      likedFeature?: string;
    }) => {
      const { data, error } = await supabase
        .from("matches")
        .insert({
          user_id: userId,
          matched_user_id: matchedUserId,
          liked_feature: likedFeature,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data as Match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
};

// Fetch matches for a user
export const useMatches = (userId: string) => {
  return useQuery({
    queryKey: ["matches", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .or(`user_id.eq.${userId},matched_user_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Match[];
    },
    enabled: !!userId,
  });
};

// Upload profile photo
export const uploadProfilePhoto = async (file: File, profileId: string) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${profileId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(fileName);

  return data.publicUrl;
};
