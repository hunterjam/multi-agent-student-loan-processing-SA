import { useState, useRef, useEffect } from "react";
import {
  Button,
  Input,
  Avatar,
  Spinner,
  Card,
  Text,
  Caption1,
  Subtitle2,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Divider,
  makeStyles,
  tokens,
  mergeClasses,
} from "@fluentui/react-components";
import {
  SendRegular,
  BotRegular,
  PersonRegular,
  AddRegular,
  DocumentRegular,
  DismissRegular,
  ArrowUploadRegular,
  CheckmarkCircleRegular,
  CheckmarkCircleFilled,
  WarningFilled,
  ErrorCircleFilled,
  DismissCircleFilled,
  DocumentAddRegular,
  CheckmarkRegular,
} from "@fluentui/react-icons";
import { api } from "../services/api";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    overflow: "hidden",
  },
  header: {
    padding: "16px 20px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
  },
  messagesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageRow: {
    display: "flex",
    gap: "12px",
  },
  messageRowUser: {
    flexDirection: "row-reverse",
  },
  messageBubble: {
    maxWidth: "70%",
    borderRadius: tokens.borderRadiusMedium,
    padding: "12px",
  },
  messageBubbleBot: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
  },
  messageBubbleUser: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  attachmentChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 8px",
    borderRadius: tokens.borderRadiusSmall,
    marginBottom: "4px",
  },
  attachmentChipBot: {
    backgroundColor: tokens.colorNeutralBackground1,
  },
  attachmentChipUser: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  inputArea: {
    padding: "16px",
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  fileChipsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "12px",
  },
  fileChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: tokens.colorNeutralBackground3,
    padding: "6px 12px",
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase200,
  },
  fileChipName: {
    maxWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  inputField: {
    flex: 1,
  },
  uploadMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 12px",
    borderRadius: tokens.borderRadiusMedium,
    cursor: "pointer",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left",
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  uploadMenuIcon: {
    width: "32px",
    height: "32px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  timestampBot: {
    color: tokens.colorNeutralForeground3,
  },
  timestampUser: {
    color: "rgba(255,255,255,0.7)",
  },
  hrRule: {
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    margin: "12px 0",
  },
  thinkingDots: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 0",
  },
  thinkingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: tokens.colorNeutralForeground3,
    animationName: {
      "0%, 80%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
      "40%": { opacity: 1, transform: "scale(1)" },
    },
    animationDuration: "1.4s",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
  },
  thinkingDot2: {
    animationDelay: "0.2s",
  },
  thinkingDot3: {
    animationDelay: "0.4s",
  },
  confirmCard: {
    maxWidth: "70%",
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorPaletteGreenBorder1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: "0",
    overflow: "hidden",
  },
  confirmCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 20px 12px",
    backgroundColor: tokens.colorPaletteGreenBackground1,
    borderBottom: `1px solid ${tokens.colorPaletteGreenBorder1}`,
  },
  confirmCardHeaderIcon: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: "24px",
    flexShrink: 0,
  },
  confirmCardBody: {
    padding: "16px 20px",
  },
  confirmCardField: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  confirmCardFieldLast: {
    borderBottom: "none",
  },
  confirmCardFooter: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px 16px",
  },
  confirmCardConfirmed: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: tokens.colorPaletteGreenForeground1,
  },
  failureCard: {
    maxWidth: "70%",
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorPaletteRedBorder1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: "0",
    overflow: "hidden",
  },
  failureCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 20px 12px",
    backgroundColor: tokens.colorPaletteRedBackground1,
    borderBottom: `1px solid ${tokens.colorPaletteRedBorder1}`,
  },
  failureCardHeaderIcon: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: "24px",
    flexShrink: 0,
  },
  failureCardBody: {
    padding: "16px 20px",
  },
  failureCardSummary: {
    marginBottom: "12px",
    fontStyle: "italic",
    color: tokens.colorNeutralForeground2,
  },
  failureCardIssue: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px 0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  failureCardIssueLast: {
    borderBottom: "none",
  },
  failureCardIssueIcon: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: "16px",
    flexShrink: 0,
    marginTop: "2px",
  },
  failureCardFooter: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px 16px",
  },
  loanDecisionCard: {
    maxWidth: "70%",
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: "0",
    overflow: "hidden",
  },
  loanApprovedBorder: {
    border: `1px solid ${tokens.colorPaletteGreenBorder1}`,
  },
  loanRejectedBorder: {
    border: `1px solid ${tokens.colorPaletteRedBorder1}`,
  },
  loanDecisionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 20px 12px",
  },
  loanApprovedHeader: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    borderBottom: `1px solid ${tokens.colorPaletteGreenBorder1}`,
  },
  loanRejectedHeader: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    borderBottom: `1px solid ${tokens.colorPaletteRedBorder1}`,
  },
  loanDecisionBody: {
    padding: "16px 20px",
  },
  loanDecisionDescription: {
    marginBottom: "12px",
    color: tokens.colorNeutralForeground2,
  },
  loanDecisionSection: {
    marginBottom: "16px",
  },
  loanDecisionSectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "8px",
  },
  loanDecisionField: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  loanDecisionFieldLast: {
    borderBottom: "none",
  },
  loanDecisionBullet: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "4px 0",
  },
  loanDecisionFooter: {
    padding: "12px 20px 16px",
    color: tokens.colorNeutralForeground2,
  },
  appStartCard: {
    maxWidth: "70%",
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorBrandStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: "0",
    overflow: "hidden",
  },
  appStartHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 20px 12px",
    backgroundColor: tokens.colorBrandBackground2,
    borderBottom: `1px solid ${tokens.colorBrandStroke1}`,
  },
  appStartHeaderIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: "24px",
    flexShrink: 0,
  },
  appStartBody: {
    padding: "16px 20px",
  },
  appStartDescription: {
    marginBottom: "12px",
    color: tokens.colorNeutralForeground2,
  },
  appStartDocItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  appStartDocItemLast: {
    borderBottom: "none",
  },
  appStartFooter: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px 16px",
  },
});

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  attachments?: { name: string; size: number }[];
}

