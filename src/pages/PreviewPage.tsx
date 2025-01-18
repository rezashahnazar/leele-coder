import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AlertCircle } from "lucide-react";
import * as Babel from "@babel/standalone";
import { setDocumentTitle } from "../lib/utils";

export function PreviewPage() {
  const { id } = useParams();
  const [code, setCode] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (metaTitle || title) {
      setDocumentTitle(`${metaTitle || title}`);
    } else {
      setDocumentTitle("Yet Another LeelE Coded Page");
    }
  }, [metaTitle, title]);

  useEffect(() => {
    async function loadCode() {
      try {
        const { data, error } = await supabase
          .from("code_snippets")
          .select("code, title, meta_title")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data?.code) throw new Error("No code found");

        setCode(data.code);
        setTitle(data.title);
        setMetaTitle(data.meta_title);

        try {
          // Strip out import statements
          const processedCode = data.code
            .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "")
            .replace(/import\s+{.*?}\s+from\s+['"].*?['"];?\s*/g, "");

          // Transform JSX to JS with a direct return
          const wrappedCode = `
            (function() {
              ${processedCode.replace(
                /export\s+default\s+/,
                "const Component = "
              )}
              return Component;
            })()
          `;

          // Transform JSX to JS
          const transformedCode = Babel.transform(wrappedCode, {
            presets: ["react"],
            filename: "component.tsx",
          }).code;

          // Create a safe scope for evaluation
          const scope = {
            React,
            Fragment: React.Fragment,
          };

          const ComponentFromCode = new Function(
            ...Object.keys(scope),
            `return ${transformedCode}`
          )(...Object.values(scope));

          if (typeof ComponentFromCode !== "function") {
            throw new Error("Code must export a valid React component");
          }

          setComponent(() => ComponentFromCode);
        } catch (err: any) {
          console.error("Error transforming code:", err);
          setError(`Failed to render component: ${err.message}`);
        }
      } catch (err: any) {
        console.error("Error loading code:", err);
        setError(err.message);
      }
    }

    if (id) loadCode();
  }, [id]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)] w-full">
        <div className="max-w-md p-6 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h2 className="font-semibold">Error</h2>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="preview-container bg-[var(--bg-primary)] min-h-screen">
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-[#1e1e1e] w-full">
          <div className="max-w-md p-6 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5" />
              <h2 className="font-semibold">Runtime Error</h2>
            </div>
            <p className="text-sm">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
