package main

import (
	"context"
	"fwdly/pkg/database"
	"fwdly/pkg/kafka"
	"fwdly/pkg/logger"
	"fwdly/pkg/ratelimit"
	"fwdly/pkg/redis"
	"fwdly/services/redirect/internal/handler"
	"fwdly/services/redirect/internal/repository"
	"fwdly/services/redirect/internal/service"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	logger.Init()

	ctx := context.Background()

	pgDSN := os.Getenv("DATABASE_URL")
	if pgDSN == "" {
		pgDSN = "postgres://fwdly_user:fwdly_password@localhost:5432/fwdly_db?sslmode=disable"
	}

	dbPool, err := database.Connect(ctx, pgDSN)
	if err != nil {
		logger.Error("failed to connect to postgresql", "error", err)
		os.Exit(1)
	}

	defer dbPool.Close()

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	rdb, err := redis.Connect(ctx, redisAddr)
	if err != nil {
		logger.Error("failed to connect to redis", "error", err)
		os.Exit(1)
	}

	defer rdb.Close()

	kafkaBrokers := []string{os.Getenv("KAFKA_BROKER")}
	if kafkaBrokers[0] == "" {
		kafkaBrokers = []string{"localhost:9092"}
	}

	kafkaProducer := kafka.NewProducer(kafkaBrokers, "fwdly-clicks")
	defer kafkaProducer.Close()

	redirectRepo := repository.NewRedirectRepo(dbPool, rdb)
	redirectService := service.NewRedirectService(redirectRepo, kafkaProducer)
	redirectHandler := handler.NewRedirectHandler(redirectService)

	limiter := ratelimit.NewLimiter(rdb)
	router := handler.SetupRoutes(redirectHandler, limiter)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	}

	go func() {
		logger.Info("redirect service started", "port", port)

		err := server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			logger.Error("redirect server crashed", "error", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit

	logger.Info("shutting down redirect service")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = server.Shutdown(shutdownCtx)
	if err != nil {
		logger.Error("forced server shutdown failed", "error", err)
	}
}
