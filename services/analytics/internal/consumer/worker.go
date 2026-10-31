package consumer

import (
	"context"
	"encoding/json"
	"fwdly/pkg/kafka"
	"fwdly/pkg/logger"
	"fwdly/services/analytics/internal/repository"
	"time"
)

type AnalyticsWorker struct {
	consumer      *kafka.Consumer
	writer        *repository.ClickBatchWriter
	batchSize     int
	flushInterval time.Duration
}

func NewAnalyticsWorker(consumer *kafka.Consumer, writer *repository.ClickBatchWriter) *AnalyticsWorker {
	return &AnalyticsWorker{
		consumer:      consumer,
		writer:        writer,
		batchSize:     250,
		flushInterval: 2 * time.Second,
	}
}

func (w *AnalyticsWorker) Start(ctx context.Context) {
	buffer := make([]kafka.ClickEvent, 0, w.batchSize)

	ticker := time.NewTicker(w.flushInterval)
	defer ticker.Stop()

	logger.Info("analytics consumer worker started", "batch_size", w.batchSize, "flush_interval", w.flushInterval)

	for {
		select {
		case <-ctx.Done():
			logger.Info("draining pending analytics events before shutdown", "count", len(buffer))
			w.flush(context.Background(), buffer)
			return

		case <-ticker.C:
			if len(buffer) > 0 {
				w.flush(ctx, buffer)
				buffer = buffer[:0]

			}

		default:
			readCtx, cancel := context.WithTimeout(ctx, 500*time.Millisecond)

			msg, err := w.consumer.ReadMessage(readCtx)
			cancel()

			if err != nil {
				if ctx.Err() != nil {
					return
				}

				continue
			}

			var event kafka.ClickEvent

			err = json.Unmarshal(msg.Value, &event)
			if err != nil {
				logger.Error("failed to unmarshal click event from kafka", "error", err)
				continue
			}

			buffer = append(buffer, event)

			if len(buffer) >= w.batchSize {
				w.flush(ctx, buffer)
				buffer = buffer[:0]
			}

		}
	}
}

func (w *AnalyticsWorker) flush(ctx context.Context, events []kafka.ClickEvent) {
	if len(events) == 0 {
		return
	}

	count, err := w.writer.BulkInsert(ctx, events)
	if err != nil {
		logger.Error("failed to flush click events to postgresql", "error", err, "attempted_count", len(events))
		return
	}

	logger.Debug("successfully flushed click events batch", "inserted_count", count)
}
