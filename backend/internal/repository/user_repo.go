package repository

import (
	"academyspace/backend/internal/models"
	"context"
	"database/sql"
)

type UserRepository interface {
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	Create(ctx context.Context, u *models.User) (int, error)
}

type userRepo struct{ db *sql.DB }

func NewUserRepository(db *sql.DB) UserRepository { return &userRepo{db: db} }

func (r *userRepo) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	const q = `SELECT user_id, email, password_hash, full_name, role, profile_picture_url, created_at, last_login_at
	           FROM users WHERE email=$1`
	u := models.User{}
	var pic *string
	var last sql.NullTime
	err := r.db.QueryRowContext(ctx, q, email).Scan(
		&u.UserID, &u.Email, &u.PasswordHash, &u.FullName, &u.Role, &pic, &u.CreatedAt, &last,
	)
	if err != nil {
		return nil, err
	}
	u.ProfilePictureURL = pic
	if last.Valid {
		t := last.Time
		u.LastLoginAt = &t
	}
	return &u, nil
}

func (r *userRepo) Create(ctx context.Context, u *models.User) (int, error) {
	const q = `INSERT INTO users (email, password_hash, full_name, role, profile_picture_url, created_at)
	           VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING user_id`
	var id int
	err := r.db.QueryRowContext(ctx, q, u.Email, u.PasswordHash, u.FullName, string(u.Role), u.ProfilePictureURL).Scan(&id)
	return id, err
}
