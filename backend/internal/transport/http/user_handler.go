package http

import (
	"academyspace/backend/internal/models"
	"academyspace/backend/internal/services"
	"encoding/json"
	"net/http"
)

type UsersHandler struct{ Auth *services.AuthService }

func (h *UsersHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email, Password, FullName string
		Role                      models.Role
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	id, err := h.Auth.Register(r.Context(), req.Email, req.Password, req.FullName, req.Role)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]any{"user_id": id})
}
