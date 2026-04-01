import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loginRequest, setToken } from "@/api/client";

interface AuthState {
  authentifie: boolean;
  connexion: (motDePasse: string) => Promise<void>;
  deconnexion: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authentifie, setAuthentifie] = useState(() => !!sessionStorage.getItem("yuki_token"));

  const connexion = useCallback(async (motDePasse: string) => {
    const { access_token } = await loginRequest(motDePasse);
    setToken(access_token);
    setAuthentifie(true);
  }, []);

  const deconnexion = useCallback(() => {
    setToken(null);
    setAuthentifie(false);
  }, []);

  const value = useMemo(
    () => ({ authentifie, connexion, deconnexion }),
    [authentifie, connexion, deconnexion]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth hors AuthProvider");
  return ctx;
}
