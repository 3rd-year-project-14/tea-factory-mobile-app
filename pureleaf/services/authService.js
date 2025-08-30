import apiClient from "./apiClient";

// Login with Firebase token
export const login = (token) => apiClient.post("/api/auth/login", { token });

// Signup with user data (expects token in data)
export const signup = (data) => apiClient.post("/api/auth/signup", data);
