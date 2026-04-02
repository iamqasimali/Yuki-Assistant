import { useEffect, useState } from "react";
import { fetchModels } from "@/api/client";
import ChatHeader from "./ChatHeader";
import ChatMainPane from "./ChatMainPane";

export default function ChatWorkspace() {
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const m = await fetchModels();
        if (!cancel) {
          setModels(m.models);
          setModel((prev) => (prev && m.models.includes(prev) ? prev : m.default));
        }
      } catch {
        if (!cancel) {
          setModels([]);
          setModel("");
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0">
      <ChatHeader model={model} models={models} onModelChange={setModel} />
      <ChatMainPane selectedModel={model} />
    </div>
  );
}
