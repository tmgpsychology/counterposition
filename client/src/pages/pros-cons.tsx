import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

interface CircleItem {
  id: string;
  label: string;
  radius: number;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function circleArea(radius: number) {
  return Math.PI * radius * radius;
}

interface Suggestion {
  text: string;
  side: "pro" | "con";
}

function generateSuggestions(topic: string, existingPros: CircleItem[], existingCons: CircleItem[]): Suggestion[] {
  const t = topic.toLowerCase();
  const existingLabels = [...existingPros, ...existingCons].map(i => i.label.toLowerCase());

  const universalPrompts: Suggestion[] = [
    { text: "Financial cost or savings", side: "con" },
    { text: "Time investment required", side: "con" },
    { text: "Impact on mental health", side: "pro" },
    { text: "What you'd miss out on by not doing it", side: "pro" },
    { text: "Opportunity cost of choosing this", side: "con" },
    { text: "How rare is this opportunity?", side: "pro" },
    { text: "Will this chance come again?", side: "pro" },
    { text: "Effect on relationships", side: "con" },
    { text: "Long-term growth potential", side: "pro" },
    { text: "Short-term disruption", side: "con" },
    { text: "Alignment with your values", side: "pro" },
    { text: "Risk of regret if you don't", side: "pro" },
    { text: "Worst-case scenario", side: "con" },
    { text: "Best-case scenario", side: "pro" },
    { text: "Impact on daily routine", side: "con" },
    { text: "New skills or experience gained", side: "pro" },
    { text: "Stress or pressure involved", side: "con" },
    { text: "Effect on your confidence", side: "pro" },
  ];

  const contextual: Suggestion[] = [];

  if (t.includes("move") || t.includes("relocat") || t.includes("abroad") || t.includes("country") || t.includes("city")) {
    contextual.push(
      { text: "Missing family and friends", side: "con" },
      { text: "Cultural enrichment", side: "pro" },
      { text: "Career opportunities in new location", side: "pro" },
      { text: "Cost of living difference", side: "con" },
      { text: "Language barrier", side: "con" },
      { text: "Adventure and personal growth", side: "pro" },
      { text: "Leaving behind your support network", side: "con" },
      { text: "Building resilience and independence", side: "pro" },
    );
  }

  if (t.includes("job") || t.includes("career") || t.includes("work") || t.includes("quit") || t.includes("resign")) {
    contextual.push(
      { text: "Job security at current position", side: "con" },
      { text: "Salary or benefits change", side: "con" },
      { text: "Professional development", side: "pro" },
      { text: "Work-life balance", side: "pro" },
      { text: "Reputation or CV impact", side: "pro" },
      { text: "Learning curve at new role", side: "con" },
    );
  }

  if (t.includes("study") || t.includes("university") || t.includes("degree") || t.includes("school") || t.includes("education")) {
    contextual.push(
      { text: "Tuition fees and debt", side: "con" },
      { text: "Qualification and credentials", side: "pro" },
      { text: "Networking opportunities", side: "pro" },
      { text: "Years of commitment", side: "con" },
      { text: "Intellectual stimulation", side: "pro" },
      { text: "Delayed earning potential", side: "con" },
    );
  }

  if (t.includes("buy") || t.includes("purchase") || t.includes("invest") || t.includes("spend")) {
    contextual.push(
      { text: "Upfront cost vs. long-term value", side: "con" },
      { text: "Depreciation over time", side: "con" },
      { text: "Quality of life improvement", side: "pro" },
      { text: "Maintenance or ongoing costs", side: "con" },
      { text: "Resale value", side: "pro" },
      { text: "Could the money be better used elsewhere?", side: "con" },
    );
  }

  if (t.includes("relationship") || t.includes("marry") || t.includes("partner") || t.includes("dating") || t.includes("break")) {
    contextual.push(
      { text: "Emotional wellbeing", side: "pro" },
      { text: "Personal freedom", side: "con" },
      { text: "Shared goals and vision", side: "pro" },
      { text: "Compromise required", side: "con" },
      { text: "Companionship and support", side: "pro" },
      { text: "Timing — is this the right moment?", side: "con" },
    );
  }

  const all = [...contextual, ...universalPrompts];

  return all.filter(s => !existingLabels.some(label => label.includes(s.text.toLowerCase().slice(0, 15))));
}

function getBubblePositions(count: number): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const angleStep = (2 * Math.PI) / Math.max(count, 1);
  
  for (let i = 0; i < count; i++) {
    const ring = Math.floor(i / 6);
    const indexInRing = i % 6;
    const ringCount = Math.min(6, count - ring * 6);
    const angle = (angleStep * i) + (ring * 0.5);
    const radius = 20 + ring * 30;
    
    const jitterX = (Math.sin(i * 7.3) * 10);
    const jitterY = (Math.cos(i * 5.1) * 10);
    
    positions.push({
      x: Math.cos(angle) * radius + jitterX,
      y: Math.sin(angle) * radius + jitterY,
    });
  }
  return positions;
}

