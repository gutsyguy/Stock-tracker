package model

import (
	"github.com/google/uuid"
	"time"
)

type UserStockTransaction struct {
	ID              uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID          uuid.UUID `json:"userId" gorm:"type:uuid;not null"`
	StockID         uuid.UUID `json:"stockId" gorm:"type:uuid;not null"`
	TransactionType string    `json:"transactionType" gorm:"type:VARCHAR(4);not null;check:transaction_type IN ('BUY','SELL')"`
	Quantity        float64   `json:"quantity" gorm:"type:numeric(20,4);not null"`
	Price           float64   `json:"price" gorm:"type:numeric(20,4);not null"`
	TransactionTime time.Time `json:"transactionTime" gorm:"autoCreateTime"`
}
