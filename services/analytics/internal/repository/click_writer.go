package repository

import (
	"context"
	"fmt"
	"fwdly/pkg/kafka"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ClickBatchWriter struct {
	db *pgxpool.Pool
}

func NewClickBatchWriter(db *pgxpool.Pool) *ClickBatchWriter {
	return &ClickBatchWriter{db: db}
}

func (w *ClickBatchWriter) BulkInsert(ctx context.Context, events []kafka.ClickEvent) (int64, error) {
	if len(events) == 0 {
		return 0, nil
	}

	rows := make([][]any, len(events))
	for idx, event := range events {
		rows[idx] = []any{event.URLID, event.IPHash, event.UserAgent, event.Referer, event.ClickedAt}
	}

	copyCount, err := w.db.CopyFrom(
		ctx,
		pgx.Identifier{"clicks"},
		[]string{"url_id", "ip_hash", "user_agent", "referer", "clicked_at"},
		pgx.CopyFromRows(rows),
	)
	if err != nil {
		return 0, fmt.Errorf("bulk copy failed : %w", err)
	}

	return copyCount, nil
}
