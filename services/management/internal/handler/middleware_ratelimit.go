package handler

import (
	"net/http"
	"time"

	"fwdly/services/management/internal/models"
)

func DynamicPolicy(r *http.Request) (string, int, time.Duration) {
	user, ok := r.Context().Value("user").(*models.User)

	if !ok || user == nil {
		ip := r.RemoteAddr
		return "guest:" + ip, 50, 1 * time.Minute
	}

	if user.Tier == "basic" {
		return "user:" + user.ID, 300, 1 * time.Minute
	}

	if user.Tier == "pro" {
		return "user:" + user.ID, 2000, 1 * time.Minute
	}

	return "user:" + user.ID, 100, 1 * time.Minute
}
