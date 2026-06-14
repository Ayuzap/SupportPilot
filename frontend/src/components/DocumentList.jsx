import { CalendarDays, Download, FileText } from "lucide-react";
import SourceChip from "@/components/SourceChip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function DocumentList({ documents = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentation</CardTitle>
        <CardDescription>
          Manuals, playbooks, and support policies used by SupportPilot's AI helper.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map((document) => (
          <div
            className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            key={document.id}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <p className="font-medium text-slate-700">{document.title}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <SourceChip label={document.type} type={document.type} />
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Updated {document.updatedAt}
                </span>
                <span>{document.format}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href={document.url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Open
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default DocumentList;
