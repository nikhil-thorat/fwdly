package handler

import (
	"encoding/json"
	"fwdly/pkg/auth"
	"fwdly/pkg/logger"
	"fwdly/services/management/internal/service"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"net/http"
	"os"
)

type AuthHandler struct {
	userService *service.UserService
	oauthConfig *oauth2.Config
	jwtSecret   string
}

func NewAuthHandler(userService *service.UserService) *AuthHandler {
	redirectURL := os.Getenv("GOOGLE_REDIRECT_URL")
	if redirectURL == "" {
		redirectURL = "http://localhost:3000/api/auth/callback/google"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "fwdly-development-secret-key-32-bytes"
	}

	return &AuthHandler{
		userService: userService,
		jwtSecret:   jwtSecret,
		oauthConfig: &oauth2.Config{
			ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
			ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
			RedirectURL:  redirectURL,
			Scopes: []string{
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
			},
			Endpoint: google.Endpoint,
		},
	}
}

type GoogleAuthRequest struct {
	Code string `json:"code"`
}

type GoogleUserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

func (h *AuthHandler) HandleGoogleAuth(w http.ResponseWriter, r *http.Request) {
	var req GoogleAuthRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || req.Code == "" {
		http.Error(w, `{"error":"authorization code is required"}`, http.StatusBadRequest)
		return
	}

	token, err := h.oauthConfig.Exchange(r.Context(), req.Code)
	if err != nil {
		logger.Error("failed to exchange google auth code", "error", err)
		http.Error(w, `{"error":"failed to authenticate with google"}`, http.StatusBadRequest)
		return
	}

	client := h.oauthConfig.Client(r.Context(), token)

	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		logger.Error("failed to fetch google user info", "error", err)
		http.Error(w, `{"error":"failed to fetch google user profile"}`, http.StatusInternalServerError)
		return
	}

	defer resp.Body.Close()

	var googleUser GoogleUserInfo

	err = json.NewDecoder(resp.Body).Decode(&googleUser)
	if err != nil {
		logger.Error("failed to decode google user profile", "error", err)
		http.Error(w, `{"error":"failed to parse google profile"}`, http.StatusInternalServerError)
		return
	}

	user, err := h.userService.FindOrCreateUser(
		r.Context(),
		googleUser.Email,
		googleUser.Name,
		googleUser.Picture,
		googleUser.ID,
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
