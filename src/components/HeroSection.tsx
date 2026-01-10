import { Button } from "@/components/ui/button";
import { BlockchainAnimation } from "./BlockchainAnimation";
import { ArrowRight, Vote, ShieldCheck } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden pt-16">
      <BlockchainAnimation />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 blockchain-grid opacity-30" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-8 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">
              Blockchain-Secured Voting
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-foreground">Democracy Meets</span>
            <br />
            <span className="text-gradient">Blockchain Security</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            A transparent, tamper-proof voting system for state and college elections. 
            Every vote is encrypted, verified, and immutably recorded on the blockchain.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button variant="hero" size="xl">
              <Vote className="w-5 h-5 mr-2" />
              Cast Your Vote
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="xl">
              Learn How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Transparent</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-foreground">256-bit</div>
              <div className="text-sm text-muted-foreground mt-1">Encryption</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-foreground">Zero</div>
              <div className="text-sm text-muted-foreground mt-1">Tampering</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
