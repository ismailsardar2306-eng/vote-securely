import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ElectionRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  candidateCount: number;
  totalVotes: number;
}

export const useElectionsAdmin = () => {
  const [elections, setElections] = useState<ElectionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchElections = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("elections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching elections:", error);
      toast.error("Failed to load elections");
      setLoading(false);
      return;
    }

    // Fetch candidate counts and vote counts for each election
    const enriched: ElectionRow[] = await Promise.all(
      (data || []).map(async (e) => {
        const { count: candidateCount } = await supabase
          .from("candidates")
          .select("*", { count: "exact", head: true })
          .eq("election_id", e.id);

        const { data: voteCounts } = await supabase
          .from("vote_counts")
          .select("vote_count")
          .eq("election_id", e.id);

        const totalVotes = voteCounts?.reduce((sum, v) => sum + (v.vote_count || 0), 0) || 0;

        return { ...e, candidateCount: candidateCount || 0, totalVotes };
      })
    );

    setElections(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  const createElection = async (data: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
  }) => {
    const { error } = await supabase.from("elections").insert({
      title: data.title,
      description: data.description || null,
      start_date: data.start_date,
      end_date: data.end_date,
      status: "upcoming",
    });

    if (error) {
      console.error("Error creating election:", error);
      toast.error("Failed to create election");
      return false;
    }

    toast.success("Election created successfully");
    await fetchElections();
    return true;
  };

  const updateElectionStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("elections").update({ status }).eq("id", id);
    if (error) {
      console.error("Error updating election status:", error);
      toast.error("Failed to update election status");
      return false;
    }
    toast.success(`Election ${status === "active" ? "activated" : "deactivated"}`);
    await fetchElections();
    return true;
  };

  const deleteElection = async (id: string) => {
    const { error } = await supabase.from("elections").delete().eq("id", id);

    if (error) {
      console.error("Error deleting election:", error);
      toast.error("Failed to delete election");
      return false;
    }

    toast.success("Election deleted successfully");
    await fetchElections();
    return true;
  };

  return { elections, loading, createElection, deleteElection, updateElectionStatus, refetch: fetchElections };
};
