/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, authExpiredEvent, authToken } from '../../lib/api';
import type { AuthPayload, User } from '../../types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isBooting: boolean;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  completeInvitationRegistration: (
    token: string,
    payload: { name: string; password: string },
  ) => Promise<void>;
  acceptInvitation: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(payload: AuthPayload): User {
  authToken.set(payload.token);
  return payload.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => authToken.get());
  const [isBooting, setIsBooting] = useState(true);

  const refreshUser = useCallback(async () => {
    const nextUser = await api.me();
    setUser(nextUser);
  }, []);

  useEffect(() => {
    if (!token) {
      setIsBooting(false);
      return;
    }

    refreshUser()
      .catch(() => {
        authToken.clear();
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsBooting(false));
  }, [refreshUser, token]);

  useEffect(() => {
    function expireSession() {
      setToken(null);
      setUser(null);
    }

    window.addEventListener(authExpiredEvent, expireSession);

    return () => window.removeEventListener(authExpiredEvent, expireSession);
  }, []);

  const setAuthenticated = useCallback((payload: AuthPayload) => {
    const nextUser = persistSession(payload);
    setToken(payload.token);
    setUser(nextUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isBooting,
      signIn: async (payload) => setAuthenticated(await api.login(payload)),
      register: async (payload) =>
        setAuthenticated(await api.register(payload)),
      completeInvitationRegistration: async (invitationToken, payload) =>
        setAuthenticated(
          await api.registerInvitation(invitationToken, payload),
        ),
      acceptInvitation: async (invitationToken) => {
        await api.acceptInvitation(invitationToken);
        await refreshUser();
      },
      refreshUser,
      refreshSession: async () => {
        const refreshed = await api.refresh();
        authToken.set(refreshed.token);
        setToken(refreshed.token);
        await refreshUser();
      },
      signOut: async () => {
        await api.logout().catch(() => undefined);
        authToken.clear();
        setToken(null);
        setUser(null);
      },
    }),
    [isBooting, refreshUser, setAuthenticated, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
