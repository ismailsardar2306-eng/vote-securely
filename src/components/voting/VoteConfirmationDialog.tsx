import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Candidate } from "./CandidateCard";
import { AlertTriangle, Vote, Loader2 } from "lucide-react";

interface VoteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export const VoteConfirmationDialog = ({
  open,
  onOpenChange,
  candidate,
  onConfirm,
  isSubmitting,
}: VoteConfirmationDialogProps) => {
  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Vote className="w-5 h-5 text-secondary" />
            Confirm Your Vote
          </DialogTitle>
          <DialogDescription>
            Please review your selection before submitting. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Candidate Preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="w-16 h-16 rounded-full bg-muted overflow-hidden border-2 border-secondary">
              <img
                src={candidate.image}
                alt={candidate.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground">
                {candidate.name}
              </h4>
              <p className="text-sm text-secondary">{candidate.party}</p>
              <p className="text-xs text-muted-foreground">{candidate.position}</p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              Your vote will be permanently recorded on the blockchain. 
              Please ensure this is your final choice.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Go Back
          </Button>
          <Button
            variant="hero"
            className="flex-1"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Vote className="w-4 h-4 mr-2" />
                Cast Vote
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
