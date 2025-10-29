package models

import (
	"errors"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	UserID            int       `gorm:"column:user_id;primaryKey" json:"userId"`
	Email             string    `gorm:"column:email;unique;not null" json:"email"`
	PasswordHash      string    `gorm:"column:password_hash;not null" json:"-"`
	FullName          string    `gorm:"column:full_name;not null" json:"fullName"`
	Role              string    `gorm:"column:role;not null" json:"role"`
	ProfilePictureURL string    `gorm:"column:profile_picture_url" json:"profilePictureUrl"`
	CreatedAt         time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	LastLoginAt       time.Time `gorm:"column:last_login_at" json:"lastLoginAt"`
}

func (User) TableName() string {
	return "users"
}

func (u *User) Register(db *gorm.DB) error {
	// Check if email already exists
	var count int64
	if err := db.Model(&User{}).Where("email = ?", u.Email).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hashedPassword)
	u.CreatedAt = time.Now()

	return db.Create(u).Error
}

func (u *User) Login(db *gorm.DB, email, password string) error {
	if err := db.Where("email = ?", email).First(u).Error; err != nil {
		return errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil {
		return errors.New("invalid email or password")
	}

	u.LastLoginAt = time.Now()
	db.Model(u).Update("last_login_at", u.LastLoginAt)

	return nil
}

func (u *User) UpdateProfile(db *gorm.DB, data map[string]interface{}) error {
	allowedFields := map[string]bool{
		"full_name":           true,
		"profile_picture_url": true,
	}

	updates := make(map[string]interface{})
	for key, value := range data {
		if allowedFields[key] {
			updates[key] = value
		}
	}

	return db.Model(u).Updates(updates).Error
}

func (u *User) ChangePassword(db *gorm.DB, oldPass, newPass string) error {
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(oldPass)); err != nil {
		return errors.New("old password is incorrect")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPass), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return db.Model(u).Update("password_hash", string(hashedPassword)).Error
}

func (u *User) IsAdmin() bool {
	return u.Role == "admin"
}

func (u *User) IsStudent() bool {
	return u.Role == "student"
}

type PasswordResetToken struct {
	TokenID   int       `gorm:"column:token_id;primaryKey" json:"tokenId"`
	UserID    int       `gorm:"column:user_id;not null" json:"userId"`
	Token     string    `gorm:"column:token;not null" json:"token"`
	ExpiresAt time.Time `gorm:"column:expires_at" json:"expiresAt"`
	Used      bool      `gorm:"column:used;default:false" json:"used"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (PasswordResetToken) TableName() string {
	return "password_reset_tokens"
}

func (p *PasswordResetToken) Generate(db *gorm.DB, userID int) (string, error) {
	// Generate random token (you should use crypto/rand for production)
	token := fmt.Sprintf("%d-%d", userID, time.Now().Unix())

	p.UserID = userID
	p.Token = token
	p.ExpiresAt = time.Now().Add(1 * time.Hour)
	p.CreatedAt = time.Now()

	if err := db.Create(p).Error; err != nil {
		return "", err
	}

	return token, nil
}

func (p *PasswordResetToken) Validate(db *gorm.DB, token string) error {
	if err := db.Where("token = ? AND used = false", token).First(p).Error; err != nil {
		return errors.New("invalid or expired token")
	}

	if p.IsExpired() {
		return errors.New("token has expired")
	}

	return nil
}

func (p *PasswordResetToken) MarkAsUsed(db *gorm.DB) error {
	return db.Model(p).Update("used", true).Error
}

func (p *PasswordResetToken) IsExpired() bool {
	return time.Now().After(p.ExpiresAt)
}
