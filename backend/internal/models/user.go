package models

import "time"

type Role string
const (
	RoleAdmin Role = "ADMIN"
	RoleUser  Role = "USER"
)

type User struct {
	UserID            int
	Email             string
	PasswordHash      string
	FullName          string
	Role              Role
	ProfilePictureURL *string
	CreatedAt         time.Time
	LastLoginAt       *time.Time
}

type Admin struct{ User }
func (a Admin) IsAdmin() bool { return a.Role == RoleAdmin }
