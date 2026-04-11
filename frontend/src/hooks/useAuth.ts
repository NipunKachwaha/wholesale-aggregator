import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials, logout } from "../store";
import { authApi } from "../services/api.service";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);

      if (response.success) {
        dispatch(
          setCredentials({
            user: response.data.user,
            tokens: response.data.tokens,
          }),
        );
        navigate("/");
        return true;
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || "Login failed";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Register
  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.register(data);

      if (response.success) {
        dispatch(
          setCredentials({
            user: response.data.user,
            tokens: response.data.tokens,
          }),
        );
        navigate("/");
        return true;
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || "Registration failed";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return {
    login,
    register,
    handleLogout,
    loading,
    error,
    clearError: () => setError(null),
  };
};
