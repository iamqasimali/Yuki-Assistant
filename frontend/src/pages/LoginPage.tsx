import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

const demo = import.meta.env.VITE_MODE_DEMO === "true";

export default function LoginPage() {
  const { authentifie, connexion } = useAuth();
  const [motDePasse, setMotDePasse] = useState(demo ? "yuki-dev" : "");
  const [erreur, setErreur] = useState<string | null>(null);
  const [charge, setCharge] = useState(false);

  if (authentifie) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setCharge(true);
    try {
      await connexion(motDePasse);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la connexion.");
    } finally {
      setCharge(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-yuki-bg to-yuki-surface">
      <div className="w-full max-w-md rounded-2xl border border-yuki-border bg-yuki-surface/90 dark:bg-yuki-surface/80 p-8 shadow-xl backdrop-blur">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-yuki-accent/20 p-3 text-yuki-accent">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-yuki-text">Yuki</h1>
            <p className="text-sm text-yuki-muted">Assistant personnel — connexion</p>
          </div>
        </div>
        {demo && (
          <p className="text-xs text-amber-900 dark:text-amber-200/90 mb-4 rounded-lg bg-amber-500/15 dark:bg-amber-500/10 px-3 py-2 border border-amber-600/25 dark:border-amber-500/20">
            Mode démo : mot de passe prérempli pour les tests locaux uniquement.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-yuki-muted">
            Mot de passe
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="mt-1 w-full rounded-xl border border-yuki-border bg-yuki-bg px-4 py-3 text-yuki-text outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50"
              autoComplete="current-password"
              required
            />
          </label>
          {erreur && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {erreur}
            </p>
          )}
          <button
            type="submit"
            disabled={charge}
            className="w-full rounded-xl bg-yuki-accent py-3 font-medium text-yuki-on-accent hover:opacity-90 disabled:opacity-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent focus-visible:ring-offset-2 focus-visible:ring-offset-yuki-surface"
          >
            {charge ? "Connexion…" : "Entrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
