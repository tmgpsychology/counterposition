import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, ArrowLeft, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

interface CircleItem {
  id: string;
  label: string;
  weight: number;
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

const CONTAINER_SIZE = 300;
const CONTAINER_HALF = CONTAINER_SIZE / 2;
const PADDING = 6;
const MIN_DISPLAY_RADIUS = 16;

function computeScaledRadiiAndPositions(items: CircleItem[]): Array<{ x: number; y: number; displayRadius: number }> {
  if (items.length === 0) return [];

  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const maxAllowedArea = Math.PI * (CONTAINER_HALF - 10) * (CONTAINER_HALF - 10) * 0.75;

  const rawRadii = items.map(item => {
    const fraction = item.weight / totalWeight;
    const area = fraction * maxAllowedArea;
    return Math.max(MIN_DISPLAY_RADIUS, Math.sqrt(area / Math.PI));
  });

  let scale = 1;
  for (let attempt = 0; attempt < 10; attempt++) {
    const scaledRadii = rawRadii.map(r => Math.max(MIN_DISPLAY_RADIUS, r * scale));
    const positions = packWithRadii(scaledRadii);
    
    let allFit = true;
    for (let i = 0; i < positions.length; i++) {
      const r = scaledRadii[i];
      const dist = Math.sqrt(positions[i].x * positions[i].x + positions[i].y * positions[i].y) + r;
      if (dist > CONTAINER_HALF - 4) {
        allFit = false;
        break;
      }
    }

    if (allFit) {
      return positions.map((p, i) => ({ x: p.x, y: p.y, displayRadius: scaledRadii[i] }));
    }
    scale *= 0.85;
  }

  for (let extra = 0; extra < 20; extra++) {
    const shrunkRadii = rawRadii.map(r => Math.max(8, r * scale));
    const positions = packWithRadii(shrunkRadii);
    let allFit = true;
    for (let i = 0; i < positions.length; i++) {
      const dist = Math.sqrt(positions[i].x * positions[i].x + positions[i].y * positions[i].y) + shrunkRadii[i];
      if (dist > CONTAINER_HALF - 4) { allFit = false; break; }
    }
    if (allFit) return positions.map((p, i) => ({ x: p.x, y: p.y, displayRadius: shrunkRadii[i] }));
    scale *= 0.85;
  }
  const finalRadii = rawRadii.map(r => Math.max(8, r * scale));
  const finalPositions = packWithRadii(finalRadii);
  return finalPositions.map((p, i) => ({ x: p.x, y: p.y, displayRadius: finalRadii[i] }));
}

function packWithRadii(radii: number[]): Array<{ x: number; y: number }> {
  if (radii.length === 0) return [];
  if (radii.length === 1) return [{ x: 0, y: 0 }];

  const boundary = CONTAINER_HALF - 4;
  const placed: Array<{ x: number; y: number; r: number }> = [];
  placed.push({ x: 0, y: 0, r: radii[0] });

  for (let i = 1; i < radii.length; i++) {
    const r = radii[i];
    let bestPos: { x: number; y: number } | null = null;
    let bestDist = Infinity;

    for (const p of placed) {
      const touchDist = p.r + r + PADDING;
      const angleSteps = 60;
      for (let a = 0; a < angleSteps; a++) {
        const angle = (a / angleSteps) * 2 * Math.PI;
        const cx = p.x + Math.cos(angle) * touchDist;
        const cy = p.y + Math.sin(angle) * touchDist;

        if (Math.sqrt(cx * cx + cy * cy) + r > boundary) continue;

        let collides = false;
        for (const q of placed) {
          const dx = cx - q.x;
          const dy = cy - q.y;
          const minD = r + q.r + PADDING;
          if (dx * dx + dy * dy < minD * minD - 0.1) {
            collides = true;
            break;
          }
        }

        if (!collides) {
          const d = cx * cx + cy * cy;
          if (d < bestDist) {
            bestDist = d;
            bestPos = { x: cx, y: cy };
          }
        }
      }
    }

    if (!bestPos) {
      const angleSteps = 60;
      for (let dist = r; dist < boundary; dist += 4) {
        for (let a = 0; a < angleSteps; a++) {
          const angle = (a / angleSteps) * 2 * Math.PI + i * 0.7;
          const cx = Math.cos(angle) * dist;
          const cy = Math.sin(angle) * dist;

          if (Math.sqrt(cx * cx + cy * cy) + r > boundary) continue;

          let collides = false;
          for (const q of placed) {
            const dx = cx - q.x;
            const dy = cy - q.y;
            const minD = r + q.r + PADDING;
            if (dx * dx + dy * dy < minD * minD - 0.1) {
              collides = true;
              break;
            }
          }

          if (!collides) {
            bestPos = { x: cx, y: cy };
            break;
          }
        }
        if (bestPos) break;
      }
    }

    placed.push({ x: bestPos?.x ?? 0, y: bestPos?.y ?? 0, r });
  }

  return placed.map(p => ({ x: p.x, y: p.y }));
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addPro = () => {
    if (!newPro.trim()) return;
    setPros(prev => [...prev, { id: generateId(), label: newPro.trim(), weight: 5 }]);
    setNewPro("");
  };

  const addCon = () => {
    if (!newCon.trim()) return;
    setCons(prev => [...prev, { id: generateId(), label: newCon.trim(), weight: 5 }]);
    setNewCon("");
  };

  const removePro = (id: string) => {
    setPros(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };
  const removeCon = (id: string) => {
    setCons(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const addSuggestion = (suggestion: Suggestion) => {
    if (suggestion.side === "pro") {
      setPros(prev => [...prev, { id: generateId(), label: suggestion.text, weight: 5 }]);
    } else {
      setCons(prev => [...prev, { id: generateId(), label: suggestion.text, weight: 5 }]);
    }
    setDismissedSuggestions(prev => new Set(prev).add(suggestion.text));
  };

  const increaseWeight = (id: string, side: "pro" | "con") => {
    if (side === "pro") {
      setPros(prev => prev.map(p => p.id === id ? { ...p, weight: Math.min(20, p.weight + 1) } : p));
    } else {
      setCons(prev => prev.map(c => c.id === id ? { ...c, weight: Math.min(20, c.weight + 1) } : c));
    }
  };

  const decreaseWeight = (id: string, side: "pro" | "con") => {
    if (side === "pro") {
      setPros(prev => prev.map(p => p.id === id ? { ...p, weight: Math.max(1, p.weight - 1) } : p));
    } else {
      setCons(prev => prev.map(c => c.id === id ? { ...c, weight: Math.max(1, c.weight - 1) } : c));
    }
  };

  const proLayout = useMemo(() => computeScaledRadiiAndPositions(pros), [pros]);
  const conLayout = useMemo(() => computeScaledRadiiAndPositions(cons), [cons]);

  const totalProArea = proLayout.reduce((sum, p) => sum + circleArea(p.displayRadius), 0);
  const totalConArea = conLayout.reduce((sum, c) => sum + circleArea(c.displayRadius), 0);
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
            Visual pros and cons. Add items, adjust their weight, and see which side wins.
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
        <div className="flex items-center justify-between flex-wrap gap-3">
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
              onClick={() => { setTopicSet(false); setTopic(""); setPros([]); setCons([]); setDismissedSuggestions(new Set()); setShowSuggestions(false); setSelectedId(null); }}
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
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Tap a circle to adjust its weight</p>
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
            <BubbleContainer
              items={pros}
              layout={proLayout}
              color="green"
              selectedId={selectedId}
              onSelect={setSelectedId}
              onIncrease={(id) => increaseWeight(id, "pro")}
              onDecrease={(id) => decreaseWeight(id, "pro")}
              onRemove={removePro}
              emptyText="No pros yet"
            />
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
            <BubbleContainer
              items={cons}
              layout={conLayout}
              color="red"
              selectedId={selectedId}
              onSelect={setSelectedId}
              onIncrease={(id) => increaseWeight(id, "con")}
              onDecrease={(id) => decreaseWeight(id, "con")}
              onRemove={removeCon}
              emptyText="No cons yet"
            />
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

function BubbleContainer({
  items,
  layout,
  color,
  selectedId,
  onSelect,
  onIncrease,
  onDecrease,
  onRemove,
  emptyText,
}: {
  items: CircleItem[];
  layout: Array<{ x: number; y: number; displayRadius: number }>;
  color: "green" | "red";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  emptyText: string;
}) {
  return (
    <div
      className="relative mx-auto border-2 border-dashed border-muted rounded-full"
      style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
    >
      <AnimatePresence>
        {items.map((item, i) => {
          const pos = layout[i] || { x: 0, y: 0, displayRadius: 20 };
          const isSelected = selectedId === item.id;
          return (
            <CircleBubble
              key={item.id}
              item={item}
              displayRadius={pos.displayRadius}
              color={color}
              offsetX={pos.x}
              offsetY={pos.y}
              isSelected={isSelected}
              onSelect={() => onSelect(isSelected ? null : item.id)}
              onIncrease={() => onIncrease(item.id)}
              onDecrease={() => onDecrease(item.id)}
              onRemove={() => onRemove(item.id)}
            />
          );
        })}
      </AnimatePresence>
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-sm uppercase tracking-widest">{emptyText}</p>
        </div>
      )}
    </div>
  );
}

function CircleBubble({
  item,
  displayRadius,
  color,
  offsetX,
  offsetY,
  isSelected,
  onSelect,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CircleItem;
  displayRadius: number;
  color: "green" | "red";
  offsetX: number;
  offsetY: number;
  isSelected: boolean;
  onSelect: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  const colorClasses = color === "green"
    ? "border-green-500 bg-green-500/10 text-green-500"
    : "border-red-500 bg-red-500/10 text-red-500";

  const selectedRing = color === "green"
    ? "ring-4 ring-green-500/40"
    : "ring-4 ring-red-500/40";

  const btnColor = color === "green"
    ? "bg-green-500 text-white hover:bg-green-600"
    : "bg-red-500 text-white hover:bg-red-600";

  const diameter = displayRadius * 2;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="absolute"
      style={{
        left: `calc(50% + ${offsetX}px - ${displayRadius}px)`,
        top: `calc(50% + ${offsetY}px - ${displayRadius}px)`,
        zIndex: isSelected ? 20 : 1,
      }}
      data-testid={`circle-${color}-${item.id}`}
    >
      <div
        className={`rounded-full border-4 ${colorClasses} ${isSelected ? selectedRing : ''} flex items-center justify-center cursor-pointer select-none relative transition-all duration-200`}
        style={{ width: diameter, height: diameter }}
        onClick={onSelect}
      >
        <span className="text-xs font-bold uppercase tracking-wider text-center px-1 leading-tight pointer-events-none"
          style={{ fontSize: Math.max(8, displayRadius / 5), maxWidth: displayRadius * 1.5 }}
        >
          {item.label}
        </span>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute flex gap-1 items-center"
          style={{
            left: '50%',
            top: diameter + 4,
            transform: 'translateX(-50%)',
            zIndex: 30,
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onDecrease(); }}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${btnColor} transition-colors`}
            data-testid={`button-decrease-${item.id}`}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-xs font-bold w-5 text-center">{item.weight}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onIncrease(); }}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${btnColor} transition-colors`}
            data-testid={`button-increase-${item.id}`}
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
            data-testid={`button-remove-${item.id}`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
