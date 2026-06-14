import { useRef, useState } from "react";
import { Paperclip, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

function FileUploader({
  label = "Upload files",
  description = "Attach manuals, screenshots, logs, or product documentation.",
  onFilesChange,
}) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const handleFiles = (nextFiles) => {
    const normalizedFiles = Array.from(nextFiles || []);
    setFiles(normalizedFiles);
    onFilesChange?.(normalizedFiles);
  };

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-slate-700">{label}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <UploadCloud className="h-4 w-4 text-indigo-500" />
          Select files
        </button>
      </div>

      <input
        className="hidden"
        multiple
        onChange={(event) => handleFiles(event.target.files)}
        ref={inputRef}
        type="file"
      />

      <div
        className={cn(
          "mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500",
          files.length === 0 && "flex items-center justify-center py-8 text-center",
        )}
      >
        {files.length === 0 ? (
          <p>Files added here can support diagnostics or enrich a product knowledge base.</p>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div className="flex items-center gap-3" key={`${file.name}-${file.size}`}>
                <Paperclip className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUploader;
