package model

import (
	"time"

	"github.com/google/uuid"
)

type Stock struct {
    ID        uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
    Symbol    string    `json:"symbol" gorm:"unique;not null" binding:"required"`
    Name      string    `json:"name" gorm:"not null" binding:"required"`
    CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}