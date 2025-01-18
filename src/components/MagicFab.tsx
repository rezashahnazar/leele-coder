import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Dialog, DialogContent } from "./ui/dialog";
import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export function MagicFab() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+L (Mac) or Ctrl+L (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "l") {
        event.preventDefault(); // Prevent default browser behavior
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const shortcutKey = isMac ? "⌘" : "Ctrl";

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className={cn(
                "fixed bottom-6 right-6 w-14 h-14 rounded-full",
                "bg-gradient-to-br from-blue-500 via-violet-500 to-purple-500",
                "flex items-center justify-center",
                "hover:shadow-xl transition-all duration-300 hover:scale-105",
                "group overflow-hidden isolate",
                "before:absolute before:inset-0 before:rounded-full",
                "before:bg-gradient-to-r before:from-indigo-500 before:via-purple-500 before:to-pink-500",
                "before:animate-[spin_3s_linear_infinite]",
                "after:absolute after:inset-[2px] after:rounded-full",
                "after:bg-gradient-to-br after:from-blue-500 after:via-violet-500 after:to-purple-500",
                "shadow-[0_0_15px_rgba(139,92,246,0.5)]"
              )}
            >
              {/* AI Core Icon */}
              <div className="relative w-6 h-6 flex items-center justify-center z-10">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>

              {/* Magical particle effects */}
              <div className="absolute inset-0">
                <div
                  className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-[float_3s_ease-in-out_infinite]"
                  style={{ transform: "translate(-50%, -50%)" }}
                />
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-[float_2s_ease-in-out_infinite_0.5s]" />
                <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-[float_2.5s_ease-in-out_infinite_1s]" />
              </div>

              {/* Magical glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="select-none">
            <p>AI Assistant ({shortcutKey}+L)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[var(--bg-secondary)] text-[var(--text-primary)]">
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">AI Magic Coming Soon!</h3>
            <p className="text-center text-[var(--text-secondary)]">
              The AI assistant is being prepared for you. Stay tuned for magical
              experiences!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
