package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/segmentio/kafka-go"
)

type ClickEvent struct {
	URLID     uint64    `json:"url_id"`
	ShortCode string    `json:"short_code"`
	IPHash    string    `json:"ip_hash"`
	UserAgent string    `json:"user_agent"`
	Referer   string    `json:"referer"`
	ClickedAt time.Time `json:"clicked_at"`
}

type Producer struct {
	writer *kafka.Writer
}

func NewProducer(broker []string, topic string) *Producer {
	writer := &kafka.Writer{
		Addr:         kafka.TCP(broker...),
		Topic:        topic,
		Balancer:     &kafka.LeastBytes{},
		Async:        true,
		BatchSize:    100,
		BatchTimeout: 10 * time.Millisecond,
	}

	return &Producer{writer: writer}
}

func (p *Producer) PublishClick(ctx context.Context, event ClickEvent) error {
	payload, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal click event : %w", err)
	}

	return p.writer.WriteMessages(ctx, kafka.Message{
		Key:   []byte(event.ShortCode),
		Value: payload,
	})
}

func (p *Producer) Close() error {
	return p.writer.Close()
}
