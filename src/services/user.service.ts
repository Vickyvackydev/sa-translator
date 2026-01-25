import { API } from "../config";

export const getStudents = async (page: number = 1) => {
  const response = await API.get(`/lecturer/students?page=${page}`);
  return response.data;
};
export const getLecturers = async (page: number = 1) => {
  const response = await API.get(`/student/lecturers/message?page=${page}`);
  return response.data;
};
