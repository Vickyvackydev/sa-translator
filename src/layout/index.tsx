import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Globe,
  Menu,
  LogOut,
  User,
  Trash2,
  X,
  Shield,
  Key as KeyIcon,
  Monitor as Computer,
  Save,
  Volume2,
  Square,
  Copy,
  Check,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { selectUser, setUser } from "../state/slices/authReducer";
import {
  translate,
  sendMessage,
  deleteChat,
  getMessages,
  getStudentMessages,
  sendStudentMessage,
} from "../services/chat.service";
import {
  updateProfile,
  updatePassword as updatePasswordService,
  getSessions,
  deleteSession,
} from "../services/auth.service";
import { getLecturers, getStudents } from "../services/user.service";
import { LecturerResponse, StudentResponse } from "../types";
import toast from "react-hot-toast";
import { Sidebar } from "../components/sidebar";
import { ClassManagement } from "./ClassManagement";

import { Store } from "../state/store";
import getEcho from "../config/echo";

// Types
interface Message {
  id: number;
  realId?: string | number;
  text: string;
  isUser: boolean;
  detectedLang?: string;
  translation?: string;
}

interface Language {
  code: string;
  name: string;
}

// interface ChatHistoryItem {
//   id: string;
//   title: string;
//   created_at: string;
//   messages: Message[];
// }

interface MessageProps {
  message: Message;
  isUser: boolean;
  onTranslate?: (messageId: string | number, language: string) => Promise<void>;
  isTranslating?: boolean;
}

interface LanguageSelectorProps {
  sourceLanguage: string;
  setSourceLanguage: (lang: string) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
}

