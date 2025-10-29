package models

import (
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type ReservationStatus struct {
	StatusID    int    `gorm:"column:status_id;primaryKey" json:"statusId"`
	Name        string `gorm:"column:name;not null" json:"name"`
	Description string `gorm:"column:description" json:"description"`
}

func (ReservationStatus) TableName() string {
	return "reservation_statuses"
}

type Reservation struct {
	ReservationID int       `gorm:"column:reservation_id;primaryKey" json:"reservationId"`
	RequesterID   int       `gorm:"column:requester_id;not null" json:"requesterId"`
	StatusID      int       `gorm:"column:status_id;not null" json:"statusId"`
	Purpose       string    `gorm:"column:purpose;not null" json:"purpose"`
	Attendees     int       `gorm:"column:attendees" json:"attendees"`
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
	IsCanceled    bool      `gorm:"column:is_canceled;default:false" json:"isCanceled"`
}

func (Reservation) TableName() string {
	return "reservations"
}

func (r *Reservation) Create(db *gorm.DB) error {
	return db.Create(r).Error
}

func (r *Reservation) Update(db *gorm.DB) error {
	return db.Save(r).Error
}

func (r *Reservation) Cancel(db *gorm.DB) error {
	return db.Model(r).Update("is_canceled", true).Error
}

func (r *Reservation) CheckAllConflicts(db *gorm.DB) (map[string]interface{}, error) {
	var items []ReservationItem
	if err := db.Where("reservation_id = ?", r.ReservationID).Find(&items).Error; err != nil {
		return nil, err
	}

	conflicts := make(map[string]interface{})
	hasConflict := false

	for _, item := range items {
		if item.FacilityID > 0 {
			var facility Facility
			if err := db.First(&facility, item.FacilityID).Error; err != nil {
				continue
			}
			conflict, _ := facility.CheckConflict(db, item.StartDatetime, item.EndDatetime, r.ReservationID)
			if conflict {
				hasConflict = true
				conflicts[fmt.Sprintf("facility_%d", item.FacilityID)] = "time slot not available"
			}
		}

		if item.EquipmentID > 0 {
			var equipment Equipment
			if err := db.First(&equipment, item.EquipmentID).Error; err != nil {
				continue
			}
			conflict, _ := equipment.CheckConflict(db, item.StartDatetime, item.EndDatetime, 1, r.ReservationID)
			if conflict {
				hasConflict = true
				conflicts[fmt.Sprintf("equipment_%d", item.EquipmentID)] = "not enough quantity available"
			}
		}
	}

	conflicts["has_conflict"] = hasConflict
	return conflicts, nil
}

func (r *Reservation) GetItems(db *gorm.DB) ([]ReservationItem, error) {
	var items []ReservationItem
	err := db.Where("reservation_id = ?", r.ReservationID).Find(&items).Error
	return items, err
}

func (r *Reservation) GetStatus(db *gorm.DB) (*ReservationStatus, error) {
	var status ReservationStatus
	err := db.First(&status, r.StatusID).Error
	return &status, err
}

func (r *Reservation) GetRequester(db *gorm.DB) (*User, error) {
	var user User
	err := db.First(&user, r.RequesterID).Error
	return &user, err
}

func (r *Reservation) Approve(db *gorm.DB, adminID int, comment string) error {
	// Get pending status
	var pendingStatus ReservationStatus
	if err := db.Where("name = ?", "Approved").First(&pendingStatus).Error; err != nil {
		return errors.New("approved status not found")
	}

	// Update reservation status
	if err := db.Model(r).Update("status_id", pendingStatus.StatusID).Error; err != nil {
		return err
	}

	// Create approval log
	log := ApprovalLog{
		ReservationID: r.ReservationID,
		ActedBy:       adminID,
		Action:        "approved",
		Comment:       comment,
		ActedAt:       time.Now(),
	}
	return log.Create(db)
}

func (r *Reservation) Reject(db *gorm.DB, adminID int, comment string) error {
	var rejectedStatus ReservationStatus
	if err := db.Where("name = ?", "Rejected").First(&rejectedStatus).Error; err != nil {
		return errors.New("rejected status not found")
	}

	if err := db.Model(r).Update("status_id", rejectedStatus.StatusID).Error; err != nil {
		return err
	}

	log := ApprovalLog{
		ReservationID: r.ReservationID,
		ActedBy:       adminID,
		Action:        "rejected",
		Comment:       comment,
		ActedAt:       time.Now(),
	}
	return log.Create(db)
}

func (r *Reservation) RequestChange(db *gorm.DB, adminID int, comment string) error {
	var changeStatus ReservationStatus
	if err := db.Where("name = ?", "Change Requested").First(&changeStatus).Error; err != nil {
		return errors.New("change requested status not found")
	}

	if err := db.Model(r).Update("status_id", changeStatus.StatusID).Error; err != nil {
		return err
	}

	log := ApprovalLog{
		ReservationID: r.ReservationID,
		ActedBy:       adminID,
		Action:        "change_requested",
		Comment:       comment,
		ActedAt:       time.Now(),
	}
	return log.Create(db)
}

func (r *Reservation) GetApprovalLogs(db *gorm.DB) ([]ApprovalLog, error) {
	var logs []ApprovalLog
	err := db.Where("reservation_id = ?", r.ReservationID).Order("acted_at DESC").Find(&logs).Error
	return logs, err
}

func (r *Reservation) GetAuditLogs(db *gorm.DB) ([]ReservationAudit, error) {
	var audits []ReservationAudit
	err := db.Where("reservation_id = ?", r.ReservationID).Order("changed_at DESC").Find(&audits).Error
	return audits, err
}

type ReservationItem struct {
	ItemID        int       `gorm:"column:item_id;primaryKey" json:"itemId"`
	ReservationID int       `gorm:"column:reservation_id;not null" json:"reservationId"`
	FacilityID    int       `gorm:"column:facility_id" json:"facilityId"`
	EquipmentID   int       `gorm:"column:equipment_id" json:"equipmentId"`
	StartDatetime time.Time `gorm:"column:start_datetime;not null" json:"startDatetime"`
	EndDatetime   time.Time `gorm:"column:end_datetime;not null" json:"endDatetime"`
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
}

func (ReservationItem) TableName() string {
	return "reservation_items"
}

func (r *ReservationItem) Create(db *gorm.DB) error {
	return db.Create(r).Error
}

func (r *ReservationItem) Update(db *gorm.DB) error {
	return db.Save(r).Error
}

func (r *ReservationItem) Delete(db *gorm.DB) error {
	return db.Delete(r).Error
}
