import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import SourceChip from "@/components/SourceChip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { withApiFallback } from "@/lib/api";
import { generateDiagnosticResponse } from "@/lib/mockData";

function ChatWidget({ product }) {
  const scrollRef = useRef(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const welcomeMessage = useMemo(
    () => ({
      id: `${product.id}-welcome`,
      role: "assistant",
      content: `Tell me what is happening with ${product.name} and I will guide you through a likely fix path using the available support documents.`,
      sources: product.documents.slice(0, 2).map((document) => ({
        id: document.id,
        label: document.title,
        type: document.type,
      })),
      checklist: [],
    }),
    [product],
  );
  const [messages, setMessages] = useState([welcomeMessage]);
  const [sessionId, setSessionId] = useState(null);

  // Track checklist progress state
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (messageId, item) => {
    const key = `${messageId}-${item}`;
    setCheckedItems((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const parseChecklist = (text) => {
    if (!text) return { checklist: [], content: "" };
    const lines = text.split("\n");
    const checklist = [];
    const cleanText = [];
    for (const line of lines) {
      const match = line.match(/^[-*]\s*\[\s*\]\s*(.+)$/);
      if (match) {
        checklist.push(match[1].trim());
      } else {
        cleanText.push(line);
      }
    }
    return { checklist, content: cleanText.join("\n").trim() };
  };

  const lastChecklistMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant" && messages[i].checklist?.length > 0) {
        return messages[i].id;
      }
    }
    return null;
  }, [messages]);

  const handleChecklistSubmit = (message) => {
    const results = message.checklist.map((item) => {
      const isChecked = Boolean(checkedItems[`${message.id}-${item}`]);
      return `${isChecked ? "[x]" : "[ ]"} ${item}`;
    });

    const userProgressMessage = `I've performed the diagnostic checks:\n${results.join("\n")}`;
    sendMessage(userProgressMessage);
  };

  useEffect(() => {
    setMessages([welcomeMessage]);
    setSessionId(null);
  }, [welcomeMessage]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (seedMessage) => {
    const question = (seedMessage || input).trim();
    if (!question || isSending) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await withApiFallback(
        (client) =>
          client.post("/assistant/chat", {
            product_id: product.id,
            session_id: sessionId,
            message: question,
          }),
        () => generateDiagnosticResponse(question, product),
      );

      let content = "";
      let checklist = [];
      let sources = [];

      if (response.reply !== undefined) {
        // Real API response
        setSessionId(response.session_id);
        const parsed = parseChecklist(response.reply);
        content = parsed.content;
        checklist = parsed.checklist;
        sources = (response.sources || []).map((s, idx) => ({
          id: `${product.id}-source-${idx}`,
          label: s.doc_name || s.label || "Source Document",
          type: s.page ? `Page ${s.page}` : "Document",
        }));
      } else {
        // Mock fallback response
        content = response.content || response.answer;
        checklist = response.checklist || [];
        sources = response.sources || [];
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: content || "I found a likely fix path.",
        checklist: checklist,
        sources: sources,
      };

      setMessages((current) => [...current, assistantMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>AI Diagnostic Assistant</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Ask about errors, symptoms, setup issues, or field failures.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by support context
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {product.commonIssues.map((issue) => (
            <button
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              key={issue}
              onClick={() => sendMessage(issue)}
              type="button"
            >
              {issue}
            </button>
          ))}
        </div>

        <div
          className="flex max-h-[420px] flex-1 flex-col gap-4 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-4"
          ref={scrollRef}
        >
          {messages.map((message) => (
            <div
              className={`max-w-[92%] rounded-xl px-4 py-3 text-sm leading-6 shadow-sm ${
                message.role === "user"
                  ? "ml-auto bg-indigo-500 text-white"
                  : "bg-white text-slate-700"
              }`}
              key={message.id}
            >
              <p>{message.content}</p>
              {message.checklist?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.checklist.map((item) => {
                    const isChecked = Boolean(checkedItems[`${message.id}-${item}`]);
                    return (
                      <div
                        className={`flex items-start gap-3 rounded-lg px-3 py-2 text-sm ${
                          message.role === "user"
                            ? "bg-indigo-400/40 text-white"
                            : "bg-slate-50 text-slate-600"
                        }`}
                        key={item}
                      >
                        {message.role === "assistant" ? (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheck(message.id, item)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        ) : (
                          <span className="mt-1">•</span>
                        )}
                        <span className={isChecked && message.role === "assistant" ? "line-through text-slate-400 font-medium" : ""}>
                          {item}
                        </span>
                      </div>
                    );
                  })}

                  {message.id === lastChecklistMessageId && (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleChecklistSubmit(message)}
                        className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 rounded-md px-2.5 py-1 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 text-indigo-500" />
                        Submit Checklist Progress
                      </button>
                    </div>
                  )}
                </div>
              )}
              {message.sources?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.sources.map((source) => (
                    <SourceChip
                      key={source.id || source.label}
                      label={source.label}
                      type={source.type}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {isSending && (
            <div className="inline-flex max-w-max items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              Reviewing product context...
            </div>
          )}
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <Input
            onChange={(event) => setInput(event.target.value)}
            placeholder="Describe the issue or paste an error message..."
            value={input}
          />
          <Button className="sm:self-end" disabled={isSending} type="submit">
            <Send className="h-4 w-4" />
            Ask SupportPilot
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default ChatWidget;
