import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CodeEditor } from "../components/Editor";
import { AuthModal } from "../components/AuthModal";
import { MagicFab } from "../components/MagicFab";
import { supabase } from "../lib/supabase";
import { setDocumentTitle } from "../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Copy, Play } from "lucide-react";

export function EditorPage() {
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const [id, setId] = useState<string | undefined>(urlId);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"save" | "publish" | null>(
    null
  );
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState<string | null>(null);
  const [pendingMetaTitle, setPendingMetaTitle] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [initialCode, setInitialCode] = useState<string | undefined>(undefined);
  const [initialTitle, setInitialTitle] = useState<string | undefined>(
    undefined
  );
  const [initialMetaTitle, setInitialMetaTitle] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(!!urlId);

  useEffect(() => {
    async function loadSavedCode() {
      if (!urlId) {
        setInitialCode(undefined);
        setInitialTitle(undefined);
        setInitialMetaTitle(undefined);
        setDocumentTitle("New Code");
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("code_snippets")
          .select("code, title, meta_title")
          .eq("id", urlId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Code not found");

        setId(urlId);
        setInitialCode(data.code);
        setInitialTitle(data.title);
        setInitialMetaTitle(data.meta_title);
        setDocumentTitle(data.meta_title || data.title);
      } catch (error) {
        console.error("Error loading code:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    }

    loadSavedCode();
  }, [urlId, navigate]);

  const handleAuth = async (
    code: string,
    title: string,
    metaTitle: string,
    action: "save" | "publish"
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPendingAction(action);
      setPendingCode(code);
      setPendingTitle(title);
      setPendingMetaTitle(metaTitle);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleAuthSuccess = async () => {
    if (pendingAction && pendingCode && pendingTitle && pendingMetaTitle) {
      if (pendingAction === "save") {
        await handleSave(pendingCode, pendingTitle, pendingMetaTitle);
      } else if (pendingAction === "publish") {
        await handlePublish(pendingCode, pendingTitle, pendingMetaTitle);
      }
      setPendingAction(null);
      setPendingCode(null);
      setPendingTitle(null);
      setPendingMetaTitle(null);
    }
  };

  const handleSave = async (code: string, title: string, metaTitle: string) => {
    if (!(await handleAuth(code, title, metaTitle, "save"))) return false;

    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setDialogMessage("Please sign in to save code");
        setShowSaveDialog(true);
        return false;
      }

      // If we already have an ID, update the existing code
      if (id) {
        const { error } = await supabase
          .from("code_snippets")
          .update({
            code,
            title,
            meta_title: metaTitle,
            user_id: user.id,
            published: false,
          })
          .eq("id", id);

        if (error) throw error;
        return true;
      }

      // Otherwise, insert new code
      const { data, error } = await supabase
        .from("code_snippets")
        .insert({
          code,
          title,
          meta_title: metaTitle,
          user_id: user.id,
          published: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Update URL and internal state without triggering a reload
      window.history.replaceState({}, "", `/editor/${data.id}`);
      setId(data.id);
      return true;
    } catch (error) {
      console.error("Error saving code:", error);
      setDialogMessage("Failed to save code");
      setShowSaveDialog(true);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (
    code: string,
    title: string,
    metaTitle: string
  ) => {
    if (!(await handleAuth(code, title, metaTitle, "publish"))) return;

    try {
      setPublishing(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setDialogMessage("Please sign in to publish code");
        setShowPublishDialog(true);
        return;
      }

      const { data, error } = await supabase
        .from("code_snippets")
        .insert({
          code,
          title,
          meta_title: metaTitle,
          user_id: user.id,
          published: true,
        })
        .select()
        .single();

      if (error) throw error;

      const publishedUrl = `/preview/${data.id}`;
      const fullUrl = `${window.location.origin}${publishedUrl}`;

      setDialogMessage(fullUrl);
      setShowPublishDialog(true);
    } catch (error) {
      console.error("Error publishing code:", error);
      setDialogMessage("Failed to deploy code. Please try again.");
      setShowPublishDialog(true);
    } finally {
      setPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
          <p className="text-[var(--text-secondary)] text-sm">
            Loading code...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full relative">
      <CodeEditor
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={saving}
        isPublishing={publishing}
        initialCode={initialCode}
        initialTitle={initialTitle}
        initialMetaTitle={initialMetaTitle}
      />
      <MagicFab />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Status</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="max-w-[400px] overflow-hidden">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <span>🚀</span> Deployment Successful!
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p className="text-xs text-[var(--text-secondary)]">
                Your code has been deployed and is now live at:
              </p>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md flex items-center relative">
                <div className="w-[320px] overflow-x-auto px-2 py-1.5 no-scrollbar">
                  <code className="text-[11px] text-[var(--text-primary)] font-mono whitespace-nowrap">
                    {dialogMessage}
                  </code>
                </div>
                <div className="absolute right-[28px] top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-[var(--bg-secondary)]" />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(dialogMessage);
                  }}
                  className="shrink-0 p-1.5 hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-l border-[var(--border-color)] relative z-10"
                  title="Copy URL"
                >
                  <Copy size={12} />
                </button>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowPublishDialog(false)}
              className="flex-1 px-3 py-1.5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors text-xs"
            >
              Close
            </button>
            <button
              onClick={() => {
                window.open(dialogMessage, "_blank");
              }}
              className="flex-1 px-3 py-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors inline-flex items-center justify-center gap-1.5 text-xs"
            >
              <Play size={12} />
              View Deployment
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
