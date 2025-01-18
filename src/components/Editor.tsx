import React, { useRef, useState, useEffect } from "react";
import Editor, { OnMount, Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import {
  Save,
  Play,
  Loader2,
  Share2,
  Copy,
  FileJson,
  Pencil,
  Type,
  Code2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { cn, setDocumentTitle } from "../lib/utils";
import { useEditor } from "../contexts/EditorContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface CodeEditorProps {
  onSave: (code: string, title: string, metaTitle: string) => Promise<boolean>;
  onPublish: (code: string, title: string, metaTitle: string) => void;
  initialCode?: string;
  initialTitle?: string;
  initialMetaTitle?: string;
  isSaving?: boolean;
  isPublishing?: boolean;
}

const defaultCode = `import React from 'react';

export default function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Hello From LeelE!</h1>
    </div>
  );
}`;

export function CodeEditor({
  onSave,
  onPublish,
  initialCode = defaultCode,
  initialTitle = "LeelECoded.tsx",
  initialMetaTitle = "Yet Another LeelE Coded Page",
  isSaving = false,
  isPublishing = false,
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [code, setCode] = useState<string>(initialCode);
  const [title, setTitle] = useState<string>(initialTitle);
  const [metaTitle, setMetaTitle] = useState<string>(initialMetaTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [lastSavedCode, setLastSavedCode] = useState<string>(initialCode);
  const [lastSavedTitle, setLastSavedTitle] = useState<string>(initialTitle);
  const [lastSavedMetaTitle, setLastSavedMetaTitle] =
    useState<string>(initialMetaTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { settings, hasUnsavedChanges, setHasUnsavedChanges } = useEditor();

  useEffect(() => {
    setDocumentTitle(metaTitle || title);
  }, [metaTitle, title]);

  useEffect(() => {
    const hasChanges =
      code !== lastSavedCode ||
      title !== lastSavedTitle ||
      metaTitle !== lastSavedMetaTitle;
    setHasUnsavedChanges(hasChanges);
  }, [
    code,
    title,
    metaTitle,
    lastSavedCode,
    lastSavedTitle,
    lastSavedMetaTitle,
  ]);

  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Save shortcut (Cmd/Ctrl + S)
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (!isSaving && hasUnsavedChanges) {
          handleSave();
        }
      }
      // Publish shortcut (Cmd/Ctrl + P)
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        if (!isPublishing && !hasUnsavedChanges) {
          onPublish(code, title, metaTitle);
        }
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcuts);
    return () => window.removeEventListener("keydown", handleKeyboardShortcuts);
  }, [isSaving, isPublishing, hasUnsavedChanges]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure TypeScript compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"],
    });

    // Add React types
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      declare module "react" {
        export = React;
        export as namespace React;
      }
      `,
      "react.d.ts"
    );
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
      setTimeout(() => {
        editorRef.current?.focus();
      }, 0);
    }
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingTitle(false);
  };

  const handleSave = async () => {
    try {
      const saveSuccessful = await onSave(code, title, metaTitle);
      if (saveSuccessful) {
        // Update last saved state only after successful save
        setLastSavedCode(code);
        setLastSavedTitle(title);
        setLastSavedMetaTitle(metaTitle);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  return (
    <div className="h-full flex flex-col select-none">
      <div className="flex flex-col border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="px-4 py-3 flex items-center justify-between relative">
          <div className="flex items-center space-x-3 flex-1 z-10">
            <Type size={16} className="text-[var(--text-secondary)]" />
            <div className="relative flex-1 max-w-md group">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      placeholder="Enter page title..."
                      className="w-full bg-transparent border-0 px-2 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none select-text"
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start">
                    <p>Edit the page title</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="absolute inset-0 -z-10 rounded-md bg-[var(--bg-primary)] opacity-50 group-focus-within:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--border-color)] group-focus-within:bg-blue-500 transition-colors" />
            </div>
          </div>
          <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-3 text-[var(--text-secondary)] opacity-50">
              <div className="relative w-7 h-7 bg-[#18181B] rounded-md flex items-center justify-center">
                <div className="absolute left-[20%] top-[20%] bottom-[20%] w-[3px] bg-blue-500 rounded-full" />
                <div className="absolute left-[20%] bottom-[20%] right-[20%] h-[3px] bg-blue-500 rounded-full" />
                <div className="absolute right-[35%] top-[35%] w-[30%] h-[2px] bg-violet-500 rounded-full" />
                <div className="absolute right-[35%] bottom-[35%] w-[30%] h-[2px] bg-violet-500 rounded-full" />
              </div>
              <span className="font-semibold text-base tracking-wide">
                LeelE Coder
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 z-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !hasUnsavedChanges}
                    className={cn(
                      "px-3 h-8 rounded-md flex items-center space-x-2 transition-colors",
                      hasUnsavedChanges
                        ? "bg-[var(--bg-primary)] border-blue-500 text-blue-500 border hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] border opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    <span className="text-sm">Save</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save changes (⌘S)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onPublish(code, title, metaTitle)}
                    disabled={isPublishing || hasUnsavedChanges}
                    className={cn(
                      "px-3 h-8 rounded-md flex items-center space-x-2 transition-colors",
                      !hasUnsavedChanges
                        ? "bg-[var(--bg-primary)] border-emerald-500 text-emerald-500 border hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] border opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isPublishing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Play size={16} />
                    )}
                    <span className="text-sm">Publish</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Publish code (⌘P)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          defaultValue={code}
          theme={settings.theme}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: settings.fontSize,
            wordWrap: "on",
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            tabSize: 2,
            scrollBeyondLastLine: false,
            folding: true,
            lineNumbers: "on",
            renderWhitespace: "none",
            quickSuggestions: true,
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: "on",
          }}
        />
      </div>
    </div>
  );
}
