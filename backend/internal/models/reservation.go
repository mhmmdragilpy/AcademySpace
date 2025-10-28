package models

import "time"

type ReservationStatus string

const (
	StatusPending  ReservationStatus = "PENDING"
	StatusApproved ReservationStatus = "APPROVED"
	StatusRejected ReservationStatus = "REJECTED"
	StatusCanceled ReservationStatus = "CANCELED"
)

type Reservation struct {
	ReservationID int
	RequesterID   int
	Status        ReservationStatus
	Purpose       string
	Attendees     *int
	IsCanceled    bool
	CreatedAt     time.Time
	UpdatedAt     *time.Time
}
