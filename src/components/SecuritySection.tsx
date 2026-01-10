import { Shield, Lock, Server, Eye } from "lucide-react";

const securityLayers = [
  {
    icon: Lock,
    title: "Cryptographic Security",
    items: ["SHA-256 hashing", "RSA encryption", "Zero-knowledge proofs", "Digital signatures"],
  },
  {
    icon: Server,
    title: "Infrastructure",
    items: ["Distributed nodes", "DDoS protection", "99.99% uptime SLA", "Geographic redundancy"],
  },
  {
    icon: Eye,
    title: "Audit & Compliance",
    items: ["Independent audits", "Open-source codebase", "Regulatory compliance", "Third-party verification"],
  },
];

export const SecuritySection = () => {
  return (
    <section id="security" className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-secondary blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
              Bank-Grade Security
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-4 mb-6">
              Trusted by Institutions. <br />
              Verified by Cryptography.
            </h2>
            <p className="text-primary-foreground/80 mb-8 leading-relaxed">
              VoteChain employs multiple layers of security to ensure that every 
              election is protected against fraud, manipulation, and unauthorized 
              access. Our system has been tested and certified by leading cybersecurity firms.
            </p>
            
            {/* Security Badge */}
            <div className="inline-flex items-center gap-4 p-4 rounded-xl bg-primary-foreground/10 backdrop-blur">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-display font-semibold">ISO 27001 Certified</div>
                <div className="text-sm text-primary-foreground/70">Information Security Management</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Security Layers */}
          <div className="space-y-6">
            {securityLayers.map((layer, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-primary-foreground/5 backdrop-blur border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <layer.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold mb-3">{layer.title}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {layer.items.map((item, iIndex) => (
                        <div key={iIndex} className="text-sm text-primary-foreground/70 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-secondary" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
