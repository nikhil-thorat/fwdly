package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"fwdly/pkg/logger"
	"fwdly/services/api-gateway/internal/handler"
	"fwdly/services/api-gateway/internal/proxy"
)

func main() {
	logger.Init()

	mgmtURL := os.Getenv("MANAGEMENT_SERVICE_URL")
	if mgmtURL == "" {
		mgmtURL = "http://localhost:8081"
	}

	redirectURL := os.Getenv("REDIRECT_SERVICE_URL")
	if redirectURL == "" {
		redirectURL = "http://localhost:8080"
	}

	mgmtProxy, err := proxy.NewReverseProxy(mgmtURL)
	if err != nil {
		logger.Error("failed to create management service proxy", "error", err)
		os.Exit(1)
	}

	redirectProxy, err := proxy.NewReverseProxy(redirectURL)
	if err != nil {
		logger.Error("failed to create redirect service proxy", "error", err)
		os.Exit(1)
	}

	router := handler.SetupRoutes(handler.GatewayConfig{
		ManagementProxy: mgmtProxy,
		RedirectProxy:   redirectProxy,
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info("API Gateway started", "port", port, "mgmt_target", mgmtURL, "redirect_target", redirectURL)

		err := server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			logger.Error("API Gateway server crashed", "error", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	sig := <-quit
	logger.Info("shutting down API Gateway", "signal", sig.String())

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Error("forced gateway shutdown failed", "error", err)
	}
}
