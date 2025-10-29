package models

import (
	"time"

	"gorm.io/gorm"
)

type Notification struct {
	NotificationID int       `gorm:"column:notification_id;primaryKey" json:"notificationId"`
	UserID         int       `gorm:"column:user_id;not null" json:"userId"`
	ReservationID  int       `gorm:"column:reservation_id" json:"reservationId"`
	Title          string    `gorm:"column:title" json:"title"`
	Message        string    `gorm:"column:message" json:"message"`
	IsRead         bool      `gorm:"column:is_read;default:false" json:"isRead"`
	StatusID       int       `gorm:"column:status_id" json:"statusId"`
	CreatedAt      time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (Notification) TableName() string {
	return "notifications"
}

func (n *Notification) Create(db *gorm.DB) error {
	return db.Create(n).Error
}

func (n *Notification) MarkAsRead(db *gorm.DB) error {
	return db.Model(n).Update("is_read", true).Error
}

func (n *Notification) Delete(db *gorm.DB) error {
	return db.Delete(n).Error
}
