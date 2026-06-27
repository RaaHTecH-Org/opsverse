import { useState, useRef, useEffect } from "react";
import SEO from "@/components/SEO";
import { Bot, Send, Sparkles, MessageSquare, Zap, FileBarChart, Target, Shield } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestedQueries = [
  { text: "Summarize today's incidents", icon: FileBarChart },
  { text: "Show all critical issues affecting Azure", icon: Target },
  { text: "Which requests are blocked awaiting approval?", icon: MessageSquare },
  { text: "Generate executive summary for this week", icon: Zap },
  { text: "List high priority tickets", icon: Shield },
  { text: "What systems have the most issues?", icon: FileBarChart },
];

const mockResponses: Record<string, string> = {
  "summarize today's incidents":
    "## Today's Incident Summary\n\n**14 total incidents** tracked across the enterprise:\n\n| Severity | Count | Trend |\n|----------|-------|-------|\n| 🔴 Critical | 3 | +1 from yesterday |\n| 🟠 High | 4 | Stable |\n| 🟡 Medium | 5 | +2 |\n| ⚪ Low | 2 | Stable |\n\n**Key Patterns Detected:**\n- 3 incidents relate to Azure AD / Entra ID authentication — likely upstream issue\n- Suspicious sign-in activity targeting executive accounts (INC-008) — **requires immediate attention**\n- VPN gateway failures impacting all NA remote workers\n\n**Recommendation:** Schedule emergency identity infrastructure review with Security Operations and Identity Operations teams. Prioritize INC-008 credential compromise investigation.",
  "show all critical issues affecting azure":
    "## Critical Azure Issues — Live\n\n**3 critical incidents** affecting Azure infrastructure:\n\n### INC-001 — Azure AD Authentication Failures\n- **Impact:** Enterprise-wide SSO failure, 340% increase in auth errors\n- **Root Cause (Probable):** Azure AD token service degradation\n- **Action:** Enable fallback auth, open Microsoft support ticket\n\n### INC-002 — VPN Gateway Connectivity Loss\n- **Impact:** Site-to-site tunnel down, all NA remote workers affected\n- **Root Cause (Probable):** IKE phase 2 negotiation failure\n- **Action:** Reset gateway instance (resolved similar issue in Feb)\n\n### INC-008 — Suspicious Sign-in Activity\n- **Impact:** 3 executive accounts targeted from Eastern Europe IPs\n- **Root Cause (Probable):** Password spray attack from known threat actor\n- **Action:** ⚠️ IMMEDIATE — Reset passwords, revoke sessions, enforce location CA policy\n\n**AI Confidence:** 91% correlation with known Azure service health patterns.",
  "which requests are blocked awaiting approval?":
    "## Requests Pending Approval\n\n**4 service requests** are currently awaiting manager approval:\n\n| Request | Requestor | Department | Wait Time |\n|---------|-----------|------------|-----------|\n| SR-001 Power BI Pro License | Sarah Chen | Finance | 8 hours |\n| SR-004 Device Replacement | Michael Torres | Sales | 6 hours |\n| SR-007 VPN Configuration | Network Team | IT | 9 hours |\n| SR-010 Onboarding (3 hires) | HR Portal | HR | 4 hours |\n\n**Average approval wait time:** 14 hours (above 8-hour SLA target)\n\n**Recommendation:** Escalate SR-010 — Engineering onboarding with March 12 start date is at risk if not approved within 24 hours. Consider auto-approval for pre-approved request types.",
  "generate executive summary for this week":
    "## Executive Operations Summary — Week of March 2, 2026\n\n### Key Metrics\n- **SLA Compliance:** 96.8% (target: 99%)\n- **System Health:** 94.2% (down from 97.1%)\n- **MTTR:** 4.2 hours (improved from 5.1h)\n- **Security Posture:** ⚠️ Elevated risk\n\n### Critical Items\n1. **Identity Platform Degradation** — Azure AD auth failures affecting enterprise SSO\n2. **Security Incident** — Credential attack targeting C-suite accounts\n3. **VPN Infrastructure** — Gateway failure impacting remote workforce\n\n### Service Delivery\n- 10 active service requests, 4 pending approval\n- 3 onboarding requests in pipeline\n- Average fulfillment time: 2.3 days\n\n### Asset Health\n- 312 tracked assets\n- 52 devices non-compliant after policy update\n- 18 Defender endpoint sensors offline\n\n### Recommendations\n1. Emergency identity infrastructure review\n2. Accelerate TPM 1.2 → 2.0 hardware refresh\n3. Implement automated token refresh for Power Automate\n4. Review conditional access named locations policy",
  "list high priority tickets":
    "## High Priority Tickets\n\n**7 active high-priority incidents** (Critical + High):\n\n| ID | Title | Priority | Status | Team |\n|----|-------|----------|--------|------|\n| INC-001 | Azure AD Auth Failures | 🔴 Critical | Open | Identity Ops |\n| INC-002 | VPN Gateway Loss | 🔴 Critical | In Progress | Network Ops |\n| INC-008 | Suspicious Sign-in | 🔴 Critical | Open | Security Ops |\n| INC-003 | SharePoint Slow (APAC) | 🟠 High | Open | Cloud Services |\n| INC-005 | MFA Push Failures | 🟠 High | In Progress | Identity Ops |\n| INC-006 | Azure SQL High DTU | 🟠 High | Open | Database Ops |\n| INC-012 | CA Policy Blocking Users | 🟠 High | In Progress | Identity Ops |\n\n**⚠️ INC-008** should be triaged first — active credential compromise.\n**Identity Operations** team is overloaded with 3 concurrent high-priority incidents.",
  "what systems have the most issues?":
    "## Systems by Incident Volume\n\n| System | Active Incidents | Health Score |\n|--------|-----------------|-------------|\n| 🔴 Azure AD / Entra ID | 3 | 72% |\n| 🟠 Microsoft Defender | 2 | 78% |\n| 🟠 Azure Infrastructure | 2 | 65% (VPN) |\n| 🟡 Microsoft 365 | 3 | 88-99% |\n| 🟡 Power Platform | 1 | 95% |\n| 🟡 Intune / Endpoint | 1 | 85% |\n\n**Analysis:**\nIdentity & Access Management is the most impacted area with 3 active incidents across Azure AD and MFA services. This correlates with a potential upstream Microsoft platform issue.\n\n**Cross-incident correlation:** INC-001, INC-005, and INC-012 may share a common root cause in Azure AD token service. Recommend joint investigation.",
};

