import { Outlet } from "react-router-dom";
import { ChatUiProvider } from "@/theme/ChatUiContext";
import ConversationSidebar from "./ConversationSidebar";

export default function ChatLayout() {
  return (
    <ChatUiProvider>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-yuki-bg">
        <ConversationSidebar />
        <Outlet />
      </div>
    </ChatUiProvider>
  );
}
