import { API } from "../config";

export const sendChat = async (data: {
  message: string;
  sourceLanguage: string;
  targetLanguage: string;
  chat_id?: string;
}) => {
  const response = await API.post("/chat", data);
  return response.data;
};
export const getChats = async () => {
  const response = await API.get("/chat");
  return response.data;
};
