package handler

import (
	"encoding/json"
	"fwdly/services/management/internal/models"
	"fwdly/services/management/internal/service"
	"io"
	"net/http"
	"time"
)

type SubscriptionHandler struct {
	subscriptionService *service.SubscriptionService
}

func NewSubscriptionHandler(subscriptionService *service.SubscriptionService) *SubscriptionHandler {
	return &SubscriptionHandler{subscriptionService: subscriptionService}
}

type StripeWebhookPayload struct {
	Type string `json:"type"`
	Data struct {
		Object struct {
			Customer         string `json:"customer"`
			ID               string `json:"id"`
			Status           string `json:"status"`
			CurrentEndPeriod int64  `json:"current_end_period"`
			Metadata         struct {
				UserID string `json:"user_id"`
			} `json:"metadata"`
		} `json:"object"`
	} `json:"data"`
}

func (h *SubscriptionHandler) HandleStripeWebhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, `{"error":"unable to read payload"}`, http.StatusBadRequest)
		return
	}

	var event StripeWebhookPayload

	err = json.Unmarshal(body, &event)
	if err != nil {
		http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
		return
	}

	switch event.Type {
	case "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted":
		obj := event.Data.Object
		periodEnd := time.Unix(obj.CurrentEndPeriod, 0)

		err := h.subscriptionService.ProcessSubscriptionUpdate(
			r.Context(),
			obj.Metadata.UserID,
			obj.Customer,
			obj.ID,
			obj.Status,
			periodEnd,
		)
		if err != nil {
			http.Error(w, `{"error":"failed to process stripe webhook"}`, http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (h *SubscriptionHandler) GetSubscription(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(*models.User)
	if !ok || user == nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	sub, err := h.subscriptionService.GetUserSubscription(r.Context(), user.ID)
	if err != nil {
		http.Error(w, `{"error":"failed to fetch subscription"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sub)
}
