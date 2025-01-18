import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { EditorPage } from "./pages/EditorPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PreviewPage } from "./pages/PreviewPage";
import { EditorProvider } from "./contexts/EditorContext";

function Layout() {
  const location = useLocation();
  const isPreviewPage = location.pathname.startsWith("/preview/");

  return (
    <div className="flex h-screen text-[var(--text-primary)] bg-[var(--bg-primary)]">
      {!isPreviewPage && <Sidebar />}
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <EditorProvider>
        <Layout />
      </EditorProvider>
    </BrowserRouter>
  );
}
