import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type AuthUser = {
  id: string;
  email: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchUser(): Promise<AuthUser> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Sign up failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to log out");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth-user"], null);
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const signup = async (email: string, password: string) => {
    await signupMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
