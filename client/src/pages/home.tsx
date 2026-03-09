import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Brain, RefreshCcw, ShieldAlert, Zap, BookOpen, Scale, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { calculateEffortScore, type ScoreResult } from "@/lib/scoring";
import heroShape from "@/assets/images/hero-shape.png";

type Step = "landing" | "belief" | "counter" | "analyzing" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [belief, setBelief] = useState("");
  const [counterArgument, setCounterArgument] = useState("");
  const [score, setScore] = useState<ScoreResult | null>(null);

  const handleStart = () => setStep("belief");

  const handleBeliefSubmit = () => {
    if (belief.trim().length > 10) {
      setStep("counter");
    }
  };

  const handleCounterSubmit = () => {
    if (counterArgument.trim().length > 10) {
      setStep("analyzing");
      // Simulate AI analysis delay
      setTimeout(() => {
        setScore(calculateEffortScore(belief, counterArgument));
        setStep("result");
      }, 3000);
    }
  };

  const handleReset = () => {
    setBelief("");
    setCounterArgument("");
    setScore(null);
    setStep("landing");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden relative">
      {/* Brutalist accents */}
      <div className="fixed top-0 left-0 w-full h-2 bg-foreground z-50"></div>
      <div className="fixed bottom-0 right-0 w-2 h-full bg-foreground z-50 hidden md:block"></div>
      
      <AnimatePresence mode="wait">
        {step === "landing" && (
          <motion.div
            key="landing"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-8">
              <h1 className="text-6xl sm:text-7xl font-bold uppercase tracking-tighter leading-none">
                Counter<br/>Position
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                An assessment of the robustness of your argument. State your position, argue against it, get an effort score. Then, if the effort score is high, and the counterposition does not convince you, the integrity of your original position is increased. Simple, thorough, robust.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleStart} 
                  size="lg" 
                  className="rounded-none border-2 border-foreground h-16 px-8 text-lg uppercase tracking-wider group hover:bg-transparent hover:text-foreground transition-all duration-300"
                  data-testid="button-get-started"
                >
                  Get Started
                  <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
                <Link href="/weigh-it-up">
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="rounded-none border-2 border-foreground h-16 px-8 text-lg uppercase tracking-wider group hover:bg-foreground hover:text-background transition-all duration-300 w-full"
                    data-testid="button-weigh-it-up"
                  >
                    <Scale className="mr-3 h-5 w-5" />
                    Weigh It Up
                  </Button>
                </Link>
                <Link href="/unthread">
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="rounded-none border-2 border-foreground h-16 px-8 text-lg uppercase tracking-wider group hover:bg-foreground hover:text-background transition-all duration-300 w-full"
                    data-testid="button-unthread"
                  >
                    <Unlink className="mr-3 h-5 w-5" />
                    Unthread
                  </Button>
                </Link>
              </div>
              <Link href="/terms">
                <span className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-terms">
                  Terms of Use
                </span>
              </Link>
            </div>
            <div className="hidden md:flex justify-end relative">
              <div className="absolute inset-0 bg-foreground/5 translate-x-4 translate-y-4 z-0"></div>
              <img 
                src={heroShape} 
                alt="Abstract shape" 
                className="w-full max-w-md object-cover grayscale contrast-125 border-4 border-foreground relative z-10"
              />
            </div>
          </motion.div>
        )}

        {step === "belief" && (
          <motion.div
            key="belief"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-2xl w-full"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center text-xl font-bold">1</div>
                <h2 className="text-3xl font-bold uppercase tracking-tight">The Thesis</h2>
              </div>
              
              <div className="space-y-4">
                <label className="text-lg font-medium block">
                  State a position you strongly believe to be true.
                </label>
                <Textarea 
                  value={belief}
                  onChange={(e) => setBelief(e.target.value)}
                  placeholder="e.g., Universal basic income is essential for the future of society..."
                  className="min-h-[200px] text-lg p-6 rounded-none border-2 border-foreground focus-visible:ring-0 focus-visible:ring-offset-0 bg-card/50"
                  data-testid="input-belief"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleBeliefSubmit}
                  disabled={belief.trim().length < 10}
                  size="lg"
                  className="rounded-none h-14 px-8 uppercase tracking-widest"
                  data-testid="button-submit-belief"
                >
                  Lock In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "counter" && (
          <motion.div
            key="counter"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-3xl"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-destructive text-destructive-foreground flex items-center justify-center text-xl font-bold">2</div>
                <h2 className="text-3xl font-bold uppercase tracking-tight">The Antithesis</h2>
              </div>
              
              <Card className="rounded-none border-2 border-muted bg-muted/20">
                <CardContent className="p-6">
                  <p className="text-sm font-bold uppercase text-muted-foreground mb-2">Target Belief:</p>
                  <p className="text-lg italic border-l-4 border-foreground pl-4 py-1">"{belief}"</p>
                </CardContent>
              </Card>

              <div className="space-y-4 mt-8">
                <label className="text-lg font-medium block">
                  Now, construct the strongest possible argument <span className="font-bold underline decoration-destructive underline-offset-4">against</span> this position.
                </label>
                <p className="text-muted-foreground text-sm">
                  You are being graded purely on intellectual effort, depth of reasoning, and consideration of opposing viewpoints. Superficial arguments will be penalized.
                </p>
                <Textarea 
                  value={counterArgument}
                  onChange={(e) => setCounterArgument(e.target.value)}
                  placeholder="The primary flaw in this thinking is..."
                  className="min-h-[250px] text-lg p-6 rounded-none border-2 border-foreground focus-visible:ring-0 focus-visible:ring-offset-0 bg-card/50"
                  data-testid="input-counter"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setStep("belief")}
                  size="lg"
                  className="rounded-none h-14 px-8 uppercase tracking-widest border-2"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleCounterSubmit}
                  disabled={counterArgument.trim().length < 10}
                  size="lg"
                  className="rounded-none h-14 px-8 uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  data-testid="button-submit-counter"
                >
                  Submit for Analysis
                  <Brain className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md text-center space-y-8"
          >
            <div className="relative w-32 h-32 mx-auto">
              <motion.div 
                className="absolute inset-0 border-4 border-foreground rounded-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-4 bg-foreground"
                animate={{ scale: [1, 0.8, 1], rotate: -180 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-bold uppercase tracking-widest">Processing</h3>
              <p className="text-muted-foreground animate-pulse">
                Evaluating structural depth and cognitive effort...
              </p>
            </div>
          </motion.div>
        )}

        {step === "result" && score && (
          <motion.div
            key="result"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-4xl"
          >
            <div className="grid md:grid-cols-[1fr_2fr] gap-8">
              {/* Score Display */}
              <div className="flex flex-col items-center justify-center p-8 border-4 border-foreground bg-card">
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Effort Grade</p>
                <div className="relative">
                  <span className="text-9xl font-bold tracking-tighter leading-none block">
                    {score.grade}
                  </span>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className={`h-4 mt-4 ${
                      score.grade.startsWith('A') ? 'bg-green-500' :
                      score.grade.startsWith('B') ? 'bg-blue-500' :
                      score.grade.startsWith('C') ? 'bg-yellow-500' :
                      'bg-destructive'
                    }`}
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-6">
                <div className="border-b-2 border-foreground pb-4">
                  <h2 className="text-4xl font-bold uppercase tracking-tight mb-2">Analysis Report</h2>
                  <p className="text-xl italic">"{score.summary}"</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <MetricCard 
                    title="Structural Depth" 
                    grade={score.metrics.depth.grade}
                    icon={<Brain className="h-5 w-5" />}
                    desc={score.metrics.depth.desc}
                  />
                  <MetricCard 
                    title="Intellectual Friction" 
                    grade={score.metrics.friction.grade}
                    icon={<Zap className="h-5 w-5" />}
                    desc={score.metrics.friction.desc}
                  />
                  <MetricCard 
                    title="Rhetorical Range" 
                    grade={score.metrics.vocabulary.grade}
                    icon={<ShieldAlert className="h-5 w-5" />}
                    desc={score.metrics.vocabulary.desc}
                  />
                  <MetricCard 
                    title="Research Quality" 
                    grade={score.metrics.research.grade}
                    icon={<BookOpen className="h-5 w-5" />}
                    desc={score.metrics.research.desc}
                  />
                </div>

                <div className="pt-8">
                  <Button 
                    onClick={handleReset}
                    className="w-full rounded-none border-2 border-foreground h-16 text-lg uppercase tracking-widest bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all"
                  >
                    <RefreshCcw className="mr-3 h-5 w-5" />
                    New Hypothesis
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ title, grade, icon, desc }: { title: string, grade: string, icon: React.ReactNode, desc: string }) {
  return (
    <div className="p-4 border-2 border-muted bg-card">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold uppercase text-sm tracking-wider flex items-center gap-2">
          {icon}
          {title}
        </span>
        <span className={`font-bold text-lg ${
          grade.startsWith('A') ? 'text-green-500' :
          grade.startsWith('B') ? 'text-blue-500' :
          grade.startsWith('C') ? 'text-yellow-500' :
          'text-destructive'
        }`}>{grade}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-3">{desc}</p>
    </div>
  );
}
