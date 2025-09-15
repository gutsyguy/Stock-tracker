// main.go
package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gutsyguy/backend/adapter"
	"github.com/gutsyguy/backend/config"
	"github.com/gutsyguy/backend/db"
)

func main() {
	// Load configuration
	r := gin.Default()
	cfg := config.Load()

	// Initialize database connection
	pool := db.InitWithConfig(cfg.Database.URL)
	if pool == nil {
		log.Fatal("Failed to connect to database. Please check your DATABASE_URL environment variable.")
	}
	defer pool.Close()

	// Set Gin mode based on configuration
	gin.SetMode(cfg.Server.GinMode)

	// Create router with database pool
	router := adapter.NewRouter(pool)

	// Add CORS middleware
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = cfg.CORS.AllowedOrigins
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	router.Use(cors.New(corsConfig))

	log.Printf("Server starting on port %s", cfg.Server.Port)
	log.Printf("Gin mode: %s", cfg.Server.GinMode)
	log.Printf("Allowed origins: %v", cfg.CORS.AllowedOrigins)

	if err := router.Run(":" + cfg.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}


	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
