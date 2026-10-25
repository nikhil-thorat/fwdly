package repository

import (
	"context"
	"fmt"

	"fwdly/services/management/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ClickRepo struct {
	db *pgxpool.Pool
}

func NewClickRepo(db *pgxpool.Pool) *ClickRepo {
	return &ClickRepo{db: db}
}

func (r *ClickRepo) GetSummaryStats(ctx context.Context, urlID uint64) (*models.ClickStats, error) {
	query := `
		SELECT 
			COUNT(id) as total_clicks, 
			COUNT(DISTINCT ip_hash) as unique_clicks 
		FROM clicks 
		WHERE url_id = $1
	`

	stats := &models.ClickStats{}

	err := r.db.QueryRow(ctx, query, urlID).Scan(&stats.TotalClicks, &stats.UniqueClicks)
	if err != nil {
		return nil, fmt.Errorf("failed to get summary stats: %w", err)
	}

	return stats, nil
}

func (r *ClickRepo) GetTimeSeries(ctx context.Context, urlID uint64) ([]models.TimeSeriesData, error) {
	query := `
		SELECT 
			TO_CHAR(DATE_TRUNC('day', clicked_at), 'YYYY-MM-DD') as date,
			COUNT(id) as clicks
		FROM clicks
		WHERE url_id = $1 AND clicked_at >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY DATE_TRUNC('day', clicked_at)
		ORDER BY date ASC
	`

	rows, err := r.db.Query(ctx, query, urlID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch time series: %w", err)
	}
	defer rows.Close()

	var timeSeries []models.TimeSeriesData
	for rows.Next() {
		var ts models.TimeSeriesData
		if err := rows.Scan(&ts.Date, &ts.Clicks); err != nil {
			return nil, fmt.Errorf("failed to scan time series row: %w", err)
		}
		timeSeries = append(timeSeries, ts)
	}

	return timeSeries, nil
}

func (r *ClickRepo) GetTopReferrers(ctx context.Context, urlID uint64) ([]models.ReferrerData, error) {
	query := `
		SELECT 
			COALESCE(referer, 'Direct') as referrer, 
			COUNT(id) as clicks
		FROM clicks
		WHERE url_id = $1
		GROUP BY referer
		ORDER BY clicks DESC
		LIMIT 5
	`

	rows, err := r.db.Query(ctx, query, urlID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch top referrers: %w", err)
	}

	defer rows.Close()

	var referrers []models.ReferrerData

	for rows.Next() {
		var ref models.ReferrerData

		if err := rows.Scan(&ref.Referrer, &ref.Clicks); err != nil {
			return nil, fmt.Errorf("failed to scan referrer row: %w", err)
		}

		referrers = append(referrers, ref)
	}

	return referrers, nil
}
