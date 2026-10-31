FROM golang:alpine AS builder
WORKDIR /app
ENV GOTOOLCHAIN=auto

COPY go.work go.work.sum* ./
COPY pkg/go.mod pkg/go.sum* ./pkg/
COPY services/analytics/go.mod services/analytics/go.sum* ./services/analytics/
COPY services/management/go.mod services/management/go.sum* ./services/management/
COPY services/redirect/go.mod services/redirect/go.sum* ./services/redirect/
COPY services/api-gateway/go.mod services/api-gateway/go.sum* ./services/api-gateway/

RUN go mod download
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/management ./services/management/cmd/api

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /bin/management /app/management

EXPOSE 8081
CMD ["/app/management"]
