import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./useWeb3";
import { toast } from "sonner";

export interface BlockchainElection {
  id: number;
  title: string;
  description: string;
  electionType: string;
  startDate: Date;
  endDate: Date;
  status: "upcoming" | "active" | "completed";
}

export interface BlockchainCandidate {
  id: number;
  electionId: number;
  name: string;
  party: string;
  bio: string;
  imageUrl: string;
  voteCount: number;
}

export const useBlockchainElection = () => {
  const { contract, account, isAdmin } = useWeb3();
  const [loading, setLoading] = useState(false);

  // Fetch all elections
  const fetchElections = useCallback(async (): Promise<BlockchainElection[]> => {
    if (!contract) return [];
    
    setLoading(true);
    try {
      const count = await contract.electionCount();
      const elections: BlockchainElection[] = [];
      
      for (let i = 1; i <= count.toNumber(); i++) {
        const [id, title, description, electionType, startDate, endDate, exists] = 
          await contract.getElection(i);
        
        if (exists) {
          const statusStr = await contract.getElectionStatus(i);
          elections.push({
            id: id.toNumber(),
            title,
            description,
            electionType,
            startDate: new Date(startDate.toNumber() * 1000),
            endDate: new Date(endDate.toNumber() * 1000),
            status: statusStr as "upcoming" | "active" | "completed",
          });
        }
      }
      
      return elections;
    } catch (error) {
      console.error("Error fetching elections:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Fetch candidates for an election
  const fetchCandidates = useCallback(async (electionId: number): Promise<BlockchainCandidate[]> => {
    if (!contract) return [];
    
    try {
      const candidateIds = await contract.getElectionCandidateIds(electionId);
      const candidates: BlockchainCandidate[] = [];
      
      for (const cId of candidateIds) {
        const [id, eId, name, party, bio, imageUrl, voteCount] = 
          await contract.getCandidate(cId.toNumber());
        
        candidates.push({
          id: id.toNumber(),
          electionId: eId.toNumber(),
          name,
          party,
          bio,
          imageUrl,
          voteCount: voteCount.toNumber(),
        });
      }
      
      return candidates;
    } catch (error) {
      console.error("Error fetching candidates:", error);
      return [];
    }
  }, [contract]);

  // Check if user has voted in election
  const hasVotedInElection = useCallback(async (electionId: number): Promise<boolean> => {
    if (!contract || !account) return false;
    
    try {
      return await contract.hasVotedInElection(electionId, account);
    } catch (error) {
      console.error("Error checking vote status:", error);
      return false;
    }
  }, [contract, account]);

  // Cast a vote
  const castVote = useCallback(async (electionId: number, candidateId: number): Promise<string | null> => {
    if (!contract) {
      toast.error("Contract not connected");
      return null;
    }
    
    setLoading(true);
    try {
      const tx = await contract.castVote(electionId, candidateId);
      const receipt = await tx.wait();
      
      toast.success("Vote cast successfully!", {
        description: `Transaction: ${receipt.transactionHash.slice(0, 10)}...`,
      });
      
      return receipt.transactionHash;
    } catch (error: any) {
      console.error("Error casting vote:", error);
      toast.error("Failed to cast vote", {
        description: error.reason || error.message,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Admin: Create election
  const createElection = useCallback(async (
    title: string,
    description: string,
    electionType: string,
    startDate: Date,
    endDate: Date
  ): Promise<number | null> => {
    if (!contract || !isAdmin) {
      toast.error("Unauthorized or not connected");
      return null;
    }
    
    setLoading(true);
    try {
      const tx = await contract.createElection(
        title,
        description,
        electionType,
        Math.floor(startDate.getTime() / 1000),
        Math.floor(endDate.getTime() / 1000)
      );
      const receipt = await tx.wait();
      
      // Get election ID from event
      const event = receipt.events?.find((e: any) => e.event === "ElectionCreated");
      const electionId = event?.args?.electionId?.toNumber();
      
      toast.success("Election created!", {
        description: `ID: ${electionId}`,
      });
      
      return electionId;
    } catch (error: any) {
      console.error("Error creating election:", error);
      toast.error("Failed to create election", {
        description: error.reason || error.message,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract, isAdmin]);

  // Admin: Add candidate
  const addCandidate = useCallback(async (
    electionId: number,
    name: string,
    party: string,
    bio: string,
    imageUrl: string
  ): Promise<number | null> => {
    if (!contract || !isAdmin) {
      toast.error("Unauthorized or not connected");
      return null;
    }
    
    setLoading(true);
    try {
      const tx = await contract.addCandidate(electionId, name, party, bio, imageUrl);
      const receipt = await tx.wait();
      
      const event = receipt.events?.find((e: any) => e.event === "CandidateAdded");
      const candidateId = event?.args?.candidateId?.toNumber();
      
      toast.success("Candidate added!", {
        description: `ID: ${candidateId}`,
      });
      
      return candidateId;
    } catch (error: any) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate", {
        description: error.reason || error.message,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract, isAdmin]);

  // Admin: Verify voter
  const verifyVoter = useCallback(async (voterAddress: string, voterId: string): Promise<boolean> => {
    if (!contract || !isAdmin) {
      toast.error("Unauthorized or not connected");
      return false;
    }
    
    setLoading(true);
    try {
      const tx = await contract.verifyVoter(voterAddress, voterId);
      await tx.wait();
      
      toast.success("Voter verified!", {
        description: `Address: ${voterAddress.slice(0, 10)}...`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error verifying voter:", error);
      toast.error("Failed to verify voter", {
        description: error.reason || error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [contract, isAdmin]);

  // Get total votes for election
  const getTotalVotes = useCallback(async (electionId: number): Promise<number> => {
    if (!contract) return 0;
    
    try {
      const total = await contract.getTotalVotesForElection(electionId);
      return total.toNumber();
    } catch (error) {
      console.error("Error getting total votes:", error);
      return 0;
    }
  }, [contract]);

  return {
    loading,
    fetchElections,
    fetchCandidates,
    hasVotedInElection,
    castVote,
    createElection,
    addCandidate,
    verifyVoter,
    getTotalVotes,
  };
};
