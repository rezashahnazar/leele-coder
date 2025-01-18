import React, { createContext, useContext, useState, useEffect } from "react";

interface EditorSettings {
  theme: "vs-dark" | "vs-light";
  fontSize: number;
}

interface EditorContextType {
  settings: EditorSettings;
  updateSettings: (newSettings: Partial<EditorSettings>) => void;
  isDarkTheme: boolean;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
}

const defaultSettings: EditorSettings = {
  theme: "vs-dark",
  fontSize: 14,
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<EditorSettings>(() => {
    const savedSettings = localStorage.getItem("editorSettings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    localStorage.setItem("editorSettings", JSON.stringify(settings));

    // Apply theme to document
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
    if (settings.theme === "vs-light") {
      document.documentElement.classList.remove("dark-theme");
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark-theme");
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <EditorContext.Provider
      value={{
        settings,
        updateSettings,
        isDarkTheme: settings.theme === "vs-dark",
        hasUnsavedChanges,
        setHasUnsavedChanges,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
