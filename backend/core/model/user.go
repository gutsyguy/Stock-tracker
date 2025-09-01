package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Username  string    `json:"username" gorm:"unique;not null" binding:"required"`
	Email     string    `json:"email" gorm:"unique;not null" binding:"required,email"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}
