package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type RedirectRepo struct {
	db       *pgxpool.Pool
	rdb      *redis.Client
	cacheTTL time.Duration
}

func NewRedirectRepo(db *pgxpool.Pool, rdb *redis.Client) *RedirectRepo {
	return &RedirectRepo{
		db:       db,
		rdb:      rdb,
		cacheTTL: 24 * time.Hour,
	}
}

func (r *RedirectRepo) GetOriginalURL(ctx context.Context, shortCode string) (uint64, string, error) {
	cacheKey := fmt.Sprintf("url:%s", shortCode)

	cacheVal, err := r.rdb.Get(ctx, cacheKey).Result()
	if err == nil && cacheVal != "" {
		var urlID uint64
		var originalURL string

		_, scanErr := fmt.Sscanf(cacheVal, "%d|%s", &urlID, &originalURL)
		if scanErr == nil {
			return urlID, originalURL, nil
		}
	}

	query := `
		SELECT id, original_url, expires_at
		FROM urls
		WHERE short_code = $1
	`

	var id uint64
	var originalURL string
	var expiresAt *time.Time

	err = r.db.QueryRow(ctx, query, shortCode).Scan(&id, &originalURL, &expiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, "", errors.New("link not found")
	}

	if err != nil {
		return 0, "", fmt.Errorf("db query error : %w", err)
	}

	if expiresAt != nil && time.Now().After(*expiresAt) {
		return 0, "", errors.New("link expired")
	}

	cacheVal = fmt.Sprintf("%d|%s", id, originalURL)
	r.rdb.Set(ctx, cacheKey, cacheVal, r.cacheTTL)

	return id, originalURL, nil
}
