package handler

import (
	"fwdly/pkg/ratelimit"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func SetupRoutes(handler *RedirectHandler, limiter *ratelimit.Limiter) *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	if limiter != nil {
		r.Use(limiter.Middleware(func(r *http.Request) (string, int, time.Duration) {
			clientIP := r.Header.Get("X-Forwarded-For")
			if clientIP != "" {
				clientIP = strings.TrimSpace(strings.Split(clientIP, ",")[0])
			} else {
				clientIP = r.RemoteAddr
			}

			return "redirect:" + clientIP, 100, 1 * time.Minute
		}))
	}

	r.Get("/{code}", handler.HandleRedirect)

	return r
}