// Message Component
const Message: React.FC<MessageProps> = ({
  message,
  isUser,
  onTranslate,
  isTranslating,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  // const [isTranslating, setIsTranslating] = useState(false);
  const translateMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEnd = () => setIsPlaying(false);
    window.speechSynthesis.addEventListener("end", handleEnd);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Close translate menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        translateMenuRef.current &&
        !translateMenuRef.current.contains(event.target as Node)
      ) {
        setShowTranslateMenu(false);
      }
    };

    if (showTranslateMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTranslateMenu]);

  const handleSpeak = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.text);
    if (message.detectedLang) {
      utterance.lang = message.detectedLang.toLowerCase();
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6 group`}
    >
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
            className={`px-4 py-3 rounded-2xl relative ${
              isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
            }`}
          >
            <p className="text-sm leading-relaxed">{message.text}</p>
            {message.translation && (
              <div className="mt-2 pt-2 border-t border-gray-200/50">
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                  Translation
                </p>
                <p className="text-sm leading-relaxed italic text-gray-700">
                  {message.translation}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 px-2 min-h-[24px]">
            {message.detectedLang && (
              <span className="text-xs text-gray-500">
                {message.detectedLang}
              </span>
            )}
            {isTranslating && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Translating...</span>
              </div>
            )}
            {!isUser && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={handleSpeak}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                  title={isPlaying ? "Stop reading" : "Read aloud"}
                >
                  {isPlaying ? (
                    <Square size={14} fill="currentColor" />
                  ) : (
                    <Volume2 size={14} />
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                  title="Copy to clipboard"
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                {message.realId && (
                  <div className="relative" ref={translateMenuRef}>
                    <button
                      onClick={() => setShowTranslateMenu(!showTranslateMenu)}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      title="Translate"
                    >
                      <Globe size={14} />
                    </button>
                    {showTranslateMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 min-w-[120px]">
                        <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">
                          Translate to...
                        </p>
                        {[
                          { code: "en", name: "English" },
                          { code: "zu", name: "isiZulu" },
                          { code: "xh", name: "isiXhosa" },
                          { code: "af", name: "Afrikaans" },
                          { code: "st", name: "Sesotho" },
                          { code: "tn", name: "Setswana" },
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              onTranslate?.(message.realId!, lang.code);
                              setShowTranslateMenu(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
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

// Main App Component
const TranslationApp: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chatId, setChatId] = useState<string | null>(id || null);

  const [messages, setMessages] = useState<Message[]>([]);
  // const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [lecturers, setLecturers] = useState<LecturerResponse[]>([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(
    null,
  );
  const [inputText, setInputText] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<"chat" | "classes">("chat");
  const [translatingMessageId, setTranslatingMessageId] = useState<
    string | number | null
  >(null);

  const [usersPage, setUsersPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const activeUser = useSelector(selectUser);

  const loadMoreUsers = async () => {
    if (isFetchingMore || !hasMoreUsers) return;
    setIsFetchingMore(true);
    try {
      const nextPage = usersPage + 1;
      let response: any;
      if (activeUser?.role === "student") {
        response = await getLecturers(nextPage);
        if (response?.data?.length > 0) {
          setLecturers((prev) => [...prev, ...response.data]);
          setUsersPage(nextPage);
        } else {
          setHasMoreUsers(false);
        }
      } else {
        response = await getStudents(nextPage);
        if (response?.data?.length > 0) {
          setStudents((prev) => [...prev, ...response.data]);
          setUsersPage(nextPage);
        } else {
          setHasMoreUsers(false);
        }
      }

      // Check if we've reached the last page
      if (
        response?.meta &&
        response.meta.current_page >= response.meta.last_page
      ) {
        setHasMoreUsers(false);
      }
    } catch (error) {
      console.error("Error loading more users:", error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "profile" | "password" | "sessions"
  >("profile");
  const [sessions, setSessions] = useState<any[]>([]);
  const [isSettingsLoading, setIsSettingsLoading] = useState<boolean>(false);

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    location: "",
    bio: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (activeUser) {
      setProfileData({
        first_name: activeUser.first_name || "",
        last_name: activeUser.last_name || "",
        location: activeUser.location || "",
        bio: activeUser.bio || "",
      });
    }
  }, [activeUser]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchStudents = async () => {
    try {
      const response = await getStudents();
      setStudents(response?.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await getLecturers();
      setLecturers(response?.data || []);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
      toast.error("Failed to load lecturers");
    }
  };

  const fetchChatMessages = async (userId: string) => {
    setIsLoading(true);
    try {
      const response =
        activeUser?.role === "lecturer"
          ? await getMessages(userId)
          : await getStudentMessages(userId);
      const rawMessages = response?.data || [];
      const mappedMessages: Message[] = [];

      rawMessages.forEach((msg: any) => {
        // Logic depends on who is the active user
        const isFromMe = String(msg.sender_id) === String(activeUser.id);

        // If it's from me, it's the 'user message'
        if (msg.body_original) {
          mappedMessages.push({
            id: Number(msg.id) * 2,
            realId: msg.id,
            text: msg.body_original,
            isUser: isFromMe,
            // detectedLang: "EN",
          });
        }

        // The translation/response
        if (msg.translated_text) {
          mappedMessages.push({
            id: Number(msg.id) * 2 + 1,
            text: msg.translated_text,
            isUser: !isFromMe,
            // detectedLang: activeUser.role === "student" ? "EN" : "ZU",
          });
        }
      });

      setMessages(mappedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingsLoading(true);
    try {
      const response = await updateProfile(profileData);
      toast.success(response.message || "Profile updated successfully");
      dispatch(setUser({ ...activeUser, ...profileData }));
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
    if (activeUser?.role === "student") {
      fetchLecturers();
    } else {
      fetchStudents();
    }
  }, [activeUser]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!activeUser?.id) return;

    const token = Store.getState().auths.token;
    const echo = getEcho(token);

    // console.log("🔧 Echo subscribing to user." + activeUser.id);
    const channel = echo.private(`user.${activeUser.id}`);

    // Confirmed event name for new messages
    channel.listen(".message.sent", (notification: any) => {
      // console.log("📩 Message event received:", notification);

      if (Notification.permission === "granted") {
        const notif = new Notification(notification.title || "New Message", {
          body: notification.body || "You have a new message",
          icon: "/favicon.ico",
        });

        notif.onclick = () => {
          window.focus();
          if (notification.meta_data?.sender_id) {
            const userId = String(notification.meta_data.sender_id);
            setSelectedChatUserId(userId);
            fetchChatMessages(userId);
          }
        };
      }

      const senderId = notification.meta_data?.sender_id;

      if (
        selectedChatUserId &&
        String(senderId) === String(selectedChatUserId)
      ) {
        fetchChatMessages(selectedChatUserId);
      } else {
        // If it's a different user, just refresh the lists to show latest state/unread
        if (activeUser?.role === "student") {
          fetchLecturers();
        } else {
          fetchStudents();
        }
      }

      // toast.success(notification.body || "New message received!");
    });

    // Handle read notifications or other system events
    channel.notification((notification: any) => {
      console.log("🔔 System notification:", notification);
      if (activeUser?.role === "student") {
        fetchLecturers();
      } else {
        fetchStudents();
      }
    });

    return () => {
      echo.leaveChannel(`user.${activeUser.id}`);
    };
  }, [activeUser?.id, selectedChatUserId]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (): Promise<void> => {
    if (!selectedChatUserId) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      detectedLang: activeUser.role === "student" ? "ZU" : "EN",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");

    try {
      const payload = {
        message: currentInput,
        receiver_id: selectedChatUserId,
      };

      activeUser?.role === "student"
        ? await sendStudentMessage(payload)
        : await sendMessage(payload);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  const handleTranslate = async (
    messageId: string | number,
    language: string,
  ) => {
    setTranslatingMessageId(messageId);
    try {
      const response = await translate({ message_id: messageId, language });
      if (response?.data?.translated) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.realId === messageId
              ? { ...msg, translation: response.data.translated }
              : msg,
          ),
        );
        // toast.success("Message translated");
      }
    } catch (error: any) {
      console.error("Translation error:", error);
      toast.error(
        error.response?.data?.message || "Failed to translate message",
      );
    } finally {
      setTranslatingMessageId(null);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // console.log(activeUser?.role);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={{
          username: `${activeUser?.first_name} ${activeUser?.last_name}`,
          email: activeUser?.email || "",
        }}
        onNewChat={() => {
          if (activeUser?.role === "lecturer") {
            setCurrentView(currentView === "chat" ? "classes" : "chat");
          } else {
            setSelectedChatUserId(null);
            setMessages([]);
          }
        }}
        students={students}
        lecturers={lecturers}
        selectedStudentId={selectedChatUserId}
        onSelect={(user: StudentResponse | LecturerResponse) => {
          const userId =
            "id" in user ? String(user.id) : String(user.lecturer_id);
          setSelectedChatUserId(userId);
          setCurrentView("chat");
          setMessages([]);
          fetchChatMessages(userId);
        }}
        onDeleteChat={handleDeleteClick}
        onOpenSettings={handleOpenSettings}
        onLoadMore={loadMoreUsers}
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col sm:flex-row h-[90vh] sm:h-[500px]"
            >
              {/* Modal Sidebar */}
              <div className="w-full sm:w-48 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-100 p-3 sm:p-4 flex flex-row sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible no-scrollbar">
                <h2 className="hidden sm:block text-lg font-bold text-gray-900 mb-4 px-2 whitespace-nowrap">
                  Settings
                </h2>
                <button
                  onClick={() => setActiveSettingsTab("profile")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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

                <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                  {activeSettingsTab === "profile" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Edit Profile
                      </h3>
                      <form
                        onSubmit={handleUpdateProfile}
                        className="space-y-4"
                      >
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
                            value={activeUser?.email || ""}
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
                      <form
                        onSubmit={handleUpdatePassword}
                        className="space-y-4"
                      >
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
                          {isSettingsLoading
                            ? "Updating..."
                            : "Update Password"}
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
                                      session.last_active,
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
                          Revoking a session will immediately log that device
                          out of your account.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden relative"
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <header className="h-16 border-b border-gray-100 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">
              {currentView === "classes"
                ? "Class Management"
                : selectedChatUserId
                  ? activeUser?.role === "student"
                    ? "Lecturer Chat"
                    : "Student Chat"
                  : "Welcome"}
            </h2>
          </div>
        </header>

        {currentView === "classes" ? (
          <ClassManagement />
        ) : (
          <>
            {!selectedChatUserId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white to-blue-50/30">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200 animate-in fade-in zoom-in duration-500">
                  <Globe className="text-white" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to translate?
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {activeUser?.role === "student"
                    ? "Select a lecturer from the sidebar to start a conversation."
                    : "Select a student from the sidebar to start translating."}
                </p>
              </div>
            ) : (
              <>
                <LanguageSelector
                  sourceLanguage={activeUser?.role === "student" ? "zu" : "en"}
                  setSourceLanguage={() => {}}
                  targetLanguage={activeUser?.role === "student" ? "en" : "zu"}
                  setTargetLanguage={() => {}}
                />

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <Message
                          key={msg.id}
                          message={msg}
                          isUser={msg.isUser}
                          onTranslate={handleTranslate}
                          isTranslating={msg.realId === translatingMessageId}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                <div className="p-4 lg:p-8 bg-white border-t border-gray-100">
                  <div className="max-w-4xl mx-auto relative group">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={
                        activeUser?.role === "student"
                          ? "Type in isiZulu..."
                          : "Type in English..."
                      }
                      className="w-full p-4 pr-14 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none shadow-sm"
                      rows={1}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition-colors shadow-lg shadow-blue-200 disabled:shadow-none"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Messages are automatically translated based on your role.
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TranslationApp;
