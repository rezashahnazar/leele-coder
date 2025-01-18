import React from "react";
import { useEditor } from "../contexts/EditorContext";

export function SettingsPage() {
  const { settings, updateSettings } = useEditor();

  return (
    <div className="flex-1 p-6 text-[var(--text-primary)]">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Editor</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select
                className="border rounded-md px-3 py-2 w-full max-w-xs bg-[var(--bg-secondary)] border-[var(--border-color)]"
                value={settings.theme}
                onChange={(e) =>
                  updateSettings({
                    theme: e.target.value as "vs-dark" | "vs-light",
                  })
                }
              >
                <option value="vs-dark">Dark</option>
                <option value="vs-light">Light</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Font Size
              </label>
              <input
                type="number"
                min={8}
                max={32}
                value={settings.fontSize}
                onChange={(e) =>
                  updateSettings({ fontSize: Number(e.target.value) })
                }
                className="border rounded-md px-3 py-2 w-full max-w-xs bg-[var(--bg-secondary)] border-[var(--border-color)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
