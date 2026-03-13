import { motion } from "framer-motion";
import { ArrowRight, Brain, Scale, Unlink, Lightbulb } from "lucide-react";
import { Link } from "wouter";

const tools = [
  {
    name: "Counterposition",
    description: "State a strongly held belief, then construct the strongest argument against it. Get scored on the effort and rigour of your counter-argument.",
    href: "/counterposition",
    icon: Brain,
    color: "#81B29A",
    lightBg: "rgba(129,178,154,0.08)",
    hint: "Try something like: \"I believe social media does more harm than good.\" Then argue the opposite as convincingly as you can. The stronger your counter-argument, the higher your score.",
  },
  {
    name: "Weigh It Up",
    description: "A visual pros and cons tool with weighted bars. Add factors, adjust their importance, and see which side of the decision carries more weight.",
    href: "/weigh-it-up",
    icon: Scale,
    color: "#E07A5F",
    lightBg: "rgba(224,122,95,0.08)",
    hint: "Enter a decision like \"Should I move abroad?\" then add pros and cons. Tap a bar and use +/- to adjust how important each factor is. The verdict shows which side wins overall.",
  },
  {
    name: "Unthread",
    description: "Trace a frustration or habit back through its reasoning chain, name the trade you're making, and decompose the thread to find alternatives.",
    href: "/unthread",
    icon: Unlink,
    color: "#81B29A",
    lightBg: "rgba(129,178,154,0.08)",
    hint: "Start with something you do but question, like \"Working long stressful hours.\" Then ask yourself why — because it gives you money, security, etc. Keep chaining until you find the real reason.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen p-6 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col"
        >
          <div className="text-center pt-16 sm:pt-24 pb-10">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-none">
              <span className="text-[#81B29A]">Reckon</span>
            </h1>
            <p className="text-base text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
              Tools for challenging our thinking and decisions.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 flex-1">
            {tools.map((tool, index) => (
              <Link key={tool.name} href={tool.href}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.1, duration: 0.5 }}
                  className="group rounded-lg p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-sm border border-transparent hover:border-border/60"
                  style={{ backgroundColor: tool.lightBg }}
                  data-testid={`card-${tool.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: tool.color, opacity: 0.85 }}
                      >
                        <tool.icon className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground/85">
                        {tool.name}
                      </h2>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-1 transition-all flex-shrink-0 ml-auto" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-12">
                      {tool.description}
                    </p>
                    <div className="flex items-start gap-2 rounded-md bg-background/60 p-3 ml-12">
                      <Lightbulb className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground/80 leading-relaxed italic" data-testid={`hint-${tool.name.toLowerCase().replace(/\s+/g, "-")}`}>
                        {tool.hint}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="text-center py-10">
            <Link href="/terms">
              <span className="text-xs tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer" data-testid="link-terms">
                Terms of Use
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
