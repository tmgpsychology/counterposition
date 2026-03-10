import { motion } from "framer-motion";
import { ArrowRight, Brain, Scale, Unlink, Lightbulb } from "lucide-react";
import { Link } from "wouter";

const tools = [
  {
    name: "Counterposition",
    description: "State a strongly held belief, then construct the strongest argument against it. Get scored on the effort and rigour of your counter-argument.",
    href: "/counterposition",
    icon: Brain,
    color: "#5B7B6A",
    hint: "Try something like: \"I believe social media does more harm than good.\" Then argue the opposite as convincingly as you can. The stronger your counter-argument, the higher your score.",
  },
  {
    name: "Weigh It Up",
    description: "A visual pros and cons tool with weighted bars. Add factors, adjust their importance, and see which side of the decision carries more weight.",
    href: "/weigh-it-up",
    icon: Scale,
    color: "#C27D60",
    hint: "Enter a decision like \"Should I move abroad?\" then add pros and cons. Tap a bar and use +/- to adjust how important each factor is. The verdict shows which side wins overall.",
  },
  {
    name: "Unthread",
    description: "Trace a frustration or habit back through its reasoning chain, name the trade you're making, and decompose the thread to find alternatives.",
    href: "/unthread",
    icon: Unlink,
    color: "#5B7B6A",
    hint: "Start with something you do but question, like \"Working long stressful hours.\" Then ask yourself why — because it gives you money, security, etc. Keep chaining until you find the real reason.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen p-6 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <div className="text-center pt-12 sm:pt-20 pb-12">
            <h1 className="text-5xl sm:text-6xl font-bold uppercase tracking-tighter leading-none">
              Counter<span className="text-[#C27D60]">position</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">
              Tools for thinking clearly. Challenge your beliefs, weigh your options, and untangle your reasoning.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 flex-1">
            {tools.map((tool, index) => (
              <Link key={tool.name} href={tool.href}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group border-2 border-muted rounded-md p-6 sm:p-8 hover:border-foreground transition-all cursor-pointer relative overflow-hidden"
                  data-testid={`card-${tool.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: tool.color }}
                      >
                        <tool.icon className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
                        {tool.name}
                      </h2>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0 ml-auto" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                    <div className="flex items-start gap-2 rounded-md bg-muted/30 p-3 border border-muted/50">
                      <Lightbulb className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed italic" data-testid={`hint-${tool.name.toLowerCase().replace(/\s+/g, "-")}`}>
                        {tool.hint}
                      </p>
                    </div>
                  </div>
                  <div
                    className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: tool.color }}
                  />
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="text-center py-10">
            <Link href="/terms">
              <span className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-terms">
                Terms of Use
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
