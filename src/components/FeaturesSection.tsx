import { Shield, Eye, Lock, Fingerprint, Server, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Immutable Records",
    description: "Every vote is permanently recorded on the blockchain, creating an unalterable audit trail that ensures complete transparency.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Advanced 256-bit encryption protects voter identity and ballot choices from the moment of casting to final tally.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Verification",
    description: "Multi-factor authentication including biometric verification ensures only authorized voters can participate.",
  },
  {
    icon: Eye,
    title: "Real-time Monitoring",
    description: "Live dashboards allow stakeholders to monitor election progress while maintaining voter anonymity.",
  },
  {
    icon: Server,
    title: "Decentralized Network",
    description: "Distributed nodes eliminate single points of failure, making the system resilient against attacks.",
  },
  {
    icon: CheckCircle,
    title: "Instant Verification",
    description: "Voters receive cryptographic receipts to independently verify their vote was correctly recorded.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-background relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
            Why Choose VoteChain
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
            Security Features That Matter
          </h2>
          <p className="text-muted-foreground">
            Built on cutting-edge blockchain technology to ensure every vote counts 
            and every election is fair, transparent, and trustworthy.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-gradient-card border border-border hover:border-secondary/30 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