export default function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your **AI Operations Copilot** powered by Azure OpenAI. I can help you:\n\n- 📊 Summarize incidents and operational data\n- 🔍 Cluster and correlate related incidents\n- 🎯 Recommend routing and next actions\n- 📋 Generate executive summaries\n- 💬 Answer natural language queries about your environment\n\nWhat would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const userMsg = (text || input).trim();
    if (!userMsg || isTyping) return;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const key = userMsg.toLowerCase();
      const response =
        mockResponses[key] ||
        `## Analysis: "${userMsg}"\n\nI've scanned the current operational data for relevant patterns.\n\nBased on the **14 active incidents** and **10 service requests** in the system, here are my findings:\n\n- Your query matches patterns across identity and infrastructure systems\n- Current system health is at **94.2%** with 3 degraded services\n- I would need to connect to Azure OpenAI for deeper semantic analysis\n\n*This is a demo response. In production, this would be powered by Azure OpenAI with full access to your operational data lake.*`;
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] animate-slide-in">
      <SEO title="AI Copilot" description="Azure OpenAI-powered conversational assistant for enterprise operations, incidents, and insights." />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Operations Copilot
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Azure OpenAI-powered operational intelligence assistant
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Connected to Operations Data
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={chatRef} className="flex-1 overflow-auto bg-card border border-border rounded-lg p-5 space-y-5 mb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "text-primary-foreground ml-8"
                    : "bg-secondary/80 text-secondary-foreground mr-8"
                }`} style={msg.role === "user" ? { background: 'var(--gradient-primary)' } : undefined}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] text-primary font-medium">
                      <Bot className="w-3.5 h-3.5" />
                      AI Copilot
                    </div>
                  )}
                  <div className={msg.role === "assistant" ? "ai-prose" : "text-[13px]"}>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary/80 rounded-lg px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse-glow text-primary" />
                  Analyzing operational data...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about incidents, operations, or systems..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-3 rounded-lg transition-colors disabled:opacity-50 text-primary-foreground"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Suggested queries sidebar */}
        <div className="hidden lg:block w-64 shrink-0 space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Example Prompts</p>
            <div className="space-y-2">
              {suggestedQueries.map((q) => (
                <button
                  key={q.text}
                  onClick={() => handleSend(q.text)}
                  className="w-full text-left text-xs bg-secondary/60 border border-border/50 rounded-lg px-3 py-2.5 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all flex items-start gap-2"
                >
                  <q.icon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  {q.text}
                </button>
              ))}
            </div>
          </div>
          <div className="ai-panel">
            <p className="text-[11px] uppercase tracking-widest text-primary/70 font-medium mb-2">Capabilities</p>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" />Incident summarization</li>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" />Cross-incident correlation</li>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" />Team routing recommendations</li>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" />Daily operations summaries</li>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" />Natural language queries</li>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" />Executive report generation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
