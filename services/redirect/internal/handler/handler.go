package handler

import (
	"fwdly/services/redirect/internal/service"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type RedirectHandler struct {
	service *service.RedirectService
}

func NewRedirectHandler(service *service.RedirectService) *RedirectHandler {
	return &RedirectHandler{service: service}
}

func (h *RedirectHandler) HandleRedirect(w http.ResponseWriter, r *http.Request) {
	shortCode := chi.URLParam(r, "code")
	if shortCode == "" {
		http.Error(w, "invalid short code", http.StatusBadRequest)
		return
	}

	userIP := r.RemoteAddr
	userAgent := r.UserAgent()
	referer := r.Referer()

	originalURL, err := h.service.ResolveAndTrack(r.Context(), shortCode, userIP, userAgent, referer)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	http.Redirect(w, r, originalURL, http.StatusFound)
}
