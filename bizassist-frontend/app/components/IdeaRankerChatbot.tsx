"use client";

import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type IdeaRankerChatbotProps = {
  rankerData: any;
  competitors: any;
  theme?: "dark" | "light";
};

// Function to convert markdown to HTML
const formatMarkdown = (text: string): string => {
  let html = text;

  // Convert bold **text** or __text__ to <strong>
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Convert italic *text* or _text_ to <em>
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Convert bullet points • to proper list items
  html = html.replace(/^[•\-\*]\s+(.+)$/gm, "<li>$1</li>");

  // Wrap consecutive list items in ul tags
  html = html.replace(
    /(<li>.*<\/li>\n?)+/g,
    '<ul class="list-disc ml-4 space-y-1">$&</ul>'
  );

  // Convert line breaks to <br>
  html = html.replace(/\n\n/g, "<br><br>");
  html = html.replace(/\n/g, "<br>");

  return html;
};

const IdeaRankerChatbot: React.FC<IdeaRankerChatbotProps> = ({
  rankerData,
  competitors,
  theme = "dark",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === "dark";

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && rankerData) {
      setMessages([
        {
          role: "assistant",
          content: `Hi! 👋 I'm your idea ranking assistant. I have access to your business evaluation scores and I'm here to help you understand them better. Feel free to ask me anything about:

• Your overall readiness score and what it means
• Individual scores (Novelty, Feasibility, Sustainability, etc.)
• Why your idea received certain scores
• How to improve your scores
• Competitor analysis
• Next steps and recommendations

What would you like to know?`,
        },
      ]);
    }
  }, [isOpen, rankerData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      }/api/v1/chatbot/idea-ranker-chat`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          rankerData,
          competitors,
          conversationHistory: messages.slice(-10), // Keep last 10 messages for context
        }),
      });

      if (!response.ok) throw new Error("Failed to get chatbot response");

      const data = await response.json();
      if (data.success && data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        throw new Error("Invalid response from chatbot");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chatbot Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div
          className={`w-96 h-[600px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-linear-to-r from-blue-600 to-emerald-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDark ? "bg-blue-600" : "bg-white/20"
                }`}
              >
                <Sparkles
                  className={`w-5 h-5 ${isDark ? "text-white" : "text-white"}`}
                />
              </div>
              <div>
                <h3
                  className={`font-bold text-lg ${
                    isDark ? "text-white" : "text-white"
                  }`}
                >
                  Idea Ranker Assistant
                </h3>
                <p
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-white/80"
                  }`}
                >
                </p>
              </div>
            </div>
            <button
              onClick={toggleChatbot}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-white/20 text-white"
              }`}
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 ${
              isDark ? "bg-gray-900" : "bg-gray-50"
            }`}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? isDark
                        ? "bg-blue-600 text-white"
                        : "bg-emerald-600 text-white"
                      : isDark
                      ? "bg-gray-800 text-gray-200 border border-gray-700"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(message.content),
                    }}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    isDark
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Loader2
                      className={`w-4 h-4 animate-spin ${
                        isDark ? "text-blue-400" : "text-emerald-600"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className={`p-4 border-t ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your idea ranking..."
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                  isDark
                    ? "bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-emerald-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  isLoading || !input.trim()
                    ? isDark
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={toggleChatbot}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isDark
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-linear-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
        } ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
        aria-label="Open idea ranker assistant"
      >
        <MessageCircle className="w-7 h-7" />
        {/* Pulse animation */}
        <span
          className={`absolute inset-0 rounded-full animate-ping ${
            isDark ? "bg-blue-600" : "bg-emerald-600"
          } opacity-75`}
          style={{ animationDuration: "2s" }}
        />
      </button>
    </>
  );
};

export default IdeaRankerChatbot;
