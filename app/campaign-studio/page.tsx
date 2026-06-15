"use client";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Loader2, Copy, Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CampaignResult {
  segment: {
    count: number;
    description: string;
  };
  channels: string[];
  ctr: number;
  message: string;
  reasoning: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  data?: CampaignResult;
  timestamp: Date;
}

export default function CampaignStudio() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ]);
    setLoading(true);

    try {
      const response = await fetch("/api/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: userMessage }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.error}`,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Campaign generated!",
            data,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to generate campaign. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-indigo-300 to-cyan-300 rounded-full shadow-lg"
            animate={{
              y: [0, -300, 0],
              x: [0, Math.cos(i) * 150, 0],
              opacity: [0, 0.3, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 10 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${(i * 100) / 25}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Aurora gradient */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

      <div className="relative z-10 max-w-5xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-8 py-6 border-b border-gray-200 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </motion.div>
            <span className="text-xs font-inter text-indigo-600 uppercase tracking-widest">
              AI Campaign Studio
            </span>
          </div>
          <h1 className="font-syne font-bold text-4xl bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Tell AI your goal.
          </h1>
          <p className="text-gray-600 text-sm mt-2 font-inter">
            Watch it build and launch the campaign.
          </p>
        </motion.div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-hide">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="inline-block p-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-cyan-100 border border-indigo-200 mb-6"
                  >
                    <Zap className="w-8 h-8 text-indigo-600" />
                  </motion.div>
                  <h2 className="text-3xl font-syne font-bold text-gray-900 mb-3">
                    What's your campaign goal?
                  </h2>
                  <p className="text-gray-600 font-inter max-w-md mx-auto leading-relaxed">
                    Try:{" "}
                    <span className="text-indigo-600 italic">
                      "Re-engage customers who haven't ordered in 45 days and
                      offer them a 15% discount"
                    </span>
                  </p>

                  {/* Example suggestions */}
                  <div className="mt-8 space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
                      Example Goals
                    </p>
                    {[
                      "Win back lapsed customers with a special offer",
                      "Promote new product to high-value shoppers",
                      "Send birthday offers to customers this month",
                    ].map((example, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02, x: 5 }}
                        onClick={() => setInput(example)}
                        className="block mx-auto text-xs text-indigo-600 hover:text-indigo-700 font-inter transition-colors border border-indigo-200 rounded-lg px-3 py-1.5 hover:border-indigo-300 hover:bg-indigo-50"
                      >
                        {example}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "user" ? (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-indigo-100 to-cyan-100 border border-indigo-200 rounded-2xl px-5 py-3 max-w-md"
                    >
                      <p className="text-gray-900 font-inter text-sm leading-relaxed">
                        {msg.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </motion.div>
                  ) : msg.data ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full max-w-2xl space-y-4"
                    >
                      {/* Main Campaign Card */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl p-6 border border-indigo-200 bg-white shadow-md"
                      >
                        {/* Segment */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mb-6 pb-6 border-b border-gray-200"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-indigo-600"
                            />
                            <h3 className="text-sm font-syne font-bold text-gray-900">
                              Segment Found
                            </h3>
                          </div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 100,
                              delay: 0.4,
                            }}
                            className="text-4xl font-syne font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-2"
                          >
                            {msg.data.segment.count.toLocaleString()}
                          </motion.div>
                          <p className="text-xs text-gray-600 font-inter leading-relaxed">
                            {msg.data.segment.description}
                          </p>
                        </motion.div>

                        {/* Channels */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="mb-6 pb-6 border-b border-gray-200"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-cyan-600"
                            />
                            <h3 className="text-sm font-syne font-bold text-gray-900">
                              Recommended Channels
                            </h3>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {msg.data.channels.map((ch, chIdx) => (
                              <motion.span
                                key={ch}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + chIdx * 0.1 }}
                                className="px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-xs font-inter text-cyan-700"
                              >
                                {ch}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>

                        {/* CTR */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mb-6 pb-6 border-b border-gray-200"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-emerald-500"
                            />
                            <h3 className="text-sm font-syne font-bold text-gray-900">
                              Expected CTR
                            </h3>
                          </div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 100,
                              delay: 0.6,
                            }}
                            className="text-4xl font-syne font-bold text-emerald-500"
                          >
                            {msg.data.ctr}%
                          </motion.div>
                        </motion.div>

                        {/* Message */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="mb-4"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 rounded-full bg-amber-500"
                            />
                            <h3 className="text-sm font-syne font-bold text-gray-900">
                              Suggested Message
                            </h3>
                          </div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="relative group"
                          >
                            <p className="text-sm font-inter text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-200 leading-relaxed">
                              {msg.data.message}
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => copyToClipboard(msg.data!.message)}
                              className="absolute top-3 right-3 p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors border border-gray-200"
                              title="Copy message"
                            >
                              {copied ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                              )}
                            </motion.button>
                          </motion.div>
                        </motion.div>

                        {/* Reasoning */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="text-xs text-gray-600 italic font-inter bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          💡 <span className="ml-2">{msg.data.reasoning}</span>
                        </motion.div>                        {/* Launch Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 }}
                          className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-syne font-bold text-sm transition-all shadow-lg hover:shadow-indigo-500/30"
                        >
                          🚀 Launch Campaign
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 max-w-md">
                      <p className="text-gray-700 font-inter text-sm">
                        {msg.content}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-4 h-4 text-indigo-600" />
                  </motion.div>
                  <div className="space-y-1">
                    <p className="text-sm text-indigo-700 font-inter font-semibold">
                      Generating campaign...
                    </p>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.4,
                            delay: i * 0.2,
                            repeat: Infinity,
                          }}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-600"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-8 py-6 border-t border-gray-200 bg-gradient-to-t from-white/50 to-transparent"
        >
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your campaign goal..."
              disabled={loading}
              className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm text-gray-900 font-inter placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all disabled:opacity-50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 transition-all disabled:opacity-30"
            >
              <Send className="w-4 h-4 text-white" />
            </motion.button>
          </form>
          <p className="text-xs text-gray-600 font-inter mt-2 text-center">
            or press <span className="text-indigo-600">Ctrl+K</span> to access command palette
          </p>
        </motion.div>
      </div>
    </div>
  );
}
