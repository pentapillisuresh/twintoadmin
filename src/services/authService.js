
import api from "./api";

// ==========================================
// ADMIN LOGIN - EXISTING
// ==========================================

export const adminLogin = (email, password) => {
  return api.post("/admin/auth/login", {
    email,
    password,
  });
};

// ==========================================
// GET CURRENT USER - EXISTING
// ==========================================

export const getMe = () => {
  return api.get("/auth/me");
};

// ==========================================
// ADMIN CHANGE PASSWORD - NEW
// ==========================================

export const changeAdminPassword = (
  currentPassword,
  newPassword
) => {
  return api.put("/admin/change-password", {
    currentPassword,
    newPassword,
  });
};
