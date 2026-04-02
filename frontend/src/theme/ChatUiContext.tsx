import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChatUiCtx = {
  conversationsRefreshKey: number;
  bumpConversations: () => void;
};

const ChatUiContext = createContext<ChatUiCtx | null>(null);

export function ChatUiProvider({ children }: { children: ReactNode }) {
  const [key, setKey] = useState(0);
  const bumpConversations = useCallback(() => setKey((k) => k + 1), []);
  const value = useMemo(
    () => ({ conversationsRefreshKey: key, bumpConversations }),
    [key, bumpConversations],
  );
  return <ChatUiContext.Provider value={value}>{children}</ChatUiContext.Provider>;
}

export function useChatUi() {
  const ctx = useContext(ChatUiContext);
  if (!ctx) throw new Error("useChatUi doit être utilisé sous ChatUiProvider");
  return ctx;
}
