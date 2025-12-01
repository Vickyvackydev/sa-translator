import { Route, Routes } from "react-router-dom";
import MainPage from "./layout";
import LoginScreen from "./auth/Login";
import RegisterScreen from "./auth/Register";
import ForgotPasswordScreen from "./auth/ForgotPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
    </Routes>
  );
}

export default App;
