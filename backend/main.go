// main.go
package main

import (
	"github.com/gin-gonic/gin"
	"github.com/gutsyguy/backend/adapter"
	"github.com/gutsyguy/backend/db"
)

type Router struct {
	*gin.Engine
}

func main() {
	pool := db.Init()
	defer pool.Close()

	router := adapter.NewRouter(pool)
	router.Run(":8080")
}
