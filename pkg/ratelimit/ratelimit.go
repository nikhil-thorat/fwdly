package ratelimit

import (
	"fmt"
	"fwdly/pkg/logger"
	"net/http"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

var slidingWindowScript = redis.NewScript(`
	local key = KEYS[1]
	local now = tonumber(ARGV[1])
	local window = tonumber(ARGV[2])
	local limit = tonumber(ARGV[3])
	local clearBefore = now - (window * 1000)

	redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)

	local reqCount = redis.call('ZCARD', key)
	if reqCount < limit then
		redis.call('ZADD', key, now, now)
		redis.call('EXPIRE', key, window)
		return {1, reqCount + 1} -- Allowed, new count
	else
		return {0, reqCount} -- Denied, current count
	end
`)

type Limiter struct {
	rdb *redis.Client
}

func NewLimiter(rdb *redis.Client) *Limiter {
	return &Limiter{rdb: rdb}
}

type KeyFunc func(r *http.Request) (key string, limit int, window time.Duration)

func (l *Limiter) Middleware(keyGenerator KeyFunc) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			identifier, limit, window := keyGenerator(r)
			if identifier == "" || limit <= 0 {
				next.ServeHTTP(w, r)
				return
			}

			redisKey := fmt.Sprintf("ratelimit:%s", identifier)

			now := time.Now().UnixMilli()
			windowSeconds := int64(window.Seconds())

			ctx := r.Context()

			res, err := slidingWindowScript.Run(ctx, l.rdb, []string{redisKey}, now, windowSeconds, limit).Result()
			if err != nil {
				logger.Error("redis rate limit error, failing open to prevent outage", "error", err)
				next.ServeHTTP(w, r)
				return
			}

			results, ok := res.([]any)
			if !ok || len(results) < 2 {
				next.ServeHTTP(w, r)
				return
			}

			allowed := results[0].(int64) == 1
			currentCount := results[1].(int64)
			remaining := max(limit-int(currentCount), 0)

			w.Header().Set("X-RateLimit-Limit", strconv.Itoa(limit))
			w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(remaining))
			w.Header().Set("X-RateLimit-Reset", strconv.FormatInt(time.Now().Add(window).Unix(), 10))

			if !allowed {
				w.Header().Set("Retry-After", strconv.FormatInt(windowSeconds, 10))
				w.Header().Set("Content-Type", "application/json")

				w.WriteHeader(http.StatusTooManyRequests)
				w.Write([]byte(`{"error":"rate limit exceeded. please try again later."}`))

				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
