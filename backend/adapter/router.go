package adapter

import (
	"github.com/gin-gonic/gin"
)

type Router struct{
	*gin.Engine
}

func NewRouter(){
	router := gin.Default()

	apiGroup := router.Group("api")
	{
		businessGroup := apiGroup.Group("/business")
		{
			businessGroup.GET("")
			businessGroup.GET(":id")
			businessGroup.GET("name/:name")
			businessGroup.POST("")
			businessGroup.PUT(":id")
			businessGroup.DELETE(":id")
		}
	}
}