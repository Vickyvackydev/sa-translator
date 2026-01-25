import React from "react";

export interface ButtonTypeProps {
  type?: "button" | "submit";
  loading?: boolean;
  title: string;
  handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  btnStyles: string;
  textStyle: string;
  icon?: string;
  rightarrow?: boolean;
  iconStyle?: string;
  disabled?: boolean;
}

export interface StudentResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  location: string;
  role: string;
  preferred_language: string;
  created_at: string;
}
export interface LecturerResponse {
  lecturer_id: number;
  name: string;
  last_message: {
    id: number;
    body: string;
    sender_id: number;
    created_at: string;
  };
}

export interface UserPayload {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}
