import { BookOpenText, ClipboardList, FileText, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const sourceStyles = {
  Document: {
    icon: BookOpenText,
    className: "bg-slate-100 text-slate-600",
  },
  Manual: {
    icon: FileText,
    className: "bg-sky-50 text-sky-700",
  },
  Checklist: {
    icon: ClipboardList,
    className: "bg-emerald-50 text-emerald-700",
  },
  Policy: {
    icon: ShieldCheck,
    className: "bg-amber-50 text-amber-700",
  },
  Guide: {
    icon: BookOpenText,
    className: "bg-indigo-50 text-indigo-700",
  },
  Playbook: {
    icon: ClipboardList,
    className: "bg-purple-50 text-purple-700",
  },
};

function SourceChip({ label, type = "Document" }) {
  const config = sourceStyles[type] || sourceStyles.Document;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export default SourceChip;
