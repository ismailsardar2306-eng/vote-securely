import { UserCheck, Vote, Database, Award } from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    step: "01",
    title: "Verify Identity",
    description: "Authenticate using your official credentials and biometric verification. Multi-factor authentication ensures only eligible voters proceed.",
  },
  {
    icon: Vote,
    step: "02",
    title: "Cast Your Vote",
    description: "Select your candidates through our intuitive interface. Your vote is encrypted instantly before leaving your device.",
  },
  {
    icon: Database,
    step: "03",
    title: "Blockchain Record",
    description: "Your encrypted vote is distributed across multiple nodes and permanently recorded on the blockchain with a unique hash.",
  },
  {
    icon: Award,
    step: "04",
    title: "Verify & Confirm",
    description: "Receive a cryptographic receipt to verify your vote. Results are tallied transparently and can be audited by anyone.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 blockchain-grid opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
            How Voting Works
          </h2>
          <p className="text-muted-foreground">
            A seamless, four-step process that combines ease of use 
            with military-grade security protocols.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-secondary/50 to-secondary/10" />
              )}
              
              <div className="relative bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">{step.step}</span>
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-secondary" />
                </div>
                
                {/* Content */}
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
