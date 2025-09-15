package db

import (
	"context"
	"log"
	"os"
	"time"
	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Init() *pgxpool.Pool {
	// Load from environment (best practice)
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Fallback to your Supabase URL if DATABASE_URL is not set
		dsn = "postgresql://postgres:yWjIJMVFMo0Q5Msm@db.hvrghcjsyecnnizahrby.supabase.co:5432/postgres"
	}
	return InitWithConfig(dsn)
}

func InitWithConfig(dsn string) *pgxpool.Pool {
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		log.Printf("Unable to parse DATABASE_URL: %v\n", err)
		return nil
	}

	// Optional: tune pool settings
	config.MaxConns = 10
	config.MaxConnIdleTime = 5 * time.Minute

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Printf("Unable to connect to database: %v\n", err)
		return nil
	}

	// Test connection
	if err := pool.Ping(context.Background()); err != nil {
		log.Printf("Unable to ping database: %v\n", err)
		pool.Close()
		return nil
	}

	log.Println("Connected to Postgres successfully!")
	Pool = pool
	return pool
}

// InitWithConfigForProduction initializes database connection for production (fails fast)
func InitWithConfigForProduction(dsn string) *pgxpool.Pool {
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		log.Fatalf("Unable to parse DATABASE_URL: %v\n", err)
	}

	// Optional: tune pool settings
	config.MaxConns = 10
	config.MaxConnIdleTime = 5 * time.Minute

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	// Test connection
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Unable to ping database: %v\n", err)
	}

	log.Println("Connected to Postgres successfully!")
	Pool = pool
	return pool
}
