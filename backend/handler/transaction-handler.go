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

// CreateTransaction creates a new user stock transaction
func CreateTransaction(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var transaction model.UserStockTransaction
		if err := c.ShouldBindJSON(&transaction); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Validate transaction type
		if transaction.TransactionType != "BUY" && transaction.TransactionType != "SELL" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "transaction type must be BUY or SELL"})
			return
		}

		transaction.ID = uuid.New()
		transaction.TransactionTime = time.Now()

		_, err := pool.Exec(context.Background(),
			`INSERT INTO user_stock_transactions (id, user_id, stock_id, transaction_type, quantity, price, transaction_time) 
			 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			transaction.ID, transaction.UserID, transaction.StockID,
			transaction.TransactionType, transaction.Quantity, transaction.Price, transaction.TransactionTime,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, transaction)
	}
}

// GetTransaction retrieves a transaction by ID
func GetTransaction(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var transaction model.UserStockTransaction
		err := pool.QueryRow(context.Background(),
			`SELECT id, user_id, stock_id, transaction_type, quantity, price, transaction_time 
			 FROM user_stock_transactions WHERE id = $1`,
			id,
		).Scan(&transaction.ID, &transaction.UserID, &transaction.StockID,
			&transaction.TransactionType, &transaction.Quantity, &transaction.Price, &transaction.TransactionTime)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
			return
		}

		c.JSON(http.StatusOK, transaction)
	}
}

// GetUserTransactions retrieves all transactions for a specific user
func GetUserTransactions(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("userId")
		limit := c.DefaultQuery("limit", "10")
		offset := c.DefaultQuery("offset", "0")

		rows, err := pool.Query(context.Background(),
			`SELECT id, user_id, stock_id, transaction_type, quantity, price, transaction_time 
			 FROM user_stock_transactions 
			 WHERE user_id = $1 
			 ORDER BY transaction_time DESC 
			 LIMIT $2 OFFSET $3`,
			userID, limit, offset,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var transactions []model.UserStockTransaction
		for rows.Next() {
			var transaction model.UserStockTransaction
			err := rows.Scan(&transaction.ID, &transaction.UserID, &transaction.StockID,
				&transaction.TransactionType, &transaction.Quantity, &transaction.Price, &transaction.TransactionTime)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			transactions = append(transactions, transaction)
		}

		c.JSON(http.StatusOK, gin.H{
			"transactions": transactions,
			"count":        len(transactions),
		})
	}
}

// GetUserPortfolio calculates user's current stock portfolio
func GetUserPortfolio(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("userId")

		rows, err := pool.Query(context.Background(),
			`SELECT 
				s.id, s.symbol, s.name,
				SUM(CASE WHEN ust.transaction_type = 'BUY' THEN ust.quantity ELSE -ust.quantity END) as net_quantity,
				AVG(CASE WHEN ust.transaction_type = 'BUY' THEN ust.price ELSE NULL END) as avg_buy_price
			 FROM user_stock_transactions ust
			 JOIN stocks s ON ust.stock_id = s.id
			 WHERE ust.user_id = $1
			 GROUP BY s.id, s.symbol, s.name
			 HAVING SUM(CASE WHEN ust.transaction_type = 'BUY' THEN ust.quantity ELSE -ust.quantity END) > 0`,
			userID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		type PortfolioItem struct {
			Stock        model.Stock `json:"stock"`
			NetQuantity  float64     `json:"netQuantity"`
			AvgBuyPrice  float64     `json:"avgBuyPrice"`
			CurrentValue float64     `json:"currentValue"`
		}

		var portfolio []PortfolioItem
		for rows.Next() {
			var item PortfolioItem
			var avgBuyPrice *float64
			err := rows.Scan(&item.Stock.ID, &item.Stock.Symbol, &item.Stock.Name,
				&item.NetQuantity, &avgBuyPrice)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			if avgBuyPrice != nil {
				item.AvgBuyPrice = *avgBuyPrice
			}
			item.CurrentValue = item.NetQuantity * item.AvgBuyPrice

			portfolio = append(portfolio, item)
		}

		c.JSON(http.StatusOK, gin.H{
			"portfolio": portfolio,
			"count":     len(portfolio),
		})
	}
}

// GetStockTransactions retrieves all transactions for a specific stock
func GetStockTransactions(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		stockID := c.Param("stockId")
		limit := c.DefaultQuery("limit", "10")
		offset := c.DefaultQuery("offset", "0")

		rows, err := pool.Query(context.Background(),
			`SELECT id, user_id, stock_id, transaction_type, quantity, price, transaction_time 
			 FROM user_stock_transactions 
			 WHERE stock_id = $1 
			 ORDER BY transaction_time DESC 
			 LIMIT $2 OFFSET $3`,
			stockID, limit, offset,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var transactions []model.UserStockTransaction
		for rows.Next() {
			var transaction model.UserStockTransaction
			err := rows.Scan(&transaction.ID, &transaction.UserID, &transaction.StockID,
				&transaction.TransactionType, &transaction.Quantity, &transaction.Price, &transaction.TransactionTime)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			transactions = append(transactions, transaction)
		}

		c.JSON(http.StatusOK, gin.H{
			"transactions": transactions,
			"count":        len(transactions),
		})
	}
}
