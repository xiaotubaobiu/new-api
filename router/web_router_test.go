package router

import (
	"embed"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

//go:embed web/dist/index.html
var testBuildFS embed.FS

func TestRegisterServesNewAPIRegisterPage(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	SetWebRouter(r, testBuildFS, []byte("index"))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/register", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if got := w.Header().Get("Location"); got != "" {
		t.Fatalf("expected no Location header, got %q", got)
	}
	if got := w.Body.String(); got != "index" {
		t.Fatalf("expected index page %q, got %q", "index", got)
	}
}

func TestLoginServesNewAPILoginPage(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	store := cookie.NewStore([]byte("test-secret"))
	r.Use(sessions.Sessions("session", store))
	SetWebRouter(r, testBuildFS, []byte("index"))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/login", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if got := w.Header().Get("Location"); got != "" {
		t.Fatalf("expected no Location header, got %q", got)
	}
	if got := w.Body.String(); got != "index" {
		t.Fatalf("expected index page %q, got %q", "index", got)
	}
}

func TestLoginLogoutQueryServesNewAPILoginPage(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	SetWebRouter(r, testBuildFS, []byte("index"))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/login?logout=1", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, w.Code)
	}
	if got := w.Header().Get("Location"); got != "" {
		t.Fatalf("expected no Location header, got %q", got)
	}
	if got := w.Body.String(); got != "index" {
		t.Fatalf("expected index page %q, got %q", "index", got)
	}
}
