import React from "react";
import { FileCode, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-12 bg-[var(--bg-secondary)] flex flex-col items-center py-4 border-r border-[var(--border-color)]">
      <Link
        to="/"
        className={cn(
          "p-3 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]",
          location.pathname === "/" &&
            "bg-[var(--bg-primary)] text-[var(--text-primary)]"
        )}
      >
        <FileCode size={20} />
      </Link>
      <Link
        to="/settings"
        className={cn(
          "p-3 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] mt-2",
          location.pathname === "/settings" &&
            "bg-[var(--bg-primary)] text-[var(--text-primary)]"
        )}
      >
        <Settings size={20} />
      </Link>
    </div>
  );
}
