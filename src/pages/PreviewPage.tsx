import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AlertCircle } from "lucide-react";
import * as Babel from "@babel/standalone";
import { setDocumentTitle } from "../lib/utils";

export function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      if (!id) {
        setError("No code ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from("code_snippets")
          .select("code, title, meta_title, published")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("Code not found");
        if (!data.published) throw new Error("This code is not published");

        setCode(data.code);
        setTitle(data.title);
        setMetaTitle(data.meta_title);

        try {
          // First remove imports and handle exports
          const codeWithoutImports = data.code
            .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "")
            .replace(/import\s+{.*?}\s+from\s+['"].*?['"];?\s*/g, "");

          // Transform JSX to JS
          const transformedCode = Babel.transform(codeWithoutImports, {
            presets: ["react"],
            filename: "component.jsx",
          }).code;

          // Create a comprehensive scope with React and common hooks
          const scope = {
            React,
            Fragment: React.Fragment,
            useState: React.useState,
            useEffect: React.useEffect,
            useCallback: React.useCallback,
            useMemo: React.useMemo,
            useRef: React.useRef,
            useContext: React.useContext,
          };

          // Extract the component function, handling both default and named exports
          const extractedCode = transformedCode
            .replace(
              /export\s+default\s+function\s+(\w+\s*\([^)]*\))/,
              "const Component = function $1"
            )
            .replace(/export\s+default\s+\(/, "const Component = (")
            .replace(/export\s+default\s+/, "const Component = ")
            .replace(
              /export\s+function\s+(\w+)/,
              "const Component = function $1"
            )
            .replace(/export\s+const\s+(\w+)/, "const Component = ");

          // Evaluate the component with proper scope
          const ComponentFromCode = new Function(
            ...Object.keys(scope),
            `
              try {
                ${extractedCode}
                if (typeof Component === 'undefined') {
                  throw new Error('Component is undefined after evaluation');
                }
                return Component;
              } catch (err) {
                throw err;
              }
            `
          )(...Object.values(scope));

          if (typeof ComponentFromCode !== "function") {
            throw new Error(
              `Code must export a valid React component function. Got ${typeof ComponentFromCode}`
            );
          }

          setComponent(() => ComponentFromCode);
        } catch (err: any) {
          console.error("Error transforming code:", err);
          setError(`Failed to render component: ${err.message}`);
        }
      } catch (err: any) {
        console.error("Error loading code:", err);
        setError(err.message);
        if (err.message === "Code not found") {
          navigate("/");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadCode();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)] w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
          <p className="text-[var(--text-secondary)] text-sm">
            Loading preview...
          </p>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
          <p className="text-[var(--text-secondary)] text-sm">
            Preparing component...
          </p>
        </div>
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
