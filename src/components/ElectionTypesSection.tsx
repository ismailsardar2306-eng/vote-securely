import { Button } from "@/components/ui/button";
import { Building2, GraduationCap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const electionTypes = [
  {
    icon: Building2,
    title: "State Elections",
    description: "Secure and transparent voting for gubernatorial, legislative, and local government elections. Designed to meet the highest standards of electoral integrity.",
    features: [
      "Voter roll integration with state databases",
      "Multi-constituency support",
      "Real-time result aggregation",
      "Compliance with electoral laws",
    ],
    cta: "Explore State Elections",
    color: "primary",
  },
  {
    icon: GraduationCap,
    title: "College Elections",
    description: "Empowering student democracy with modern blockchain technology. Perfect for student council, club leadership, and academic governance elections.",
    features: [
      "Integration with student information systems",
      "Department-wise voting segments",
      "Anonymous feedback collection",
      "Mobile-first voting experience",
    ],
    cta: "Explore College Elections",
    color: "secondary",
  },
];

export const ElectionTypesSection = () => {
  const navigate = useNavigate();

  const handleExplore = (type: string) => {
    navigate(`/vote?type=${type}`);
  };

  return (
    <section id="elections" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
            Election Types
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
            Built for Every Scale
          </h2>
          <p className="text-muted-foreground">
            From statewide elections to campus-level voting, VoteChain adapts 
            to meet the unique requirements of any electoral process.
          </p>
        </div>

        {/* Election Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {electionTypes.map((election, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-500"
            >
              {/* Top Gradient Bar */}
              <div className={`h-2 ${election.color === 'primary' ? 'bg-gradient-primary' : 'bg-secondary'}`} />
              
              <div className="p-8">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl ${election.color === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'} flex items-center justify-center mb-6`}>
                  <election.icon className={`w-8 h-8 ${election.color === 'primary' ? 'text-primary' : 'text-secondary'}`} />
                </div>
                
                {/* Content */}
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  {election.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {election.description}
                </p>
                
                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {election.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3 text-sm text-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full ${election.color === 'primary' ? 'bg-primary' : 'bg-secondary'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* CTA */}
                <Button 
                  variant={election.color === 'primary' ? 'default' : 'accent'}
                  className="w-full group"
                  onClick={() => handleExplore(election.title === 'State Elections' ? 'state' : 'college')}
                >
                  {election.cta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