interface ChatInterfaceProps {
  onApplicationStart: () => void;
  threadId?: string;
  onThreadIdUpdate: (threadId: string) => void;
}

export function ChatInterface({ onApplicationStart, threadId, onThreadIdUpdate }: ChatInterfaceProps) {
  const styles = useStyles();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Good day! I'm your dedicated loan advisor. I'm here to assist you with loan inquiries, application procedures, eligibility criteria, and terms. How may I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [applicationIntentDetected, setApplicationIntentDetected] = useState(false);
  const [applicationStarted, setApplicationStarted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedMessages, setConfirmedMessages] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoSendOnFileSelect = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (autoSendOnFileSelect.current && attachedFiles.length > 0) {
      autoSendOnFileSelect.current = false;
      handleSendMessage();
    }
  }, [attachedFiles]);

  const handleSendMessage = async (overrideText?: string) => {
    const messageText = overrideText ?? inputValue;
    if (!messageText.trim() && attachedFiles.length === 0) return;
    if (isLoading) return;

    const hasFiles = attachedFiles.length > 0;

    const userMessage: Message = {
      id: messages.length + 1,
      text: messageText || "Sent files",
      sender: "user",
      timestamp: new Date(),
      attachments: attachedFiles.map((file) => ({
        name: file.name,
        size: file.size,
      })),
    };

    setMessages((prev) => [...prev, userMessage]);

    const lowerText = messageText.toLowerCase();
    const intentKeywords = ['apply', 'application', 'start', 'begin', 'submit'];
    const hasIntent = intentKeywords.some(keyword => lowerText.includes(keyword));

    // Auto-mark confirm card when user types a confirmation keyword
    const confirmKeywords = ['confirm', 'yes', 'proceed', 'go ahead', 'continue', 'ok', 'okay', 'approve'];
    if (confirmKeywords.some(kw => lowerText.includes(kw))) {
      const docProcessedMsg = messages.findLast(
        (m) => m.sender === "bot" && isDocumentProcessedMessage(m.text)
      );
      if (docProcessedMsg) {
        setConfirmedMessages((prev) => new Set(prev).add(docProcessedMsg.id));
      }
    }

    setInputValue("");
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = [];
      messages.forEach(msg => {
        conversationHistory.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
      conversationHistory.push({ role: 'user', content: messageText || "Sent files" });

      let botText = "";
      const botMessageId = messages.length + 2;

      const botMessage: Message = {
        id: botMessageId,
        text: "",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      for await (const chunk of api.sendMessageStream({
        stream: true,
        messages: conversationHistory,
        threadId: threadId,
        files: attachedFiles
      })) {
        if (chunk.threadId && chunk.threadId !== threadId) {
          onThreadIdUpdate(chunk.threadId);
        }

        if (chunk.choices && chunk.choices[0]?.delta?.content) {
          botText += chunk.choices[0].delta.content;
          setMessages((prev) =>
            prev.map(msg =>
              msg.id === botMessageId ? { ...msg, text: botText } : msg
            )
          );
        }

        if (chunk.error) {
          console.error("Stream error:", chunk.error);
          setMessages((prev) =>
            prev.map(msg =>
              msg.id === botMessageId ? { ...msg, text: `Error: ${chunk.error}` } : msg
            )
          );
          break;
        }
      }

      if (hasFiles && !applicationStarted) {
        setApplicationStarted(true);
        onApplicationStart();
      } else if (hasIntent && !applicationIntentDetected && !applicationStarted) {
        setApplicationIntentDetected(true);
        setApplicationStarted(true);
        onApplicationStart();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error processing your request. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAttachedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatMessageText = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      if (!paragraph.trim()) return null;

      if (/^[-]{3,}$/.test(paragraph.trim())) {
        return <div key={index} className={styles.hrRule} />;
      }

      if (/^#{1,4}\s/.test(paragraph.trim())) {
        const headerText = paragraph.replace(/^#{1,4}\s+/g, '').trim();
        return (
          <div key={index} style={{ fontWeight: 600, marginTop: 16, marginBottom: 8 }}>
            {headerText}
          </div>
        );
      }

      if (paragraph.includes('|') && paragraph.split('|').length > 2) {
        const cells = paragraph.split('|').map(cell => cell.trim()).filter(cell => cell);
        const isHeaderRow = cells.some(cell => cell.startsWith('**'));
        return (
          <div key={index} style={{ display: "flex", gap: 8, fontSize: 12, marginBottom: 4 }}>
            {cells.map((cell, idx) => (
              <div key={idx} style={{ flex: 1, fontWeight: isHeaderRow ? 600 : 400 }}>
                {cell.replace(/\*\*/g, '')}
              </div>
            ))}
          </div>
        );
      }

      if (/^\d+\./.test(paragraph.trim())) {
        return <div key={index} style={{ marginBottom: 8, marginLeft: 8 }}>{paragraph.replace(/\*\*/g, '')}</div>;
      }

      if (/^[-•*]\s/.test(paragraph.trim())) {
        return <div key={index} style={{ marginBottom: 4, marginLeft: 8 }}>{paragraph.replace(/\*\*/g, '')}</div>;
      }

      return <div key={index} style={{ marginBottom: 8 }}>{paragraph.replace(/\*\*/g, '')}</div>;
    }).filter(Boolean);
  };

  const isDocumentProcessedMessage = (text: string) =>
    text.includes("Documents Processed Successfully");

  const isApplicationStartMessage = (text: string) =>
    text.includes("Student Loan Application") && text.includes("Required Documents");

  const parseApplicationStartCard = (text: string) => {
    const documents: { name: string; detail: string }[] = [];
    const descriptionLines: string[] = [];
    const nextSteps: string[] = [];
    const lines = text.split("\n");
    let section: "intro" | "docs" | "nextsteps" | "skip" = "intro";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect markdown headers and section transitions
      const isHeader = /^#{1,4}\s/.test(trimmed);
      const isSectionTitle = isHeader || /^\*\*[^*]+\*\*:?\s*$/.test(trimmed);

      if (isSectionTitle) {
        if (/Required Documents/i.test(trimmed)) { section = "docs"; continue; }
        if (/Next Step/i.test(trimmed)) { section = "nextsteps"; continue; }
        if (/Summary|Guidance|Additional|FAQ/i.test(trimmed)) { section = "skip"; continue; }
        // Generic header in intro — skip the header line itself
        if (section === "intro") continue;
        continue;
      }

      // Extract document items: numbered or bulleted bold names
      // Matches: 1. **Name** – detail  OR  - ✅ **Name** (detail)  OR  - **Name** detail
      const docMatch = trimmed.match(/^(?:\d+\.\s*|[-•*]\s*[✅✓]?\s*)\*\*(.+?)\*\*\s*[–\-—:]*\s*(.*)$/);
      if (docMatch && (section === "docs" || section === "intro")) {
        const name = docMatch[1].trim();
        const detail = docMatch[2].replace(/^\(/, "").replace(/\)$/, "").replace(/\.$/, "").trim();
        documents.push({ name, detail });
        section = "docs";
        continue;
      }

      // Sub-bullet detail line under a document (e.g. "- This form captures...")
      if (section === "docs" && /^[-•]\s/.test(trimmed) && documents.length > 0) {
        const lastDoc = documents[documents.length - 1];
        const subDetail = trimmed.replace(/^[-•]\s*/, "").trim();
        lastDoc.detail = lastDoc.detail ? `${lastDoc.detail}. ${subDetail}` : subDetail;
        continue;
      }

      // Collect next steps (numbered or bulleted)
      if (section === "nextsteps") {
        const stepText = trimmed.replace(/^\d+\.\s*/, "").replace(/^[-•*]\s*/, "").replace(/\*\*/g, "").trim();
        if (stepText) nextSteps.push(stepText);
        continue;
      }

      // Skip sections we don't want
      if (section === "skip") continue;

      // Intro description text (skip lines that are just bold section labels)
      if (section === "intro" && !trimmed.startsWith("📄")) {
        // Strip markdown bold markers for cleaner display
        descriptionLines.push(trimmed.replace(/\*\*/g, ""));
      }
    }
    return { description: descriptionLines.join(" "), documents, nextSteps };
  };

  const isLoanDecisionMessage = (text: string) =>
    text.includes("Loan Application APPROVED") || text.includes("Loan Application Not Approved");

  const parseLoanDecisionCard = (text: string) => {
    const isApproved = text.includes("Loan Application APPROVED");
    const details: { label: string; value: string }[] = [];
    const recommendations: string[] = [];
    const nextSteps: string[] = [];
    let reason = "";
    let description = "";

    const lines = text.split("\n");
    let currentSection = "";

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect section headers
      if (/\*\*(💰|📊).*Details.*\*\*/.test(trimmed) || /^(💰|📊).*Details/.test(trimmed)) {
        currentSection = "details";
        continue;
      }
      if (/\*\*(📝|❌).*(?:Reason|Rejection).*\*\*/.test(trimmed) || /^(📝|❌).*(?:Reason|Rejection)/.test(trimmed)) {
        currentSection = "reason";
        continue;
      }
      if (/\*\*💡.*Recommend.*\*\*/.test(trimmed) || /^💡.*Recommend/.test(trimmed)) {
        currentSection = "recommendations";
        continue;
      }
      if (/\*\*(🚀|📌).*(?:Next Steps|Steps).*\*\*/.test(trimmed) || /^(🚀|📌).*(?:Next Steps|Steps)/.test(trimmed)) {
        currentSection = "nextsteps";
        continue;
      }
      // Skip title and status lines
      if (/^(🎉|❌)\s*\*\*Loan Application/.test(trimmed)) continue;
      if (/^📋\s*\*\*Decision Status/.test(trimmed)) continue;
      if (!trimmed) { continue; }

      // Parse bullet fields in details: • **Label:** Value
      if (currentSection === "details") {
        const fieldMatch = trimmed.match(/^[•\-*]\s*\*\*(.+?)\*\*:?\s*(.+)$/);
        if (fieldMatch) {
          details.push({ label: fieldMatch[1].trim(), value: fieldMatch[2].trim() });
        }
        continue;
      }

      if (currentSection === "reason") {
        if (trimmed && !trimmed.startsWith("**")) {
          reason += (reason ? " " : "") + trimmed;
        }
        continue;
      }

      if (currentSection === "recommendations") {
        const bulletMatch = trimmed.match(/^[•\-*]\s*(.+)$/);
        if (bulletMatch) recommendations.push(bulletMatch[1]);
        continue;
      }

      if (currentSection === "nextsteps") {
        const numMatch = trimmed.match(/^\d+\.\s*(.+)$/);
        const bulletMatch = trimmed.match(/^[•\-*]\s*(.+)$/);
        if (numMatch) nextSteps.push(numMatch[1]);
        else if (bulletMatch) nextSteps.push(bulletMatch[1]);
        else if (trimmed) nextSteps.push(trimmed);
        continue;
      }

      // Lines before any section = description
      if (!currentSection && trimmed) {
        description += (description ? " " : "") + trimmed;
      }
    }

    return { isApproved, details, reason, recommendations, nextSteps, description };
  };

  const isValidationFailedMessage = (text: string) =>
    text.includes("Document Validation Issues Found") || text.includes("Validation Status: FAILED");

  const parseValidationFailedCard = (text: string) => {
    const issues: string[] = [];
    let summary = "";
    const lines = text.split("\n");
    for (const line of lines) {
      // Extract italic summary line: _text_
      const summaryMatch = line.match(/^\s*_(.+?)_\s*$/);
      if (summaryMatch) {
        summary = summaryMatch[1];
        continue;
      }
      // Extract numbered issues: 1. **Label**: description
      const issueMatch = line.match(/^\s*\d+\.\s*\*\*(.+?)\*\*:?\s*(.*)$/);
      if (issueMatch) {
        issues.push(`${issueMatch[1]}: ${issueMatch[2]}`.trim());
      }
    }
    return { summary, issues };
  };

  const parseDocumentProcessedCard = (text: string) => {
    const fields: { label: string; value: string }[] = [];
    const lines = text.split("\n");
    for (const line of lines) {
      const match = line.match(/^[\s•·\-*]*\*\*(.+?)\*\*:?\s*(.+)$/);
      if (match) {
        const label = match[1].replace(/^[📋🚀✅📝]+\s*/, "").trim();
        const value = match[2].replace(/\*\*/g, "").trim();
        if (
          label !== "Validation Status" &&
          !label.includes("Ready to Proceed") &&
          !label.includes("Validated Information") &&
          !label.includes("Documents Processed")
        ) {
          fields.push({ label, value });
        }
      }
    }
    return fields;
  };

  const handleConfirmClick = (messageId: number) => {
    setConfirmedMessages((prev) => new Set(prev).add(messageId));
    handleSendMessage("confirm");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <Avatar
            icon={<BotRegular />}
            color="brand"
            size={32}
          />
          <div>
            <Subtitle2>
              {applicationStarted ? "Loan Application Support " : "Loan Advisory Service "}
            </Subtitle2>
            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
              {applicationStarted
                ? "Professional assistance with your application"
                : "Expert guidance on loan products and services"}
            </Caption1>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesArea}>
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={mergeClasses(
                styles.messageRow,
                message.sender === "user" && styles.messageRowUser
              )}
            >
              <Avatar
                icon={message.sender === "user" ? <PersonRegular /> : <BotRegular />}
                color={message.sender === "user" ? "brand" : "neutral"}
                size={32}
              />
              {message.text && message.sender === "bot" && isApplicationStartMessage(message.text) ? (
                /* Application start card with upload button */
                (() => {
                  const { description, documents, nextSteps } = parseApplicationStartCard(message.text);
                  return (
                    <Card className={styles.appStartCard}>
                      <div className={styles.appStartHeader}>
                        <DocumentAddRegular className={styles.appStartHeaderIcon} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <Subtitle2 block>Student Loan Application</Subtitle2>
                          <Caption1 block style={{ color: tokens.colorBrandForeground1 }}>
                            Starting Application Process
                          </Caption1>
                        </div>
                      </div>
                      <div className={styles.appStartBody}>
                        {description && (
                          <Text size={200} className={styles.appStartDescription} block>
                            {description}
                          </Text>
                        )}
                        {documents.length > 0 && (
                          <div>
                            <Text size={200} weight="semibold" style={{ display: "block", marginBottom: "8px" }}>
                              Required Documents
                            </Text>
                            {documents.map((doc, idx) => (
                              <div
                                key={idx}
                                className={mergeClasses(
                                  styles.appStartDocItem,
                                  idx === documents.length - 1 && styles.appStartDocItemLast
                                )}
                              >
                                <CheckmarkRegular style={{ color: tokens.colorPaletteGreenForeground1, fontSize: 16, flexShrink: 0 }} />
                                <div>
                                  <Text size={200} weight="semibold" block>{doc.name}</Text>
                                  {doc.detail && (
                                    <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                                      {doc.detail}
                                    </Caption1>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {nextSteps.length > 0 && (
                          <div style={{ marginTop: "12px" }}>
                            <Text size={200} weight="semibold" style={{ display: "block", marginBottom: "4px" }}>
                              Next Step
                            </Text>
                            {nextSteps.map((step, idx) => (
                              <Text key={idx} size={200} block style={{ color: tokens.colorNeutralForeground2 }}>
                                {step}
                              </Text>
                            ))}
                          </div>
                        )}
                      </div>
                      <Divider />
                      <div className={styles.appStartFooter}>
                        <Button
                          appearance="primary"
                          icon={<ArrowUploadRegular />}
                          onClick={() => {
                            autoSendOnFileSelect.current = true;
                            fileInputRef.current?.click();
                          }}
                          disabled={isLoading}
                        >
                          Upload Documents
                        </Button>
                        <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                          PDF, JPG, PNG, DOC accepted
                        </Caption1>
                      </div>
                      <Caption1
                        className={styles.timestampBot}
                        style={{ display: "block", padding: "0 20px 12px" }}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Caption1>
                    </Card>
                  );
                })()
              ) : message.text && message.sender === "bot" && isDocumentProcessedMessage(message.text) ? (
                /* Interactive confirm card for document processed messages */
                <Card className={styles.confirmCard}>
                  <div className={styles.confirmCardHeader}>
                    <CheckmarkCircleFilled className={styles.confirmCardHeaderIcon} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <Subtitle2 block>Documents Processed Successfully</Subtitle2>
                      <Caption1 block style={{ color: tokens.colorPaletteGreenForeground1 }}>
                        Validation Status: PASSED
                      </Caption1>
                    </div>
                  </div>
                  <div className={styles.confirmCardBody}>
                    {(() => {
                      const fields = parseDocumentProcessedCard(message.text);
                      return fields.map((field, idx) => (
                        <div
                          key={idx}
                          className={mergeClasses(
                            styles.confirmCardField,
                            idx === fields.length - 1 && styles.confirmCardFieldLast
                          )}
                        >
                          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                            {field.label}
                          </Caption1>
                          <Text size={200} weight="semibold">
                            {field.value}
                          </Text>
                        </div>
                      ));
                    })()}
                  </div>
                  <Divider />
                  <div className={styles.confirmCardFooter}>
                    {confirmedMessages.has(message.id) ? (
                      <div className={styles.confirmCardConfirmed}>
                        <CheckmarkCircleFilled style={{ fontSize: 20 }} />
                        <Text size={200} weight="semibold">Confirmed</Text>
                      </div>
                    ) : (
                      <>
                        <Button
                          appearance="primary"
                          icon={<CheckmarkCircleRegular />}
                          onClick={() => handleConfirmClick(message.id)}
                          disabled={isLoading}
                        >
                          Confirm &amp; Proceed
                        </Button>
                        <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                          or type &quot;confirm&quot; in chat
                        </Caption1>
                      </>
                    )}
                  </div>
                  <Caption1
                    className={styles.timestampBot}
                    style={{ display: "block", padding: "0 20px 12px" }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Caption1>
                </Card>
              ) : message.text && message.sender === "bot" && isLoanDecisionMessage(message.text) ? (
                /* Loan decision card (approved or rejected) */
                (() => {
                  const decision = parseLoanDecisionCard(message.text);
                  const approved = decision.isApproved;
                  return (
                    <Card className={mergeClasses(
                      styles.loanDecisionCard,
                      approved ? styles.loanApprovedBorder : styles.loanRejectedBorder
                    )}>
                      <div className={mergeClasses(
                        styles.loanDecisionHeader,
                        approved ? styles.loanApprovedHeader : styles.loanRejectedHeader
                      )}>
                        {approved
                          ? <CheckmarkCircleFilled style={{ fontSize: 24, color: tokens.colorPaletteGreenForeground1, flexShrink: 0 }} />
                          : <DismissCircleFilled style={{ fontSize: 24, color: tokens.colorPaletteRedForeground1, flexShrink: 0 }} />
                        }
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <Subtitle2 block>
                            {approved ? "Loan Application APPROVED!" : "Loan Application Not Approved"}
                          </Subtitle2>
                          <Caption1 block style={{ color: approved ? tokens.colorPaletteGreenForeground1 : tokens.colorPaletteRedForeground1 }}>
                            Decision Status: {approved ? "APPROVED" : "REJECTED"}
                          </Caption1>
                        </div>
                      </div>

                      <div className={styles.loanDecisionBody}>
                        {decision.description && (
                          <Text size={200} className={styles.loanDecisionDescription} block>
                            {decision.description}
                          </Text>
                        )}

                        {/* Details section */}
                        {decision.details.length > 0 && (
                          <div className={styles.loanDecisionSection}>
                            <div className={styles.loanDecisionSectionTitle}>
                              <Text size={200} weight="semibold">
                                {approved ? "💰 Loan Details" : "📊 Application Details"}
                              </Text>
                            </div>
                            {decision.details.map((field, idx) => (
                              <div
                                key={idx}
                                className={mergeClasses(
                                  styles.loanDecisionField,
                                  idx === decision.details.length - 1 && styles.loanDecisionFieldLast
                                )}
                              >
                                <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                                  {field.label}
                                </Caption1>
                                <Text size={200} weight="semibold">
                                  {field.value}
                                </Text>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reason */}
                        {decision.reason && (
                          <div className={styles.loanDecisionSection}>
                            <div className={styles.loanDecisionSectionTitle}>
                              <Text size={200} weight="semibold">
                                {approved ? "📝 Decision Reason" : "❌ Reason for Rejection"}
                              </Text>
                            </div>
                            <Text size={200} block>{decision.reason}</Text>
                          </div>
                        )}

                        {/* Recommendations (rejected) */}
                        {decision.recommendations.length > 0 && (
                          <div className={styles.loanDecisionSection}>
                            <div className={styles.loanDecisionSectionTitle}>
                              <Text size={200} weight="semibold">💡 Recommendations</Text>
                            </div>
                            {decision.recommendations.map((rec, idx) => (
                              <div key={idx} className={styles.loanDecisionBullet}>
                                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>•</Text>
                                <Text size={200}>{rec}</Text>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Next Steps */}
                        {decision.nextSteps.length > 0 && (
                          <div style={{ marginBottom: 0 }}>
                            <div className={styles.loanDecisionSectionTitle}>
                              <Text size={200} weight="semibold">
                                {approved ? "🚀 Next Steps" : "📌 Next Steps"}
                              </Text>
                            </div>
                            {decision.nextSteps.map((step, idx) => (
                              <div key={idx} className={styles.loanDecisionBullet}>
                                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                  {approved ? `${idx + 1}.` : "•"}
                                </Text>
                                <Text size={200}>{step}</Text>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Caption1
                        className={styles.timestampBot}
                        style={{ display: "block", padding: "0 20px 12px" }}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Caption1>
                    </Card>
                  );
                })()
              ) : message.text && message.sender === "bot" && isValidationFailedMessage(message.text) ? (
                /* Interactive failure card for validation failed messages */
                <Card className={styles.failureCard}>
                  <div className={styles.failureCardHeader}>
                    <WarningFilled className={styles.failureCardHeaderIcon} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <Subtitle2 block>Document Validation Issues Found</Subtitle2>
                      <Caption1 block style={{ color: tokens.colorPaletteRedForeground1 }}>
                        Validation Status: FAILED
                      </Caption1>
                    </div>
                  </div>
                  <div className={styles.failureCardBody}>
                    {(() => {
                      const { summary, issues } = parseValidationFailedCard(message.text);
                      return (
                        <>
                          {summary && (
                            <Text size={200} className={styles.failureCardSummary} block>
                              {summary}
                            </Text>
                          )}
                          {issues.map((issue, idx) => (
                            <div
                              key={idx}
                              className={mergeClasses(
                                styles.failureCardIssue,
                                idx === issues.length - 1 && styles.failureCardIssueLast
                              )}
                            >
                              <ErrorCircleFilled className={styles.failureCardIssueIcon} />
                              <Text size={200}>{issue}</Text>
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </div>
                  <Divider />
                  <div className={styles.failureCardFooter}>
                    <Button
                      appearance="primary"
                      icon={<ArrowUploadRegular />}
                      onClick={() => {
                        autoSendOnFileSelect.current = true;
                        fileInputRef.current?.click();
                      }}
                      disabled={isLoading}
                    >
                      Upload New Documents
                    </Button>
                    <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                      Review and re-upload corrected files
                    </Caption1>
                  </div>
                  <Caption1
                    className={styles.timestampBot}
                    style={{ display: "block", padding: "0 20px 12px" }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Caption1>
                </Card>
              ) : (
                <div
                  className={mergeClasses(
                    styles.messageBubble,
                    message.sender === "user" ? styles.messageBubbleUser : styles.messageBubbleBot
                  )}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      {message.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className={mergeClasses(
                            styles.attachmentChip,
                            message.sender === "user" ? styles.attachmentChipUser : styles.attachmentChipBot
                          )}
                        >
                          <DocumentRegular style={{ fontSize: 16, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text size={100} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {file.name}
                            </Text>
                            <Text size={100} style={{ opacity: 0.7 }}>
                              {formatFileSize(file.size)}
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {message.text ? (
                    <Text size={200} style={{ whiteSpace: "pre-wrap" }}>
                      {formatMessageText(message.text)}
                    </Text>
                  ) : message.sender === "bot" && isLoading ? (
                    <div className={styles.thinkingDots}>
                      <div className={styles.thinkingDot} />
                      <div className={mergeClasses(styles.thinkingDot, styles.thinkingDot2)} />
                      <div className={mergeClasses(styles.thinkingDot, styles.thinkingDot3)} />
                    </div>
                  ) : null}
                  <Caption1
                    className={message.sender === "user" ? styles.timestampUser : styles.timestampBot}
                    style={{ display: "block", marginTop: 4 }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Caption1>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
        {attachedFiles.length > 0 && (
          <div className={styles.fileChipsRow}>
            {attachedFiles.map((file, index) => (
              <div key={index} className={styles.fileChip}>
                <DocumentRegular style={{ fontSize: 16, color: tokens.colorBrandForeground1 }} />
                <span className={styles.fileChipName}>{file.name}</span>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<DismissRegular style={{ fontSize: 12 }} />}
                  onClick={() => removeAttachedFile(index)}
                  style={{ minWidth: "auto", padding: 2 }}
                />
              </div>
            ))}
          </div>
        )}
        <div className={styles.inputRow}>
          <Popover open={menuOpen} onOpenChange={(_, data) => setMenuOpen(data.open)}>
            <PopoverTrigger disableButtonEnhancement>
              <Button
                appearance="subtle"
                icon={<AddRegular />}
                shape="circular"
                onClick={() => setMenuOpen(!menuOpen)}
              />
            </PopoverTrigger>
            <PopoverSurface style={{ padding: 8 }}>
              <Caption1 style={{ display: "block", padding: "4px 12px", color: tokens.colorNeutralForeground3, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                Tools
              </Caption1>
              <button
                className={styles.uploadMenuItem}
                onClick={() => {
                  fileInputRef.current?.click();
                  setMenuOpen(false);
                }}
              >
                <div className={styles.uploadMenuIcon}>
                  <ArrowUploadRegular style={{ fontSize: 16 }} />
                </div>
                <Text size={200} weight="semibold">Upload images and files</Text>
              </button>
            </PopoverSurface>
          </Popover>

          <Input
            placeholder="Ask anything"
            value={inputValue}
            onChange={(_, data) => setInputValue(data.value)}
            onKeyDown={handleKeyDown}
            className={styles.inputField}
            disabled={isLoading}
          />
          <Button
            appearance="primary"
            icon={isLoading ? <Spinner size="tiny" /> : <SendRegular />}
            onClick={handleSendMessage}
            disabled={isLoading || (!inputValue.trim() && attachedFiles.length === 0)}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            handleFileSelect(e.target.files);
            e.target.value = "";
          }}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
      </div>
    </div>
  );
}
