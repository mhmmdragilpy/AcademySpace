package models

import (
	"time"

	"gorm.io/gorm"
)

type ApprovalLog struct {
	ApprovalID    int       `gorm:"column:approval_id;primaryKey" json:"approvalId"`
	ReservationID int       `gorm:"column:reservation_id;not null" json:"reservationId"`
	ActedBy       int       `gorm:"column:acted_by;not null" json:"actedBy"`
	Action        string    `gorm:"column:action;not null" json:"action"`
	Comment       string    `gorm:"column:comment" json:"comment"`
	ActedAt       time.Time `gorm:"column:acted_at" json:"actedAt"`
}

func (ApprovalLog) TableName() string {
	return "approval_logs"
}

func (a *ApprovalLog) Create(db *gorm.DB) error {
	return db.Create(a).Error
}

type ReservationAudit struct {
	AuditID       int       `gorm:"column:audit_id;primaryKey" json:"auditId"`
	ReservationID int       `gorm:"column:reservation_id;not null" json:"reservationId"`
	ChangedBy     int       `gorm:"column:changed_by" json:"changedBy"`
	ChangeType    string    `gorm:"column:change_type;not null" json:"changeType"`
	ChangeData    string    `gorm:"column:change_data" json:"changeData"`
	ChangedAt     time.Time `gorm:"column:changed_at" json:"changedAt"`
}

func (ReservationAudit) TableName() string {
	return "reservation_audit"
}

func (r *ReservationAudit) Create(db *gorm.DB) error {
	return db.Create(r).Error
}
