import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export function GuestSignupPrompt({ onDismiss }: { onDismiss: () => void }) {
  const { signup, login } = useAuth();
  const [mode, setMode] = useState<"prompt" | "signup" | "login">("prompt");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      onDismiss();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "prompt") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="border-2 border-[#5B7B6A]/30 rounded-md bg-[#5B7B6A]/5 p-4 mt-6"
        data-testid="guest-signup-prompt"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <UserPlus className="h-5 w-5 text-[#5B7B6A] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Sign up to save your results</p>
              <p className="text-xs text-muted-foreground mt-1">Track your thinking over time and review past exercises.</p>
            </div>
          </div>
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground" data-testid="button-dismiss-prompt">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3 ml-8">
          <Button
            size="sm"
            className="rounded-md text-xs uppercase tracking-widest bg-[#5B7B6A] hover:bg-[#5B7B6A]/90"
            onClick={() => setMode("signup")}
            data-testid="button-show-signup"
          >
            Sign Up
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-md text-xs uppercase tracking-widest border-2"
            onClick={() => setMode("login")}
            data-testid="button-show-login"
          >
            Log In
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="border-2 border-[#5B7B6A]/30 rounded-md bg-[#5B7B6A]/5 p-4 mt-6"
      data-testid="auth-form"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold uppercase tracking-widest">
          {mode === "signup" ? "Create Account" : "Log In"}
        </p>
        <button onClick={() => setMode("prompt")} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        <Input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="rounded-md border-2 border-muted h-10"
          data-testid="input-auth-email"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="rounded-md border-2 border-muted h-10"
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          data-testid="input-auth-password"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          onClick={handleSubmit}
          disabled={loading || !email.trim() || !password.trim()}
          className="w-full rounded-md uppercase tracking-widest text-xs bg-[#5B7B6A] hover:bg-[#5B7B6A]/90"
          data-testid="button-auth-submit"
        >
          {loading ? "..." : mode === "signup" ? "Create Account" : "Log In"}
        </Button>
        <button
          className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          data-testid="button-auth-toggle"
        >
          {mode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
        </button>
      </div>
    </motion.div>
  );
}
