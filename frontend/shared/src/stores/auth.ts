import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "../types";
import { authApi } from "../api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token"));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.login(email, password);
      user.value = response.user;
      token.value = response.token;
      localStorage.setItem("token", response.token);
      return true;
    } catch (err: any) {
      error.value = err.message || "Login failed";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function register(
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.register(name, email, password);
      user.value = response.user;
      token.value = response.token;
      localStorage.setItem("token", response.token);
      return true;
    } catch (err: any) {
      error.value = err.message || "Registration failed";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser(): Promise<void> {
    if (!token.value) return;
    loading.value = true;
    error.value = null;
    try {
      user.value = await authApi.getMe();
    } catch {
      // Token expired or invalid
      logout();
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  }

  async function updateProfile(updates: Partial<User>): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      user.value = await authApi.updateProfile(updates);
      return true;
    } catch (err: any) {
      error.value = err.message || "Update failed";
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Auto-fetch user on init if token exists
  if (token.value) {
    fetchUser();
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    fetchUser,
  };
});
