import { useAuthStore } from '../store/auth';
import { authService } from '../services/auth';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, setUser, logout, loadToken } = useAuthStore();

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    await setUser(response.user, response.accessToken);
    return response;
  };

  const register = async (email: string, password: string, fullName: string) => {
    const response = await authService.register(email, password, fullName);
    await setUser(response.user, response.accessToken);
    return response;
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    setUser,
    login,
    register,
    logout,
    loadToken,
  };
};
