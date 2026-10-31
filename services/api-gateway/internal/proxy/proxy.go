package proxy

import (
	"fwdly/pkg/logger"
	"net/http"
	"net/http/httputil"
	"net/url"
)

type ReverseProxy struct {
	target *url.URL
	proxy  *httputil.ReverseProxy
}

func NewReverseProxy(targetURL string) (*ReverseProxy, error) {
	target, err := url.Parse(targetURL)
	if err != nil {
		return nil, err
	}

	p := httputil.NewSingleHostReverseProxy(target)

	p.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		logger.Error("gateway reverse proxy error", "target", targetURL, "path", r.URL.Path, "error", err)
		http.Error(w, `{"error":"service temporarily unavailable"}`, http.StatusBadGateway)
	}

	return &ReverseProxy{
		target: target,
		proxy:  p,
	}, nil
}

func (p *ReverseProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	r.Host = p.target.Host
	p.proxy.ServeHTTP(w, r)
}
