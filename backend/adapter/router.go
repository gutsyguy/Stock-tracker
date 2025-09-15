package adapter

import (
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gutsyguy/backend/config"
	"github.com/gutsyguy/backend/handler"
	"github.com/gutsyguy/backend/middleware"
	"github.com/gutsyguy/backend/service"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(pool *pgxpool.Pool) *gin.Engine {
	// Load configuration
	cfg := config.Load()

	// Initialize Supabase service
	supabaseService, err := service.NewSupabaseService(&cfg.Supabase)
	if err != nil {
		log.Printf("Warning: Supabase service not initialized: %v", err)
		// Continue without Supabase if not configured
		supabaseService = nil
	}

	router := gin.Default()

	router.Use(cors.New(cors.Config{
        AllowOrigins:     cfg.CORS.AllowedOrigins,
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

	// Health check endpoints (outside API group for easier access)
	router.GET("/health", handler.HealthCheck(pool))
	router.GET("/ready", handler.ReadinessCheck(pool))
	router.GET("/live", handler.LivenessCheck())

	api := router.Group("/api")
	{
		// Authentication endpoints (only if Supabase is configured)
		if supabaseService != nil {
			auth := api.Group("/auth")
			{
				auth.POST("/signup", handler.SignUp(supabaseService))
				auth.POST("/signin", handler.SignIn(supabaseService))
				auth.POST("/signout", handler.SignOut(supabaseService))
				auth.POST("/refresh", handler.RefreshToken(supabaseService))
				auth.GET("/profile", middleware.AuthMiddleware(cfg), handler.GetProfile(supabaseService))
				auth.GET("/protected", middleware.AuthMiddleware(cfg), handler.ProtectedEndpoint())
			}
		}

		// User endpoints
		user := api.Group("/users")
		{
			user.POST("", handler.CreateUser(pool))
			user.GET("/:id", handler.GetUserByID(pool))
			user.GET("/email/:email", handler.GetUserByEmail(pool)) // 👈 new route
		}
		// User-specific endpoints (using different path to avoid conflicts)
		userSpecific := api.Group("/user")
		if supabaseService != nil {
			userSpecific.Use(middleware.AuthMiddleware(cfg))
		}
		{
			userSpecific.GET("/:userId/transactions", handler.GetUserTransactions(pool))
			userSpecific.GET("/:userId/portfolio", handler.GetUserPortfolio(pool))
		}

		// Stock endpoints (public read, protected write)
		stock := api.Group("/stocks")
		{
			// Public stock endpoints
			stock.GET("", handler.ListStocks(pool))
			stock.GET("/:id", handler.GetStock(pool))
			stock.GET("/symbol/:symbol", handler.GetStockBySymbol(pool))
		}

		// Stock-specific endpoints (using different path to avoid conflicts)
		stockSpecific := api.Group("/stock")
		{
			stockSpecific.GET("/:stockId/transactions", handler.GetStockTransactions(pool))
			
			// Protected stock endpoints
			if supabaseService != nil {
				stockSpecific.Use(middleware.AuthMiddleware(cfg))
			}
			{
				stockSpecific.POST("", handler.CreateStock(pool))
				stockSpecific.PUT("/:id", handler.UpdateStock(pool))
				stockSpecific.DELETE("/:id", handler.DeleteStock(pool))
			}
		}

		// Transaction endpoints (protected)
		transaction := api.Group("/transactions")
		if supabaseService != nil {
			transaction.Use(middleware.AuthMiddleware(cfg))
		}
		{
			transaction.POST("", handler.CreateTransaction(pool))
			transaction.GET("/:id", handler.GetTransaction(pool))
		}
	}

	return router
}
