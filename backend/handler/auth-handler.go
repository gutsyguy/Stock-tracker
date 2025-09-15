package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gutsyguy/backend/middleware"
	"github.com/gutsyguy/backend/service"
)

// SignUpRequest represents the request body for user registration
type SignUpRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// SignInRequest represents the request body for user authentication
type SignInRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// RefreshTokenRequest represents the request body for token refresh
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// SignUp handles user registration
func SignUp(supabaseService *service.SupabaseService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req SignUpRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user, err := supabaseService.SignUp(c.Request.Context(), req.Email, req.Password)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "User created successfully",
			"user":    user,
		})
	}
}

// SignIn handles user authentication
func SignIn(supabaseService *service.SupabaseService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req SignInRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		resp, err := supabaseService.SignIn(c.Request.Context(), req.Email, req.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"access_token":  resp.AccessToken,
			"refresh_token": resp.RefreshToken,
			"expires_in":    resp.ExpiresIn,
			"user":          resp.User,
		})
	}
}

// SignOut handles user sign out
func SignOut(supabaseService *service.SupabaseService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the access token from the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization header required"})
			return
		}

		accessToken := authHeader[7:] // Remove "Bearer " prefix

		err := supabaseService.SignOut(c.Request.Context(), accessToken)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Signed out successfully"})
	}
}

// RefreshToken handles token refresh
func RefreshToken(supabaseService *service.SupabaseService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RefreshTokenRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		resp, err := supabaseService.RefreshToken(c.Request.Context(), req.RefreshToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"access_token":  resp.AccessToken,
			"refresh_token": resp.RefreshToken,
			"expires_in":    resp.ExpiresIn,
			"user":          resp.User,
		})
	}
}

// GetProfile handles getting the current user's profile
func GetProfile(supabaseService *service.SupabaseService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := middleware.GetUserID(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		userEmail, _ := middleware.GetUserEmail(c)

		c.JSON(http.StatusOK, gin.H{
			"id":    userID,
			"email": userEmail,
		})
	}
}

// ProtectedEndpoint is an example of a protected endpoint
func ProtectedEndpoint() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, _ := middleware.GetUserID(c)
		userEmail, _ := middleware.GetUserEmail(c)

		c.JSON(http.StatusOK, gin.H{
			"message": "This is a protected endpoint",
			"user_id": userID,
			"email":   userEmail,
		})
	}
}
