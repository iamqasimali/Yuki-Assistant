import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import ChatLayout from "@/components/chat/ChatLayout";
import ChatWorkspace from "@/components/chat/ChatWorkspace";
import LoginPage from "@/pages/LoginPage";
import SettingsPage from "@/pages/SettingsPage";

function Protege({ children }: { children: ReactNode }) {
  const { authentifie } = useAuth();
  if (!authentifie) return <Navigate to="/connexion" replace />;
  return <>{children}</>;
}

function RoutesInternes() {
  return (
    <Routes>
      <Route path="/connexion" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protege>
            <ChatLayout />
          </Protege>
        }
      >
        <Route index element={<ChatWorkspace />} />
        <Route path="c/:conversationId" element={<ChatWorkspace />} />
      </Route>
      <Route
        path="/parametres"
        element={
          <Protege>
            <SettingsPage />
          </Protege>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RoutesInternes />
    </AuthProvider>
  );
}
