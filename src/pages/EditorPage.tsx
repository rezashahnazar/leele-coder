import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CodeEditor } from "../components/Editor";
import { AuthModal } from "../components/AuthModal";
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

export function EditorPage() {
  const navigate = useNavigate();
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

  useEffect(() => {
    setDocumentTitle("New Code");
  }, []);

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
    if (!(await handleAuth(code, title, metaTitle, "save"))) return;

    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setDialogMessage("Please sign in to save code");
        setShowSaveDialog(true);
        return;
      }

      const { error } = await supabase.from("code_snippets").insert({
        code,
        title,
        meta_title: metaTitle,
        user_id: user.id,
        published: false,
      });

      if (error) throw error;
      setDialogMessage("Code saved successfully!");
      setShowSaveDialog(true);
    } catch (error) {
      console.error("Error saving code:", error);
      setDialogMessage("Failed to save code");
      setShowSaveDialog(true);
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
      setDialogMessage(
        `Code published successfully! Preview URL: ${window.location.origin}${publishedUrl}`
      );
      setShowPublishDialog(true);
      navigate(publishedUrl);
    } catch (error) {
      console.error("Error publishing code:", error);
      setDialogMessage("Failed to publish code");
      setShowPublishDialog(true);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex-1 h-full">
      <CodeEditor
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={saving}
        isPublishing={publishing}
      />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Status</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowPublishDialog(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
