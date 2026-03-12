import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { pool } from "./db";
import type { User } from "@shared/schema";

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return bcrypt.compare(supplied, stored);
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      password: string;
      createdAt: Date;
    }
  }
}

export function setupAuth(app: Express) {
  const PgSession = connectPgSimple(session);

  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set in production");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    },
    store: new PgSession({
      pool: pool,
      createTableIfMissing: true,
    }),
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          const isMatch = await comparePasswords(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/auth/signup", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      if (typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      let user: User;
      try {
        user = await storage.createUser({ email, password: hashedPassword });
      } catch (dbError: unknown) {
        if (dbError instanceof Error && "code" in dbError && (dbError as { code: string }).code === "23505") {
          return res.status(400).json({ message: "An account with this email already exists" });
        }
        throw dbError;
      }

      req.session.regenerate((err) => {
        if (err) return next(err);
        req.login(user, (err) => {
          if (err) return next(err);
          return res.json({
            id: user.id,
            email: user.email,
          });
        });
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string }) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.login(user, (err) => {
          if (err) return next(err);
          return res.json({
            id: user.id,
            email: user.email,
          });
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to destroy session" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out" });
      });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user!;
      return res.json({
        id: user.id,
        email: user.email,
      });
    }
    return res.status(401).json({ message: "Not authenticated" });
  });

  app.get("/api/me", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user!;
      return res.json({
        id: user.id,
        email: user.email,
      });
    }
    return res.status(401).json({ message: "Not authenticated" });
  });
}
