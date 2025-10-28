package main

import (
	"log"
	"net/http"

	"academyspace/backend/database"
	"academyspace/backend/internal/repository"
	"academyspace/backend/internal/services"
	transportHttp "academyspace/backend/internal/transport/http" // alias biar gak bentrok sama net/http
)

// bcryptHasher implementasi dummy untuk contoh
type bcryptHasher struct{}

func (bcryptHasher) Hash(p string) (string, error) { return p, nil }
func (bcryptHasher) Compare(h, p string) bool      { return h == p }

func main() {
	// 🔹 Hubungkan ke database PostgreSQL kamu
	err := database.Connect() // panggil fungsi Connect() dari database/db.go
	if err != nil {
		log.Fatalf("❌ Gagal konek database: %v", err)
	}
	defer database.DB.Close() // tutup koneksi saat program selesai

	// 🔹 Inisialisasi repository dan service
	userRepo := repository.NewUserRepository(database.DB)
	authSvc := services.NewAuthService(userRepo, bcryptHasher{})

	// 🔹 Inisialisasi handler HTTP
	uh := &transportHttp.UsersHandler{Auth: authSvc}

	// 🔹 Setup router sederhana pakai net/http
	mux := http.NewServeMux()
	mux.HandleFunc("/register", uh.Register)

	log.Println("✅ Server berjalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
