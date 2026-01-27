import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Election {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
}

export interface Candidate {
  id: string;
  election_id: string;
  name: string;
  party: string | null;
  bio: string | null;
  image_url: string | null;
}

export interface VoteCount {
  candidate_id: string;
  count: number;
}

export const useElection = (electionId?: string) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all elections
  useEffect(() => {
    const fetchElections = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("elections")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching elections:", error);
        setLoading(false);
      } else {
        setElections(data || []);
        // Set the first active election as default
        const active = data?.find((e) => e.status === "active");
        if (active && !electionId) {
          setActiveElection(active);
        } else {
          // No active election found, stop loading
          setLoading(false);
        }
      }
    };

    fetchElections();
  }, [electionId]);

  // Fetch specific election if ID provided
  useEffect(() => {
    if (!electionId) return;

    const fetchElection = async () => {
      const { data, error } = await supabase
        .from("elections")
        .select("*")
        .eq("id", electionId)
        .single();

      if (error) {
        console.error("Error fetching election:", error);
      } else {
        setActiveElection(data);
      }
    };

    fetchElection();
  }, [electionId]);

  // Fetch candidates for active election
  useEffect(() => {
    if (!activeElection?.id) return;

    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("election_id", activeElection.id);

      if (error) {
        console.error("Error fetching candidates:", error);
      } else {
        setCandidates(data || []);
      }
    };

    fetchCandidates();
  }, [activeElection?.id]);

  // Fetch vote counts from aggregated view (protects ballot secrecy)
  const fetchVoteCounts = async () => {
    if (!activeElection?.id) return;

    // Get vote counts per candidate from the secure vote_counts view
    const { data: voteCounts, error } = await supabase
      .from("vote_counts")
      .select("candidate_id, vote_count")
      .eq("election_id", activeElection.id);

    if (error) {
      console.error("Error fetching vote counts:", error);
      return;
    }

    const counts: Record<string, number> = {};
    let total = 0;

    voteCounts?.forEach((row) => {
      counts[row.candidate_id] = row.vote_count;
      total += row.vote_count;
    });

    setVoteCounts(counts);
    setTotalVotes(total);
  };

  // Check if current user has voted
  const checkUserVote = async (userId: string) => {
    if (!activeElection?.id) return;

    const { data, error } = await supabase
      .from("votes")
      .select("id")
      .eq("election_id", activeElection.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      setHasVoted(true);
    }
  };

  // Fetch votes and set up realtime subscription
  useEffect(() => {
    if (!activeElection?.id) return;

    fetchVoteCounts();
    setLoading(false);

    // Subscribe to realtime vote updates
    const channel = supabase
      .channel(`votes-${activeElection.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `election_id=eq.${activeElection.id}`,
        },
        (payload) => {
          console.log("New vote received:", payload);
          const newVote = payload.new as { candidate_id: string };
          
          setVoteCounts((prev) => ({
            ...prev,
            [newVote.candidate_id]: (prev[newVote.candidate_id] || 0) + 1,
          }));
          setTotalVotes((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeElection?.id]);

  // Cast a vote
  const castVote = async (
    candidateId: string,
    userId: string
  ): Promise<{ success: boolean; hash?: string; error?: string }> => {
    if (!activeElection?.id) {
      return { success: false, error: "No active election" };
    }

    // Generate a mock blockchain hash
    const blockchainHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    const { error } = await supabase.from("votes").insert({
      election_id: activeElection.id,
      candidate_id: candidateId,
      user_id: userId,
      blockchain_hash: blockchainHash,
    });

    if (error) {
      console.error("Error casting vote:", error);
      if (error.code === "23505") {
        return { success: false, error: "You have already voted in this election" };
      }
      return { success: false, error: error.message };
    }

    setHasVoted(true);
    return { success: true, hash: blockchainHash };
  };

  return {
    elections,
    activeElection,
    candidates,
    voteCounts,
    totalVotes,
    hasVoted,
    loading,
    castVote,
    checkUserVote,
    setActiveElection,
  };
};
