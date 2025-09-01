// main.go
package main 

import (
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default() // Creates a Gin router with default middleware (Logger and Recovery)

	// Define a simple GET route
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// Run the server on port 8080
	router.Run(":8080")
}
