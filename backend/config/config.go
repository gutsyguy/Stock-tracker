package config

import (
	"os"
	"strconv"
	"strings"
)

// Config holds all configuration for the application
type Config struct {
	Database DatabaseConfig
	Supabase SupabaseConfig
	Server   ServerConfig
	CORS     CORSConfig
	JWT      JWTConfig
	External ExternalConfig
	Logging  LoggingConfig
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	URL string
}

// SupabaseConfig holds Supabase configuration
type SupabaseConfig struct {
	URL            string
	AnonKey        string
	ServiceRoleKey string
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Port    string
	GinMode string
}

// CORSConfig holds CORS configuration
type CORSConfig struct {
	AllowedOrigins []string
}

// JWTConfig holds JWT configuration
type JWTConfig struct {
	Secret string
}

// ExternalConfig holds external API configurations
type ExternalConfig struct {
	AlphaVantageAPIKey string
	FinnhubAPIKey      string
}

// LoggingConfig holds logging configuration
type LoggingConfig struct {
	Level  string
	Format string
}

// Load loads configuration from environment variables
func Load() *Config {
	return &Config{
		Database: DatabaseConfig{
			URL: getEnv("DATABASE_URL", "postgresql://postgres:yWjIJMVFMo0Q5Msm@db.hvrghcjsyecnnizahrby.supabase.co:5432/postgres"),
		},
		Supabase: SupabaseConfig{
			URL:            getEnv("SUPABASE_URL", ""),
			AnonKey:        getEnv("SUPABASE_ANON_KEY", ""),
			ServiceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY", ""),
		},
		Server: ServerConfig{
			Port:    getEnv("PORT", "8080"),
			GinMode: getEnv("GIN_MODE", "debug"),
		},
		CORS: CORSConfig{
			AllowedOrigins: strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000"), ","),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "your-default-secret-change-in-production"),
		},
		External: ExternalConfig{
			AlphaVantageAPIKey: getEnv("ALPHA_VANTAGE_API_KEY", ""),
			FinnhubAPIKey:      getEnv("FINNHUB_API_KEY", ""),
		},
		Logging: LoggingConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "text"),
		},
	}
}

// getEnv gets environment variable with fallback to default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt gets environment variable as integer with fallback to default value
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// getEnvAsBool gets environment variable as boolean with fallback to default value
func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}
