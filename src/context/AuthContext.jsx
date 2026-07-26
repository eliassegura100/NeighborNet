import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get whatever session already exists (e.g. after a page refresh)
    // up front, then keep listening for sign-in/sign-out/token-refresh
    // events. Supabase's own docs recommend both together — relying on
    // onAuthStateChange alone can miss the very first render.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  function logout() {
    return supabase.auth.signOut();
  }

  // NOTE for the rest of the migration: this is a Supabase user, so it's
  // shaped like { id, email, ... } — not Firebase's { uid, email, ... }.
  // Anywhere still doing user.uid (MyRequestsPage's Firestore query is
  // the one left) needs to become user.id when that page gets rewritten.
  const value = { user: session?.user ?? null, session, loading, logout };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}