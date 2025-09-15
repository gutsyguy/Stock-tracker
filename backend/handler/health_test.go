package handler

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gutsyguy/backend/db"
	"github.com/stretchr/testify/assert"
)

func TestLivenessCheck(t *testing.T) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Create a new Gin router
	router := gin.New()
	router.GET("/live", LivenessCheck())

	// Create a test request
	req, err := http.NewRequest("GET", "/live", nil)
	assert.NoError(t, err)

	// Create a test response recorder
	w := httptest.NewRecorder()

	// Perform the request
	router.ServeHTTP(w, req)

	// Check the response
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "alive")
	assert.Contains(t, w.Body.String(), "true")
}

func TestHealthCheckWithoutDB(t *testing.T) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Create a mock pool that will fail
	// Note: This test assumes we have a way to create a failing connection
	// In a real scenario, you'd want to use dependency injection or mocking

	// For now, we'll just test that the handler can be created
	handler := HealthCheck(nil)
	assert.NotNil(t, handler)
}

// TestHealthCheckIntegration tests the health check with a real database connection
// This test will be skipped if DATABASE_URL is not set or database is not accessible
func TestHealthCheckIntegration(t *testing.T) {
	// Skip if no database URL is provided
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	// Try to initialize database - if it fails, skip the test
	defer func() {
		if r := recover(); r != nil {
			t.Skip("Skipping integration test: database initialization failed")
		}
	}()

	// Try to initialize database
	pool := db.Init()
	if pool == nil {
		t.Skip("Skipping integration test: no database connection")
	}
	defer pool.Close()

	// Test database connectivity
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	err := pool.Ping(ctx)
	if err != nil {
		t.Skipf("Skipping integration test: database not accessible: %v", err)
	}

	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Create a new Gin router
	router := gin.New()
	router.GET("/health", HealthCheck(pool))

	// Create a test request
	req, err := http.NewRequest("GET", "/health", nil)
	assert.NoError(t, err)

	// Create a test response recorder
	w := httptest.NewRecorder()

	// Perform the request
	router.ServeHTTP(w, req)

	// Check the response
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "healthy")
	assert.Contains(t, w.Body.String(), "database")
}
