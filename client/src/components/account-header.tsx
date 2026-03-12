import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AccountHeader() {
  const { user, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Link href="/account">
          <button
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/30"
            data-testid="link-sign-in"
          >
            <User className="h-3.5 w-3.5" />
            Sign in
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground/70 hover:text-muted-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/30"
        data-testid="button-account-menu"
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
          style={{ backgroundColor: "#5B7B6A" }}
        >
          {user.email[0].toUpperCase()}
        </div>
        <ChevronDown className="h-3 w-3" />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-sm py-1 min-w-[180px]"
          >
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
                {user.email}
              </p>
            </div>
            <LogoutButton onDone={() => setMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LogoutButton({ onDone }: { onDone: () => void }) {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    onDone();
    setLoading(false);
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      data-testid="button-logout"
    >
      <LogOut className="h-3.5 w-3.5" />
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
