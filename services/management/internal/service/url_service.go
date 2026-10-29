package service

import (
	"context"
	"errors"
	"fmt"
	"fwdly/pkg/base62"
	"fwdly/services/management/internal/models"
	"fwdly/services/management/internal/repository"
	"net/url"
	"regexp"
	"time"
)

var (
	ErrUnauthorizedCustomCode = errors.New("custom short code are restricted to Pro tier users")
	ErrInvalidCustomCode      = errors.New("custom code must be 3-30 characters long and contain only letters, numbers, hyphens, or underscores")
	ErrInvalidURL             = errors.New("invalid target URL format")
)

var customCodeRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]{3-30}$`)

type URLService struct {
	urlRepo   *repository.URLRepo
	clickRepo *repository.ClickRepo
}

func NewURLService(urlRepo *repository.URLRepo, clickRepo *repository.ClickRepo) *URLService {
	return &URLService{
		urlRepo:   urlRepo,
		clickRepo: clickRepo,
	}
}

func (s *URLService) CreateLink(ctx context.Context, originalURL string, customCode *string, user *models.User, expiresAt *time.Time) (*models.URL, error) {
	parsedURL, err := url.ParseRequestURI(originalURL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		return nil, ErrInvalidURL
	}

	var shortCode string
	var nextID uint64

	if customCode != nil && *customCode != "" {

		if user == nil || user.Tier != TIER_PRO {
			return nil, ErrUnauthorizedCustomCode
		}

		if !customCodeRegex.MatchString(*customCode) {
			return nil, ErrInvalidCustomCode
		}

		shortCode = *customCode

		nextID, err = s.urlRepo.GetNextID(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to generate URL ID : %w", err)
		}
	} else {
		nextID, err = s.urlRepo.GetNextID(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to generate URL ID : %w", err)
		}

		shortCode = base62.Encode(nextID)
	}

	var userID *string
	if user != nil {
		userID = &user.ID
	}

	link := &models.URL{
		ID:          nextID,
		ShortCode:   shortCode,
		OriginalURL: originalURL,
		UserID:      userID,
		ExpiresAt:   expiresAt,
	}

	if err := s.urlRepo.Insert(ctx, link); err != nil {
		return nil, fmt.Errorf("failed to save URL : %w", err)
	}

	return link, nil
}

func (s *URLService) GetUserLinks(ctx context.Context, userID string) ([]models.URL, error) {
	return s.urlRepo.GetByUserID(ctx, userID)
}

func (s *URLService) UpdateLink(ctx context.Context, shortCode, userID, newURL string) error {
	parsedURL, err := url.ParseRequestURI(newURL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		return ErrInvalidURL
	}

	return s.urlRepo.UpdateOriginalURL(ctx, shortCode, userID, newURL)
}

func (s *URLService) DeleteLink(ctx context.Context, shortCode, userID string) error {
	return s.urlRepo.Delete(ctx, shortCode, userID)
}

func (s *URLService) GetLinkAnalytics(ctx context.Context, urlID uint64) (*models.ClickStats, error) {
	stats, err := s.clickRepo.GetSummaryStats(ctx, urlID)
	if err != nil {
		return nil, err
	}

	timeSeries, err := s.clickRepo.GetTimeSeries(ctx, urlID)
	if err != nil {
		return nil, err
	}

	stats.TimeSeries = timeSeries

	referrers, err := s.clickRepo.GetTopReferrers(ctx, urlID)
	if err != nil {
		return nil, err
	}

	stats.TopReferrers = referrers

	return stats, nil
}
