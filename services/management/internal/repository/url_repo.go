package repository

import (
	"context"
	"fmt"

	"fwdly/services/management/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type URLRepo struct {
	db *pgxpool.Pool
}

func NewURLRepo(db *pgxpool.Pool) *URLRepo {
	return &URLRepo{db: db}
}

func (r *URLRepo) GetNextID(ctx context.Context) (uint64, error) {
	var nextID uint64

	err := r.db.QueryRow(ctx, "SELECT nextval('urls_id_seq')").Scan(&nextID)
	if err != nil {
		return 0, fmt.Errorf("failed to get next sequence: %w", err)
	}

	return nextID, nil
}

func (r *URLRepo) Insert(ctx context.Context, u *models.URL) error {
	query := `
		INSERT INTO urls (id, short_code, original_url, user_id, expires_at) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING created_at
	`

	err := r.db.QueryRow(ctx, query, u.ID, u.ShortCode, u.OriginalURL, u.UserID, u.ExpiresAt).Scan(&u.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to insert url: %w", err)
	}

	return nil
}

func (r *URLRepo) GetByUserID(ctx context.Context, userID string) ([]models.URL, error) {
	query := `
		SELECT id, short_code, original_url, user_id, created_at, expires_at 
		FROM urls 
		WHERE user_id = $1 
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user urls: %w", err)
	}

	defer rows.Close()

	var urls []models.URL
	for rows.Next() {
		var u models.URL

		if err := rows.Scan(&u.ID, &u.ShortCode, &u.OriginalURL, &u.UserID, &u.CreatedAt, &u.ExpiresAt); err != nil {
			return nil, fmt.Errorf("failed to scan url: %w", err)
		}

		urls = append(urls, u)
	}

	return urls, nil
}

func (r *URLRepo) UpdateOriginalURL(ctx context.Context, shortCode string, userID string, newOriginalURL string) error {
	query := `
		UPDATE urls 
		SET original_url = $1 
		WHERE short_code = $2 AND user_id = $3
	`

	tag, err := r.db.Exec(ctx, query, newOriginalURL, shortCode, userID)
	if err != nil {
		return fmt.Errorf("failed to update url: %w", err)
	}

	if tag.RowsAffected() == 0 {
		return fmt.Errorf("url not found or unauthorized")
	}

	return nil
}

func (r *URLRepo) Delete(ctx context.Context, shortCode string, userID string) error {
	query := `
		DELETE FROM urls 
		WHERE short_code = $1 AND user_id = $2
	`

	tag, err := r.db.Exec(ctx, query, shortCode, userID)
	if err != nil {
		return fmt.Errorf("failed to delete url: %w", err)
	}

	if tag.RowsAffected() == 0 {
		return fmt.Errorf("url not found or unauthorized")
	}

	return nil
}
