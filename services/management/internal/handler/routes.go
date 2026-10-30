package handler

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type RouterConfig struct {
	UserHandler         *UserHandler
	URLHandler          *URLHandler
	SubscriptionHandler *SubscriptionHandler
}

func SetupRoutes(cfg RouterConfig) *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/links", cfg.URLHandler.CreateLink)
		r.Post("/webhooks/stripe", cfg.SubscriptionHandler.HandleStripeWebhook)

		r.Group(func(r chi.Router) {
			r.Get("/user/me", cfg.UserHandler.GetProfile)
			r.Delete("/user/me", cfg.UserHandler.DeleteAccount)

			r.Get("/links", cfg.URLHandler.GetUserLinks)
			r.Put("/links/{code}", cfg.URLHandler.UpdateLink)
			r.Delete("/links/{code}", cfg.URLHandler.DeleteLink)
			r.Get("/links/{id}/analytics", cfg.URLHandler.GetLinkAnalytics)

			r.Get("/subscription", cfg.SubscriptionHandler.GetSubscription)
		})
	})

	return r
}
