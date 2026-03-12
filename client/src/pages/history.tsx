import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Scale, Link2, Calendar, ChevronDown, ChevronUp, X } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface BarItem {
  id: string;
  label: string;
  weight: number;
}

interface ChainLink {
  id: string;
  reasons: { id: string; text: string }[];
}

interface CounterpositionEntry {
  id: string;
  belief: string;
  counterArgument: string;
  grade: string;
  summary: string;
  metricGrades: Record<string, { grade: string; desc: string }>;
  createdAt: string;
}

interface WeighItUpEntry {
  id: string;
  topic: string;
  pros: BarItem[];
  cons: BarItem[];
  proPercent: number;
  conPercent: number;
  createdAt: string;
}

interface UnthreadEntry {
  id: string;
  question: string;
  chain: ChainLink[];
  tradeCost: string;
  tradeGain: string;
  alternatives: Record<string, { id: string; text: string }[]>;
  createdAt: string;
}

type TimelineEntry =
  | { type: "counterposition"; data: CounterpositionEntry }
  | { type: "weighItUp"; data: WeighItUpEntry }
  | { type: "unthread"; data: UnthreadEntry };

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function groupByDate(entries: TimelineEntry[]): Map<string, TimelineEntry[]> {
  const groups = new Map<string, TimelineEntry[]>();
  for (const entry of entries) {
    const dateKey = formatDate(entry.data.createdAt);
    const existing = groups.get(dateKey) || [];
    existing.push(entry);
    groups.set(dateKey, existing);
  }
  return groups;
}

