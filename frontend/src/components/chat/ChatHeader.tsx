import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/theme/ThemeContext";

const demo = import.meta.env.VITE_MODE_DEMO === "true";

type Props = {
  model: string;
  models: string[];
  onModelChange: (model: string) => void;
};

export default function ChatHeader({ model, models, onModelChange }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-yuki-border bg-yuki-surface/80 shrink-0 rounded-b-2xl">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="font-semibold text-yuki-text truncate">Assistant Yuki</h1>
        {demo && (
          <span className="shrink-0 rounded-full bg-blue-500/15 text-blue-800 dark:text-blue-200 dark:bg-blue-500/20 text-xs font-medium px-3 py-1 border border-blue-600/25 dark:border-blue-500/30">
            Mode démo
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <label className="sr-only" htmlFor="yuki-model-select">
          Modèle de langage
        </label>
        <select
          id="yuki-model-select"
          value={model && models.includes(model) ? model : models[0] || ""}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={models.length === 0}
          className="cursor-pointer rounded-2xl border border-yuki-border bg-yuki-bg px-4 py-2 text-sm text-yuki-text focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50 disabled:opacity-50 min-h-[44px]"
        >
          {models.length === 0 ? (
            <option value="">—</option>
          ) : (
            models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))
          )}
        </select>
        <button
          type="button"
          onClick={toggleTheme}
          className="cursor-pointer rounded-full border border-yuki-border p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-yuki-muted hover:text-yuki-text hover:bg-yuki-border/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-yuki-accent/50"
          aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
