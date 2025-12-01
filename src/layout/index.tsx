import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Globe,
  Menu,
  LogOut,
  User,
  Settings,
  MessageSquare,
} from "lucide-react";

// Types
interface Message {
  id: number;
  text: string;
  isUser: boolean;
  detectedLang?: string;
}

interface UserProfile {
  name: string;
  email: string;
}

interface Language {
  code: string;
  name: string;
}

interface MessageProps {
  message: Message;
  isUser: boolean;
}

interface LanguageSelectorProps {
  sourceLanguage: string;
  setSourceLanguage: (lang: string) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

// Message Component
const Message: React.FC<MessageProps> = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`flex gap-3 max-w-3xl ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-blue-600" : "bg-amber-600"
          }`}
        >
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Globe size={18} className="text-white" />
          )}
        </div>
        <div
          className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
        >
          <div
            className={`px-4 py-3 rounded-2xl ${
              isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
            }`}
          >
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>
          {message.detectedLang && (
            <span className="text-xs text-gray-500 mt-1 px-2">
              {message.detectedLang}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Language Selector Component
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLanguage,
  setSourceLanguage,
  targetLanguage,
  setTargetLanguage,
}) => {
  const languages: Language[] = [
    { code: "en", name: "English" },
    { code: "zu", name: "isiZulu" },
    { code: "xh", name: "isiXhosa" },
    { code: "af", name: "Afrikaans" },
    { code: "st", name: "Sesotho" },
    { code: "tn", name: "Setswana" },
    { code: "ss", name: "Siswati" },
    { code: "nr", name: "isiNdebele" },
    { code: "ve", name: "Tshivenda" },
    { code: "ts", name: "Xitsonga" },
  ];

  const swapLanguages = (): void => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-white border-b border-gray-200">
      <select
        value={sourceLanguage}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setSourceLanguage(e.target.value)
        }
        className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((lang: Language) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <button
        onClick={swapLanguages}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Swap languages"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 4L3 8L7 12M13 8H3M13 16L17 12L13 8M7 12H17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <select
        value={targetLanguage}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setTargetLanguage(e.target.value)
        }
        className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((lang: Language) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// Sidebar Component
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Globe className="text-amber-500" size={28} />
            <h1 className="text-lg font-semibold">SA Translator</h1>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <MessageSquare size={18} />
            New Translation
          </button>
        </div>

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Recent
          </h3>
          <div className="space-y-2">
            {["Today", "Yesterday", "Previous 7 Days"].map(
              (period: string, idx: number) => (
                <div key={idx}>
                  <p className="text-xs text-gray-500 mb-2 mt-4">{period}</p>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors truncate">
                    Translation session...
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* User Menu */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button className="w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2">
            <Settings size={16} />
            Settings
          </button>
          <button className="w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2 mt-1">
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </>
  );
};

// Main App Component
const TranslationApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [sourceLanguage, setSourceLanguage] = useState<string>("en");
  const [targetLanguage, setTargetLanguage] = useState<string>("zu");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user: UserProfile = {
    name: "Benedict Omosa",
    email: "benedict@example.com",
  };

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      detectedLang: sourceLanguage === "en" ? "English" : "Detected language",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Simulate translation API call
    setTimeout(() => {
      const translatedMessage: Message = {
        id: Date.now() + 1,
        text: `[Translated to ${
          targetLanguage === "en" ? "English" : "target language"
        }]: ${inputText}`,
        isUser: false,
        detectedLang: targetLanguage === "en" ? "English" : "Target language",
      };
      setMessages((prev) => [...prev, translatedMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            Language Translation
          </h2>
        </header>

        {/* Language Selector */}
        <LanguageSelector
          sourceLanguage={sourceLanguage}
          setSourceLanguage={setSourceLanguage}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Globe className="text-gray-300 mb-4" size={64} />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to SA Translator
              </h3>
              <p className="text-gray-600 max-w-md">
                Start a conversation by typing a message below. Your text will
                be translated between English and South African languages
                instantly.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message: Message) => (
                <Message
                  key={message.id}
                  message={message}
                  isUser={message.isUser}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="flex gap-3 max-w-3xl">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-amber-600">
                      <Globe size={18} className="text-white" />
                    </div>
                    <div className="px-4 py-3 bg-gray-100 rounded-2xl">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setInputText(e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ minHeight: "52px", maxHeight: "200px" }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                style={{ minHeight: "52px" }}
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by OpenAI • Translation accuracy may vary
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationApp;
