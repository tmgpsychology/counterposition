import { motion } from "framer-motion";
import { ArrowRight, Brain, Scale, Unlink } from "lucide-react";
import { Link } from "wouter";

const tools = [
  {
    name: "Counterposition",
    description: "State a strongly held belief, then construct the strongest argument against it. Get scored on the effort and rigour of your counter-argument.",
    href: "/counterposition",
    icon: Brain,
    color: "#333D79",
    video: "/videos/counterposition_tutorial.mp4",
  },
  {
    name: "Weigh It Up",
    description: "A visual pros and cons tool with weighted bars. Add factors, adjust their importance, and see which side of the decision carries more weight.",
    href: "/weigh-it-up",
    icon: Scale,
    color: "#c4868a",
    video: "/videos/weighitup_tutorial.mp4",
  },
  {
    name: "Unthread",
    description: "Trace a frustration or habit back through its reasoning chain, name the trade you're making, and decompose the thread to find alternatives.",
    href: "/unthread",
    icon: Unlink,
    color: "#333D79",
    video: "/videos/unthread_tutorial.mp4",
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
              Counter<span className="text-[#c4868a]">position</span>
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
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="flex-1 min-w-0 space-y-3">
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
                    </div>
                    <div className="sm:w-48 flex-shrink-0 rounded-md overflow-hidden border border-muted bg-muted/10">
                      <video
                        src={tool.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto object-cover"
                        data-testid={`video-${tool.name.toLowerCase().replace(/\s+/g, "-")}`}
                      />
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
