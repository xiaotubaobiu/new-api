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

func TestLaunchNewAPIOIDCRedirectsToAuthorizationEndpointWithStoredState(t *testing.T) {
	originalServerAddress := system_setting.ServerAddress
	originalOIDCSettings := *system_setting.GetOIDCSettings()
	defer func() {
		system_setting.ServerAddress = originalServerAddress
		*system_setting.GetOIDCSettings() = originalOIDCSettings
	}()

	system_setting.ServerAddress = "https://matrix.000328.xyz:2053/"
	*system_setting.GetOIDCSettings() = system_setting.OIDCSettings{
		ClientId:              "newapi",
		AuthorizationEndpoint: "https://auth.000328.xyz:2053/application/o/authorize/",
	}

	router := newOIDCLaunchTestRouter(t, nil)

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/sso/newapi?aff=D0CA", nil)
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusFound {
		t.Fatalf("expected status %d, got %d", http.StatusFound, recorder.Code)
	}

	redirectURL, err := url.Parse(recorder.Header().Get("Location"))
	if err != nil {
		t.Fatalf("expected valid redirect URL: %v", err)
	}
	if got := redirectURL.Scheme + "://" + redirectURL.Host + redirectURL.Path; got != "https://auth.000328.xyz:2053/application/o/authorize/" {
		t.Fatalf("unexpected authorization URL: %s", got)
	}

	query := redirectURL.Query()
	if got := query.Get("client_id"); got != "newapi" {
		t.Fatalf("unexpected client_id: %q", got)
	}
	if got := query.Get("redirect_uri"); got != "https://matrix.000328.xyz:2053/oauth/oidc" {
		t.Fatalf("unexpected redirect_uri: %q", got)
	}
	if got := query.Get("response_type"); got != "code" {
		t.Fatalf("unexpected response_type: %q", got)
	}
	if got := query.Get("scope"); got != "openid profile email" {
		t.Fatalf("unexpected scope: %q", got)
	}
	state := query.Get("state")
	if state == "" {
		t.Fatal("expected non-empty state")
	}

	sessionRecorder := httptest.NewRecorder()
	sessionRequest := httptest.NewRequest(http.MethodGet, "/_session", nil)
	for _, cookie := range recorder.Result().Cookies() {
		sessionRequest.AddCookie(cookie)
	}
	router.ServeHTTP(sessionRecorder, sessionRequest)
	if sessionRecorder.Code != http.StatusOK {
		t.Fatalf("expected session route status %d, got %d", http.StatusOK, sessionRecorder.Code)
	}

	var sessionData map[string]string
	if err := json.Unmarshal(sessionRecorder.Body.Bytes(), &sessionData); err != nil {
		t.Fatalf("failed to decode session data: %v", err)
	}
	if got := sessionData["oauth_state"]; got != state {
		t.Fatalf("expected stored oauth_state %q, got %q", state, got)
	}
	if got := sessionData["aff"]; got != "D0CA" {
		t.Fatalf("expected stored aff code %q, got %q", "D0CA", got)
	}
}

func TestLaunchNewAPIOIDCRedirectsExistingNewAPISessionToConsole(t *testing.T) {
	router := newOIDCLaunchTestRouter(t, func(session sessions.Session) {
		session.Set("id", 123)
	})

	seedRecorder := httptest.NewRecorder()
	seedRequest := httptest.NewRequest(http.MethodGet, "/_seed", nil)
	router.ServeHTTP(seedRecorder, seedRequest)
	if seedRecorder.Code != http.StatusNoContent {
		t.Fatalf("expected seed route status %d, got %d", http.StatusNoContent, seedRecorder.Code)
	}

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/sso/newapi", nil)
	for _, cookie := range seedRecorder.Result().Cookies() {
		request.AddCookie(cookie)
	}
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusFound {
		t.Fatalf("expected status %d, got %d", http.StatusFound, recorder.Code)
	}
	if got := recorder.Header().Get("Location"); got != "/console" {
		t.Fatalf("expected redirect to /console, got %q", got)
	}
}

func newOIDCLaunchTestRouter(t *testing.T, seed func(session sessions.Session)) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)

	router := gin.New()
	store := cookie.NewStore([]byte("test-secret"))
	router.Use(sessions.Sessions("session", store))
	router.GET("/sso/newapi", LaunchNewAPIOIDC)
	router.GET("/_seed", func(c *gin.Context) {
		session := sessions.Default(c)
		if seed != nil {
			seed(session)
		}
		if err := session.Save(); err != nil {
			t.Fatalf("failed to seed session: %v", err)
		}
		c.Status(http.StatusNoContent)
	})
	router.GET("/_session", func(c *gin.Context) {
		session := sessions.Default(c)
		data := map[string]string{}
		if state, ok := session.Get("oauth_state").(string); ok {
			data["oauth_state"] = state
		}
		if aff, ok := session.Get("aff").(string); ok {
			data["aff"] = aff
		}
		c.JSON(http.StatusOK, data)
	})

	return router
}
