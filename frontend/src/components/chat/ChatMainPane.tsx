import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Mic, Paperclip, Send } from "lucide-react";
import {
  fetchHistory,
  sendChat,
  uploadFile,
  type MessageDto,
} from "@/api/client";
import { useChatUi } from "@/theme/ChatUiContext";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Props = {
  selectedModel: string;
};

export default function ChatMainPane({ selectedModel }: Props) {
  const { conversationId: routeConvId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { bumpConversations } = useChatUi();
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
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
    if (!routeConvId) {
      setActiveConvId(null);
      setMessages([]);
      setErreur(null);
      return;
    }
    if (!UUID_RE.test(routeConvId)) {
      navigate("/", { replace: true });
      return;
    }
    setActiveConvId(routeConvId);
    setErreur(null);
    let cancel = false;
    (async () => {
      try {
        const data = await fetchHistory(routeConvId);
        if (!cancel) setMessages(data.messages);
      } catch {
        if (!cancel) {
          setMessages([]);
          setErreur("Conversation introuvable ou inaccessible.");
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [routeConvId, navigate]);

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
        conversation_id: activeConvId,
        contexte_fichier: contexteFichier,
        model: selectedModel || undefined,
      });
      const newId = rep.conversation_id;
      setActiveConvId(newId);
      setContexteFichier(null);
      setNomFichier(null);
      const assistant: MessageDto = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: rep.reponse,
        created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistant]);
      bumpConversations();
      if (!routeConvId) {
        navigate(`/c/${newId}`, { replace: true });
      }
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
    <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-yuki-bg">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
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
            <div className="max-w-[85%] space-y-1">
              <p className="text-xs text-yuki-muted px-1">
                {m.role === "user" ? "Vous" : "Yuki"}
              </p>
              <div
                className={`rounded-3xl px-4 py-3.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-yuki-user-bubble text-yuki-text rounded-br-xl"
                    : "bg-yuki-surface border border-yuki-border text-yuki-text-secondary rounded-bl-xl shadow-sm dark:shadow-none"
                }`}
              >
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {envoi && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-3xl border border-yuki-border bg-yuki-surface px-4 py-3 text-sm text-yuki-muted">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Yuki réfléchit…
            </div>
          </div>
        )}
        <div ref={finRef} />
        </div>
      </div>

      {nomFichier && contexteFichier && (
        <div className="max-w-3xl mx-auto w-full px-4 mb-1">
        <div className="rounded-2xl px-4 py-2 text-xs text-yuki-muted border border-yuki-border bg-yuki-surface/50">
          Fichier prêt : <span className="text-yuki-accent">{nomFichier}</span> — sera inclus avec le
          prochain message.
          <button
            type="button"
            className="ml-2 underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50 rounded-md"
            onClick={() => {
              setContexteFichier(null);
              setNomFichier(null);
            }}
          >
            Retirer
          </button>
        </div>
        </div>
      )}

      {erreur && (
        <div className="max-w-3xl mx-auto w-full px-4 mb-2">
          <div
            className="rounded-2xl px-4 py-2 text-sm text-red-700 dark:text-red-300 bg-red-500/10 border border-red-500/20"
            role="alert"
          >
            {erreur}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-yuki-border bg-yuki-surface/50 rounded-t-3xl"
      >
        <div className="max-w-3xl mx-auto flex gap-2 items-end w-full">
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
          className="cursor-pointer shrink-0 rounded-full border border-yuki-border p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-yuki-muted hover:text-yuki-text hover:border-yuki-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50"
          aria-label="Joindre un fichier"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <label htmlFor="yuki-message-input" className="sr-only">
          Message à Yuki
        </label>
        <textarea
          id="yuki-message-input"
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void envoyerMessage();
            }
          }}
          rows={2}
          placeholder="Écrivez votre message…"
          className="flex-1 resize-none rounded-2xl border border-yuki-border bg-yuki-bg px-4 py-3 text-sm text-yuki-text placeholder:text-yuki-muted outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/40"
        />
        <button
          type="button"
          disabled
          title="Bientôt disponible"
          className="cursor-not-allowed shrink-0 rounded-full border border-yuki-border p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-yuki-muted opacity-60"
          aria-label="Saisie vocale (bientôt disponible)"
        >
          <Mic className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={envoi || !saisie.trim()}
          className="cursor-pointer shrink-0 rounded-full bg-yuki-accent p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-yuki-on-accent disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent focus-visible:ring-offset-2 focus-visible:ring-offset-yuki-surface"
          aria-label="Envoyer"
        >
          <Send className="w-5 h-5" />
        </button>
        </div>
      </form>
    </div>
  );
}
