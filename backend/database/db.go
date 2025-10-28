package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() error {
	connStr := "host=localhost port=5432 user=postgres password=sqlismyname dbname=as_db sslmode=disable"

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("error open: %v", err)
	}

	if err := db.Ping(); err != nil {
		return fmt.Errorf("error ping: %v", err)
	}

	DB = db
	fmt.Println("✅ Koneksi database berhasil!")
	return nil
}
