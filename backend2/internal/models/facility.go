package models

import (
	"time"

	"gorm.io/gorm"
)

type FacilityType struct {
	TypeID      int    `gorm:"column:type_id;primaryKey" json:"typeId"`
	Name        string `gorm:"column:name;not null" json:"name"`
	Description string `gorm:"column:description" json:"description"`
}

func (FacilityType) TableName() string {
	return "facility_types"
}

func (f *FacilityType) Create(db *gorm.DB) error {
	return db.Create(f).Error
}

func (f *FacilityType) Update(db *gorm.DB) error {
	return db.Save(f).Error
}

func (f *FacilityType) Delete(db *gorm.DB) error {
	return db.Delete(f).Error
}

func (f *FacilityType) GetFacilities(db *gorm.DB) ([]Facility, error) {
	var facilities []Facility
	err := db.Where("type_id = ?", f.TypeID).Find(&facilities).Error
	return facilities, err
}

func (f *FacilityType) GetEquipments(db *gorm.DB) ([]Equipment, error) {
	var equipments []Equipment
	err := db.Where("type_id = ?", f.TypeID).Find(&equipments).Error
	return equipments, err
}

type Facility struct {
	FacilityID        int       `gorm:"column:facility_id;primaryKey" json:"facilityId"`
	TypeID            int       `gorm:"column:type_id;not null" json:"typeId"`
	Name              string    `gorm:"column:name;not null" json:"name"`
	Location          string    `gorm:"column:location" json:"location"`
	Capacity          int       `gorm:"column:capacity" json:"capacity"`
	LayoutDescription string    `gorm:"column:layout_description" json:"layoutDescription"`
	PhotoURL          string    `gorm:"column:photo_url" json:"photoUrl"`
	IsActive          bool      `gorm:"column:is_active;default:true" json:"isActive"`
	CreatedAt         time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt         time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updatedAt"`
}

func (Facility) TableName() string {
	return "facilities"
}

func (f *Facility) Create(db *gorm.DB) error {
	return db.Create(f).Error
}

func (f *Facility) Update(db *gorm.DB) error {
	return db.Save(f).Error
}

func (f *Facility) Delete(db *gorm.DB) error {
	return db.Delete(f).Error
}

func (f *Facility) Activate(db *gorm.DB) error {
	return db.Model(f).Update("is_active", true).Error
}

func (f *Facility) Deactivate(db *gorm.DB) error {
	return db.Model(f).Update("is_active", false).Error
}

func (f *Facility) GetAvailability(db *gorm.DB, startDate, endDate time.Time) ([]map[string]interface{}, error) {
	var items []ReservationItem
	err := db.Where("facility_id = ? AND start_datetime < ? AND end_datetime > ?",
		f.FacilityID, endDate, startDate).Find(&items).Error

	if err != nil {
		return nil, err
	}

	result := make([]map[string]interface{}, len(items))
	for i, item := range items {
		result[i] = map[string]interface{}{
			"start":  item.StartDatetime,
			"end":    item.EndDatetime,
			"status": "booked",
		}
	}

	return result, nil
}

func (f *Facility) CheckConflict(db *gorm.DB, startDate, endDate time.Time, excludeReservationID int) (bool, error) {
	var count int64
	query := db.Model(&ReservationItem{}).
		Joins("JOIN reservations ON reservation_items.reservation_id = reservations.reservation_id").
		Where("reservation_items.facility_id = ?", f.FacilityID).
		Where("reservation_items.start_datetime < ? AND reservation_items.end_datetime > ?", endDate, startDate).
		Where("reservations.is_canceled = false")

	if excludeReservationID > 0 {
		query = query.Where("reservations.reservation_id != ?", excludeReservationID)
	}

	err := query.Count(&count).Error
	return count > 0, err
}

func (f *Facility) GetReservations(db *gorm.DB, startDate, endDate time.Time) ([]Reservation, error) {
	var reservations []Reservation
	err := db.Joins("JOIN reservation_items ON reservations.reservation_id = reservation_items.reservation_id").
		Where("reservation_items.facility_id = ?", f.FacilityID).
		Where("reservation_items.start_datetime < ? AND reservation_items.end_datetime > ?", endDate, startDate).
		Find(&reservations).Error

	return reservations, err
}

func (f *Facility) GetCalendarEntries(db *gorm.DB, startDate, endDate time.Time) ([]FacilityCalendar, error) {
	var entries []FacilityCalendar
	err := db.Where("facility_id = ? AND start_datetime < ? AND end_datetime > ?",
		f.FacilityID, endDate, startDate).Find(&entries).Error
	return entries, err
}

type FacilityAvailability struct {
	AvailabilityID int       `gorm:"column:availability_id;primaryKey" json:"availabilityId"`
	FacilityID     int       `gorm:"column:facility_id;not null" json:"facilityId"`
	Reason         string    `gorm:"column:reason" json:"reason"`
	CreatedBy      int       `gorm:"column:created_by" json:"createdBy"`
	CreatedAt      time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	IsActive       bool      `gorm:"column:is_active;default:true" json:"isActive"`
}

func (FacilityAvailability) TableName() string {
	return "facility_availabilities"
}

func (f *FacilityAvailability) Create(db *gorm.DB) error {
	return db.Create(f).Error
}

func (f *FacilityAvailability) Update(db *gorm.DB) error {
	return db.Save(f).Error
}

func (f *FacilityAvailability) Toggle(db *gorm.DB) error {
	return db.Model(f).Update("is_active", !f.IsActive).Error
}

type FacilityCalendar struct {
	EntryID           int       `gorm:"column:entry_id;primaryKey" json:"entryId"`
	FacilityID        int       `gorm:"column:facility_id;not null" json:"facilityId"`
	ReservationItemID int       `gorm:"column:reservation_item_id" json:"reservationItemId"`
	StartDatetime     time.Time `gorm:"column:start_datetime;not null" json:"startDatetime"`
	EndDatetime       time.Time `gorm:"column:end_datetime;not null" json:"endDatetime"`
	CreatedBy         int       `gorm:"column:created_by" json:"createdBy"`
	CreatedAt         time.Time `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	IsActive          bool      `gorm:"column:is_active;default:true" json:"isActive"`
	Note              string    `gorm:"column:note" json:"note"`
}

func (FacilityCalendar) TableName() string {
	return "facility_calendar"
}

func (f *FacilityCalendar) Create(db *gorm.DB) error {
	return db.Create(f).Error
}

func (f *FacilityCalendar) Update(db *gorm.DB) error {
	return db.Save(f).Error
}

func (f *FacilityCalendar) Delete(db *gorm.DB) error {
	return db.Delete(f).Error
}
