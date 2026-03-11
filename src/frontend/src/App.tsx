import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminPanel from "./components/AdminPanel";
import GamePage from "./components/GamePage";

export type AppPage = "game" | "admin";

export default function App() {
  const [page, setPage] = useState<AppPage>("game");

  return (
    <div className="dark min-h-screen bg-background text-foreground font-body">
      <Toaster richColors position="top-right" />
      {page === "game" ? (
        <GamePage onNavigateAdmin={() => setPage("admin")} />
      ) : (
        <AdminPanel onBack={() => setPage("game")} />
      )}
    </div>
  );
}
