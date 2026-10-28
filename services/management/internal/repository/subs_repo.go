package repository

import (
	"context"
	"fmt"

	"fwdly/services/management/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SubscriptionRepo struct {
	db *pgxpool.Pool
}

func NewSubscriptionRepo(db *pgxpool.Pool) *SubscriptionRepo {
	return &SubscriptionRepo{db: db}
}

func (r *SubscriptionRepo) Upsert(ctx context.Context, sub *models.Subscription) error {
	query := `
		INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end, updated_at)
		VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
		ON CONFLICT (user_id) DO UPDATE SET
			stripe_customer_id = EXCLUDED.stripe_customer_id,
			stripe_subscription_id = EXCLUDED.stripe_subscription_id,
			status = EXCLUDED.status,
			current_period_end = EXCLUDED.current_period_end,
			updated_at = CURRENT_TIMESTAMP
	`
	_, err := r.db.Exec(ctx, query, sub.UserID, sub.StripeCustomerID, sub.StripeSubscriptionID, sub.Status, sub.CurrentPeriodEnd)
	if err != nil {
		return fmt.Errorf("failed to upsert subscription: %w", err)
	}

	return nil
}

func (r *SubscriptionRepo) GetByUserID(ctx context.Context, userID string) (*models.Subscription, error) {
	query := `
		SELECT id, user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end, created_at, updated_at 
		FROM subscriptions 
		WHERE user_id = $1
	`
	var s models.Subscription
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&s.ID, &s.UserID, &s.StripeCustomerID, &s.StripeSubscriptionID, &s.Status, &s.CurrentPeriodEnd, &s.CreatedAt, &s.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, fmt.Errorf("failed to fetch subscription: %w", err)
	}

	return &s, nil
}
