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

func (w *ClickBatchWriter) BulkInsert(ctx context.Context, events []kafka.ClickEvent) (int64, int64, error) {
	if len(events) == 0 {
		return 0, 0, nil
	}

	tx, err := w.db.Begin(ctx)
	if err != nil {
		return 0, 0, fmt.Errorf("begin click batch transaction : %w", err)
	}
	defer tx.Rollback(ctx)

	ids := make([]int64, 0, len(events))
	seen := make(map[uint64]struct{}, len(events))

	for _, event := range events {
		if _, ok := seen[event.URLID]; ok {
			continue
		}
		seen[event.URLID] = struct{}{}
		ids = append(ids, int64(event.URLID))
	}

	rows, err := tx.Query(
		ctx,
		`SELECT id FROM urls WHERE id = ANY($1) FOR KEY SHARE`,
		ids,
	)
	if err != nil {
		return 0, 0, fmt.Errorf("lock click urls : %w", err)
	}

	validIDs := make(map[uint64]struct{}, len(ids))
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			rows.Close()
			return 0, 0, fmt.Errorf("scan click url id : %w", err)
		}
		validIDs[uint64(id)] = struct{}{}
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return 0, 0, fmt.Errorf("iterate click url ids : %w", err)
	}
	rows.Close()

	filtered := make([][]any, 0, len(events))
	for _, event := range events {
		if _, ok := validIDs[event.URLID]; !ok {
			continue
		}
		filtered = append(filtered, []any{
			event.URLID,
			event.IPHash,
			event.UserAgent,
			event.Referer,
			event.ClickedAt,
		})
	}

	skipped := int64(len(events) - len(filtered))
	if len(filtered) == 0 {
		return 0, skipped, nil
	}

	copyCount, err := tx.CopyFrom(
		ctx,
		pgx.Identifier{"clicks"},
		[]string{"url_id", "ip_hash", "user_agent", "referer", "clicked_at"},
		pgx.CopyFromRows(filtered),
	)
	if err != nil {
		return 0, skipped, fmt.Errorf("bulk copy failed : %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, skipped, fmt.Errorf("commit click batch transaction : %w", err)
	}

	return copyCount, skipped, nil
}
