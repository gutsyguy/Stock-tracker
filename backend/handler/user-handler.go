package handler

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gutsyguy/backend/core/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

var db *sql.DB

func CreateUser(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user model.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user.ID = uuid.New()
		user.CreatedAt = time.Now()

		_, err := pool.Exec(context.Background(),
			`INSERT INTO users (id, username, email, created_at) 
			 VALUES ($1, $2, $3, $4)`,
			user.ID, user.Username, user.Email, user.CreatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, user)
	}
}

func GetUser(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var user model.User
		err := pool.QueryRow(context.Background(),
			`SELECT id, username, email, created_at 
			 FROM users WHERE id = $1`,
			id,
		).Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}
