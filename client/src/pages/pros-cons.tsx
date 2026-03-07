import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, ArrowLeft, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

interface BarItem {
  id: string;
  label: string;
  weight: number;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

interface Suggestion {
  text: string;
  side: "pro" | "con";
}

function generateSuggestions(topic: string, existingPros: BarItem[], existingCons: BarItem[]): Suggestion[] {
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

const MAX_BAR_HEIGHT = 200;

export default function ProsCons() {
  const [topic, setTopic] = useState("");
  const [topicSet, setTopicSet] = useState(false);
  const [pros, setPros] = useState<BarItem[]>([]);
  const [cons, setCons] = useState<BarItem[]>([]);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [selectedBarSide, setSelectedBarSide] = useState<"pro" | "con" | null>(null);

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
    if (selectedBarId === id) { setSelectedBarId(null); setSelectedBarSide(null); }
  };
  const removeCon = (id: string) => {
    setCons(prev => prev.filter(c => c.id !== id));
    if (selectedBarId === id) { setSelectedBarId(null); setSelectedBarSide(null); }
  };

  const selectBar = (id: string, side: "pro" | "con") => {
    if (selectedBarId === id) { setSelectedBarId(null); setSelectedBarSide(null); }
    else { setSelectedBarId(id); setSelectedBarSide(side); }
  };

  const increaseSelected = () => {
    if (!selectedBarId || !selectedBarSide) return;
    if (selectedBarSide === "pro") {
      setPros(prev => prev.map(p => p.id === selectedBarId ? { ...p, weight: Math.min(20, p.weight + 1) } : p));
    } else {
      setCons(prev => prev.map(c => c.id === selectedBarId ? { ...c, weight: Math.min(20, c.weight + 1) } : c));
    }
  };

  const decreaseSelected = () => {
    if (!selectedBarId || !selectedBarSide) return;
    if (selectedBarSide === "pro") {
      setPros(prev => prev.map(p => p.id === selectedBarId ? { ...p, weight: Math.max(1, p.weight - 1) } : p));
    } else {
      setCons(prev => prev.map(c => c.id === selectedBarId ? { ...c, weight: Math.max(1, c.weight - 1) } : c));
    }
  };

  const addSuggestion = (suggestion: Suggestion) => {
    if (suggestion.side === "pro") {
      setPros(prev => [...prev, { id: generateId(), label: suggestion.text, weight: 5 }]);
    } else {
      setCons(prev => [...prev, { id: generateId(), label: suggestion.text, weight: 5 }]);
    }
    setDismissedSuggestions(prev => new Set(prev).add(suggestion.text));
  };

  const selectedItem = selectedBarId
    ? (selectedBarSide === "pro" ? pros : cons).find(i => i.id === selectedBarId)
    : null;

  const totalProWeight = pros.reduce((sum, p) => sum + p.weight, 0);
  const totalConWeight = cons.reduce((sum, c) => sum + c.weight, 0);
  const totalWeight = totalProWeight + totalConWeight;

  const maxSummaryRadius = 80;
  let proSummaryRadius = 0;
  let conSummaryRadius = 0;

  if (totalWeight > 0) {
    const maxW = Math.max(totalProWeight, totalConWeight);
    proSummaryRadius = Math.sqrt(totalProWeight / maxW) * maxSummaryRadius;
    conSummaryRadius = Math.sqrt(totalConWeight / maxW) * maxSummaryRadius;
  }

  const proPercent = totalWeight > 0 ? Math.round((totalProWeight / totalWeight) * 100) : 0;
  const conPercent = totalWeight > 0 ? Math.round((totalConWeight / totalWeight) * 100) : 0;

  const suggestions = useMemo(() => {
    return generateSuggestions(topic, pros, cons).filter(s => !dismissedSuggestions.has(s.text));
  }, [topic, pros, cons, dismissedSuggestions]);

  const allItems = [...pros, ...cons];
  const globalMaxWeight = allItems.length > 0 ? Math.max(...allItems.map(i => i.weight)) : 1;

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

        {(pros.length > 0 || cons.length > 0) && (
          <div className="flex items-center justify-center gap-4 py-4 border-2 border-muted bg-muted/20">
            <button
              onClick={decreaseSelected}
              disabled={!selectedItem || selectedItem.weight <= 1}
              className="w-10 h-10 rounded-none border-2 border-foreground flex items-center justify-center font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground hover:text-background transition-colors"
              data-testid="button-global-decrease"
            >
              <Minus className="h-5 w-5" />
            </button>
            <div className="text-center min-w-[120px]">
              {selectedItem ? (
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest ${selectedBarSide === "pro" ? "text-green-500" : "text-red-500"}`}>
                    {selectedItem.label}
                  </p>
                  <p className="text-2xl font-bold">{selectedItem.weight}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Tap a bar</p>
              )}
            </div>
            <button
              onClick={increaseSelected}
              disabled={!selectedItem || selectedItem.weight >= 20}
              className="w-10 h-10 rounded-none border-2 border-foreground flex items-center justify-center font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground hover:text-background transition-colors"
              data-testid="button-global-increase"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}

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
            <BarChart
              items={pros}
              color="green"
              globalMax={globalMaxWeight}
              selectedId={selectedBarId}
              onSelect={(id) => selectBar(id, "pro")}
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
            <BarChart
              items={cons}
              color="red"
              globalMax={globalMaxWeight}
              selectedId={selectedBarId}
              onSelect={(id) => selectBar(id, "con")}
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

function BarChart({
  items,
  color,
  globalMax,
  selectedId,
  onSelect,
  onRemove,
  emptyText,
}: {
  items: BarItem[];
  color: "green" | "red";
  globalMax: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex items-end justify-center h-[260px] border-2 border-dashed border-muted p-4">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">{emptyText}</p>
      </div>
    );
  }

  const barColor = color === "green" ? "bg-green-500" : "bg-red-500";
  const barBorder = color === "green" ? "border-green-500" : "border-red-500";
  const textColor = color === "green" ? "text-green-500" : "text-red-500";
  const selectedRing = color === "green" ? "ring-green-500" : "ring-red-500";

  return (
    <div className="border-2 border-muted p-4 overflow-x-auto">
      <div className="flex gap-3 justify-center">
        <AnimatePresence>
          {items.map((item) => {
            const heightPercent = item.weight / globalMax;
            const barHeight = Math.max(16, heightPercent * MAX_BAR_HEIGHT);
            const isSelected = selectedId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center flex-shrink-0"
                style={{ width: 64 }}
                data-testid={`bar-${color}-${item.id}`}
              >
                <span className={`text-xs font-bold mb-1 ${textColor}`}>{item.weight}</span>
                <div className="flex flex-col justify-end" style={{ height: MAX_BAR_HEIGHT }}>
                  <motion.div
                    onClick={() => onSelect(item.id)}
                    className={`w-12 cursor-pointer ${barColor}/80 border-2 ${barBorder} relative transition-all ${isSelected ? `ring-2 ${selectedRing} ring-offset-2` : "opacity-70 hover:opacity-100"}`}
                    animate={{ height: barHeight }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                </div>
                <div className="flex flex-col items-center gap-1 mt-2">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${textColor} text-center leading-tight max-w-[64px]`}>
                    {item.label}
                  </p>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
