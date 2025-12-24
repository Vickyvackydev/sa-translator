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
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { reset, selectUser } from "../state/slices/authReducer";
import { sendChat, getChats } from "../services/chat.service";
import toast from "react-hot-toast";

// Types
interface Message {
  id: number;
  text: string;
  isUser: boolean;
  detectedLang?: string;
}

interface UserProfile {
  username: string;
  email: string;
}

interface Language {
  code: string;
  name: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
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
  onNewChat: () => void;
  history: ChatHistoryItem[];
  onSelectChat: (chat: ChatHistoryItem) => void;
  currentChatId: string | null;
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
const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  user,
  onNewChat,
  history,
  onSelectChat,
  currentChatId,
}) => {
  const groupHistory = () => {
    const groups: { [key: string]: ChatHistoryItem[] } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    history.forEach((item) => {
      const itemDate = new Date(item.created_at);
      if (itemDate >= today) {
        groups["Today"].push(item);
      } else if (itemDate >= yesterday) {
        groups["Yesterday"].push(item);
      } else if (itemDate >= sevenDaysAgo) {
        groups["Previous 7 Days"].push(item);
      }
    });

    return groups;
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const historyGroups = groupHistory();

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
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            New Translation
          </button>
        </div>

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-gray-700">
          {Object.entries(historyGroups).map(([period, items]) =>
            items.length > 0 ? (
              <div key={period} className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 px-2">
                  {period}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectChat(item);
                        onClose();
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors truncate flex items-center gap-2 ${
                        currentChatId === item.id
                          ? "bg-gray-800 text-white font-medium shadow-sm"
                          : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                      }`}
                    >
                      <MessageSquare
                        size={14}
                        className={
                          currentChatId === item.id
                            ? "text-blue-400"
                            : "text-gray-600"
                        }
                      />
                      <span className="truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null
          )}
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <p className="text-xs text-gray-500">No previous translations</p>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button className="w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2">
            <Settings size={16} />
            Settings
          </button>
          <button
            onClick={() => {
              dispatch(reset());
              navigate("/login");
            }}
            className="w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2 mt-1"
          >
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chatId, setChatId] = useState<string | null>(id || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [sourceLanguage, setSourceLanguage] = useState<string>("en");
  const [targetLanguage, setTargetLanguage] = useState<string>("zu");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = useSelector(selectUser);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      const response = await getChats();
      if (response && response.data) {
        // Map the API structure to our ChatHistoryItem interface
        const mappedHistory: ChatHistoryItem[] = response.data.map(
          (chat: any) => ({
            id: chat.id,
            title: chat.title,
            created_at: chat.created_at,
            messages: chat.messages.map((msg: any) => ({
              id: msg.id,
              text: msg.content,
              isUser: msg.sender === "user",
              detectedLang: msg.sender === "user" ? "EN" : "ZU", // Defaulting to EN/ZU for history if not provided
            })),
          })
        );
        setHistory(mappedHistory);

        // If there's an ID in the URL, load those messages
        if (id) {
          const currentChat = mappedHistory.find((c) => c.id === id);
          if (currentChat) {
            setMessages(currentChat.messages);
            setChatId(id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state if navigation happens (e.g., clicking a history item or back/forward)
  useEffect(() => {
    if (id && history.length > 0) {
      const currentChat = history.find((c) => c.id === id);
      if (currentChat) {
        setMessages(currentChat.messages);
        setChatId(id);
      }
    } else if (!id) {
      setMessages([]);
      setChatId(null);
    }
  }, [id, history]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      detectedLang: sourceLanguage.toUpperCase(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      const payload = {
        message: currentInput,
        sourceLanguage,
        targetLanguage,
        chat_id: chatId || undefined,
      };

      const response = await sendChat(payload);

      if (response && response.data) {
        if (!chatId && response.data.id) {
          setChatId(response.data.id);
          navigate(`/chat/${response.data.id}`);
        }

        const newMessages: Message[] = response.data.messages.map(
          (msg: any) => ({
            id: msg.id,
            text: msg.content,
            isUser: msg.sender === "user",
            detectedLang: (msg.sender === "user"
              ? sourceLanguage
              : targetLanguage
            ).toUpperCase(),
          })
        );

        setMessages(newMessages);
        // Refresh history to show new chat or updated title
        fetchHistory();
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
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
        onNewChat={() => {
          setChatId(null);
          setMessages([]);
          navigate("/");
        }}
        history={history}
        currentChatId={chatId}
        onSelectChat={(chat) => {
          setChatId(chat.id);
          setMessages(chat.messages);
          navigate(`/chat/${chat.id}`);
        }}
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
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-amber-600 animate-pulse">
                      <Globe size={18} className="text-white" />
                    </div>
                    <div className="px-5 py-4 bg-gray-100 rounded-2xl shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-[bounce_1.4s_infinite_0ms]"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-[bounce_1.4s_infinite_200ms]"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-[bounce_1.4s_infinite_400ms]"></div>
                        </div>
                        <span className="text-xs font-medium text-gray-500 ml-2 animate-pulse">
                          Translating...
                        </span>
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
