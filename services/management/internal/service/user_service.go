package service

import (
	"context"
	"fmt"
	"fwdly/services/management/internal/models"
	"fwdly/services/management/internal/repository"
)

const (
	TIER_BASIC = "basic"
	TIER_PRO   = "pro"
)

type UserService struct {
	userRepo *repository.UserRepo
}

func NewUserService(userRepo *repository.UserRepo) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) FindOrCreateUser(ctx context.Context, email, name, avatarURL, googleID string) (*models.User, error) {
	user, err := s.userRepo.GetByGoogleID(ctx, googleID)
	if err != nil {
		return nil, fmt.Errorf("error cheking existing user : %w", err)
	}

	if user != nil {
		return user, nil
	}

	newUser := &models.User{
		Email:     &email,
		Name:      &name,
		AvatarURL: &avatarURL,
		GoogleID:  &googleID,
		Tier:      TIER_BASIC,
	}

	createdUser, err := s.userRepo.Create(ctx, newUser)
	if err != nil {
		return nil, fmt.Errorf("error creating new user : %w", err)
	}

	return createdUser, nil
}

func (s *UserService) UpgradeToPro(ctx context.Context, userID string) error {
	err := s.userRepo.UpdateTier(ctx, userID, TIER_PRO)
	if err != nil {
		return fmt.Errorf("failed to upgrade user to pro : %w", err)
	}

	return nil
}

func (s *UserService) DowngradeToBasic(ctx context.Context, userID string) error {
	err := s.userRepo.UpdateTier(ctx, userID, TIER_BASIC)
	if err != nil {
		return fmt.Errorf("failed to downgrade user to basic : %w", err)
	}

	return nil
}

func (s *UserService) DeleteAccount(ctx context.Context, userID string) error {
	err := s.userRepo.Delete(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user account : %w", err)
	}

	return nil
}
