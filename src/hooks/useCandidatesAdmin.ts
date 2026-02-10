import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminCandidate {
  id: string;
  name: string;
  party: string | null;
  bio: string | null;
  image_url: string | null;
  election_id: string;
  election_title?: string;
}

export const useCandidatesAdmin = () => {
  const [candidates, setCandidates] = useState<AdminCandidate[]>([]);
  const [elections, setElections] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("candidates")
      .select("*, elections(title)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } else {
      setCandidates(
        (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          party: c.party,
          bio: c.bio,
          image_url: c.image_url,
          election_id: c.election_id,
          election_title: c.elections?.title || "Unknown",
        }))
      );
    }
    setLoading(false);
  };

  const fetchElections = async () => {
    const { data } = await supabase
      .from("elections")
      .select("id, title")
      .order("start_date", { ascending: false });
    setElections(data || []);
  };

  useEffect(() => {
    fetchCandidates();
    fetchElections();
  }, []);

  const createCandidate = async (candidate: {
    name: string;
    party: string;
    bio: string;
    image_url: string;
    election_id: string;
  }) => {
    const { error } = await supabase.from("candidates").insert({
      name: candidate.name,
      party: candidate.party || null,
      bio: candidate.bio || null,
      image_url: candidate.image_url || null,
      election_id: candidate.election_id,
    });

    if (error) {
      console.error("Error creating candidate:", error);
      toast.error("Failed to add candidate: " + error.message);
      return false;
    }
    toast.success("Candidate added successfully");
    await fetchCandidates();
    return true;
  };

  const updateCandidate = async (
    id: string,
    candidate: {
      name: string;
      party: string;
      bio: string;
      image_url: string;
      election_id: string;
    }
  ) => {
    const { error } = await supabase
      .from("candidates")
      .update({
        name: candidate.name,
        party: candidate.party || null,
        bio: candidate.bio || null,
        image_url: candidate.image_url || null,
        election_id: candidate.election_id,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating candidate:", error);
      toast.error("Failed to update candidate: " + error.message);
      return false;
    }
    toast.success("Candidate updated successfully");
    await fetchCandidates();
    return true;
  };

  const deleteCandidate = async (id: string) => {
    const { error } = await supabase.from("candidates").delete().eq("id", id);

    if (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete candidate: " + error.message);
      return false;
    }
    toast.success("Candidate removed successfully");
    await fetchCandidates();
    return true;
  };

  return {
    candidates,
    elections,
    loading,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    refetch: fetchCandidates,
  };
};
