package main

import (
	"context"
	"fwdly/pkg/database"
	"fwdly/pkg/logger"
	"fwdly/pkg/redis"
	"fwdly/services/management/internal/handler"
	"fwdly/services/management/internal/repository"
	"fwdly/services/management/internal/service"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	logger.Init()

	ctx := context.Background()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://fwdly_user:fwdly_password@localhost:5432/fwdly_db?sslmode=disable"
	}

	dbPool, err := database.Connect(ctx, dsn)
	if err != nil {
		logger.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}

	defer dbPool.Close()
	logger.Info("connected to postgresql pool successfully")

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	cacheClient, err := redis.Connect(ctx, redisAddr)
	if err != nil {
		logger.Warn("failed to connect to redis; url cache invalidation disabled", "error", err)
	} else {
		defer cacheClient.Close()
	}

	userRepo := repository.NewUserRepo(dbPool)
	urlRepo := repository.NewURLRepo(dbPool)
	subscriptionRepo := repository.NewSubscriptionRepo(dbPool)
	clickRepo := repository.NewClickRepo(dbPool)

	userService := service.NewUserService(userRepo)
	urlService := service.NewURLService(urlRepo, clickRepo, cacheClient)
	subscriptionService := service.NewSubscriptionService(subscriptionRepo, userRepo)

	authHandler := handler.NewAuthHandler(userService)
	userHandler := handler.NewUserHandler(userService)
	urlHandler := handler.NewURLHandler(urlService)
	subscriptionHandler := handler.NewSubscriptionHandler(subscriptionService)

	router := handler.SetupRoutes(handler.RouterConfig{
		AuthHandler:         authHandler,
		UserHandler:         userHandler,
		URLHandler:          urlHandler,
		SubscriptionHandler: subscriptionHandler,
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info("management service started", "port", port, "env", os.Getenv("APP_ENV"))
		err := server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			logger.Error("management service crashed", "error", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	sig := <-quit
	logger.Info("received shutdown signal, stopping service", "signal", sig.String())

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = server.Shutdown(shutdownCtx)
	if err != nil {
		logger.Error("forced server shutdown failed", "error", err)
	} else {
		logger.Info("management service stopped gracefully")
	}
}
