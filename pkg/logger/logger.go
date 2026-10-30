package logger

import (
	"context"
	"log/slog"
	"os"
	"strings"
	"sync"
)

var (
	globalLogger *slog.Logger
	once         sync.Once
)

func Init() {
	once.Do(func() {
		var level slog.Level
		switch strings.ToLower(os.Getenv("LOG_LEVEL")) {
		case "debug":
			level = slog.LevelDebug
		case "warn":
			level = slog.LevelWarn
		case "error":
			level = slog.LevelError
		default:
			level = slog.LevelInfo
		}

		opts := &slog.HandlerOptions{
			Level:     level,
			AddSource: level == slog.LevelDebug,
		}

		var handler slog.Handler
		if strings.ToLower(os.Getenv("APP_ENV")) == "production" {
			handler = slog.NewJSONHandler(os.Stdout, opts)
		} else {
			handler = slog.NewTextHandler(os.Stdout, opts)
		}

		globalLogger = slog.New(handler)
		slog.SetDefault(globalLogger)
	})
}

func Get() *slog.Logger {
	if globalLogger == nil {
		Init()
	}
	return globalLogger
}

func Info(msg string, keysAndValues ...any) {
	Get().Info(msg, keysAndValues...)
}

func Error(msg string, keysAndValues ...any) {
	Get().Error(msg, keysAndValues...)
}

func Debug(msg string, keysAndValues ...any) {
	Get().Debug(msg, keysAndValues...)
}

func Warn(msg string, keysAndValues ...any) {
	Get().Warn(msg, keysAndValues...)
}

func Fatal(msg string, keysAndValues ...any) {
	Get().Error(msg, keysAndValues...)
	os.Exit(1)
}

func WithContext(ctx context.Context) *slog.Logger {
	return Get()
}

func With(args ...any) *slog.Logger {
	return Get().With(args...)
}
