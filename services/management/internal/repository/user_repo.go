package repository

import (
	"context"
	"fmt"

	"fwdly/services/management/internal/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepo struct {
	db *pgxpool.Pool
}

func NewUserRepo(db *pgxpool.Pool) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) Create(ctx context.Context, u *models.User) (*models.User, error) {
	query := `
		INSERT INTO users (email, name, avatar_url, google_id, tier) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id, created_at
	`

	err := r.db.QueryRow(ctx, query, u.Email, u.Name, u.AvatarURL, u.GoogleID, u.Tier).Scan(&u.ID, &u.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return u, nil
}

func (r *UserRepo) GetByGoogleID(ctx context.Context, googleID string) (*models.User, error) {
	query := `SELECT id, email, name, avatar_url, google_id, tier, created_at FROM users WHERE google_id = $1`

	var u models.User

	err := r.db.QueryRow(ctx, query, googleID).Scan(
		&u.ID, &u.Email, &u.Name, &u.AvatarURL, &u.GoogleID, &u.Tier, &u.CreatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &u, nil
}

func (r *UserRepo) UpdateTier(ctx context.Context, userID string, tier string) error {
	query := `UPDATE users SET tier = $1 WHERE id = $2`

	_, err := r.db.Exec(ctx, query, tier, userID)
	if err != nil {
		return fmt.Errorf("failed to update user tier: %w", err)
	}

	return nil
}

func (r *UserRepo) Delete(ctx context.Context, userID string) error {
	query := `DELETE FROM users WHERE id = $1`

	_, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}
