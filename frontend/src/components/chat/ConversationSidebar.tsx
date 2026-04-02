import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, Plus, Search, Settings, User } from "lucide-react";
import { fetchConversations, type ConversationListItemDto } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { useChatUi } from "@/theme/ChatUiContext";
import { formatRelativeFr } from "@/lib/time";

const SIDEBAR_COLLAPSED_KEY = "yuki-sidebar-collapsed";

export default function ConversationSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { deconnexion } = useAuth();
  const { conversationsRefreshKey } = useChatUi();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [items, setItems] = useState<ConversationListItemDto[]>([]);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const data = await fetchConversations();
        if (!cancel) {
          setItems(data.conversations);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancel) setLoadError(e instanceof Error ? e.message : "Erreur");
      }
    })();
    return () => {
      cancel = true;
    };
  }, [conversationsRefreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => (c.title || "Conversation").toLowerCase().includes(q));
  }, [items, search]);

  const activeId = useMemo(() => {
    const m = location.pathname.match(/^\/c\/([^/]+)/);
    return m ? m[1] : null;
  }, [location.pathname]);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function handleNewChat() {
    navigate("/");
  }

  return (
    <aside
      className={`flex flex-col border-r border-yuki-border bg-yuki-surface shrink-0 overflow-hidden rounded-r-3xl transition-[width] duration-200 ease-out motion-reduce:transition-none ${
        collapsed ? "w-[52px]" : "w-[280px]"
      }`}
      aria-label="Conversations"
    >
      <div className="flex items-center justify-between gap-2 p-3 border-b border-yuki-border min-h-[52px]">
        {!collapsed && <span className="font-semibold text-yuki-text truncate pl-1">Yuki</span>}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="cursor-pointer rounded-xl p-2 text-yuki-muted hover:text-yuki-text hover:bg-yuki-border/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50"
          aria-label={collapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="p-3 space-y-2">
            <button
              type="button"
              onClick={handleNewChat}
              className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-full bg-yuki-text py-2.5 px-4 text-sm font-medium text-yuki-surface hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent focus-visible:ring-offset-2 focus-visible:ring-offset-yuki-surface dark:bg-white dark:text-yuki-bg"
            >
              <Plus className="w-4 h-4" aria-hidden />
              Nouvelle conversation
            </button>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yuki-muted pointer-events-none"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher des chats"
                className="w-full rounded-2xl border border-yuki-border bg-yuki-bg py-2.5 pl-9 pr-3 text-sm text-yuki-text placeholder:text-yuki-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50"
                aria-label="Rechercher des chats"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5" aria-label="Historique">
            {loadError && (
              <p className="text-xs text-red-600 dark:text-red-400 mx-2 mb-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-3 py-2">
                {loadError}
              </p>
            )}
            {filtered.map((c) => {
              const active = activeId === c.id;
              const label = c.title || "Conversation";
              return (
                <Link
                  key={c.id}
                  to={`/c/${c.id}`}
                  className={`cursor-pointer block rounded-2xl px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50 ${
                    active
                      ? "bg-yuki-border/50 text-yuki-text"
                      : "text-yuki-muted hover:bg-yuki-border/30 hover:text-yuki-text"
                  }`}
                >
                  <span className="block text-sm font-medium truncate">{label}</span>
                  <span className="block text-xs text-yuki-muted mt-0.5">
                    {formatRelativeFr(c.updated_at)}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-yuki-border p-2 space-y-0.5">
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-yuki-muted opacity-60 cursor-not-allowed"
              title="Un seul compte pour cet assistant"
            >
              <User className="w-4 h-4 shrink-0" aria-hidden />
              <span>Comptes</span>
            </div>
            <Link
              to="/parametres"
              className="cursor-pointer flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-yuki-muted hover:bg-yuki-border/30 hover:text-yuki-text focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50"
            >
              <Settings className="w-4 h-4 shrink-0" aria-hidden />
              Paramètres
            </Link>
            <button
              type="button"
              onClick={() => {
                deconnexion();
                navigate("/connexion", { replace: true });
              }}
              className="cursor-pointer w-full flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-yuki-muted hover:bg-yuki-border/30 hover:text-yuki-text focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden />
              Déconnexion
            </button>
          </div>
        </>
      )}

      {collapsed && (
        <div className="flex flex-col items-center gap-2 py-3">
          <button
            type="button"
            onClick={handleNewChat}
            className="cursor-pointer rounded-xl p-2 text-yuki-muted hover:text-yuki-text hover:bg-yuki-border/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50"
            aria-label="Nouvelle conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
          <Link
            to="/parametres"
            className="cursor-pointer rounded-xl p-2 text-yuki-muted hover:text-yuki-text hover:bg-yuki-border/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50"
            aria-label="Paramètres"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <button
            type="button"
            onClick={() => {
              deconnexion();
              navigate("/connexion", { replace: true });
            }}
            className="cursor-pointer rounded-xl p-2 text-yuki-muted hover:text-yuki-text hover:bg-yuki-border/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50"
            aria-label="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
}
