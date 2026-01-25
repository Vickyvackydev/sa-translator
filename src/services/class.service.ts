import { API } from "../config";

export const createClass = async (name: string) => {
  const response = await API.post("/lecturer/classes", { name });
  return response.data;
};
export const joinClass = async (formdata: FormData) => {
  const response = await API.post(
    "/lecturer/classes/bulk-add-students",
    formdata,
  );
  return response.data;
};

export const getClasses = async (page: number = 1) => {
  const response = await API.get(`/lecturer/classes?page=${page}`);
  return response.data;
};
export const deleteClass = async (class_id: string | number) => {
  const response = await API.delete(`/lecturer/classes/${class_id}`);
  return response.data;
};
