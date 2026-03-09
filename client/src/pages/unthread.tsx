import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowLeft, ArrowDown, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

interface ChainLink {
  id: string;
  action: string;
  reward: string;
}

interface GoalComponent {
  id: string;
  name: string;
  alternatives: { id: string; text: string }[];
  expanded: boolean;
}

type Phase = "question" | "chain" | "decompose";

export default function Unthread() {
  const [phase, setPhase] = useState<Phase>("question");
  const [question, setQuestion] = useState("");
  const [questionSet, setQuestionSet] = useState(false);
  const [chain, setChain] = useState<ChainLink[]>([]);
  const [components, setComponents] = useState<GoalComponent[]>([]);
  const [newComponentName, setNewComponentName] = useState("");

  const handleSetQuestion = () => {
    if (question.trim().length < 5) return;
    setQuestionSet(true);
    setPhase("chain");
    if (chain.length === 0) {
      setChain([{ id: generateId(), action: "", reward: "" }]);
    }
  };

  const addChainLink = () => {
    setChain(prev => [...prev, { id: generateId(), action: "", reward: "" }]);
  };

  const updateChainLink = (id: string, field: "action" | "reward", value: string) => {
    setChain(prev => prev.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const removeChainLink = (id: string) => {
    setChain(prev => prev.filter(link => link.id !== id));
  };

  const moveToDecompose = () => {
    setPhase("decompose");
  };

  const addComponent = () => {
    if (!newComponentName.trim()) return;
    setComponents(prev => [...prev, {
      id: generateId(),
      name: newComponentName.trim(),
      alternatives: [],
      expanded: true,
    }]);
    setNewComponentName("");
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  const toggleComponent = (id: string) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, expanded: !c.expanded } : c));
  };

  const addAlternative = (componentId: string) => {
    setComponents(prev => prev.map(c =>
      c.id === componentId
        ? { ...c, alternatives: [...c.alternatives, { id: generateId(), text: "" }] }
        : c
    ));
  };

  const updateAlternative = (componentId: string, altId: string, text: string) => {
    setComponents(prev => prev.map(c =>
      c.id === componentId
        ? { ...c, alternatives: c.alternatives.map(a => a.id === altId ? { ...a, text } : a) }
        : c
    ));
  };

  const removeAlternative = (componentId: string, altId: string) => {
    setComponents(prev => prev.map(c =>
      c.id === componentId
        ? { ...c, alternatives: c.alternatives.filter(a => a.id !== altId) }
        : c
    ));
  };

  const handleReset = () => {
    setQuestion("");
    setQuestionSet(false);
    setChain([]);
    setComponents([]);
    setNewComponentName("");
    setPhase("question");
  };

  const lastReward = chain.length > 0 ? chain[chain.length - 1].reward : "";
  const chainComplete = chain.length > 0 && chain.every(link => link.action.trim() && link.reward.trim());

  if (!questionSet) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl space-y-8"
        >
          <Link href="/">
            <button className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </Link>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold uppercase tracking-tighter">Unthread</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pull apart the threads of a decision. Trace a frustration back to its root purpose, identify what you really need, and discover alternative paths to get there.
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-lg font-medium block">
              What's the question or frustration you're wrestling with?
            </label>
            <Textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g., Why do I put up with the stress of work?"
              className="min-h-[120px] text-lg p-6 rounded-md border-2 border-foreground focus-visible:ring-0 focus-visible:ring-offset-0 bg-card/50"
              data-testid="input-question"
            />
          </div>

          <Button
            onClick={handleSetQuestion}
            disabled={question.trim().length < 5}
            size="lg"
            className="rounded-md h-14 px-8 uppercase tracking-widest w-full"
            data-testid="button-start-unthread"
          >
            Start Unthreading
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-home-main">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </Link>
          <Button
            onClick={handleReset}
            variant="outline"
            className="rounded-md border-2 border-foreground uppercase tracking-wider text-sm"
            data-testid="button-reset"
          >
            Reset
          </Button>
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Unthreading</p>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter" data-testid="text-question">
            "{question}"
          </h1>
        </div>

        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPhase("chain")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md border-2 transition-all ${phase === "chain" ? "bg-[#333D79] text-white border-[#333D79]" : "border-muted text-muted-foreground hover:border-foreground hover:text-foreground"}`}
            data-testid="tab-chain"
          >
            1. The Chain
          </button>
          <button
            onClick={() => chainComplete && setPhase("decompose")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md border-2 transition-all ${phase === "decompose" ? "bg-[#333D79] text-white border-[#333D79]" : "border-muted text-muted-foreground hover:border-foreground hover:text-foreground"} ${!chainComplete ? "opacity-40 cursor-not-allowed" : ""}`}
            data-testid="tab-decompose"
          >
            2. Decompose
          </button>
        </div>

        {phase === "chain" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="border-2 border-[#333D79] rounded-md p-4 bg-[#333D79]/5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Starting point</p>
              <p className="font-bold text-lg" data-testid="text-starting-point">{question}</p>
            </div>

            <AnimatePresence>
              {chain.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="border-2 border-muted rounded-md p-4 space-y-4 relative group">
                    {chain.length > 1 && (
                      <button
                        onClick={() => removeChainLink(link.id)}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        data-testid={`button-remove-link-${link.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">
                        {index === 0 ? "I do this / this happens..." : "Which leads to..."}
                      </label>
                      <Input
                        value={link.action}
                        onChange={e => updateChainLink(link.id, "action", e.target.value)}
                        placeholder={index === 0 ? "e.g., I work long stressful hours" : "e.g., I build my career"}
                        className="rounded-md border-2 border-muted h-12"
                        data-testid={`input-action-${link.id}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">
                        Because it gives me...
                      </label>
                      <Input
                        value={link.reward}
                        onChange={e => updateChainLink(link.id, "reward", e.target.value)}
                        placeholder="e.g., Money, stability, purpose"
                        className="rounded-md border-2 border-muted h-12"
                        data-testid={`input-reward-${link.id}`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-center py-2">
              <Button
                onClick={addChainLink}
                variant="outline"
                className="rounded-md border-2 border-dashed border-muted text-muted-foreground hover:border-foreground hover:text-foreground"
                data-testid="button-add-link"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add another link
              </Button>
            </div>

            {chainComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="border-2 border-[#c4868a] rounded-md p-4 bg-[#c4868a]/5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">The real goal</p>
                  <p className="font-bold text-lg text-[#c4868a]" data-testid="text-real-goal">{lastReward}</p>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={moveToDecompose}
                    className="rounded-md h-14 px-8 uppercase tracking-widest bg-[#333D79] hover:bg-[#333D79]/90"
                    data-testid="button-decompose"
                  >
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Now decompose it
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === "decompose" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="border-2 border-[#c4868a] rounded-md p-4 bg-[#c4868a]/5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Your real goal</p>
              <p className="font-bold text-xl text-[#c4868a]">{lastReward}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                What are the key components needed to achieve this goal? Break it down, then explore alternative ways to get each one.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                value={newComponentName}
                onChange={e => setNewComponentName(e.target.value)}
                placeholder="e.g., Income, Purpose, Social connection..."
                className="rounded-md border-2 border-muted h-12"
                onKeyDown={e => e.key === "Enter" && addComponent()}
                data-testid="input-add-component"
              />
              <Button
                onClick={addComponent}
                className="rounded-md border-2 border-foreground h-12 px-4"
                data-testid="button-add-component"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <AnimatePresence>
              {components.map(comp => (
                <motion.div
                  key={comp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border-2 border-muted rounded-md overflow-hidden"
                  data-testid={`component-${comp.id}`}
                >
                  <div
                    className="flex items-center justify-between p-4 bg-[#333D79]/5 cursor-pointer"
                    onClick={() => toggleComponent(comp.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#333D79] text-white flex items-center justify-center text-sm font-bold">
                        {comp.alternatives.length}
                      </div>
                      <h3 className="font-bold uppercase tracking-wider">{comp.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); removeComponent(comp.id); }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        data-testid={`button-remove-component-${comp.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {comp.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {comp.expanded && (
                    <div className="p-4 space-y-3">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        Alternative ways to get "{comp.name}":
                      </p>

                      {comp.alternatives.map(alt => (
                        <div key={alt.id} className="flex gap-2 items-center">
                          <span className="text-muted-foreground text-sm">→</span>
                          <Input
                            value={alt.text}
                            onChange={e => updateAlternative(comp.id, alt.id, e.target.value)}
                            placeholder="e.g., Freelancing, different job, passive income..."
                            className="rounded-md border-2 border-muted h-10 flex-1"
                            data-testid={`input-alternative-${alt.id}`}
                          />
                          <button
                            onClick={() => removeAlternative(comp.id, alt.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            data-testid={`button-remove-alt-${alt.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => addAlternative(comp.id)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
                        data-testid={`button-add-alternative-${comp.id}`}
                      >
                        <Plus className="h-3 w-3" />
                        Add alternative
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {components.length > 0 && components.some(c => c.alternatives.some(a => a.text.trim())) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t-4 border-foreground pt-8 space-y-6"
              >
                <h2 className="text-3xl font-bold uppercase tracking-tight text-center">The Insight</h2>
                <div className="border-2 border-muted rounded-md p-6 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    You're currently using <strong className="text-foreground">{chain[0]?.action || "your current approach"}</strong> to
                    get <strong className="text-foreground">{lastReward}</strong>. But that goal breaks down
                    into {components.length} key component{components.length !== 1 ? "s" : ""}:
                  </p>
                  <div className="space-y-3">
                    {components.map(comp => (
                      <div key={comp.id} className="pl-4 border-l-4 border-[#333D79]">
                        <p className="font-bold text-sm uppercase tracking-wider">{comp.name}</p>
                        {comp.alternatives.filter(a => a.text.trim()).length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Could also come from: {comp.alternatives.filter(a => a.text.trim()).map(a => a.text).join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed pt-2">
                    The thread is unravelled. You can now see the full picture of what you need, and whether your current path is truly the only way — or just the one you haven't questioned yet.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
