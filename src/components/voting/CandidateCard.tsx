import { Check, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  image: string;
  votes?: number;
  voteCount?: number;
  manifesto: string[];
}

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
  showVoteCount?: boolean;
  totalVotes?: number;
}

export const CandidateCard = ({ 
  candidate, 
  isSelected, 
  onSelect, 
  disabled,
  showVoteCount,
  totalVotes = 0
}: CandidateCardProps) => {
  const voteCount = candidate.voteCount || candidate.votes || 0;
  const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  return (
    <div
      onClick={() => !disabled && onSelect(candidate.id)}
      className={cn(
        "relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 group",
        isSelected
          ? "border-secondary bg-secondary/5 shadow-glow"
          : "border-border bg-card hover:border-secondary/50 hover:shadow-md",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Selection Indicator */}
      <div
        className={cn(
          "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          isSelected
            ? "bg-secondary border-secondary"
            : "border-muted-foreground/30 group-hover:border-secondary/50"
        )}
      >
        {isSelected && <Check className="w-4 h-4 text-secondary-foreground" />}
      </div>

      {/* Candidate Image */}
      <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 overflow-hidden border-2 border-border group-hover:border-secondary/30 transition-colors">
        <img
          src={candidate.image}
          alt={candidate.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Candidate Info */}
      <div className="text-center mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {candidate.name}
        </h3>
        <p className="text-sm text-secondary font-medium">{candidate.party}</p>
        <p className="text-xs text-muted-foreground mt-1">{candidate.position}</p>
      </div>

      {/* Vote Count Display */}
      {showVoteCount && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              Votes
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {voteCount.toLocaleString()} ({percentage}%)
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-secondary to-secondary/70 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Manifesto Points */}
      <ul className="space-y-2">
        {candidate.manifesto.slice(0, 3).map((point, index) => (
          <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
