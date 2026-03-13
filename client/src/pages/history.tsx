import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Scale, Unlink, Clock, X, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import type { MetricDetail } from "@/lib/scoring";

interface CounterpositionEntry {
  id: string;
  type: "counterposition";
  createdAt: string;
  belief: string;
  counterArgument: string;
  grade: string;
  summary: string;
  metrics: Record<string, MetricDetail>;
}

interface WeighItUpEntry {
  id: string;
  type: "weighitup";
  createdAt: string;
  decision: string;
  pros: { label: string; weight: number }[];
  cons: { label: string; weight: number }[];
  proPercent: number;
  conPercent: number;
}

interface UnthreadEntry {
  id: string;
  type: "unthread";
  createdAt: string;
  question: string;
  chain: { id: string; reasons: { id: string; text: string }[] }[];
  tradeGain: string;
  alternatives: Record<string, { id: string; text: string }[]>;
}

type ExerciseEntry = CounterpositionEntry | WeighItUpEntry | UnthreadEntry;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function groupByDate(exercises: ExerciseEntry[]) {
  const groups: { [date: string]: ExerciseEntry[] } = {};
  for (const ex of exercises) {
    const key = formatDate(ex.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(ex);
  }
  return groups;
}

function getToolIcon(type: string) {
  switch (type) {
    case "counterposition": return <Brain className="h-4 w-4" />;
    case "weighitup": return <Scale className="h-4 w-4" />;
    case "unthread": return <Unlink className="h-4 w-4" />;
    default: return null;
  }
}

function getToolName(type: string) {
  switch (type) {
    case "counterposition": return "Counterposition";
    case "weighitup": return "Weigh It Up";
    case "unthread": return "Unthread";
    default: return "";
  }
}

function getToolColor(type: string) {
  switch (type) {
    case "counterposition": return "#81B29A";
    case "weighitup": return "#E07A5F";
    case "unthread": return "#81B29A";
    default: return "#888";
  }
}

function getSummary(entry: ExerciseEntry): string {
  switch (entry.type) {
    case "counterposition": return entry.belief;
    case "weighitup": return entry.decision;
    case "unthread": return entry.question;
  }
}

function getGradeOrVerdict(entry: ExerciseEntry): string {
  switch (entry.type) {
    case "counterposition": return entry.grade;
    case "weighitup": return `${entry.proPercent}% Pro`;
    case "unthread": return `${entry.chain?.length || 0} links`;
  }
}

function gradeColor(grade: string) {
  if (grade.startsWith("A")) return "text-green-500";
  if (grade.startsWith("B")) return "text-blue-500";
  if (grade.startsWith("C")) return "text-yellow-500";
  return "text-red-500";
}

function CounterpositionDetail({ exercise }: { exercise: CounterpositionEntry }) {
  const metrics = exercise.metrics;
  return (
    <div className="space-y-4" data-testid={`detail-counterposition-${exercise.id}`}>
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Belief</p>
          <p className="text-sm italic border-l-4 border-[#81B29A] pl-3">"{exercise.belief}"</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Counter-argument</p>
          <p className="text-sm italic border-l-4 border-[#E07A5F] pl-3">"{exercise.counterArgument}"</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center p-4 border-2 border-foreground bg-card">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Grade</p>
          <span className={`text-4xl font-bold ${gradeColor(exercise.grade)}`}>{exercise.grade}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm italic text-muted-foreground">"{exercise.summary}"</p>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(metrics).map(([key, metric]) => (
            <div key={key} className="border border-muted p-3 bg-card">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider">{key}</span>
                <span className={`font-bold ${gradeColor(metric.grade)}`}>{metric.grade}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeighItUpDetail({ exercise }: { exercise: WeighItUpEntry }) {
  const pros = exercise.pros;
  const cons = exercise.cons;
  return (
    <div className="space-y-4" data-testid={`detail-weighitup-${exercise.id}`}>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Decision</p>
        <p className="text-lg font-bold">{exercise.decision}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-[#81B29A] mb-2">Pros</p>
          {pros.map((p, i) => (
            <div key={i} className="flex justify-between items-center py-1 border-b border-muted">
              <span className="text-sm">{p.label}</span>
              <span className="text-xs font-bold text-[#81B29A]">{p.weight}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-[#E07A5F] mb-2">Cons</p>
          {cons.map((c, i) => (
            <div key={i} className="flex justify-between items-center py-1 border-b border-muted">
              <span className="text-sm">{c.label}</span>
              <span className="text-xs font-bold text-[#E07A5F]">{c.weight}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-8 pt-2">
        <div className="text-center">
          <span className="text-2xl font-bold text-[#81B29A]">{exercise.proPercent}%</span>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Pros</p>
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold text-[#E07A5F]">{exercise.conPercent}%</span>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Cons</p>
        </div>
      </div>
    </div>
  );
}

function UnthreadDetail({ exercise }: { exercise: UnthreadEntry }) {
  const chain = exercise.chain;
  const alternatives = exercise.alternatives;
  return (
    <div className="space-y-4" data-testid={`detail-unthread-${exercise.id}`}>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Question</p>
        <p className="text-lg font-bold">"{exercise.question}"</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Reasoning Chain</p>
        {chain.map((link, i) => (
          <div key={link.id} className="border-l-4 border-[#81B29A] pl-3 py-1">
            <p className="text-xs text-muted-foreground">{i === 0 ? "Because" : "And because"}</p>
            <p className="text-sm font-medium">
              {link.reasons.filter(r => r.text.trim()).map(r => r.text).join(", ")}
            </p>
          </div>
        ))}
      </div>

      {exercise.tradeGain && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">What I'm Getting</p>
          <p className="text-sm font-bold text-[#81B29A]">{exercise.tradeGain}</p>
        </div>
      )}

      {alternatives && Object.values(alternatives).some((alts) => alts?.length > 0) && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Alternatives Found</p>
          {Object.entries(alternatives).map(([linkId, alts]) => {
            const filledAlts = alts.filter(a => a.text.trim());
            if (filledAlts.length === 0) return null;
            return (
              <div key={linkId} className="pl-3 border-l-4 border-[#E07A5F]">
                {filledAlts.map(a => (
                  <p key={a.id} className="text-sm text-muted-foreground">{a.text}</p>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function History() {
  const { user, isLoading: authLoading } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: exercises, isLoading } = useQuery<ExerciseEntry[]>({
    queryKey: ["/api/exercises"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-3xl font-bold uppercase tracking-tight">Exercise History</h1>
          <p className="text-muted-foreground">Sign in to view your exercise history and track your thinking over time.</p>
          <Link href="/">
            <button className="mt-4 px-6 py-3 border-2 border-foreground text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all" data-testid="link-back-home">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const grouped = exercises ? groupByDate(exercises) : {};

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter" data-testid="text-history-title">
            Your History
          </h1>
          <p className="text-sm text-muted-foreground">
            Review your past exercises and see how your thinking has evolved.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground animate-pulse">Loading exercises...</p>
          </div>
        ) : !exercises || exercises.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">No exercises yet. Complete a tool to see your history here.</p>
            <Link href="/">
              <button className="px-6 py-3 border-2 border-foreground text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all" data-testid="button-start-exercising">
                Start an Exercise
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, entries]) => (
              <div key={date}>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3" data-testid={`text-date-${date}`}>
                  {date}
                </p>
                <div className="space-y-3">
                  {entries.map((entry) => {
                    const isExpanded = expandedId === `${entry.type}-${entry.id}`;
                    return (
                      <motion.div
                        key={`${entry.type}-${entry.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-2 border-muted rounded-md overflow-hidden"
                        data-testid={`card-exercise-${entry.type}-${entry.id}`}
                      >
                        <div
                          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => setExpandedId(isExpanded ? null : `${entry.type}-${entry.id}`)}
                          data-testid={`button-expand-${entry.type}-${entry.id}`}
                        >
                          <div
                            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: getToolColor(entry.type), opacity: 0.85 }}
                          >
                            <span className="text-white">{getToolIcon(entry.type)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: getToolColor(entry.type) }}>
                                {getToolName(entry.type)}
                              </span>
                              <span className="text-xs text-muted-foreground">{formatTime(entry.createdAt)}</span>
                            </div>
                            <p className="text-sm font-medium truncate mt-0.5" data-testid={`text-summary-${entry.type}-${entry.id}`}>
                              {getSummary(entry)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-sm font-bold ${entry.type === "counterposition" ? gradeColor(entry.grade) : "text-foreground"}`}>
                              {getGradeOrVerdict(entry)}
                            </span>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
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
                              <div className="p-4 pt-0 border-t border-muted">
                                <div className="pt-4">
                                  {entry.type === "counterposition" && <CounterpositionDetail exercise={entry} />}
                                  {entry.type === "weighitup" && <WeighItUpDetail exercise={entry} />}
                                  {entry.type === "unthread" && <UnthreadDetail exercise={entry} />}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
