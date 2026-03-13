import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, ArrowLeft, Lightbulb, X, Save, Check, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GuestSignupPrompt } from "@/components/guest-signup-prompt";

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

interface SpecificityNudge {
  itemId: string;
  itemLabel: string;
  side: "pro" | "con";
  message: string;
  suggestions: string[];
  expanded: boolean;
}

function generateNudge(label: string, topic: string, side: "pro" | "con"): { message: string; suggestions: string[] } {
  const l = label.toLowerCase().trim();
  const t = topic.toLowerCase();
  const cleanTopic = t.replace(/should i |going |to /gi, "").trim();

  const vagueTerms: Record<string, { message: string; suggestions: (topic: string, side: string) => string[] }> = {
    money: {
      message: "\"Money\" is broad — what specifically about money?",
      suggestions: (_t, s) => {
        if (s === "con") return [
          `The upfront cost of ${cleanTopic}`,
          "Ongoing expenses it would create",
          "Money that could go elsewhere",
          "Risk of wasted spending",
          "Pressure on monthly budget",
        ];
        return [
          `Saving money on ${cleanTopic}`,
          "Having more disposable income",
          "Reducing financial stress",
          "Being able to afford other priorities",
          "Building long-term savings",
        ];
      },
    },
    time: {
      message: "\"Time\" can mean a lot of things — what aspect?",
      suggestions: (_t, s) => {
        if (s === "con") return [
          "Time taken away from other priorities",
          "Learning curve / ramp-up time",
          "Ongoing time commitment",
          "Less free time for hobbies",
          "Time pressure and deadlines",
        ];
        return [
          "More free time for what matters",
          "Time saved on current frustrations",
          "Better use of daily hours",
          "Flexibility with schedule",
          "Time to invest in personal growth",
        ];
      },
    },
    stress: {
      message: "What kind of stress, specifically?",
      suggestions: (_t, s) => {
        if (s === "pro") return [
          "Less daily anxiety or worry",
          "Fewer responsibilities weighing on me",
          "Reduced pressure from expectations",
          "Better sleep and mental clarity",
          "More emotional stability",
        ];
        return [
          "Increased daily pressure",
          "Uncertainty about the outcome",
          "Emotional toll of the change",
          "Added responsibility",
          "Fear of making the wrong choice",
        ];
      },
    },
    health: {
      message: "Health in what way? Physical, mental, or something else?",
      suggestions: (_t, s) => {
        if (s === "pro") return ["Better physical fitness", "Improved mental wellbeing", "More energy day to day", "Reduced risk of burnout", "Healthier daily habits"];
        return ["Physical strain or exhaustion", "Impact on mental health", "Less time for exercise or self-care", "Increased anxiety", "Sleep disruption"];
      },
    },
    happiness: {
      message: "Can you pinpoint what would make you happier?",
      suggestions: (_t, s) => {
        if (s === "pro") return ["Doing something I genuinely enjoy", "Feeling more fulfilled day to day", "Spending time with people I love", "Having something to look forward to", "Sense of purpose and meaning"];
        return ["Short-term pleasure but long-term regret", "Happiness that depends on external factors", "Might not be as fulfilling as expected"];
      },
    },
    freedom: {
      message: "Freedom from what, or freedom to do what?",
      suggestions: (_t, s) => {
        if (s === "pro") return ["Freedom to choose my own schedule", "Independence from current constraints", "More control over my daily life", "Ability to explore new interests", "Not being tied down"];
        return ["Too much freedom can feel aimless", "Loss of structure and routine", "Responsibility that comes with freedom"];
      },
    },
    experience: {
      message: "What kind of experience — and why does it matter?",
      suggestions: (_t, s) => {
        if (s === "pro") return ["Gaining skills I can't get elsewhere", "A once-in-a-lifetime opportunity", "Stories and memories to carry forward", "Broadening my perspective", "Personal growth through challenge"];
        return ["The experience might not live up to expectations", "Could gain similar experience another way", "Discomfort during the adjustment period"];
      },
    },
    people: {
      message: "What about people specifically?",
      suggestions: (_t, s) => {
        if (s === "pro") return ["Meeting people with different perspectives", "Building meaningful new relationships", "Being around people who inspire me", "Expanding my professional network"];
        return ["Leaving behind people I care about", "Difficulty building trust with new people", "Feeling isolated or lonely", "Dealing with difficult personalities"];
      },
    },
    fun: {
      message: "What makes this fun — can you be more specific?",
      suggestions: (_t, s) => {
        if (s === "pro") return ["Doing activities I genuinely enjoy", "A welcome break from routine", "Excitement of trying something new", "Shared joy with people I care about"];
        return ["Fun might wear off quickly", "Could be fun at the expense of something important"];
      },
    },
    security: {
      message: "Security in what sense?",
      suggestions: (_t, s) => {
        if (s === "pro") return ["Financial stability and safety net", "Job security and predictable income", "Emotional security in relationships", "Feeling settled and grounded"];
        return ["Giving up current stability", "Uncertainty about the future", "Risk of losing what I have", "No guaranteed safety net"];
      },
    },
    growth: {
      message: "Growth in what area?",
      suggestions: () => ["Professional skills and career advancement", "Personal development and self-awareness", "Emotional maturity and resilience", "Learning new things I couldn't before", "Stepping outside my comfort zone"],
    },
    risk: {
      message: "What's the actual risk you're worried about?",
      suggestions: () => ["Financial loss if it doesn't work out", "Wasted time with nothing to show", "Damage to relationships", "Reputation or career setback", "Emotional toll of failure"],
    },
    comfort: {
      message: "Comfort — in what way?",
      suggestions: (_t, s) => {
        if (s === "pro") return ["Physical comfort and ease", "Emotional safety and familiarity", "Predictable routine I enjoy"];
        return ["Staying comfortable means not growing", "Comfort zone keeping me stuck", "Trading long-term fulfilment for short-term ease"];
      },
    },
    family: {
      message: "What specifically about family?",
      suggestions: (_t, s) => {
        if (s === "pro") return ["More quality time with family", "Being closer to family members", "Better support system", "Shared experiences with loved ones"];
        return ["Being further from family", "Less time for family commitments", "Family disagreement about the decision", "Impact on family dynamics"];
      },
    },
    career: {
      message: "What about your career specifically?",
      suggestions: (_t, s) => {
        if (s === "pro") return ["Advancement opportunities", "Better alignment with my goals", "Higher earning potential", "More meaningful work"];
        return ["Career disruption or gap", "Starting over in a new field", "Loss of seniority or progress", "Uncertain career trajectory"];
      },
    },
  };

  for (const [term, config] of Object.entries(vagueTerms)) {
    if (l === term || l === term + "s") {
      return { message: config.message, suggestions: config.suggestions(t, side) };
    }
  }

  const wordCount = l.split(/\s+/).length;

  if (wordCount <= 2) {
    return {
      message: `Can you be more specific about "${label}"?`,
      suggestions: side === "pro"
        ? [
          `${label} — what specifically makes this a positive?`,
          `How does ${label.toLowerCase()} improve your situation?`,
          `What would ${label.toLowerCase()} actually look like day to day?`,
        ]
        : [
          `${label} — what exactly is the downside?`,
          `How does ${label.toLowerCase()} make things worse?`,
          `What would ${label.toLowerCase()} actually cost you?`,
        ],
    };
  }

  return {
    message: `Good — could you sharpen "${label}" even further?`,
    suggestions: side === "pro"
      ? [
        `Why does this matter to you personally?`,
        `What would this look like in practice?`,
        `How significant is this compared to other factors?`,
      ]
      : [
        `How likely is this to actually happen?`,
        `What would make this worse or better?`,
        `Could you live with this downside?`,
      ],
  };
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
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [dismissedPrompt, setDismissedPrompt] = useState(false);
  const [nudges, setNudges] = useState<Map<string, SpecificityNudge>>(new Map());

  const addPro = () => {
    if (!newPro.trim()) return;
    const id = generateId();
    const label = newPro.trim();
    setPros(prev => [...prev, { id, label, weight: 5 }]);
    setNewPro("");
    const { message, suggestions } = generateNudge(label, topic, "pro");
    setNudges(prev => new Map(prev).set(id, { itemId: id, itemLabel: label, side: "pro", message, suggestions, expanded: true }));
  };

  const addCon = () => {
    if (!newCon.trim()) return;
    const id = generateId();
    const label = newCon.trim();
    setCons(prev => [...prev, { id, label, weight: 5 }]);
    setNewCon("");
    const { message, suggestions } = generateNudge(label, topic, "con");
    setNudges(prev => new Map(prev).set(id, { itemId: id, itemLabel: label, side: "con", message, suggestions, expanded: true }));
  };

  const toggleNudge = (itemId: string) => {
    setNudges(prev => {
      const next = new Map(prev);
      const nudge = next.get(itemId);
      if (nudge) next.set(itemId, { ...nudge, expanded: !nudge.expanded });
      return next;
    });
  };

  const replaceWithSpecific = (itemId: string, newLabel: string, side: "pro" | "con") => {
    if (side === "pro") {
      setPros(prev => prev.map(p => p.id === itemId ? { ...p, label: newLabel } : p));
    } else {
      setCons(prev => prev.map(c => c.id === itemId ? { ...c, label: newLabel } : c));
    }
    const { message, suggestions } = generateNudge(newLabel, topic, side);
    setNudges(prev => {
      const next = new Map(prev);
      next.set(itemId, { itemId, itemLabel: newLabel, side, message, suggestions, expanded: true });
      return next;
    });
  };

  const removePro = (id: string) => {
    setPros(prev => prev.filter(p => p.id !== id));
    if (selectedBarId === id) { setSelectedBarId(null); setSelectedBarSide(null); }
    setNudges(prev => { const next = new Map(prev); next.delete(id); return next; });
  };
  const removeCon = (id: string) => {
    setCons(prev => prev.filter(c => c.id !== id));
    if (selectedBarId === id) { setSelectedBarId(null); setSelectedBarSide(null); }
    setNudges(prev => { const next = new Map(prev); next.delete(id); return next; });
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
            <Button
              onClick={() => { setTopicSet(false); setTopic(""); setPros([]); setCons([]); setDismissedSuggestions(new Set()); setShowSuggestions(false); setSaved(false); setSaveError(""); setDismissedPrompt(false); setNudges(new Map()); }}
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

        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-[#81B29A] border-b-2 border-[#81B29A] pb-2">Pros</h2>
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
                  color="pro"
                  globalMax={globalMaxWeight}
                  selectedId={selectedBarId}
                  onSelect={(id) => selectBar(id, "pro")}
                  onRemove={removePro}
                  emptyText="No pros yet"
                />
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-[#E07A5F] border-b-2 border-[#F2CC8F] pb-2">Cons</h2>
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
                  color="con"
                  globalMax={globalMaxWeight}
                  selectedId={selectedBarId}
                  onSelect={(id) => selectBar(id, "con")}
                  onRemove={removeCon}
                  emptyText="No cons yet"
                />
              </div>
            </div>
          </div>

          {(pros.length > 0 || cons.length > 0) && (
            <div className="flex flex-col items-center justify-center gap-3 border-2 border-muted bg-muted/20 rounded-lg px-3 py-4 self-start sticky top-4">
              <button
                onClick={increaseSelected}
                disabled={!selectedItem || selectedItem.weight >= 20}
                className="w-10 h-10 rounded-md border-2 border-foreground flex items-center justify-center font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground hover:text-background transition-colors"
                data-testid="button-global-increase"
              >
                <Plus className="h-5 w-5" />
              </button>
              <div className="text-center min-w-[48px]">
                {selectedItem ? (
                  <div>
                    <p className={`text-[9px] font-bold uppercase tracking-widest leading-tight ${selectedBarSide === "pro" ? "text-[#81B29A]" : "text-[#E07A5F]"}`}>
                      {selectedItem.label}
                    </p>
                    <p className="text-xl font-bold">{selectedItem.weight}</p>
                  </div>
                ) : (
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-tight">Tap a<br/>bar</p>
                )}
              </div>
              <button
                onClick={decreaseSelected}
                disabled={!selectedItem || selectedItem.weight <= 1}
                className="w-10 h-10 rounded-md border-2 border-foreground flex items-center justify-center font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground hover:text-background transition-colors"
                data-testid="button-global-decrease"
              >
                <Minus className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {nudges.size > 0 && (
          <div className="space-y-2">
            {[...nudges.values()].map((nudge) => (
              <div
                key={nudge.itemId}
                className={`border rounded-lg overflow-hidden transition-all ${
                  nudge.side === "pro"
                    ? "border-[#81B29A]/30 bg-[#81B29A]/5"
                    : "border-[#E07A5F]/30 bg-[#E07A5F]/5"
                }`}
                data-testid={`specificity-nudge-${nudge.itemId}`}
              >
                <button
                  onClick={() => toggleNudge(nudge.itemId)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
                  data-testid={`button-toggle-nudge-${nudge.itemId}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageCircle className={`h-3.5 w-3.5 flex-shrink-0 ${
                      nudge.side === "pro" ? "text-[#81B29A]" : "text-[#E07A5F]"
                    }`} />
                    <span className="text-xs font-medium truncate">
                      {nudge.expanded ? nudge.message : `"${nudge.itemLabel}" — tap to refine`}
                    </span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform ${nudge.expanded ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {nudge.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                        {nudge.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => replaceWithSpecific(nudge.itemId, s, nudge.side)}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all hover:scale-[1.02] ${
                              nudge.side === "pro"
                                ? "bg-[#81B29A]/15 text-[#81B29A] hover:bg-[#81B29A]/25"
                                : "bg-[#E07A5F]/15 text-[#E07A5F] hover:bg-[#E07A5F]/25"
                            }`}
                            data-testid={`button-specific-${s.slice(0, 20)}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <Button
              onClick={() => setShowSuggestions(!showSuggestions)}
              variant="outline"
              className={`rounded-md border-2 border-foreground uppercase tracking-wider text-sm w-full ${showSuggestions ? 'bg-foreground text-background' : ''}`}
              data-testid="button-toggle-suggestions"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Have you considered...
            </Button>
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-2 border-muted rounded-lg p-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {suggestions.slice(0, 8).map((suggestion) => (
                        <motion.button
                          key={suggestion.text}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`px-4 py-2 border-2 rounded-md text-sm font-medium uppercase tracking-wider transition-all hover:scale-105 ${
                            suggestion.side === "pro"
                              ? "border-[#81B29A]/50 text-[#81B29A] hover:bg-[#81B29A]/10"
                              : "border-[#F2CC8F] text-[#E07A5F] hover:bg-[#F2CC8F]/30"
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
          </div>
        )}

        {(pros.length > 0 || cons.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t-4 border-foreground pt-8"
          >
            <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-8">The Verdict</h2>
            {!saved && (
              <div className="flex justify-center mb-6">
                {user ? (
                  <Button
                    onClick={async () => {
                      setSaveError("");
                      try {
                        await apiRequest("POST", "/api/exercises/weighitup", {
                          decision: topic,
                          pros: pros.map(p => ({ label: p.label, weight: p.weight })),
                          cons: cons.map(c => ({ label: c.label, weight: c.weight })),
                          proPercent,
                          conPercent,
                        });
                        setSaved(true);
                        queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
                      } catch (err: unknown) {
                        setSaveError(err instanceof Error ? err.message : "Failed to save");
                      }
                    }}
                    className="rounded-md border-2 border-[#81B29A] bg-[#81B29A] text-white hover:bg-[#81B29A]/90 uppercase tracking-widest text-sm"
                    data-testid="button-save-exercise"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save to History
                  </Button>
                ) : null}
              </div>
            )}
            {saved && (
              <div className="flex justify-center mb-6">
                <span className="text-sm text-[#81B29A] font-medium flex items-center gap-2">
                  <Check className="h-4 w-4" /> Saved to history
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center" style={{ height: maxSummaryRadius * 2 + 20 }}>
                  <div
                    className="rounded-full bg-[#81B29A]/20 border-4 border-[#81B29A] flex items-center justify-center transition-all duration-500"
                    style={{ width: proSummaryRadius * 2 + 20, height: proSummaryRadius * 2 + 20 }}
                    data-testid="circle-summary-pros"
                  >
                    <span className="text-2xl font-bold text-[#81B29A]">{proPercent}%</span>
                  </div>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-[#81B29A] mt-4">Pros</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center" style={{ height: maxSummaryRadius * 2 + 20 }}>
                  <div
                    className="rounded-full border-4 flex items-center justify-center transition-all duration-500"
                    style={{ width: conSummaryRadius * 2 + 20, height: conSummaryRadius * 2 + 20, backgroundColor: "rgba(224,122,95,0.1)", borderColor: "#F2CC8F" }}
                    data-testid="circle-summary-cons"
                  >
                    <span className="text-2xl font-bold text-[#E07A5F]">{conPercent}%</span>
                  </div>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-[#E07A5F] mt-4">Cons</p>
              </div>
            </div>

            {saveError && (
              <p className="text-xs text-destructive text-center mt-2">{saveError}</p>
            )}
            <AnimatePresence>
              {!user && !saved && !dismissedPrompt && (
                <GuestSignupPrompt onDismiss={() => setDismissedPrompt(true)} />
              )}
            </AnimatePresence>
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
  color: "pro" | "con";
  globalMax: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex items-end justify-center h-[260px] border-2 border-dashed border-muted rounded-lg p-4">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">{emptyText}</p>
      </div>
    );
  }

  const isPro = color === "pro";
  const barStyle = isPro
    ? { backgroundColor: "#81B29A", borderColor: "#81B29A" }
    : { backgroundColor: "#E07A5F", borderColor: "#E07A5F" };
  const ringClass = isPro ? "ring-[#81B29A]" : "ring-[#E07A5F]";
  const barTextClass = isPro ? "text-white" : "text-white";

  return (
    <div className="border-2 border-muted rounded-lg p-4">
      <div className="flex gap-2 justify-center w-full">
        <AnimatePresence>
          {items.map((item) => {
            const heightPercent = item.weight / globalMax;
            const barHeight = Math.max(40, heightPercent * MAX_BAR_HEIGHT);
            const isSelected = selectedId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center flex-1 min-w-0"
                data-testid={`bar-${color}-${item.id}`}
              >
                <div className="flex flex-col justify-end w-full" style={{ height: MAX_BAR_HEIGHT }}>
                  <motion.div
                    onClick={() => onSelect(item.id)}
                    className={`w-full cursor-pointer border-2 rounded-md relative transition-all flex flex-col items-center justify-end p-1 overflow-hidden ${isSelected ? `ring-2 ${ringClass} ring-offset-2` : "opacity-70 hover:opacity-100"}`}
                    style={barStyle}
                    animate={{ height: barHeight }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <p className={`text-[8px] font-bold uppercase tracking-wider ${barTextClass} text-center leading-tight break-words w-full`}>
                      {item.label}
                    </p>
                    <span className={`text-xs font-bold ${barTextClass} opacity-90 mt-0.5`}>{item.weight}</span>
                  </motion.div>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors mt-2"
                  data-testid={`button-remove-${item.id}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
