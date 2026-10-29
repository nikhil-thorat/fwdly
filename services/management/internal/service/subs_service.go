package service

import (
	"context"
	"fmt"
	"fwdly/services/management/internal/models"
	"fwdly/services/management/internal/repository"
	"time"
)

type SubscriptionService struct {
	subscriptionRepo *repository.SubscriptionRepo
	userRepo         *repository.UserRepo
}

func NewSubscriptionService(subscriptionRepo *repository.SubscriptionRepo, userRepo *repository.UserRepo) *SubscriptionService {
	return &SubscriptionService{
		subscriptionRepo: subscriptionRepo,
		userRepo:         userRepo,
	}
}

func (s *SubscriptionService) ProcessSubscriptionUpdate(ctx context.Context, userID, stripeCustomerID, stripeSubscriptionID, status string, currentPeriodEnd time.Time) error {
	subscription := &models.Subscription{
		UserID:               userID,
		StripeCustomerID:     stripeCustomerID,
		StripeSubscriptionID: &stripeSubscriptionID,
		Status:               &status,
		CurrentPeriodEnd:     &currentPeriodEnd,
	}

	if err := s.subscriptionRepo.Upsert(ctx, subscription); err != nil {
		return fmt.Errorf("failed to save subscription record : %w", err)
	}

	switch status {
	case "active", "trailing":
		if err := s.userRepo.UpdateTier(ctx, userID, TIER_PRO); err != nil {
			return fmt.Errorf("failed to promote user to pro : %w", err)
		}

	case "canceled", "unpaid", "past_due":
		if err := s.userRepo.UpdateTier(ctx, userID, TIER_BASIC); err != nil {
			return fmt.Errorf("failed to demote user to basic : %w", err)
		}
	}

	return nil
}

func (s *SubscriptionService) GetUserSubscription(ctx context.Context, userID string) (*models.Subscription, error) {
	return s.subscriptionRepo.GetByUserID(ctx, userID)
}
