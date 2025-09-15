package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gutsyguy/backend/core/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CreateStock creates a new stock
func CreateStock(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var stock model.Stock
		if err := c.ShouldBindJSON(&stock); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		stock.ID = uuid.New()
		stock.CreatedAt = time.Now()

		_, err := pool.Exec(context.Background(),
			`INSERT INTO stocks (id, symbol, name, created_at) 
			 VALUES ($1, $2, $3, $4)`,
			stock.ID, stock.Symbol, stock.Name, stock.CreatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, stock)
	}
}

// GetStock retrieves a stock by ID
func GetStock(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var stock model.Stock
		err := pool.QueryRow(context.Background(),
			`SELECT id, symbol, name, created_at 
			 FROM stocks WHERE id = $1`,
			id,
		).Scan(&stock.ID, &stock.Symbol, &stock.Name, &stock.CreatedAt)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "stock not found"})
			return
		}

		c.JSON(http.StatusOK, stock)
	}
}

// GetStockBySymbol retrieves a stock by symbol
func GetStockBySymbol(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		symbol := c.Param("symbol")

		var stock model.Stock
		err := pool.QueryRow(context.Background(),
			`SELECT id, symbol, name, created_at 
			 FROM stocks WHERE symbol = $1`,
			symbol,
		).Scan(&stock.ID, &stock.Symbol, &stock.Name, &stock.CreatedAt)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "stock not found"})
			return
		}

		c.JSON(http.StatusOK, stock)
	}
}

// ListStocks retrieves all stocks with pagination
func ListStocks(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		limit := c.DefaultQuery("limit", "10")
		offset := c.DefaultQuery("offset", "0")

		rows, err := pool.Query(context.Background(),
			`SELECT id, symbol, name, created_at 
			 FROM stocks 
			 ORDER BY created_at DESC 
			 LIMIT $1 OFFSET $2`,
			limit, offset,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var stocks []model.Stock
		for rows.Next() {
			var stock model.Stock
			err := rows.Scan(&stock.ID, &stock.Symbol, &stock.Name, &stock.CreatedAt)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			stocks = append(stocks, stock)
		}

		c.JSON(http.StatusOK, gin.H{
			"stocks": stocks,
			"count":  len(stocks),
		})
	}
}

// UpdateStock updates a stock by ID
func UpdateStock(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var updateData struct {
			Symbol string `json:"symbol"`
			Name   string `json:"name"`
		}

		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, err := pool.Exec(context.Background(),
			`UPDATE stocks SET symbol = $1, name = $2 WHERE id = $3`,
			updateData.Symbol, updateData.Name, id,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if result.RowsAffected() == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "stock not found"})
			return
		}

		// Get updated stock
		var stock model.Stock
		err = pool.QueryRow(context.Background(),
			`SELECT id, symbol, name, created_at 
			 FROM stocks WHERE id = $1`,
			id,
		).Scan(&stock.ID, &stock.Symbol, &stock.Name, &stock.CreatedAt)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, stock)
	}
}

// DeleteStock deletes a stock by ID
func DeleteStock(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		result, err := pool.Exec(context.Background(),
			`DELETE FROM stocks WHERE id = $1`,
			id,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if result.RowsAffected() == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "stock not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "stock deleted successfully"})
	}
}
