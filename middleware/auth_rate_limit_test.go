package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

func resetRateLimitState() {
	inMemoryRateLimiter = common.InMemoryRateLimiter{}
	common.RedisEnabled = false
	common.CriticalRateLimitEnable = true
	common.CriticalRateLimitNum = 1
	common.CriticalRateLimitDuration = 3600
	common.AuthRateLimitEnable = true
	common.AuthRateLimitNum = 2
	common.AuthRateLimitDuration = 3600
}

func performRateLimitRequest(router *gin.Engine, path string) int {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, path, nil)
	req.RemoteAddr = "192.0.2.10:12345"
	router.ServeHTTP(w, req)
	return w.Code
}

func TestAuthRateLimitUsesSeparateBucketFromCriticalRateLimit(t *testing.T) {
	gin.SetMode(gin.TestMode)
	resetRateLimitState()

	r := gin.New()
	r.GET("/critical", CriticalRateLimit(), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})
	r.GET("/auth", AuthRateLimit(), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	if got := performRateLimitRequest(r, "/critical"); got != http.StatusOK {
		t.Fatalf("first critical request status = %d, want %d", got, http.StatusOK)
	}
	if got := performRateLimitRequest(r, "/critical"); got != http.StatusTooManyRequests {
		t.Fatalf("second critical request status = %d, want %d", got, http.StatusTooManyRequests)
	}
	if got := performRateLimitRequest(r, "/auth"); got != http.StatusOK {
		t.Fatalf("auth request should not share critical bucket, status = %d", got)
	}
}

func TestAuthRateLimitLimitsAuthBucketIndependently(t *testing.T) {
	gin.SetMode(gin.TestMode)
	resetRateLimitState()

	r := gin.New()
	r.GET("/auth", AuthRateLimit(), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	if got := performRateLimitRequest(r, "/auth"); got != http.StatusOK {
		t.Fatalf("first auth request status = %d, want %d", got, http.StatusOK)
	}
	if got := performRateLimitRequest(r, "/auth"); got != http.StatusOK {
		t.Fatalf("second auth request status = %d, want %d", got, http.StatusOK)
	}
	if got := performRateLimitRequest(r, "/auth"); got != http.StatusTooManyRequests {
		t.Fatalf("third auth request status = %d, want %d", got, http.StatusTooManyRequests)
	}
}
