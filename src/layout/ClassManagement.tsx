import React, { useState, useEffect } from "react";
import { Plus, Trash2, Users, X } from "lucide-react";
import {
  getClasses,
  createClass,
  deleteClass,
  joinClass,
} from "../services/class.service";
import { getStudents } from "../services/user.service";
import { StudentResponse } from "../types";
import toast from "react-hot-toast";

interface Class {
  id: number;
  name: string;
  students_count?: number;
}

export const ClassManagement: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // Pagination State
  const [classesPage, setClassesPage] = useState(1);
  const [hasMoreClasses, setHasMoreClasses] = useState(true);
  const [isFetchingMoreClasses, setIsFetchingMoreClasses] = useState(false);

  const [studentsPage, setStudentsPage] = useState(1);
  const [hasMoreStudents, setHasMoreStudents] = useState(true);
  const [isFetchingMoreStudents, setIsFetchingMoreStudents] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setClassesPage(1);
    setStudentsPage(1);
    try {
      const classRes = await getClasses(1);
      setClasses(classRes?.data || []);
      setHasMoreClasses(
        classRes?.meta?.current_page < classRes?.meta?.last_page,
      );

      const studentRes = await getStudents(1);
      setStudents(studentRes?.data || []);
      setHasMoreStudents(
        studentRes?.meta?.current_page < studentRes?.meta?.last_page,
      );
    } catch (error) {
      console.error("Error fetching class data:", error);
      toast.error("Failed to load classes or students");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreClasses = async () => {
    if (isFetchingMoreClasses || !hasMoreClasses) return;
    setIsFetchingMoreClasses(true);
    try {
      const nextPage = classesPage + 1;
      const res = await getClasses(nextPage);
      if (res?.data?.length > 0) {
        setClasses((prev) => [...prev, ...res.data]);
        setClassesPage(nextPage);
        setHasMoreClasses(res.meta.current_page < res.meta.last_page);
      } else {
        setHasMoreClasses(false);
      }
    } catch (error) {
      console.error("Error fetching more classes:", error);
    } finally {
      setIsFetchingMoreClasses(false);
    }
  };

  const loadMoreStudents = async () => {
    if (isFetchingMoreStudents || !hasMoreStudents) return;
    setIsFetchingMoreStudents(true);
    try {
      const nextPage = studentsPage + 1;
      const res = await getStudents(nextPage);
      if (res?.data?.length > 0) {
        setStudents((prev) => [...prev, ...res.data]);
        setStudentsPage(nextPage);
        setHasMoreStudents(res.meta.current_page < res.meta.last_page);
      } else {
        setHasMoreStudents(false);
      }
    } catch (error) {
      console.error("Error fetching more students:", error);
    } finally {
      setIsFetchingMoreStudents(false);
    }
  };

  const handleClassesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMoreClasses();
    }
  };

  const handleStudentsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMoreStudents();
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      await createClass(newClassName);
      toast.success("Class created successfully");
      setNewClassName("");
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to create class");
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await deleteClass(id);
      toast.success("Class deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete class");
    }
  };

  const handleOpenAddStudents = (cls: Class) => {
    setCurrentClass(cls);
    setSelectedStudents([]);
    setShowAddStudentsModal(true);
  };

  const handleAddStudentsToClass = async () => {
    if (!currentClass || selectedStudents.length === 0) return;
    setLoading(true);
    const formdata = new FormData();

    formdata.append("class_id", String(currentClass.id));
    students.forEach((stud) =>
      formdata.append("student_ids[]", String(stud.id)),
    );
    try {
      await joinClass(formdata);
      toast.success("Students added to class");
      setShowAddStudentsModal(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to add students");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentSelection = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <div
      onScroll={handleClassesScroll}
      className="flex-1 p-6 bg-gray-50 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Class Management
            </h2>
            <p className="text-gray-500 text-sm">
              Create and manage your student groups
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Class
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {classes?.map((cls) => (
              <div
                key={cls.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{cls.name}</h4>
                    <p className="text-sm text-gray-500">
                      {cls.students_count || 0} Students enrolled
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenAddStudents(cls)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Add Students"
                  >
                    <Users size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Class"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {classes.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Users className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">No classes created yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-blue-600 font-medium hover:text-blue-700"
                >
                  Create your first class
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Create New Class
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Computer Science 101"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Create Class
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Students Modal */}
      {showAddStudentsModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Add Students
                </h3>
                <p className="text-sm text-gray-500">
                  Adding to {currentClass?.name}
                </p>
              </div>
              <button
                onClick={() => setShowAddStudentsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div
              onScroll={handleStudentsScroll}
              className="flex-1 overflow-y-auto mb-6 pr-2"
            >
              <div className="space-y-2">
                {students.map((student) => (
                  <label
                    key={student.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedStudents.includes(student.id)
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                    />
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        selectedStudents.includes(student.id)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedStudents.includes(student.id) && (
                        <Plus size={14} className="text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddStudentsModal(false)}
                className="flex-1 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudentsToClass}
                disabled={selectedStudents.length === 0 || loading}
                className="flex-2 py-2 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {!loading
                  ? `Add ${selectedStudents.length} Students`
                  : "please wait..."}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
