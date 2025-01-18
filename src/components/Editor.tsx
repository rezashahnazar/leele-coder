import React, { useRef, useState, useEffect } from "react";
import Editor, { OnMount, Monaco } from "@monaco-editor/react";
import {
  Save,
  Play,
  Loader2,
  Share2,
  Copy,
  FileJson,
  Pencil,
  Type,
} from "lucide-react";
import { cn, setDocumentTitle } from "../lib/utils";
import { useEditor } from "../contexts/EditorContext";

interface CodeEditorProps {
  onSave: (code: string, title: string, metaTitle: string) => void;
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
      <h1 className="text-2xl font-bold">Hello World!</h1>
    </div>
  );
}`;

export function CodeEditor({
  onSave,
  onPublish,
  initialCode = defaultCode,
  initialTitle = "Untitled.tsx",
  initialMetaTitle = "My Component",
  isSaving = false,
  isPublishing = false,
}: CodeEditorProps) {
  const editorRef = useRef<Monaco | null>(null);
  const [code, setCode] = useState<string>(initialCode);
  const [title, setTitle] = useState<string>(initialTitle);
  const [metaTitle, setMetaTitle] = useState<string>(initialMetaTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { settings } = useEditor();

  useEffect(() => {
    setDocumentTitle(metaTitle || title);
  }, [metaTitle, title]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = monaco;

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

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingTitle(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-2">
            <div className="flex items-center mr-6">
              <FileJson size={20} className="text-[var(--text-secondary)]" />
              {isEditingTitle ? (
                <form onSubmit={handleTitleSubmit} className="ml-2">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    className="bg-[var(--bg-primary)] border border-blue-500 rounded px-2 py-1 text-sm font-medium text-[var(--text-primary)] w-48 focus:outline-none"
                    autoFocus
                  />
                </form>
              ) : (
                <button
                  onClick={() => {
                    setIsEditingTitle(true);
                    setTimeout(() => titleInputRef.current?.focus(), 0);
                  }}
                  className="flex items-center ml-2 group"
                >
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {title}
                  </span>
                  <Pencil
                    size={12}
                    className="ml-2 opacity-0 group-hover:opacity-100 text-[var(--text-secondary)]"
                  />
                </button>
              )}
            </div>
            <button
              onClick={() => !isSaving && onSave(code, title, metaTitle)}
              disabled={isSaving}
              className={cn(
                "px-3 h-8 rounded-md flex items-center space-x-2 text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border-color)]",
                isSaving
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-blue-500 hover:text-blue-500 transition-colors"
              )}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span className="text-sm">{isSaving ? "Saving..." : "Save"}</span>
            </button>
            <button
              onClick={() => !isPublishing && onPublish(code, title, metaTitle)}
              disabled={isPublishing}
              className={cn(
                "px-3 h-8 rounded-md flex items-center space-x-2 text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border-color)]",
                isPublishing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-blue-500 hover:text-blue-500 transition-colors"
              )}
            >
              {isPublishing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Play size={16} />
              )}
              <span className="text-sm">
                {isPublishing ? "Publishing..." : "Publish"}
              </span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="px-3 h-8 rounded-md flex items-center space-x-2 text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Copy size={16} />
              <span className="text-sm">Copy</span>
            </button>
            <button
              onClick={() => {}} // TODO: Implement share functionality
              className="px-3 h-8 rounded-md flex items-center space-x-2 text-[var(--text-primary)] bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Share2 size={16} />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
        <div className="px-4 py-2 flex items-center space-x-3">
          <Type size={16} className="text-[var(--text-secondary)]" />
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Enter page title..."
            className="flex-1 max-w-md bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-sm text-[var(--text-primary)] focus:border-blue-500 focus:outline-none"
          />
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
