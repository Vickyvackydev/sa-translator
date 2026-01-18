import { API } from "../config";

export const getStudents = async () => {
  const response = await API.get("/lecturer/students");
  return response.data;
};
