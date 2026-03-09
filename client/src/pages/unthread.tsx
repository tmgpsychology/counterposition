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
  reasons: { id: string; text: string }[];
}

interface LinkAlternatives {
  [linkId: string]: { id: string; text: string }[];
}

type Phase = "question" | "chain" | "trade" | "decompose";

export default function Unthread() {
  const [phase, setPhase] = useState<Phase>("question");
  const [question, setQuestion] = useState("");
  const [questionSet, setQuestionSet] = useState(false);
  const [chain, setChain] = useState<ChainLink[]>([]);
  const [tradeCost, setTradeCost] = useState("");
  const [tradeGain, setTradeGain] = useState("");
  const [tradeVerdict, setTradeVerdict] = useState<"yes" | "no" | "unsure" | null>(null);
  const [tradeReflection, setTradeReflection] = useState("");
  const [linkAlternatives, setLinkAlternatives] = useState<LinkAlternatives>({});
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());

  const handleSetQuestion = () => {
    if (question.trim().length < 5) return;
    setQuestionSet(true);
    setPhase("chain");
    if (chain.length === 0) {
      setChain([{ id: generateId(), reasons: [{ id: generateId(), text: "" }] }]);
    }
  };

  const addChainLink = () => {
    setChain(prev => [...prev, { id: generateId(), reasons: [{ id: generateId(), text: "" }] }]);
  };

  const removeChainLink = (id: string) => {
    setChain(prev => prev.filter(link => link.id !== id));
  };

  const addReason = (linkId: string) => {
    setChain(prev => prev.map(link =>
      link.id === linkId
        ? { ...link, reasons: [...link.reasons, { id: generateId(), text: "" }] }
        : link
    ));
  };

  const updateReason = (linkId: string, reasonId: string, text: string) => {
    setChain(prev => prev.map(link =>
      link.id === linkId
        ? { ...link, reasons: link.reasons.map(r => r.id === reasonId ? { ...r, text } : r) }
        : link
    ));
  };

  const removeReason = (linkId: string, reasonId: string) => {
    setChain(prev => prev.map(link =>
      link.id === linkId
        ? { ...link, reasons: link.reasons.filter(r => r.id !== reasonId) }
        : link
    ));
  };

  const moveToTrade = () => {
    if (chain.length > 0) {
      setTradeCost(question);
      const lastLink = chain[chain.length - 1];
      const lastReasons = lastLink.reasons.filter(r => r.text.trim()).map(r => r.text);
      setTradeGain(lastReasons.join(", ") || "");
    }
    setPhase("trade");
  };

  const moveToDecompose = () => {
    setExpandedLinks(new Set(chain.map(link => link.id)));
    setPhase("decompose");
  };

  const toggleLinkExpanded = (linkId: string) => {
    setExpandedLinks(prev => {
      const next = new Set(prev);
      if (next.has(linkId)) next.delete(linkId);
      else next.add(linkId);
      return next;
    });
  };

  const addLinkAlternative = (linkId: string) => {
    setLinkAlternatives(prev => ({
      ...prev,
      [linkId]: [...(prev[linkId] || []), { id: generateId(), text: "" }],
    }));
  };

  const updateLinkAlternative = (linkId: string, altId: string, text: string) => {
    setLinkAlternatives(prev => ({
      ...prev,
      [linkId]: (prev[linkId] || []).map(a => a.id === altId ? { ...a, text } : a),
    }));
  };

  const removeLinkAlternative = (linkId: string, altId: string) => {
    setLinkAlternatives(prev => ({
      ...prev,
      [linkId]: (prev[linkId] || []).filter(a => a.id !== altId),
    }));
  };

  const handleReset = () => {
    setQuestion("");
    setQuestionSet(false);
    setChain([]);
    setTradeCost("");
    setTradeGain("");
    setTradeVerdict(null);
    setTradeReflection("");
    setLinkAlternatives({});
    setExpandedLinks(new Set());
    setPhase("question");
  };

  const allReasons = chain.flatMap(link => link.reasons.filter(r => r.text.trim()).map(r => r.text));
  const lastReward = allReasons.length > 0 ? allReasons[allReasons.length - 1] : "";
  const chainComplete = chain.length > 0 && chain.every(link => link.reasons.some(r => r.text.trim()));
  const tradeComplete = chainComplete && tradeVerdict !== null;

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
              placeholder="e.g., Working long stressful hours"
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

        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => setPhase("chain")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md border-2 transition-all ${phase === "chain" ? "bg-[#333D79] text-white border-[#333D79]" : "border-muted text-muted-foreground hover:border-foreground hover:text-foreground"}`}
            data-testid="tab-chain"
          >
            1. The Chain
          </button>
          <button
            onClick={() => chainComplete && moveToTrade()}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md border-2 transition-all ${phase === "trade" ? "bg-[#333D79] text-white border-[#333D79]" : "border-muted text-muted-foreground hover:border-foreground hover:text-foreground"} ${!chainComplete ? "opacity-40 cursor-not-allowed" : ""}`}
            data-testid="tab-trade"
          >
            2. The Trade
          </button>
          <button
            onClick={() => tradeComplete && setPhase("decompose")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md border-2 transition-all ${phase === "decompose" ? "bg-[#333D79] text-white border-[#333D79]" : "border-muted text-muted-foreground hover:border-foreground hover:text-foreground"} ${!tradeComplete ? "opacity-40 cursor-not-allowed" : ""}`}
            data-testid="tab-decompose"
          >
            3. Decompose
          </button>
        </div>

        {phase === "chain" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="border-2 border-[#333D79] rounded-md p-4 bg-[#333D79]/5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">I am currently doing this</p>
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

                  <div className="border-2 border-muted rounded-md p-4 space-y-3 relative group">
                    {chain.length > 1 && (
                      <button
                        onClick={() => removeChainLink(link.id)}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        data-testid={`button-remove-link-${link.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {index === 0 ? "Because..." : "And because..."}
                    </p>

                    {link.reasons.map((reason, rIdx) => (
                      <div key={reason.id} className="flex gap-2 items-center">
                        <Input
                          value={reason.text}
                          onChange={e => updateReason(link.id, reason.id, e.target.value)}
                          placeholder={
                            index === 0 && rIdx === 0
                              ? "e.g., It gives me money"
                              : index === 0
                              ? "e.g., It provides stability"
                              : index === 1 && rIdx === 0
                              ? "e.g., It lets me feel secure"
                              : "e.g., It gives me status"
                          }
                          className="rounded-md border-2 border-muted h-12 flex-1"
                          data-testid={`input-reason-${reason.id}`}
                        />
                        {link.reasons.length > 1 && (
                          <button
                            onClick={() => removeReason(link.id, reason.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                            data-testid={`button-remove-reason-${reason.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => addReason(link.id)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      data-testid={`button-add-reason-${link.id}`}
                    >
                      <Plus className="h-3 w-3" />
                      Add another reason
                    </button>
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

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={moveToTrade}
                    className="rounded-md h-14 px-8 uppercase tracking-widest bg-[#333D79] hover:bg-[#333D79]/90"
                    data-testid="button-to-trade"
                  >
                    <ArrowDown className="h-5 w-5 mr-2" />
                    Let's see what choice I'm making
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === "trade" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold uppercase tracking-tight">The Choice I'm Making</h2>
              <p className="text-sm text-muted-foreground">
                Here's the full thread of your reasoning, from what you're doing to why.
              </p>
            </div>

            <div className="space-y-0">
              <div className="border-2 border-[#c4868a] rounded-md p-4 bg-[#c4868a]/5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">What I'm doing</p>
                <p className="font-bold text-lg text-[#c4868a]" data-testid="text-trade-cost">{question}</p>
              </div>

              {chain.map((link, index) => (
                <div key={link.id}>
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="border-2 border-muted rounded-md p-3 bg-muted/5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      {index === 0 ? "Because" : "And because"}
                    </p>
                    <p className="font-medium text-sm">
                      {link.reasons.filter(r => r.text.trim()).map(r => r.text).join(", ") || "..."}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex justify-center py-1">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="border-2 border-[#333D79] rounded-md p-4 bg-[#333D79]/5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">What I'm getting</p>
                <p className="font-bold text-lg text-[#333D79]" data-testid="text-trade-gain">{tradeGain}</p>
              </div>
            </div>

            <div className="border-2 border-foreground rounded-md p-6 bg-foreground/5 text-center space-y-4">
              <p className="text-lg leading-relaxed">
                Phrased as a choice, I'm choosing to pay the cost of <strong className="text-[#c4868a]">{tradeCost}</strong> for
                the gain of <strong className="text-[#333D79]">{tradeGain}</strong>.
              </p>
              <p className="text-xl font-bold uppercase tracking-wider">
                Is this trade worth it?
              </p>
              <div className="flex justify-center gap-3 pt-2 flex-wrap">
                {(["yes", "unsure", "no"] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => setTradeVerdict(option)}
                    className={`px-6 py-3 rounded-md border-2 font-bold uppercase tracking-wider text-sm transition-all ${
                      tradeVerdict === option
                        ? option === "yes" ? "bg-[#333D79] text-white border-[#333D79]"
                          : option === "no" ? "bg-[#c4868a] text-white border-[#c4868a]"
                          : "bg-foreground text-background border-foreground"
                        : "border-muted text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                    data-testid={`button-verdict-${option}`}
                  >
                    {option === "yes" ? "Yes, worth it" : option === "no" ? "No, not worth it" : "I'm not sure"}
                  </button>
                ))}
              </div>
            </div>

            {tradeVerdict && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                    {tradeVerdict === "yes"
                      ? "What makes this trade worth it for you?"
                      : tradeVerdict === "no"
                      ? "What would need to change to make it worth it?"
                      : "What would help you decide?"}
                  </label>
                  <Textarea
                    value={tradeReflection}
                    onChange={e => setTradeReflection(e.target.value)}
                    placeholder="e.g., I'd need to find a less stressful way to earn the same income..."
                    className="min-h-[100px] rounded-md border-2 border-muted"
                    data-testid="input-trade-reflection"
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={moveToDecompose}
                    className="rounded-md h-14 px-8 uppercase tracking-widest bg-[#333D79] hover:bg-[#333D79]/90"
                    data-testid="button-to-decompose"
                  >
                    <Lightbulb className="h-5 w-5 mr-2" />
                    {tradeVerdict === "yes" ? "Explore it deeper" : "Find alternatives"}
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
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Decompose The Thread</h2>
              <p className="text-sm text-muted-foreground">
                Each link in your chain is a choice. Expand any step to explore what else could serve the same purpose.
              </p>
            </div>

            <div className="space-y-3">
              {chain.map((link, index) => {
                const reasons = link.reasons.filter(r => r.text.trim());
                const alts = linkAlternatives[link.id] || [];
                const isExpanded = expandedLinks.has(link.id);
                const reasonsSummary = reasons.map(r => r.text).join(", ");
                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-2 border-muted rounded-md overflow-hidden"
                    data-testid={`decompose-link-${link.id}`}
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => toggleLinkExpanded(link.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 w-7 h-7 rounded-md bg-[#333D79] text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">Because</p>
                          <p className="font-bold text-sm truncate" data-testid={`text-link-reasons-${link.id}`}>
                            {reasonsSummary || "..."}
                          </p>
                        </div>
                        {alts.filter(a => a.text.trim()).length > 0 && (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#c4868a] text-white flex items-center justify-center text-xs font-bold">
                            {alts.filter(a => a.text.trim()).length}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 space-y-3 border-t border-muted">
                            <div className="bg-muted/20 rounded-md p-3 mt-3">
                              <p className="text-xs text-muted-foreground">
                                You said this is because: <strong className="text-foreground">{reasonsSummary || "..."}</strong>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                What alternatives could replace this step?
                              </p>
                            </div>

                            {alts.map(alt => (
                              <div key={alt.id} className="flex gap-2 items-center">
                                <span className="text-[#c4868a] text-sm font-bold flex-shrink-0">→</span>
                                <Input
                                  value={alt.text}
                                  onChange={e => updateLinkAlternative(link.id, alt.id, e.target.value)}
                                  placeholder="e.g., Freelancing, a different role, passive income..."
                                  className="rounded-md border-2 border-muted h-10 flex-1"
                                  data-testid={`input-alt-${alt.id}`}
                                />
                                <button
                                  onClick={() => removeLinkAlternative(link.id, alt.id)}
                                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                                  data-testid={`button-remove-alt-${alt.id}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}

                            <button
                              onClick={() => addLinkAlternative(link.id)}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
                              data-testid={`button-add-alt-${link.id}`}
                            >
                              <Plus className="h-3 w-3" />
                              Add alternative
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {chain.some(link => (linkAlternatives[link.id] || []).some(a => a.text.trim())) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t-4 border-foreground pt-8 space-y-6"
              >
                <h2 className="text-3xl font-bold uppercase tracking-tight text-center">The Insight</h2>
                <div className="border-2 border-muted rounded-md p-6 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    You traced a thread from <strong className="text-foreground">{question}</strong> through
                    {chain.length} layer{chain.length !== 1 ? "s" : ""} of reasoning. Here's where
                    the thread could be rewoven:
                  </p>
                  <div className="space-y-3">
                    {chain.filter(link => (linkAlternatives[link.id] || []).some(a => a.text.trim())).map(link => {
                      const reasonsText = link.reasons.filter(r => r.text.trim()).map(r => r.text).join(", ");
                      return (
                        <div key={link.id} className="pl-4 border-l-4 border-[#c4868a]">
                          <p className="font-bold text-sm">
                            Instead of: <span className="text-[#333D79]">{reasonsText}</span>
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {(linkAlternatives[link.id] || []).filter(a => a.text.trim()).map(a => a.text).join(" · ")}
                          </p>
                        </div>
                      );
                    })}
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
