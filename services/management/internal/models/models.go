package models

import "time"

type User struct {
	ID        string    `json:"id"`
	Email     *string   `json:"email"`
	Name      *string   `json:"name"`
	AvatarURL *string   `json:"avatar_url"`
	GoogleID  *string   `json:"google_id"`
	Tier      string    `json:"tier"`
	CreatedAt time.Time `json:"created_at"`
}

type URL struct {
	ID          uint64     `json:"id"`
	ShortCode   string     `json:"short_code"`
	OriginalURL string     `json:"original_url"`
	UserID      *string    `json:"user_id"`
	CreatedAt   time.Time  `json:"created_at"`
	ExpiresAt   *time.Time `json:"expires_at"`
}

type Subscription struct {
	ID                   string     `json:"id"`
	UserID               string     `json:"user_id"`
	StripeCustomerID     string     `json:"stripe_customer_id"`
	StripeSubscriptionID *string    `json:"stripe_subscription_id"`
	Status               *string    `json:"status"`
	CurrentPeriodEnd     *time.Time `json:"current_period_end"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
}

type TimeSeriesData struct {
	Date   string `json:"date"`
	Clicks int64  `json:"clicks"`
}

type ReferrerData struct {
	Referrer string `json:"referrer"`
	Clicks   int64  `json:"clicks"`
}

type ClickStats struct {
	TotalClicks  int64            `json:"total_clicks"`
	UniqueClicks int64            `json:"unique_clicks"`
	TimeSeries   []TimeSeriesData `json:"time_series"`
	TopReferrers []ReferrerData   `json:"top_referrers"`
}
