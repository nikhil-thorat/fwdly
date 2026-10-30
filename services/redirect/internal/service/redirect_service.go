package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fwdly/pkg/kafka"
	"fwdly/pkg/logger"
	"fwdly/services/redirect/internal/repository"
	"time"
)

type RedirectService struct {
	repo          *repository.RedirectRepo
	kafkaProducer *kafka.Producer
}

func NewRedirectService(repo *repository.RedirectRepo, kafkaProducer *kafka.Producer) *RedirectService {
	return &RedirectService{
		repo:          repo,
		kafkaProducer: kafkaProducer,
	}
}

func (s *RedirectService) ResolveAndTrack(ctx context.Context, shortCode, userIP, userAgent, referer string) (string, error) {
	urlID, originalURL, err := s.repo.GetOriginalURL(ctx, shortCode)
	if err != nil {
		return "", err
	}

	hasher := sha256.New()

	hasher.Write([]byte(userIP))
	ipHash := hex.EncodeToString(hasher.Sum(nil))

	go func() {
		event := kafka.ClickEvent{
			URLID:     urlID,
			ShortCode: shortCode,
			IPHash:    ipHash,
			UserAgent: userAgent,
			Referer:   referer,
			ClickedAt: time.Now().UTC(),
		}

		err := s.kafkaProducer.PublishClick(context.Background(), event)
		if err != nil {
			logger.Error("failed to publish click event to kafka", "short_code", shortCode, "error", err)
		}
	}()

	return originalURL, nil
}
