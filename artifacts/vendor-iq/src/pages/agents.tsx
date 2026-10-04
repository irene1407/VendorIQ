import {
  useListAgentStatuses,
  useQueryAgent,
  useRunAgent,
  getListAgentStatusesQueryKey,
} from "@workspace/api-client-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Bot,
  Sparkles,
  Send,
  Play,
  ShieldCheck,
  TrendingUp,
  FileText,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type ReactNode,
} from "react";

import { useQueryClient } from "@tanstack/react-query";

type Message = {
  role: "user" | "agent";
  content: string;
  confidence?: number;
  sources?: string[];
};

const AGENT_ICON: Record<string, ReactNode> = {
  risk_analyst: (
    <ShieldCheck className="h-5 w-5 text-destructive" />
  ),

  price_forecaster: (
    <TrendingUp className="h-5 w-5 text-primary" />
  ),

  contract_analyst: (
    <FileText className="h-5 w-5 text-blue-400" />
  ),

  fraud_investigator: (
    <AlertTriangle className="h-5 w-5 text-amber-400" />
  ),

  procurement_copilot: (
    <Sparkles className="h-5 w-5 text-emerald-400" />
  ),
};

const AGENT_DESCRIPTION: Record<string, string> = {
  "agent-risk":
    "Re-scores all suppliers against the trained vendor-risk model. Results appear on the Risk Intelligence page.",

  "agent-price":
    "Runs the commodity forecasting workflow using World Bank price data and the XGBoost forecasting model. Results appear on the Price Intelligence page.",

  "agent-contract":
    "Analyzes active contracts for compliance gaps, missing clauses, risk areas, and SLA issues using local Ollama NLP. Results appear on the Contracts page.",

  "agent-fraud":
    "Runs the vendor anomaly detector across procurement data and surfaces suspicious patterns as anomaly alerts. Results appear on the Fraud Detection page.",

  "agent-copilot":
    "Provides procurement intelligence through the Copilot interface using the available supplier, risk, contract, fraud, and market data.",
};

