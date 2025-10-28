package services

import (
	"academyspace/backend/internal/models"
	"academyspace/backend/internal/repository"
	"context"
	"errors"
)

type PasswordHasher interface {
	Hash(pw string) (string, error)
	Compare(hash, pw string) bool
}

type AuthService struct {
	users  repository.UserRepository
	hasher PasswordHasher
}

func NewAuthService(users repository.UserRepository, hasher PasswordHasher) *AuthService {
	return &AuthService{users: users, hasher: hasher}
}

func (s *AuthService) Register(ctx context.Context, email, password, fullName string, role models.Role) (int, error) {
	if role == "" {
		role = models.RoleUser
	}
	if _, err := s.users.FindByEmail(ctx, email); err == nil {
		return 0, errors.New("email already exists")
	}
	hash, _ := s.hasher.Hash(password)
	u := &models.User{Email: email, PasswordHash: hash, FullName: fullName, Role: role}
	return s.users.Create(ctx, u)
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*models.User, error) {
	u, err := s.users.FindByEmail(ctx, email)
	if err != nil || !s.hasher.Compare(u.PasswordHash, password) {
		return nil, errors.New("invalid credentials")
	}
	return u, nil
}
