package models

import (
	"time"

	"gorm.io/gorm"
)

type Equipment struct {
	EquipmentID int       `gorm:"column:equipment_id;primaryKey" json:"equipmentId"`
	TypeID      int       `gorm:"column:type_id;not null" json:"typeId"`
	Name        string    `gorm:"column:name;not null" json:"name"`
	Location    string    `gorm:"column:location" json:"location"`
	Quantity    int       `gorm:"column:quantity" json:"quantity"`
	Description string    `gorm:"column:description" json:"description"`
	PhotoURL    string    `gorm:"column:photo_url" json:"photoUrl"`
	IsActive    bool      `gorm:"column:is_active;default:true" json:"isActive"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (Equipment) TableName() string {
	return "equipments"
}

func (e *Equipment) Create(db *gorm.DB) error {
	return db.Create(e).Error
}

func (e *Equipment) Update(db *gorm.DB) error {
	return db.Save(e).Error
}

func (e *Equipment) Delete(db *gorm.DB) error {
	return db.Delete(e).Error
}

func (e *Equipment) Activate(db *gorm.DB) error {
	return db.Model(e).Update("is_active", true).Error
}

func (e *Equipment) Deactivate(db *gorm.DB) error {
	return db.Model(e).Update("is_active", false).Error
}

func (e *Equipment) GetAvailableQuantity(db *gorm.DB, startDate, endDate time.Time) (int, error) {
	var totalReserved int
	err := db.Model(&ReservationItem{}).
		Joins("JOIN reservations ON reservation_items.reservation_id = reservations.reservation_id").
		Where("reservation_items.equipment_id = ?", e.EquipmentID).
		Where("reservation_items.start_datetime < ? AND reservation_items.end_datetime > ?", endDate, startDate).
		Where("reservations.is_canceled = false").
		Select("COALESCE(SUM(1), 0)").
		Scan(&totalReserved).Error

	if err != nil {
		return 0, err
	}

	return e.Quantity - totalReserved, nil
}

func (e *Equipment) CheckConflict(db *gorm.DB, startDate, endDate time.Time, requestedQty, excludeReservationID int) (bool, error) {
	available, err := e.GetAvailableQuantity(db, startDate, endDate)
	if err != nil {
		return false, err
	}

	return available < requestedQty, nil
}

func (e *Equipment) GetReservations(db *gorm.DB, startDate, endDate time.Time) ([]Reservation, error) {
	var reservations []Reservation
	err := db.Joins("JOIN reservation_items ON reservations.reservation_id = reservation_items.reservation_id").
		Where("reservation_items.equipment_id = ?", e.EquipmentID).
		Where("reservation_items.start_datetime < ? AND reservation_items.end_datetime > ?", endDate, startDate).
		Find(&reservations).Error

	return reservations, err
}

func (e *Equipment) GetCalendarEntries(db *gorm.DB, startDate, endDate time.Time) ([]EquipmentCalendar, error) {
	var entries []EquipmentCalendar
	err := db.Where("equipment_id = ? AND start_datetime < ? AND end_datetime > ?",
		e.EquipmentID, endDate, startDate).Find(&entries).Error
	return entries, err
}

type EquipmentAvailability struct {
	AvailabilityID int       `gorm:"column:availability_id;primaryKey" json:"availabilityId"`
	EquipmentID    int       `gorm:"column:equipment_id;not null" json:"equipmentId"`
	Reason         string    `gorm:"column:reason" json:"reason"`
	CreatedBy      int       `gorm:"column:created_by" json:"createdBy"`
	CreatedAt      time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	IsActive       bool      `gorm:"column:is_active;default:true" json:"isActive"`
}

func (EquipmentAvailability) TableName() string {
	return "equipment_availabilities"
}

func (e *EquipmentAvailability) Create(db *gorm.DB) error {
	return db.Create(e).Error
}

func (e *EquipmentAvailability) Update(db *gorm.DB) error {
	return db.Save(e).Error
}

func (e *EquipmentAvailability) Toggle(db *gorm.DB) error {
	return db.Model(e).Update("is_active", !e.IsActive).Error
}

type EquipmentCalendar struct {
	EntryID           int       `gorm:"column:entry_id;primaryKey" json:"entryId"`
	EquipmentID       int       `gorm:"column:equipment_id;not null" json:"equipmentId"`
	ReservationItemID int       `gorm:"column:reservation_item_id" json:"reservationItemId"`
	StartDatetime     time.Time `gorm:"column:start_datetime;not null" json:"startDatetime"`
	EndDatetime       time.Time `gorm:"column:end_datetime;not null" json:"endDatetime"`
	CreatedBy         int       `gorm:"column:created_by" json:"createdBy"`
	CreatedAt         time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	IsActive          bool      `gorm:"column:is_active;default:true" json:"isActive"`
	Note              string    `gorm:"column:note" json:"note"`
}

func (EquipmentCalendar) TableName() string {
	return "equipment_calendar"
}

func (e *EquipmentCalendar) Create(db *gorm.DB) error {
	return db.Create(e).Error
}

func (e *EquipmentCalendar) Update(db *gorm.DB) error {
	return db.Save(e).Error
}

func (e *EquipmentCalendar) Delete(db *gorm.DB) error {
	return db.Delete(e).Error
}