export default function History() {
  const { user, isLoading: authLoading } = useAuth();
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/exercises", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        const all: TimelineEntry[] = [
          ...data.counterpositions.map((d: CounterpositionEntry) => ({ type: "counterposition" as const, data: d })),
          ...data.weighItUps.map((d: WeighItUpEntry) => ({ type: "weighItUp" as const, data: d })),
          ...data.unthreads.map((d: UnthreadEntry) => ({ type: "unthread" as const, data: d })),
        ];
        all.sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
        setEntries(all);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-bold uppercase tracking-tight">History</h1>
          <p className="text-muted-foreground">
            Sign in to view your saved exercises and track your thinking over time.
          </p>
          <Link href="/account">
            <button
              className="mt-4 px-6 py-3 rounded-md text-sm font-medium uppercase tracking-widest text-white transition-all"
              style={{ backgroundColor: "#5B7B6A" }}
              data-testid="link-sign-in-history"
            >
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const grouped = groupByDate(entries);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter">Your History</h1>
          <p className="text-sm text-muted-foreground">
            Past exercises and thinking sessions
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm uppercase tracking-widest animate-pulse">Loading...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">No exercises saved yet.</p>
            <p className="text-sm text-muted-foreground">
              Complete an exercise while signed in to start building your history.
            </p>
            <Link href="/">
              <button
                className="mt-4 px-6 py-3 rounded-md text-sm font-medium uppercase tracking-widest border-2 border-foreground hover:bg-foreground hover:text-background transition-all"
                data-testid="link-explore-tools"
              >
                Explore Tools
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(grouped.entries()).map(([date, items]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{date}</h2>
                </div>
                <div className="space-y-2">
                  {items.map(entry => (
                    <HistoryCard
                      key={entry.data.id}
                      entry={entry}
                      isExpanded={expandedId === entry.data.id}
                      onToggle={() => setExpandedId(expandedId === entry.data.id ? null : entry.data.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ entry, isExpanded, onToggle }: { entry: TimelineEntry; isExpanded: boolean; onToggle: () => void }) {
  const icon = entry.type === "counterposition" ? <Brain className="h-4 w-4" /> :
               entry.type === "weighItUp" ? <Scale className="h-4 w-4" /> :
               <Link2 className="h-4 w-4" />;

  const toolName = entry.type === "counterposition" ? "Counterposition" :
                   entry.type === "weighItUp" ? "Weigh It Up" : "Unthread";

  const summary = entry.type === "counterposition" ? entry.data.belief :
                  entry.type === "weighItUp" ? entry.data.topic :
                  entry.data.question;

  const badge = entry.type === "counterposition" ? entry.data.grade :
                entry.type === "weighItUp" ? `${entry.data.proPercent}% / ${entry.data.conPercent}%` :
                null;

  const badgeColor = entry.type === "counterposition"
    ? (entry.data.grade.startsWith("A") ? "text-green-600 bg-green-50" :
       entry.data.grade.startsWith("B") ? "text-blue-600 bg-blue-50" :
       entry.data.grade.startsWith("C") ? "text-yellow-600 bg-yellow-50" :
       "text-red-600 bg-red-50")
    : "text-[#5B7B6A] bg-[#5B7B6A]/10";

  return (
    <motion.div
      layout
      className="border-2 border-muted rounded-md bg-card overflow-hidden"
      data-testid={`history-card-${entry.data.id}`}
    >
      <div
        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={onToggle}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted/40 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{toolName}</span>
            <span className="text-[10px] text-muted-foreground/60">{formatTime(entry.data.createdAt)}</span>
          </div>
          <p className="text-sm font-medium truncate mt-0.5" data-testid={`text-summary-${entry.data.id}`}>
            {summary}
          </p>
        </div>
        {badge && (
          <span className={`text-xs font-bold px-2 py-1 rounded-md flex-shrink-0 ${badgeColor}`}>
            {badge}
          </span>
        )}
        <div className="flex-shrink-0 text-muted-foreground">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-muted">
              {entry.type === "counterposition" && <CounterpositionDetail data={entry.data} />}
              {entry.type === "weighItUp" && <WeighItUpDetail data={entry.data} />}
              {entry.type === "unthread" && <UnthreadDetail data={entry.data} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CounterpositionDetail({ data }: { data: CounterpositionEntry }) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Belief</p>
        <p className="text-sm italic border-l-4 border-[#5B7B6A] pl-3">"{data.belief}"</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Counter-argument</p>
        <p className="text-sm italic border-l-4 border-[#C27D60] pl-3">"{data.counterArgument}"</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Summary</p>
        <p className="text-sm text-foreground/80">{data.summary}</p>
      </div>
      {data.metricGrades && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(data.metricGrades).map(([key, val]) => (
            <div key={key} className="bg-muted/20 rounded-md px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {key === "depth" ? "Structural Depth" :
                 key === "friction" ? "Intellectual Friction" :
                 key === "vocabulary" ? "Rhetorical Range" : "Research Quality"}
              </p>
              <p className="text-sm font-bold">{val.grade}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeighItUpDetail({ data }: { data: WeighItUpEntry }) {
  const prosArr = Array.isArray(data.pros) ? data.pros as BarItem[] : [];
  const consArr = Array.isArray(data.cons) ? data.cons as BarItem[] : [];

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#5B7B6A] font-bold mb-2">Pros ({data.proPercent}%)</p>
          <div className="space-y-1">
            {prosArr.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-[#5B7B6A]/5 rounded px-2 py-1.5">
                <span className="text-xs">{p.label}</span>
                <span className="text-xs font-bold text-[#5B7B6A]">{p.weight}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-[#C27D60] font-bold mb-2">Cons ({data.conPercent}%)</p>
          <div className="space-y-1">
            {consArr.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-[#C27D60]/5 rounded px-2 py-1.5">
                <span className="text-xs">{c.label}</span>
                <span className="text-xs font-bold text-[#C27D60]">{c.weight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UnthreadDetail({ data }: { data: UnthreadEntry }) {
  const chainArr = Array.isArray(data.chain) ? data.chain as ChainLink[] : [];
  const alts = (data.alternatives && typeof data.alternatives === "object") ? data.alternatives as Record<string, { id: string; text: string }[]> : {};

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">What you're doing</p>
        <p className="text-sm font-bold text-[#C27D60]">{data.tradeCost}</p>
      </div>

      <div className="space-y-2">
        {chainArr.map((link, i) => {
          const reasons = link.reasons.filter(r => r.text.trim()).map(r => r.text).join(", ");
          const linkAlts = (alts[link.id] || []).filter(a => a.text.trim());
          return (
            <div key={link.id || i} className="bg-muted/20 rounded-md px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {i === 0 ? "Because" : "And because"}
              </p>
              <p className="text-sm font-medium">{reasons || "..."}</p>
              {linkAlts.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  <p className="text-[10px] uppercase tracking-widest text-[#C27D60]">Alternatives</p>
                  {linkAlts.map(a => (
                    <p key={a.id} className="text-xs text-foreground/70">→ {a.text}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">What you're getting</p>
        <p className="text-sm font-bold text-[#5B7B6A]">{data.tradeGain}</p>
      </div>
    </div>
  );
}
