package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// HealthCheck provides a health check endpoint for CI/CD and monitoring
func HealthCheck(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check database connectivity
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := pool.Ping(ctx); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status":    "unhealthy",
				"timestamp": time.Now().UTC(),
				"error":     "database connection failed",
				"details":   err.Error(),
			})
			return
		}

		// Additional health checks can be added here
		// For example: check external API connectivity, cache status, etc.

		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"timestamp": time.Now().UTC(),
			"database":  "connected",
			"version":   "1.0.0",
		})
	}
}

// ReadinessCheck provides a readiness check endpoint
func ReadinessCheck(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if the application is ready to serve requests
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		// Test a simple database query
		var count int
		err := pool.QueryRow(ctx, "SELECT 1").Scan(&count)
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"ready":     false,
				"timestamp": time.Now().UTC(),
				"error":     "database not ready",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"ready":     true,
			"timestamp": time.Now().UTC(),
		})
	}
}

// LivenessCheck provides a liveness check endpoint
func LivenessCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"alive":     true,
			"timestamp": time.Now().UTC(),
		})
	}
}
