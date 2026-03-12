import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login, signup } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      setLocation("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <Link href="/">
            <button
              className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-back"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col justify-center py-12"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin
                ? "Sign in to access your saved exercises"
                : "Sign up to save your thinking exercises"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7B6A]/30 focus:border-[#5B7B6A] transition-all"
                  placeholder="you@example.com"
                  data-testid="input-email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7B6A]/30 focus:border-[#5B7B6A] transition-all"
                  placeholder="At least 6 characters"
                  data-testid="input-password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#5B7B6A]/30 focus:border-[#5B7B6A] transition-all"
                    placeholder="Confirm your password"
                    data-testid="input-confirm-password"
                    autoComplete="new-password"
                  />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#C27D60] bg-[#C27D60]/10 rounded-lg px-3 py-2"
                data-testid="text-error"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium uppercase tracking-widest transition-all disabled:opacity-50"
              style={{
                backgroundColor: "#5B7B6A",
                color: "white",
              }}
              data-testid="button-submit"
            >
              {loading ? "..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setConfirmPassword("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-toggle-mode"
            >
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <span className="font-medium" style={{ color: "#5B7B6A" }}>
                    Sign up
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span className="font-medium" style={{ color: "#5B7B6A" }}>
                    Sign in
                  </span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
