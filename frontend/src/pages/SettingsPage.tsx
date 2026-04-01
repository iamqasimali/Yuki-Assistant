import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getConfig, saveConfig } from "@/api/client";

export default function SettingsPage() {
  const [extra, setExtra] = useState("");
  const [charge, setCharge] = useState(true);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const c = await getConfig();
        if (!cancel) setExtra(c.personnalite_extra || "");
      } catch (e) {
        if (!cancel) setErreur(e instanceof Error ? e.message : "Chargement impossible.");
      } finally {
        if (!cancel) setCharge(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setErreur(null);
    setSauvegarde(true);
    try {
      await saveConfig({ personnalite_extra: extra });
      setMessage("Préférences enregistrées.");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l’enregistrement.");
    } finally {
      setSauvegarde(false);
    }
  }

  return (
    <div className="min-h-screen max-w-xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-yuki-muted hover:text-white mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au chat
      </Link>
      <h1 className="text-2xl font-semibold text-white mb-2">Paramètres</h1>
      <p className="text-sm text-yuki-muted mb-8">
        Ajuste le ton de Yuki avec des instructions supplémentaires (conservées côté serveur).
      </p>
      {charge ? (
        <p className="text-yuki-muted">Chargement…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-yuki-muted">
            Personnalité / instructions supplémentaires
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              rows={8}
              className="mt-2 w-full rounded-xl border border-yuki-border bg-yuki-surface px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-yuki-accent/40"
              placeholder="Ex. : « Utilise des phrases courtes quand je suis stressé. »"
            />
          </label>
          {message && <p className="text-sm text-emerald-300">{message}</p>}
          {erreur && <p className="text-sm text-red-300">{erreur}</p>}
          <button
            type="submit"
            disabled={sauvegarde}
            className="rounded-xl bg-yuki-accent px-6 py-3 text-sm font-medium text-yuki-bg disabled:opacity-50"
          >
            {sauvegarde ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      )}
    </div>
  );
}
