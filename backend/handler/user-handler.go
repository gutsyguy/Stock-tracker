package handler

import (
	"errors"
	"net/http"
	"time"

	
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gutsyguy/backend/core/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateUser(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user model.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user.ID = uuid.New()
		user.CreatedAt = time.Now()

		_, err := pool.Exec(c.Request.Context(),
			`INSERT INTO users (id, username, email, created_at) 
			 VALUES ($1, $2, $3, $4)`,
			user.ID, user.Username, user.Email, user.CreatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}

		c.JSON(http.StatusCreated, user)
	}
}

func GetUserByID(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var user model.User
		err := pool.QueryRow(c.Request.Context(),
			`SELECT id, username, email, created_at 
			 FROM users WHERE id = $1`,
			id,
		).Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt)

		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

func GetUserByEmail(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		email := c.Param("email")

		var user model.User
		err := pool.QueryRow(c.Request.Context(),
			`SELECT id, username, email, created_at 
			 FROM users WHERE email = $1`,
			email,
		).Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt)

		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}
