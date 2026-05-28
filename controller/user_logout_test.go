package controller

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/QuantumNous/new-api/setting/system_setting"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func TestLogoutReturnsOIDCEndSessionRedirect(t *testing.T) {
	originalServerAddress := system_setting.ServerAddress
	originalOIDCSettings := *system_setting.GetOIDCSettings()
	defer func() {
		system_setting.ServerAddress = originalServerAddress
		*system_setting.GetOIDCSettings() = originalOIDCSettings
	}()

	system_setting.ServerAddress = "https://matrix.000328.xyz:2053/"
	*system_setting.GetOIDCSettings() = system_setting.OIDCSettings{
		EndSessionEndpoint: "https://auth.000328.xyz:2053/application/o/newapi/end-session/",
	}

	router := newLogoutTestRouter(t, func(session sessions.Session) {
		session.Set(sessionKeyAuthProvider, "oidc")
		session.Set(sessionKeyOIDCIDToken, "oidc-id-token")
	})

	response := performLogoutRequest(t, router)
	if !response.Success {
		t.Fatalf("expected logout success, got %#v", response)
	}

	redirectTo, ok := response.Data["redirect_to"].(string)
	if !ok || redirectTo == "" {
		t.Fatalf("expected redirect_to in response data, got %#v", response.Data)
	}

	redirectURL, err := url.Parse(redirectTo)
	if err != nil {
		t.Fatalf("expected valid redirect URL, got error: %v", err)
	}
	if got := redirectURL.Scheme + "://" + redirectURL.Host + redirectURL.Path; got != "https://auth.000328.xyz:2053/application/o/newapi/end-session/" {
		t.Fatalf("unexpected end-session URL: %s", got)
	}
	if got := redirectURL.Query().Get("post_logout_redirect_uri"); got != "https://matrix.000328.xyz:2053/login" {
		t.Fatalf("unexpected post_logout_redirect_uri: %q", got)
	}
	if got := redirectURL.Query().Get("id_token_hint"); got != "oidc-id-token" {
		t.Fatalf("unexpected id_token_hint: %q", got)
	}
}

func TestLogoutDoesNotReturnOIDCRedirectForNonOIDCSession(t *testing.T) {
	originalServerAddress := system_setting.ServerAddress
	originalOIDCSettings := *system_setting.GetOIDCSettings()
	defer func() {
		system_setting.ServerAddress = originalServerAddress
		*system_setting.GetOIDCSettings() = originalOIDCSettings
	}()

	system_setting.ServerAddress = "https://matrix.000328.xyz:2053/"
	*system_setting.GetOIDCSettings() = system_setting.OIDCSettings{
		EndSessionEndpoint: "https://auth.000328.xyz:2053/application/o/newapi/end-session/",
	}

	router := newLogoutTestRouter(t, func(session sessions.Session) {
		session.Set(sessionKeyAuthProvider, "github")
		session.Set(sessionKeyOIDCIDToken, "github-id-token")
	})

	response := performLogoutRequest(t, router)
	if !response.Success {
		t.Fatalf("expected logout success, got %#v", response)
	}
	if _, ok := response.Data["redirect_to"]; ok {
		t.Fatalf("expected no redirect_to for non-oidc session, got %#v", response.Data)
	}
}

type logoutResponse struct {
	Success bool           `json:"success"`
	Data    map[string]any `json:"data"`
}

func newLogoutTestRouter(t *testing.T, seed func(session sessions.Session)) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)

	router := gin.New()
	store := cookie.NewStore([]byte("test-secret"))
	router.Use(sessions.Sessions("session", store))
	router.GET("/seed", func(c *gin.Context) {
		session := sessions.Default(c)
		seed(session)
		if err := session.Save(); err != nil {
			t.Fatalf("failed to seed session: %v", err)
		}
		c.Status(http.StatusNoContent)
	})
	router.GET("/logout", Logout)

	return router
}

func performLogoutRequest(t *testing.T, router *gin.Engine) logoutResponse {
	t.Helper()

	seedRecorder := httptest.NewRecorder()
	seedRequest := httptest.NewRequest(http.MethodGet, "/seed", nil)
	router.ServeHTTP(seedRecorder, seedRequest)
	if seedRecorder.Code != http.StatusNoContent {
		t.Fatalf("expected seed route status %d, got %d", http.StatusNoContent, seedRecorder.Code)
	}

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/logout", nil)
	for _, cookie := range seedRecorder.Result().Cookies() {
		request.AddCookie(cookie)
	}
	router.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("expected logout status %d, got %d", http.StatusOK, recorder.Code)
	}

	var response logoutResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to decode logout response: %v", err)
	}
	return response
}
