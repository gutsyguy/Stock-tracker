package adapter

import (
	"github.com/gin-gonic/gin"
	"github.com/gutsyguy/backend/handler"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(pool *pgxpool.Pool) *gin.Engine {
	router := gin.Default()

	api := router.Group("/api")
	{
		user := api.Group("/user")
		{
			user.POST("", handler.CreateUser(pool))
			user.GET("/:id", handler.GetUser(pool))
		}
	}

	return router
}