export default function ProsCons() {
  const [topic, setTopic] = useState("");
  const [topicSet, setTopicSet] = useState(false);
  const [pros, setPros] = useState<CircleItem[]>([]);
  const [cons, setCons] = useState<CircleItem[]>([]);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const addPro = () => {
    if (!newPro.trim()) return;
    setPros(prev => [...prev, { id: generateId(), label: newPro.trim(), radius: 40 }]);
    setNewPro("");
  };

  const addCon = () => {
    if (!newCon.trim()) return;
    setCons(prev => [...prev, { id: generateId(), label: newCon.trim(), radius: 40 }]);
    setNewCon("");
  };

  const removePro = (id: string) => setPros(prev => prev.filter(p => p.id !== id));
  const removeCon = (id: string) => setCons(prev => prev.filter(c => c.id !== id));

  const addSuggestion = (suggestion: Suggestion) => {
    if (suggestion.side === "pro") {
      setPros(prev => [...prev, { id: generateId(), label: suggestion.text, radius: 40 }]);
    } else {
      setCons(prev => [...prev, { id: generateId(), label: suggestion.text, radius: 40 }]);
    }
    setDismissedSuggestions(prev => new Set(prev).add(suggestion.text));
  };

  const dismissSuggestion = (text: string) => {
    setDismissedSuggestions(prev => new Set(prev).add(text));
  };

  const updateRadius = useCallback((id: string, side: "pro" | "con", newRadius: number) => {
    const clamped = Math.max(20, Math.min(80, newRadius));
    if (side === "pro") {
      setPros(prev => prev.map(p => p.id === id ? { ...p, radius: clamped } : p));
    } else {
      setCons(prev => prev.map(c => c.id === id ? { ...c, radius: clamped } : c));
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent, id: string, side: "pro" | "con", currentRadius: number) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const delta = -(ev.clientY - e.clientY);
      const newRadius = currentRadius + delta * 0.5;
      updateRadius(id, side, newRadius);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const totalProArea = pros.reduce((sum, p) => sum + circleArea(p.radius), 0);
  const totalConArea = cons.reduce((sum, c) => sum + circleArea(c.radius), 0);
  const totalArea = totalProArea + totalConArea;

  const maxSummaryRadius = 80;
  let proSummaryRadius = 0;
  let conSummaryRadius = 0;

  if (totalArea > 0) {
    const maxArea = Math.max(totalProArea, totalConArea);
    proSummaryRadius = Math.sqrt(totalProArea / maxArea) * maxSummaryRadius;
    conSummaryRadius = Math.sqrt(totalConArea / maxArea) * maxSummaryRadius;
  }

  const proPercent = totalArea > 0 ? Math.round((totalProArea / totalArea) * 100) : 0;
  const conPercent = totalArea > 0 ? Math.round((totalConArea / totalArea) * 100) : 0;

  const suggestions = useMemo(() => {
    return generateSuggestions(topic, pros, cons).filter(s => !dismissedSuggestions.has(s.text));
  }, [topic, pros, cons, dismissedSuggestions]);

  const proPositions = useMemo(() => getBubblePositions(pros.length), [pros.length]);
  const conPositions = useMemo(() => getBubblePositions(cons.length), [cons.length]);

  if (!topicSet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl space-y-8"
        >
          <Link href="/">
            <button className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </Link>
          <h1 className="text-5xl sm:text-6xl font-bold uppercase tracking-tighter leading-none">
            Weigh It Up
          </h1>
          <p className="text-lg text-muted-foreground">
            Visual pros and cons. Add items, drag circles to resize their weight, and see which side wins.
          </p>
          <div className="space-y-4">
            <Input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="What are you deciding?"
              className="rounded-none border-2 border-foreground h-14 text-lg"
              onKeyDown={e => e.key === "Enter" && topic.trim() && setTopicSet(true)}
              data-testid="input-topic"
            />
            <Button
              onClick={() => topic.trim() && setTopicSet(true)}
              disabled={!topic.trim()}
              className="w-full rounded-none border-2 border-foreground h-14 text-lg uppercase tracking-wider"
              data-testid="button-set-topic"
            >
              Start Weighing
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-home-main">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </Link>
          <div className="flex gap-3">
            {suggestions.length > 0 && (
              <Button
                onClick={() => setShowSuggestions(!showSuggestions)}
                variant="outline"
                className={`rounded-none border-2 border-foreground uppercase tracking-wider text-sm ${showSuggestions ? 'bg-foreground text-background' : ''}`}
                data-testid="button-toggle-suggestions"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Have you considered...
              </Button>
            )}
            <Button
              onClick={() => { setTopicSet(false); setTopic(""); setPros([]); setCons([]); setDismissedSuggestions(new Set()); setShowSuggestions(false); }}
              variant="outline"
              className="rounded-none border-2 border-foreground uppercase tracking-wider text-sm"
              data-testid="button-reset"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-tighter" data-testid="text-topic">{topic}</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Drag circles up to increase weight, down to decrease</p>
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-2 border-muted p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Have you considered...
                  </h3>
                  <button onClick={() => setShowSuggestions(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 8).map((suggestion) => (
                    <motion.button
                      key={suggestion.text}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`px-4 py-2 border-2 text-sm font-medium uppercase tracking-wider transition-all hover:scale-105 ${
                        suggestion.side === "pro"
                          ? "border-green-500/50 text-green-500 hover:bg-green-500/10"
                          : "border-red-500/50 text-red-500 hover:bg-red-500/10"
                      }`}
                      onClick={() => addSuggestion(suggestion)}
                      data-testid={`button-suggestion-${suggestion.text.slice(0, 20)}`}
                    >
                      <span className="mr-2">{suggestion.side === "pro" ? "+" : "−"}</span>
                      {suggestion.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-green-500 border-b-2 border-green-500 pb-2">Pros</h2>
            <div className="flex gap-2">
              <Input
                value={newPro}
                onChange={e => setNewPro(e.target.value)}
                placeholder="Add a pro..."
                className="rounded-none border-2 border-muted h-12"
                onKeyDown={e => e.key === "Enter" && addPro()}
                data-testid="input-add-pro"
              />
              <Button onClick={addPro} className="rounded-none border-2 border-foreground h-12 px-4" data-testid="button-add-pro">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative min-h-[280px] flex items-center justify-center">
              <div className="relative" style={{ width: 300, height: 280 }}>
                <AnimatePresence>
                  {pros.map((pro, i) => {
                    const pos = proPositions[i] || { x: 0, y: 0 };
                    return (
                      <CircleBubble
                        key={pro.id}
                        item={pro}
                        color="green"
                        offsetX={pos.x}
                        offsetY={pos.y}
                        onPointerDown={(e) => handlePointerDown(e, pro.id, "pro", pro.radius)}
                        onRemove={() => removePro(pro.id)}
                      />
                    );
                  })}
                </AnimatePresence>
                {pros.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm uppercase tracking-widest">No pros yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-red-500 border-b-2 border-red-500 pb-2">Cons</h2>
            <div className="flex gap-2">
              <Input
                value={newCon}
                onChange={e => setNewCon(e.target.value)}
                placeholder="Add a con..."
                className="rounded-none border-2 border-muted h-12"
                onKeyDown={e => e.key === "Enter" && addCon()}
                data-testid="input-add-con"
              />
              <Button onClick={addCon} className="rounded-none border-2 border-foreground h-12 px-4" data-testid="button-add-con">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative min-h-[280px] flex items-center justify-center">
              <div className="relative" style={{ width: 300, height: 280 }}>
                <AnimatePresence>
                  {cons.map((con, i) => {
                    const pos = conPositions[i] || { x: 0, y: 0 };
                    return (
                      <CircleBubble
                        key={con.id}
                        item={con}
                        color="red"
                        offsetX={pos.x}
                        offsetY={pos.y}
                        onPointerDown={(e) => handlePointerDown(e, con.id, "con", con.radius)}
                        onRemove={() => removeCon(con.id)}
                      />
                    );
                  })}
                </AnimatePresence>
                {cons.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm uppercase tracking-widest">No cons yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {(pros.length > 0 || cons.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t-4 border-foreground pt-8"
          >
            <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-8">The Verdict</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center transition-all duration-500"
                  style={{ width: proSummaryRadius * 2 + 20, height: proSummaryRadius * 2 + 20 }}
                  data-testid="circle-summary-pros"
                >
                  <span className="text-2xl font-bold text-green-500">{proPercent}%</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-green-500">Pros</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div
                  className="rounded-full bg-red-500/20 border-4 border-red-500 flex items-center justify-center transition-all duration-500"
                  style={{ width: conSummaryRadius * 2 + 20, height: conSummaryRadius * 2 + 20 }}
                  data-testid="circle-summary-cons"
                >
                  <span className="text-2xl font-bold text-red-500">{conPercent}%</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-red-500">Cons</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CircleBubble({
  item,
  color,
  offsetX,
  offsetY,
  onPointerDown,
  onRemove,
}: {
  item: CircleItem;
  color: "green" | "red";
  offsetX: number;
  offsetY: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onRemove: () => void;
}) {
  const colorClasses = color === "green"
    ? "border-green-500 bg-green-500/10 text-green-500"
    : "border-red-500 bg-red-500/10 text-red-500";

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="absolute flex flex-col items-center gap-1"
      style={{
        left: `calc(50% + ${offsetX}px - ${item.radius}px)`,
        top: `calc(50% + ${offsetY}px - ${item.radius}px)`,
      }}
      data-testid={`circle-${color}-${item.id}`}
    >
      <div
        className={`rounded-full border-4 ${colorClasses} flex items-center justify-center cursor-ns-resize select-none touch-none relative`}
        style={{ width: item.radius * 2, height: item.radius * 2, transition: "width 0.1s, height 0.1s" }}
        onPointerDown={onPointerDown}
      >
        <span className="text-xs font-bold uppercase tracking-wider text-center px-2 leading-tight pointer-events-none"
          style={{ fontSize: Math.max(9, item.radius / 5), maxWidth: item.radius * 1.6 }}
        >
          {item.label}
        </span>
      </div>
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive transition-colors z-10"
        data-testid={`button-remove-${item.id}`}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </motion.div>
  );
}
