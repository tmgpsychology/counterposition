import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowLeft, ArrowDown, Lightbulb, ChevronDown, ChevronUp, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GuestSignupPrompt } from "@/components/guest-signup-prompt";

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
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [dismissedPrompt, setDismissedPrompt] = useState(false);

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
    setSaved(false);
    setSaveError("");
    setDismissedPrompt(false);
  };

  const handleSaveExercise = async () => {
    setSaveError("");
    try {
      await apiRequest("POST", "/api/exercises/unthread", {
        question,
        chain,
        tradeGain,
        alternatives: linkAlternatives,
      });
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const allReasons = chain.flatMap(link => link.reasons.filter(r => r.text.trim()).map(r => r.text));
  const lastReward = allReasons.length > 0 ? allReasons[allReasons.length - 1] : "";
  const chainComplete = chain.length > 0 && chain.every(link => link.reasons.some(r => r.text.trim()));
  const tradeComplete = chainComplete;

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
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Unthread</p>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter" data-testid="text-question">
            {question}
          </h1>
        </div>

        {phase === "chain" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center text-xl font-bold rounded-md">1</div>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">The Chain</h2>
                <p className="text-sm text-muted-foreground">Why do you do this? Trace the reasoning.</p>
              </div>
            </div>

            <div className="space-y-4">
              {chain.map((link, linkIndex) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  {linkIndex > 0 && (
                    <div className="flex justify-center py-2">
                      <ArrowDown className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="border-2 border-muted rounded-md p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {linkIndex === 0 ? "I do this because..." : "And that matters because..."}
                      </p>
                      {chain.length > 1 && (
                        <button
                          onClick={() => removeChainLink(link.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          data-testid={`button-remove-link-${link.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {link.reasons.map((reason, reasonIndex) => (
                      <div key={reason.id} className="flex gap-2">
                        <Input
                          value={reason.text}
                          onChange={e => updateReason(link.id, reason.id, e.target.value)}
                          placeholder={reasonIndex === 0 ? "Main reason..." : "Another reason..."}
                          className="rounded-md border-2 border-muted h-10"
                          data-testid={`input-reason-${link.id}-${reason.id}`}
                        />
                        {link.reasons.length > 1 && (
                          <button
                            onClick={() => removeReason(link.id, reason.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors px-2"
                            data-testid={`button-remove-reason-${reason.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
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
            </div>

            <div className="flex gap-3">
              <Button
                onClick={addChainLink}
                variant="outline"
                className="flex-1 rounded-md border-2 border-foreground uppercase tracking-wider text-sm"
                data-testid="button-add-link"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
              {chainComplete && (
                <Button
                  onClick={moveToTrade}
                  className="flex-1 rounded-md uppercase tracking-wider text-sm"
                  data-testid="button-move-to-trade"
                >
                  Next: The Trade
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {phase === "trade" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#C27D60] text-white flex items-center justify-center text-xl font-bold rounded-md">2</div>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">The Trade</h2>
                <p className="text-sm text-muted-foreground">See the full picture of what you're trading.</p>
              </div>
            </div>

            <div className="border-2 border-muted rounded-md p-6 space-y-6">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <div className="text-center p-4 border-2 border-[#C27D60] rounded-md bg-[#C27D60]/5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#C27D60] mb-2">What I'm doing</p>
                  <p className="text-sm font-medium">{tradeCost}</p>
                </div>
                <ArrowDown className="h-6 w-6 text-muted-foreground rotate-[-90deg]" />
                <div className="text-center p-4 border-2 border-[#5B7B6A] rounded-md bg-[#5B7B6A]/5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#5B7B6A] mb-2">What I'm getting</p>
                  <p className="text-sm font-medium">{tradeGain}</p>
                </div>
              </div>

              <div className="border-t-2 border-muted pt-6 space-y-4">
                <p className="text-lg font-medium text-center">
                  Is <span className="text-[#5B7B6A] font-bold">{tradeGain || "this"}</span> worth <span className="text-[#C27D60] font-bold">{tradeCost || "that"}</span>?
                </p>

                <div className="flex justify-center gap-3">
                  {(["yes", "no", "unsure"] as const).map(option => (
                    <button
                      key={option}
                      onClick={() => setTradeVerdict(option)}
                      className={`px-6 py-3 border-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all ${
                        tradeVerdict === option
                          ? option === "yes" ? "border-[#5B7B6A] bg-[#5B7B6A] text-white"
                            : option === "no" ? "border-[#C27D60] bg-[#C27D60] text-white"
                            : "border-foreground bg-foreground text-background"
                          : "border-muted hover:border-foreground"
                      }`}
                      data-testid={`button-verdict-${option}`}
                    >
                      {option === "yes" ? "Yes" : option === "no" ? "No" : "Not sure"}
                    </button>
                  ))}
                </div>

                {tradeVerdict && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <Textarea
                      value={tradeReflection}
                      onChange={e => setTradeReflection(e.target.value)}
                      placeholder="Why? (optional)"
                      className="min-h-[80px] rounded-md border-2 border-muted"
                      data-testid="input-trade-reflection"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setPhase("chain")}
                variant="outline"
                className="rounded-md border-2 border-foreground uppercase tracking-wider text-sm"
              >
                Back to Chain
              </Button>
              {tradeComplete && (
                <Button
                  onClick={moveToDecompose}
                  className="flex-1 rounded-md uppercase tracking-wider text-sm"
                  data-testid="button-move-to-decompose"
                >
                  Next: Decompose
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {phase === "decompose" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#5B7B6A] text-white flex items-center justify-center text-xl font-bold rounded-md">3</div>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">Decompose</h2>
                <p className="text-sm text-muted-foreground">Find alternative paths to what you really need.</p>
              </div>
            </div>

            <div className="space-y-4">
              {chain.map((link, linkIndex) => {
                const isExpanded = expandedLinks.has(link.id);
                const reasons = link.reasons.filter(r => r.text.trim()).map(r => r.text);

                return (
                  <motion.div
                    key={link.id}
                    className="border-2 border-muted rounded-md overflow-hidden"
                  >
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => toggleLinkExpanded(link.id)}
                      data-testid={`button-toggle-link-${link.id}`}
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {linkIndex === 0 ? "Because" : "And because"}
                        </p>
                        <p className="text-sm font-medium mt-1">{reasons.join(", ") || "..."}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 border-t border-muted space-y-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#C27D60] pt-3">
                              <Lightbulb className="h-3 w-3 inline mr-1" />
                              What else could achieve this?
                            </p>

                            {(linkAlternatives[link.id] || []).map(alt => (
                              <div key={alt.id} className="flex gap-2">
                                <Input
                                  value={alt.text}
                                  onChange={e => updateLinkAlternative(link.id, alt.id, e.target.value)}
                                  placeholder="An alternative approach..."
                                  className="rounded-md border-2 border-muted h-10"
                                  data-testid={`input-alt-${link.id}-${alt.id}`}
                                />
                                <button
                                  onClick={() => removeLinkAlternative(link.id, alt.id)}
                                  className="text-muted-foreground hover:text-destructive transition-colors px-2"
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
                        <div key={link.id} className="pl-4 border-l-4 border-[#C27D60]">
                          <p className="font-bold text-sm">
                            Instead of: <span className="text-[#5B7B6A]">{reasonsText}</span>
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

                  {!saved && (
                    <div className="flex justify-center pt-4">
                      {user ? (
                        <Button
                          onClick={handleSaveExercise}
                          className="rounded-md border-2 border-[#5B7B6A] bg-[#5B7B6A] text-white hover:bg-[#5B7B6A]/90 uppercase tracking-widest text-sm"
                          data-testid="button-save-exercise"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save to History
                        </Button>
                      ) : null}
                    </div>
                  )}
                  {saved && (
                    <div className="flex justify-center pt-4">
                      <span className="text-sm text-[#5B7B6A] font-medium flex items-center gap-2">
                        <Check className="h-4 w-4" /> Saved to history
                      </span>
                    </div>
                  )}

                  {saveError && (
                    <p className="text-xs text-destructive text-center mt-2">{saveError}</p>
                  )}
                  <AnimatePresence>
                    {!user && !saved && !dismissedPrompt && (
                      <GuestSignupPrompt onDismiss={() => setDismissedPrompt(true)} />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
