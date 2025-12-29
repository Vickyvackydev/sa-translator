import { Navigate, Route, Routes } from "react-router-dom";
import MainPage from "./layout";
import LoginScreen from "./auth/Login";
import RegisterScreen from "./auth/Register";
import ForgotPasswordScreen from "./auth/ForgotPassword";
import VerifyTokenScreen from "./auth/VerifyToken";
import ResetPasswordScreen from "./auth/ResetPassword";
import PrivateRoute from "./Private";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-left" />

      <Routes>
        <Route
          path="/chat?/:id?"
          element={
            <PrivateRoute>
              <MainPage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/verify-token" element={<VerifyTokenScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
      </Routes>
    </>
  );
}

export default App;
