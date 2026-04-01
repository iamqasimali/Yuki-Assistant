import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Paperclip, Send, Settings } from "lucide-react";
import {
  fetchHistory,
  sendChat,
  uploadFile,
  type MessageDto,
} from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

export default function ChatPage() {
  const { deconnexion } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [saisie, setSaisie] = useState("");
  const [contexteFichier, setContexteFichier] = useState<string | null>(null);
  const [nomFichier, setNomFichier] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const fichierRef = useRef<HTMLInputElement>(null);

  const scrollBas = useCallback(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollBas();
  }, [messages, scrollBas]);

  useEffect(() => {
    if (!conversationId) return;
    let cancel = false;
    (async () => {
      try {
        const data = await fetchHistory(conversationId);
        if (!cancel) setMessages(data.messages);
      } catch {
        /* conversation nouvelle */
      }
    })();
    return () => {
      cancel = true;
    };
  }, [conversationId]);

  async function handleFichier(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setErreur(null);
    try {
      const { texte, nom_fichier } = await uploadFile(f);
      setContexteFichier(texte);
      setNomFichier(nom_fichier);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l’envoi du fichier.");
    }
  }

  async function envoyerMessage() {
    const texte = saisie.trim();
    if (!texte || envoi) return;
    setErreur(null);
    setEnvoi(true);
    const tempUser: MessageDto = {
      id: crypto.randomUUID(),
      role: "user",
      content: contexteFichier ? `[${nomFichier}]\n${texte}` : texte,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, tempUser]);
    setSaisie("");
    try {
      const rep = await sendChat({
        message: texte,
        conversation_id: conversationId,
        contexte_fichier: contexteFichier,
      });
      setConversationId(rep.conversation_id);
      setContexteFichier(null);
      setNomFichier(null);
      const assistant: MessageDto = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: rep.reponse,
        created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistant]);
    } catch (err) {
      setMessages((m) => m.filter((x) => x.id !== tempUser.id));
      setSaisie(texte);
      setErreur(err instanceof Error ? err.message : "Erreur réseau.");
    } finally {
      setEnvoi(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void envoyerMessage();
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-3xl mx-auto border-x border-yuki-border bg-yuki-bg">
      <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-yuki-border bg-yuki-surface/50">
        <div>
          <h1 className="font-semibold text-white">Yuki</h1>
          <p className="text-xs text-yuki-muted">Assistant bienveillant</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/parametres"
            className="inline-flex items-center gap-2 rounded-lg border border-yuki-border px-3 py-2 text-sm text-yuki-muted hover:text-white hover:border-yuki-accent/40 transition"
          >
            <Settings className="w-4 h-4" />
            Paramètres
          </Link>
          <button
            type="button"
            onClick={() => {
              deconnexion();
              navigate("/connexion", { replace: true });
            }}
            className="rounded-lg border border-yuki-border px-3 py-2 text-sm text-yuki-muted hover:text-white"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-yuki-muted text-sm py-12">
            Écris un message pour commencer. Tu peux joindre un PDF, un DOCX ou une image.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-yuki-accent/25 text-slate-100 rounded-br-md"
                  : "bg-yuki-surface border border-yuki-border text-slate-200 rounded-bl-md"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {envoi && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-yuki-border bg-yuki-surface px-4 py-3 text-sm text-yuki-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              Yuki réfléchit…
            </div>
          </div>
        )}
        <div ref={finRef} />
      </div>

      {nomFichier && contexteFichier && (
        <div className="px-4 py-2 text-xs text-yuki-muted border-t border-yuki-border bg-yuki-surface/30">
          Fichier prêt : <span className="text-yuki-accent">{nomFichier}</span> — sera inclus avec le
          prochain message.
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => {
              setContexteFichier(null);
              setNomFichier(null);
            }}
          >
            Retirer
          </button>
        </div>
      )}

      {erreur && (
        <div className="px-4 py-2 text-sm text-red-300 bg-red-500/10 border-t border-red-500/20">
          {erreur}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-yuki-border bg-yuki-surface/50 flex gap-2 items-end"
      >
        <input
          ref={fichierRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.gif"
          onChange={handleFichier}
        />
        <button
          type="button"
          onClick={() => fichierRef.current?.click()}
          className="shrink-0 rounded-xl border border-yuki-border p-3 text-yuki-muted hover:text-white hover:border-yuki-accent/40"
          aria-label="Joindre un fichier"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <textarea
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void envoyerMessage();
            }
          }}
          rows={2}
          placeholder="Message à Yuki…"
          className="flex-1 resize-none rounded-xl border border-yuki-border bg-yuki-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-yuki-accent/40"
        />
        <button
          type="submit"
          disabled={envoi || !saisie.trim()}
          className="shrink-0 rounded-xl bg-yuki-accent p-3 text-yuki-bg disabled:opacity-40"
          aria-label="Envoyer"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
