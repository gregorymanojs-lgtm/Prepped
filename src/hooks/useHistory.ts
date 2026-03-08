import { useState, useCallback } from "react";
import { SessionResult } from "@/lib/types";

const STORAGE_KEY = "prepped_sessions";

function loadSessions(): SessionResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: SessionResult[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useHistory() {
  const [sessions, setSessions] = useState<SessionResult[]>(loadSessions);

  const addSession = useCallback((session: SessionResult) => {
    setSessions((prev) => {
      const updated = [session, ...prev];
      saveSessions(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getFilteredSessions = useCallback(
    (role?: string, type?: string) => {
      return sessions.filter(
        (s) =>
          (!role || role === "all" || s.setup.role === role) &&
          (!type || type === "all" || s.setup.type === type)
      );
    },
    [sessions]
  );

  const personalBest = sessions.length
    ? Math.max(...sessions.map((s) => s.overallScore))
    : 0;

  return {
    sessions,
    addSession,
    clearHistory,
    getFilteredSessions,
    personalBest,
    totalSessions: sessions.length,
  };
}
