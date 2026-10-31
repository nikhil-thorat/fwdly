package handler

import (
	"encoding/json"
	"errors"
	"fwdly/services/management/internal/models"
	"fwdly/services/management/internal/service"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi"
)

type URLHandler struct {
	urlService *service.URLService
}

func NewURLHandler(urlService *service.URLService) *URLHandler {
	return &URLHandler{urlService: urlService}
}

type CreateLinkRequest struct {
	OriginalURL string     `json:"original_url"`
	CustomCode  *string    `json:"custom_code,omitempty"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
}

type UpdateLinkRequest struct {
	OriginalURL string `json:"original_url"`
}

func (h *URLHandler) CreateLink(w http.ResponseWriter, r *http.Request) {
	var req CreateLinkRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, `{"error":"invalid json body"}`, http.StatusBadRequest)
	}

	user, _ := r.Context().Value(UserContextKey).(*models.User)

	link, err := h.urlService.CreateLink(r.Context(), req.OriginalURL, req.CustomCode, user, req.ExpiresAt)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidURL):
			http.Error(w, `{"error":"invalid url format"}`, http.StatusBadRequest)
		case errors.Is(err, service.ErrUnauthorizedCustomCode):
			http.Error(w, `{"error":"custom aliases require a Pro plan"}`, http.StatusForbidden)
		case errors.Is(err, service.ErrInvalidCustomCode):
			http.Error(w, `{"error":"invalid custom code format"}`, http.StatusBadRequest)
		default:
			http.Error(w, `{"error":"failed to create link"}`, http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(link)
}

func (h *URLHandler) GetUserLinks(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(UserContextKey).(*models.User)
	if !ok || user == nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	links, err := h.urlService.GetUserLinks(r.Context(), user.ID)
	if err != nil {
		http.Error(w, `{"error":"failed to fetch links"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(links)
}

func (h *URLHandler) UpdateLink(w http.ResponseWriter, r *http.Request) {
	shortCode := chi.URLParam(r, "code")

	user, ok := r.Context().Value(UserContextKey).(*models.User)
	if !ok || user == nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req UpdateLinkRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, `{"error":"invalid json body"}`, http.StatusBadRequest)
		return
	}

	err = h.urlService.UpdateLink(r.Context(), shortCode, user.ID, req.OriginalURL)
	if err != nil {
		if errors.Is(err, service.ErrInvalidURL) {
			http.Error(w, `{"error":"invalid url format"}`, http.StatusBadRequest)
		}

		http.Error(w, `{"error":"failed to update link"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "link updated successfully"})

}

func (h *URLHandler) DeleteLink(w http.ResponseWriter, r *http.Request) {
	shortCode := chi.URLParam(r, "code")

	user, ok := r.Context().Value(UserContextKey).(*models.User)
	if !ok || user == nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	err := h.urlService.DeleteLink(r.Context(), shortCode, user.ID)
	if err != nil {
		http.Error(w, `{"error":"failed to delete link"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *URLHandler) GetLinkAnalytics(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")

	urlID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid url id"}`, http.StatusBadRequest)
		return
	}

	stats, err := h.urlService.GetLinkAnalytics(r.Context(), urlID)
	if err != nil {
		http.Error(w, `{"error":"failed to fetch analytics"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