export default function Agents() {
  const queryClient = useQueryClient();

  const {
    data: agents,
    isLoading,
  } = useListAgentStatuses({
    query: {
      queryKey: ["agent-status"],
      refetchInterval: 5000,
    },
  });

  /*
   * Always normalize the API response before using it.
   * This keeps the rest of the component type-safe.
   */
  const agentsList = Array.isArray(agents) ? agents : [];

  /*
   * IMPORTANT:
   * AgentStatusStatus does not contain "completed".
   * Valid statuses used by the API are handled here as:
   * running, idle, error.
   */
  const runningCount = agentsList.filter(
    (agent) => agent.status === "running",
  ).length;

  const errorCount = agentsList.filter(
    (agent) => agent.status === "error",
  ).length;

  const idleCount = agentsList.filter(
    (agent) => agent.status === "idle",
  ).length;

  const [query, setQuery] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content:
        "Hello. I'm your Procurement Copilot. I have access to your supplier data, risk models, contract intelligence, fraud alerts, and market intelligence. How can I help you today?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    mutate: sendQuery,
    isPending: isQuerying,
  } = useQueryAgent({
    mutation: {
      onSuccess(data) {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: data.message,
            confidence: data.confidence,
            sources: data.sources,
          },
        ]);
      },

      onError() {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content:
              "I'm having trouble reaching the intelligence engine right now. Please try again in a moment.",
          },
        ]);
      },
    },
  });

  const [runError, setRunError] = useState<string | null>(null);

  const {
    mutate: runAgent,
    isPending: isStartingAgent,
    variables: startingVars,
  } = useRunAgent({
    mutation: {
      onSuccess(data) {
        setRunError(null);

        queryClient.setQueryData(
          getListAgentStatusesQueryKey(),
          (old: typeof agents) =>
            old?.map((agent) =>
              agent.id === data.id
                ? {
                    ...agent,
                    ...data,
                  }
                : agent,
            ),
        );

        queryClient.invalidateQueries({
          queryKey: getListAgentStatusesQueryKey(),
        });
      },

      onError() {
        setRunError(
          "Couldn't start the agent. Please try again.",
        );
      },
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isQuerying]);

  const buildHistory = () =>
    messages.slice(-8).map((message) => ({
      role: message.role,
      content: message.content,
    }));

  const handleQuery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = query.trim();

    if (!trimmed || isQuerying) {
      return;
    }

    const history = buildHistory();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmed,
      },
    ]);

    setQuery("");

    sendQuery({
      data: {
        message: trimmed,
        agentType: "procurement_copilot",
        context: {
          history,
        },
      },
    });
  };

  const handleChip = (text: string) => {
    if (isQuerying) {
      return;
    }

    const history = buildHistory();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    sendQuery({
      data: {
        message: text,
        agentType: "procurement_copilot",
        context: {
          history,
        },
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-display font-bold tracking-tight">
            AI Agent Hub
          </h1>

          <Badge
            variant="outline"
            className="text-xs"
          >
            {agentsList.length} agents
          </Badge>
        </div>

        <p className="text-muted-foreground">
          Autonomous specialized agents monitoring your procurement network.
        </p>
      </div>

      {/* Agent status summary */}
      <div className="grid grid-cols-3 gap-3 md:w-[520px]">
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Running
            </div>

            <div className="text-xl font-bold text-primary mt-1">
              {runningCount}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Idle
            </div>

            <div className="text-xl font-bold mt-1">
              {idleCount}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Errors
            </div>

            <div
              className={`text-xl font-bold mt-1 ${
                errorCount > 0
                  ? "text-destructive"
                  : "text-foreground"
              }`}
            >
              {errorCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, index) => (
              <Card
                key={index}
                className="h-36 bg-muted/20 animate-pulse border-border/10"
              />
            ))
        ) : agentsList.length === 0 ? (
          <Card className="md:col-span-5 bg-card/50 backdrop-blur border-border/10">
            <CardContent className="p-8 text-center">
              <Bot className="h-8 w-8 mx-auto text-muted-foreground mb-3" />

              <p className="text-sm text-muted-foreground">
                No agent statuses are available.
              </p>
            </CardContent>
          </Card>
        ) : (
          agentsList.map((agent) => {
            const isRunning = agent.status === "running";
            const isIdle = agent.status === "idle";

            const isStarting =
              isStartingAgent &&
              startingVars?.agentId === agent.id;

            return (
              <Card
                key={agent.id}
                className={`bg-card/50 backdrop-blur border-border/10 relative overflow-hidden flex flex-col ${
                  isRunning
                    ? "ring-1 ring-primary/50"
                    : ""
                }`}
              >
                {/* Running progress bar */}
                {isRunning && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/30 overflow-hidden">
                    <div className="h-full bg-primary w-1/3 animate-[slide_1.5s_ease-in-out_infinite]" />
                  </div>
                )}

                <CardContent className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    {AGENT_ICON[agent.type] ?? (
                      <Bot className="h-5 w-5 text-muted-foreground" />
                    )}

                    <Badge
                      variant={
                        isRunning
                          ? "default"
                          : agent.status === "error"
                            ? "destructive"
                            : "outline"
                      }
                      className="text-[10px]"
                    >
                      {agent.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm">
                      {agent.name}
                    </h3>

                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {agent.tasksCompleted.toLocaleString()} tasks done
                    </div>
                  </div>

                  {isRunning && agent.currentTask && (
                    <div className="text-[11px] text-primary/80 leading-tight italic truncate">
                      {agent.currentTask}
                    </div>
                  )}

                  {/* Run button */}
                  {isIdle && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-auto h-7 text-xs gap-1 border-border/30 hover:border-primary/50 hover:bg-primary/10 disabled:opacity-60"
                        disabled={isStarting}
                        onClick={() => {
                          setRunError(null);

                          runAgent({
                            agentId: agent.id,
                          });
                        }}
                      >
                        {isStarting ? (
                          <>
                            <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />

                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" />

                            Run now
                          </>
                        )}
                      </Button>

                      {runError &&
                        startingVars?.agentId ===
                          agent.id && (
                          <div className="text-[10px] text-destructive mt-1">
                            {runError}
                          </div>
                        )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Agent descriptions */}
      <details className="group">
        <summary className="text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform inline-block">
            ▶
          </span>

          What does each agent do, and where do results appear?
        </summary>

        <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-xs text-muted-foreground">
          {agentsList
            .filter(
              (agent) =>
                agent.type !== "procurement_copilot",
            )
            .map((agent) => (
              <div
                key={agent.id}
                className="p-3 rounded-lg bg-muted/10 border border-border/10"
              >
                <div className="font-semibold text-foreground mb-1">
                  {agent.name}
                </div>

                {AGENT_DESCRIPTION[agent.id] ??
                  "Specialized procurement intelligence agent."}
              </div>
            ))}
        </div>
      </details>

      {/* Procurement Copilot */}
      <Card className="flex-1 bg-card/50 backdrop-blur border-border/10 flex flex-col overflow-hidden shadow-xl shadow-black/20">
        <CardHeader className="border-b border-border/10 bg-muted/10 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />

            <CardTitle className="text-lg">
              Procurement Copilot
            </CardTitle>

            <Badge
              variant="outline"
              className="text-[10px] ml-auto"
            >
              keyword-aware · 5 agents
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col bg-background/50 min-h-0">
          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-xl text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/30 border border-border/20 text-foreground rounded-tl-sm"
                  }`}
                >
                  {message.role === "agent" && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/10">
                      <Bot className="h-4 w-4 text-primary" />

                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Copilot
                      </span>

                      {message.confidence != null && (
                        <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                          {(
                            message.confidence * 100
                          ).toFixed(0)}
                          % confidence
                        </span>
                      )}
                    </div>
                  )}

                  {message.content}

                  {/* Sources */}
                  {message.sources &&
                    message.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-border/10 flex flex-wrap gap-1">
                        {message.sources.map(
                          (source, sourceIndex) => (
                            <span
                              key={sourceIndex}
                              className="inline-flex items-center gap-0.5 text-[10px] bg-muted/30 border border-border/20 rounded px-1.5 py-0.5 font-mono text-muted-foreground"
                            >
                              <ExternalLink className="h-2.5 w-2.5" />

                              {source}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isQuerying && (
              <div className="flex justify-start">
                <div className="bg-muted/30 border border-border/20 rounded-xl rounded-tl-sm p-4 w-16 flex justify-center items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{
                      animationDelay: "0ms",
                    }}
                  />

                  <div
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{
                      animationDelay: "150ms",
                    }}
                  />

                  <div
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{
                      animationDelay: "300ms",
                    }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-muted/20 border-t border-border/10 shrink-0">
            <form
              onSubmit={handleQuery}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Ask about a supplier, risk factor, or market trend..."
                disabled={isQuerying}
                className="w-full bg-background border border-border/30 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm disabled:opacity-50"
              />

              <Button
                type="submit"
                size="icon"
                disabled={!query.trim() || isQuerying}
                className="absolute right-1 top-1 h-9 w-9 rounded-md bg-primary hover:bg-primary/90 transition-all"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {/* Suggestion chips */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
              {[
                "Analyze TSMC supply chain risk",
                "Show me expiring software contracts",
                "What's driving the aluminum price spike?",
                "Any fraud alerts this week?",
                "How much can we save this quarter?",
              ].map((chip) => (
                <Badge
                  key={chip}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted whitespace-nowrap shrink-0"
                  onClick={() =>
                    !isQuerying && handleChip(chip)
                  }
                >
                  {chip}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}