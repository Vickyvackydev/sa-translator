import { API } from "../config";

// ignore for now
export const sendChat = async (data: {
  message: string;
  sourceLanguage: string | null;
  targetLanguage: string;
  chat_id?: string;
}) => {
  const response = await API.post("/chat", data);
  return response.data;
};

// ignore for now
export const getChats = async () => {
  const response = await API.get("/chat");
  return response.data;
};
// ignore for now
export const deleteChat = async (id: string) => {
  const response = await API.delete(`/chat/${id}`);
  return response.data;
};

// use this for now
export const sendMessage = async () => {
  const response = await API.post("/lecturer/messages", {
    body_original: "Hello",
    receiver_id: "1",
  });
  return response.data;
};

// use this for now

export const getMessages = async (receiver_id: string) => {
  const response = await API.get(`/lecturer/messages/${receiver_id}`);
  return response.data;
};
