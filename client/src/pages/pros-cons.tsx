import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
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

export default function ProsCons() {
  const [topic, setTopic] = useState("");
  const [topicSet, setTopicSet] = useState(false);
  const [pros, setPros] = useState<CircleItem[]>([]);
  const [cons, setCons] = useState<CircleItem[]>([]);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");
  const [dragging, setDragging] = useState<{ id: string; startY: number; startRadius: number } | null>(null);

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
    setDragging({ id, startY: e.clientY, startRadius: currentRadius });

    const onMove = (ev: PointerEvent) => {
      const delta = -(ev.clientY - e.clientY);
      const newRadius = currentRadius + delta * 0.5;
      updateRadius(id, side, newRadius);
    };

    const onUp = () => {
      setDragging(null);
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
          <Button
            onClick={() => { setTopicSet(false); setTopic(""); setPros([]); setCons([]); }}
            variant="outline"
            className="rounded-none border-2 border-foreground uppercase tracking-wider text-sm"
            data-testid="button-reset"
          >
            Reset
          </Button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-tighter" data-testid="text-topic">{topic}</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Drag circles up to increase weight, down to decrease</p>
        </div>

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
            <div className="flex flex-wrap gap-6 items-center justify-center min-h-[200px]">
              <AnimatePresence>
                {pros.map(pro => (
                  <CircleBubble
                    key={pro.id}
                    item={pro}
                    color="green"
                    onPointerDown={(e) => handlePointerDown(e, pro.id, "pro", pro.radius)}
                    onRemove={() => removePro(pro.id)}
                  />
                ))}
              </AnimatePresence>
              {pros.length === 0 && (
                <p className="text-muted-foreground text-sm uppercase tracking-widest">No pros yet</p>
              )}
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
            <div className="flex flex-wrap gap-6 items-center justify-center min-h-[200px]">
              <AnimatePresence>
                {cons.map(con => (
                  <CircleBubble
                    key={con.id}
                    item={con}
                    color="red"
                    onPointerDown={(e) => handlePointerDown(e, con.id, "con", con.radius)}
                    onRemove={() => removeCon(con.id)}
                  />
                ))}
              </AnimatePresence>
              {cons.length === 0 && (
                <p className="text-muted-foreground text-sm uppercase tracking-widest">No cons yet</p>
              )}
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
  onPointerDown,
  onRemove,
}: {
  item: CircleItem;
  color: "green" | "red";
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
      className="flex flex-col items-center gap-2"
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
        className="text-muted-foreground hover:text-destructive transition-colors"
        data-testid={`button-remove-${item.id}`}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </motion.div>
  );
}
