package main

import (
	"github.com/gin-contrib/cors" // Import paket cors
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Gunakan middleware CORS
	// Default() mengizinkan semua origin, bagus untuk development
	r.Use(cors.Default())

	r.GET("/api/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong dari server Go! 🚀",
		})
	})

	r.Run()
}
