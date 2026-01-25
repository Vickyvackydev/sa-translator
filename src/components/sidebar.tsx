import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Globe, MessageSquare, User, Settings, LogOut } from "lucide-react";
import { reset, selectUser } from "../state/slices/authReducer";
import { LecturerResponse, StudentResponse } from "../types";
import { useEffect, useState } from "react";

interface UserProfile {
  username: string;
  email: string;
}
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onNewChat: () => void;
  // history: ChatHistoryItem[];
  students: StudentResponse[];
  lecturers: LecturerResponse[];
  // onSelectChat: (chat: ChatHistoryItem) => void;
  onSelect: (student: StudentResponse | LecturerResponse) => void;
  // currentChatId: string | null;
  selectedStudentId: string | null;
  onDeleteChat: (e: React.MouseEvent, id: string) => void;
  onOpenSettings: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  user,
  onNewChat,
  // history,
  students,
  lecturers,
  // onSelectChat,
  onSelect,
  // currentChatId,
  selectedStudentId,

  onOpenSettings,
  onLoadMore,
  hasMore,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeUser = useSelector(selectUser);
  // const historyGroups = groupHistory();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight + 50 &&
      hasMore &&
      onLoadMore
    ) {
      onLoadMore();
    }
  };

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

        {/* New Chat Button / Classes Button */}
        <div className="p-4">
          {activeUser?.role === "lecturer" ? (
            <button
              onClick={() => {
                onNewChat(); // Using this to toggle view for now, or we can add a new prop
                onClose();
              }}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              Classes
            </button>
          ) : (
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
          )}
        </div>

        {/* Recent Chats */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-gray-700"
        >
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 px-2">
            {activeUser?.role === "student" ? "Lecturers" : "Students"}
          </h3>
          <div className="space-y-1">
            {activeUser?.role === "student"
              ? lecturers.map((lecturer) => (
                  <button
                    key={lecturer.lecturer_id}
                    onClick={() => {
                      onSelect(lecturer);
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors truncate flex items-center gap-3 ${
                      selectedStudentId === String(lecturer.lecturer_id)
                        ? "bg-gray-800 text-white font-medium shadow-sm"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-blue-400">
                        {lecturer.name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-white">{lecturer.name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {lecturer.last_message?.body}
                      </p>
                    </div>
                  </button>
                ))
              : students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      onSelect(student);
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors truncate flex items-center gap-3 ${
                      selectedStudentId === String(student.id)
                        ? "bg-gray-800 text-white font-medium shadow-sm"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-blue-400">
                        {student.first_name?.[0]}
                        {student.last_name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-white">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {student.email}
                      </p>
                    </div>
                  </button>
                ))}
            {((activeUser?.role === "student" && lecturers.length === 0) ||
              (activeUser?.role !== "student" && students.length === 0)) && (
              <div className="text-center py-4">
                <p className="text-xs text-gray-600">No users found</p>
              </div>
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
