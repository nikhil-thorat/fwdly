package handler

import (
	"encoding/json"
	"fwdly/pkg/auth"
	"fwdly/pkg/logger"
	"fwdly/services/management/internal/service"
	"net/http"
	"os"
)

type AuthHandler struct {
	userService *service.UserService
	jwtSecret   string
}

func NewAuthHandler(userService *service.UserService) *AuthHandler {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "fwdly-development-secret-key-32-bytes"
	}

	return &AuthHandler{
		userService: userService,
		jwtSecret:   jwtSecret,
	}
}

type GoogleAuthRequest struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	GoogleID string `json:"google_id"`
	Avatar   string `json:"avatar_url"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  any    `json:"user"`
}

func (h *AuthHandler) HandleGoogleAuth(w http.ResponseWriter, r *http.Request) {
	var req GoogleAuthRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || req.Email == "" || req.GoogleID == "" {
		logger.Error("invalid auth request body", "error", err)
		http.Error(w, `{"error":"email and google_id are required"}`, http.StatusBadRequest)
		return
	}

	user, err := h.userService.FindOrCreateUser(
		r.Context(),
		req.Email,
		req.Name,
		req.Avatar,
		req.GoogleID,
	)
	if err != nil {
		logger.Error("failed to find or create user", "error", err)
		http.Error(w, `{"error":"failed to process account"}`, http.StatusInternalServerError)
		return
	}

	emailStr := ""
	if user.Email != nil {
		emailStr = *user.Email
	}

	jwtToken, err := auth.GenerateToken(user.ID, emailStr, user.Tier, h.jwtSecret)
	if err != nil {
		logger.Error("failed to generate jwt token", "error", err)
		http.Error(w, `{"error":"failed to generate authorization token"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(AuthResponse{
		Token: jwtToken,
		User:  user,
	})
}
