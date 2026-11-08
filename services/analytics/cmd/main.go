package main

import (
	"context"
	"fwdly/pkg/database"
	"fwdly/pkg/kafka"
	"fwdly/pkg/logger"
	"fwdly/services/analytics/internal/consumer"
	"fwdly/services/analytics/internal/repository"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	logger.Init()

	ctx, cancel := context.WithCancel(context.Background())

	pgDSN := os.Getenv("DATABASE_URL")
	if pgDSN == "" {
		pgDSN = "postgres://fwdly_user:fwdly_password@localhost:5432/fwdly_db?sslmode=disable"
	}

	dbPool, err := database.Connect(ctx, pgDSN)
	if err != nil {
		logger.Error("failed to connect to database pool", "error", err)
		os.Exit(1)
	}

	defer dbPool.Close()

	kafkaBrokers := []string{os.Getenv("KAFKA_BROKER")}
	if kafkaBrokers[0] == "" {
		kafkaBrokers = []string{"localhost:9092"}
	}

	kafkaConsumer := kafka.NewConsumer(kafkaBrokers, "fwdly-clicks", "analytics-consumer-group")
	defer kafkaConsumer.Close()

	batchWriter := repository.NewClickBatchWriter(dbPool)
	worker := consumer.NewAnalyticsWorker(kafkaConsumer, batchWriter)

	go worker.Start(ctx)

	quit := make(chan os.Signal, 1)

	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit

	logger.Info("received shutdown signal for analytics consumer", "signal", sig.String())
	cancel()

}
