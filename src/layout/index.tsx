import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Globe,
  Menu,
  LogOut,
  User,
  Settings,
  MessageSquare,
  Trash2,
  X,
  MoreVertical,
  Shield,
  Key as KeyIcon,
  Monitor as Computer,
  Save,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { reset, selectUser, setUser } from "../state/slices/authReducer";
import { sendChat, getChats, deleteChat } from "../services/chat.service";
import {
  updateProfile,
  updatePassword as updatePasswordService,
  getSessions,
  deleteSession,
} from "../services/auth.service";
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
  onDeleteChat: (e: React.MouseEvent, id: string) => void;
  onOpenSettings: () => void;
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
    { code: "", name: "Auto" },
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
        {languages.slice(1).map((lang: Language) => (
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
  onDeleteChat,
  onOpenSettings,
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

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
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => {
                          onSelectChat(item);
                          onClose();
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors truncate flex items-center justify-between ${
                          currentChatId === item.id
                            ? "bg-gray-800 text-white font-medium shadow-sm"
                            : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate flex-1">
                          <MessageSquare
                            size={14}
                            className={
                              currentChatId === item.id
                                ? "text-blue-400"
                                : "text-gray-600"
                            }
                          />
                          <span className="truncate">{item.title}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === item.id ? null : item.id
                            );
                          }}
                          className={`p-1 hover:bg-gray-700 rounded transition-colors ${
                            currentChatId === item.id || openMenuId === item.id
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                          aria-label="More options"
                        >
                          <MoreVertical
                            size={14}
                            className="text-gray-500 hover:text-gray-300"
                          />
                        </button>
                      </button>

                      {/* Dropdown Menu (Pop up) */}
                      {openMenuId === item.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[60] overflow-hidden animate-in fade-in zoom-in duration-150">
                          <button
                            onClick={(e) => {
                              onDeleteChat(e, item.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={12} />
                            Delete Chat
                          </button>
                        </div>
                      )}
                    </div>
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
          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
          >
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
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Settings State
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "profile" | "password" | "sessions"
  >("profile");
  const [sessions, setSessions] = useState<any[]>([]);
  const [isSettingsLoading, setIsSettingsLoading] = useState<boolean>(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    location: "",
    bio: "",
    // email: "",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        location: user.location || "",
        bio: user.bio || "",
        // email: user.email || "",
      });
    }
  }, [user]);

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
              // detectedLang:
              //   msg.sender === "user"
              //     ? chatId === chat.id
              //       ? sourceLanguage.toUpperCase()
              //       : "EN"
              //     : chatId === chat.id
              //     ? targetLanguage.toUpperCase()
              //     : "ZU",
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingsLoading(true);
    try {
      const response = await updateProfile(profileData);
      toast.success(response.message || "Profile updated successfully");
      dispatch(setUser({ ...user, ...profileData }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error("New passwords do not match");
      return;
    }
    setIsSettingsLoading(true);
    try {
      const response = await updatePasswordService(passwordData);
      toast.success(response.message || "Password updated successfully");
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const fetchSessions = async () => {
    setIsSettingsLoading(true);
    try {
      const response = await getSessions();
      setSessions(response.data || []);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      toast.success("Session revoked");
      fetchSessions();
    } catch (error: any) {
      toast.error("Failed to revoke session");
    }
  };

  useEffect(() => {
    if (showSettingsModal && activeSettingsTab === "sessions") {
      fetchSessions();
    }
  }, [showSettingsModal, activeSettingsTab]);

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
    setActiveSettingsTab("profile");
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setChatToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;
    setIsDeleting(true);
    try {
      await deleteChat(chatToDelete);
      toast.success("Chat deleted successfully");

      if (chatToDelete === chatId) {
        setChatId(null);
        setMessages([]);
        navigate("/");
      }

      fetchHistory();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete chat");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setChatToDelete(null);
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
        sourceLanguage: sourceLanguage === "auto" ? null : sourceLanguage,
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
        onDeleteChat={handleDeleteClick}
        onOpenSettings={handleOpenSettings}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex h-[500px]">
            {/* Modal Sidebar */}
            <div className="w-48 bg-gray-50 border-r border-gray-100 p-4 flex flex-col gap-1">
              <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">
                Settings
              </h2>
              <button
                onClick={() => setActiveSettingsTab("profile")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSettingsTab === "profile"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <User size={18} />
                Profile
              </button>
              <button
                onClick={() => setActiveSettingsTab("password")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSettingsTab === "password"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <KeyIcon size={18} />
                Password
              </button>
              <button
                onClick={() => setActiveSettingsTab("sessions")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSettingsTab === "sessions"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Computer size={18} />
                Sessions
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 flex flex-col relative">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="flex-1 overflow-y-auto p-8">
                {activeSettingsTab === "profile" && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Edit Profile
                    </h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.first_name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              first_name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileData.last_name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              last_name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          readOnly
                          // onChange={(e) =>
                          //   setProfileData({
                          //     ...profileData,
                          //     email: e.target.value,
                          //   })
                          // }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="test"
                          value={profileData.location}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              location: e.target.value,
                            })
                          }
                          placeholder="Enter your location"
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <input
                          type="text"
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              bio: e.target.value,
                            })
                          }
                          placeholder="Enter your bio"
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSettingsLoading}
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        <Save size={18} />
                        {isSettingsLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </form>
                  </div>
                )}

                {activeSettingsTab === "password" && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Update Password
                    </h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordData.current_password}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              current_password: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordData.new_password}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              new_password: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordData.new_password_confirmation}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              new_password_confirmation: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSettingsLoading}
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        <KeyIcon size={18} />
                        {isSettingsLoading ? "Updating..." : "Update Password"}
                      </button>
                    </form>
                  </div>
                )}

                {activeSettingsTab === "sessions" && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      {isSettingsLoading && sessions.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          Loading sessions...
                        </p>
                      ) : sessions.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          No other active sessions found.
                        </p>
                      ) : (
                        sessions.map((session: any) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <Computer className="text-gray-400" size={24} />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {session.device || "Unknown Device"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {session.ip_address} • Last active{" "}
                                  {new Date(
                                    session.last_active
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Revoke session"
                            >
                              <LogOut size={18} />
                            </button>
                          </div>
                        ))
                      )}
                      <p className="text-xs text-gray-400 mt-6 bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-2">
                        <Shield
                          size={16}
                          className="text-amber-500 flex-shrink-0"
                        />
                        Revoking a session will immediately log that device out
                        of your account.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Translation?
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

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
