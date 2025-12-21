# 📋 SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SKPL)
# UML Class Diagram - AcademySpace

**Nama Sistem:** AcademySpace - Campus Facility Reservation System  
**Versi:** 1.0  
**Tanggal:** 21 Desember 2025  

---

## 📊 1. UML Class Diagram

### 1.1 Domain Entity Classes (Complete dengan Semua Relasi)

```mermaid
classDiagram
    direction TB

    %%============================================================
    %% ENUMERATIONS
    %%============================================================

    class UserRole {
        <<enumeration>>
        admin
        user
    }

    class ApprovalAction {
        <<enumeration>>
        PENDING
        APPROVED
        REJECTED
        CANCELED
    }

    class AuditChangeType {
        <<enumeration>>
        CREATE
        UPDATE
        DELETE
        CANCEL
    }

    %%============================================================
    %% ENTITY: User
    %%============================================================

    class User {
        <<Entity>>
        -int user_id
        -string username
        -string password_hash
        -string full_name
        -UserRole role
        -string profile_picture_url
        -string verification_token
        -string recovery_token
        -boolean is_suspended
        -datetime created_at
        -datetime last_login_at
        +register() User
        +login() Token
        +logout() void
        +updateProfile() User
        +changePassword() boolean
        +uploadAvatar() string
        +deleteAvatar() boolean
    }

    %%============================================================
    %% ENTITY: Building
    %%============================================================

    class Building {
        <<Entity>>
        -int building_id
        -string name
        -string code
        -string location_description
        -string image_url
        -datetime created_at
        -datetime updated_at
        +getAll() Building[]
        +getById() Building
        +create() Building
        +update() Building
        +delete() boolean
    }

    %%============================================================
    %% ENTITY: FacilityType
    %%============================================================

    class FacilityType {
        <<Entity>>
        -int type_id
        -string name
        -string description
        +getAll() FacilityType[]
        +getById() FacilityType
        +create() FacilityType
        +update() FacilityType
        +delete() boolean
    }

    %%============================================================
    %% ENTITY: Facility
    %%============================================================

    class Facility {
        <<Entity>>
        -int facility_id
        -int type_id
        -int building_id
        -string name
        -string room_number
        -int capacity
        -int floor
        -string description
        -string layout_description
        -string photo_url
        -boolean is_active
        -datetime maintenance_until
        -string maintenance_reason
        -datetime created_at
        -datetime updated_at
        +getAll() Facility[]
        +getById() Facility
        +create() Facility
        +update() Facility
        +delete() boolean
        +setMaintenance() Facility
        +clearMaintenance() Facility
        +checkAvailability() boolean
        +getReservations() Reservation[]
    }

    %%============================================================
    %% ENTITY: ReservationStatus
    %%============================================================

    class ReservationStatus {
        <<Entity>>
        -int status_id
        -string name
        -string description
        +getAll() ReservationStatus[]
        +getById() ReservationStatus
        +getByName() ReservationStatus
    }

    %%============================================================
    %% ENTITY: Reservation
    %%============================================================

    class Reservation {
        <<Entity>>
        -int reservation_id
        -int requester_id
        -int status_id
        -string purpose
        -int attendees
        -string proposal_url
        -boolean is_canceled
        -datetime created_at
        -datetime updated_at
        +create() Reservation
        +update() Reservation
        +cancel() boolean
        +approve() Reservation
        +reject() Reservation
        +getById() Reservation
        +getByUser() Reservation[]
        +getAll() Reservation[]
    }

    %%============================================================
    %% ENTITY: ReservationItem
    %%============================================================

    class ReservationItem {
        <<Entity>>
        -int item_id
        -int reservation_id
        -int facility_id
        -datetime start_datetime
        -datetime end_datetime
        -datetime created_at
        +create() ReservationItem
        +update() ReservationItem
        +delete() boolean
        +checkConflict() boolean
    }

    %%============================================================
    %% ENTITY: ApprovalLog
    %%============================================================

    class ApprovalLog {
        <<Entity>>
        -int approval_id
        -int reservation_id
        -int acted_by
        -ApprovalAction action
        -string comment
        -datetime acted_at
        +create() ApprovalLog
        +getByReservation() ApprovalLog[]
    }

    %%============================================================
    %% ENTITY: ReservationAudit
    %%============================================================

    class ReservationAudit {
        <<Entity>>
        -int audit_id
        -int reservation_id
        -int changed_by
        -AuditChangeType change_type
        -json change_data
        -datetime changed_at
        +create() ReservationAudit
        +getByReservation() ReservationAudit[]
    }

    %%============================================================
    %% ENTITY: Notification
    %%============================================================

    class Notification {
        <<Entity>>
        -int notification_id
        -int user_id
        -int reservation_id
        -string title
        -string message
        -boolean is_read
        -int status_id
        -datetime created_at
        +create() Notification
        +getByUser() Notification[]
        +markAsRead() boolean
        +markAllAsRead() boolean
        +delete() boolean
    }

    %%============================================================
    %% ENTITY: Rating
    %%============================================================

    class Rating {
        <<Entity>>
        -int rating_id
        -int user_id
        -int facility_id
        -int reservation_id
        -int rating
        -string review
        -datetime created_at
        +create() Rating
        +getByFacility() Rating[]
        +getAverageByFacility() number
        +getByUserReservation() Rating
    }

    %%============================================================
    %% ENTITY: SystemToken
    %%============================================================

    class SystemToken {
        <<Entity>>
        -string key
        -string value
        -string description
        +get() string
        +set() boolean
        +validate() boolean
        +validateAdminToken() boolean
        +validateResetToken() boolean
    }

    %%============================================================
    %% RELATIONSHIPS - USER (Pusat Relasi Utama)
    %%============================================================
    
    %% User memiliki role
    User "1" --* "1" UserRole : memiliki

    %% User membuat reservasi
    User "1" --o "0..*" Reservation : membuat

    %% User menerima notifikasi  
    User "1" --o "0..*" Notification : menerima

    %% User menulis rating
    User "1" --o "0..*" Rating : menulis

    %% User (Admin) melakukan approval
    User "1" --o "0..*" ApprovalLog : melakukan

    %% User melakukan perubahan yang di-audit
    User "1" --o "0..*" ReservationAudit : mencatat

    %% User menggunakan SystemToken untuk validasi
    User "0..*" ..> "1" SystemToken : validates_with

    %%============================================================
    %% RELATIONSHIPS - FACILITY (Lokasi Reservasi)
    %%============================================================

    %% Building memiliki banyak Facility
    Building "1" --o "0..*" Facility : memiliki

    %% FacilityType mengkategorikan Facility
    FacilityType "1" --o "0..*" Facility : mengkategorikan

    %% Facility memiliki banyak ReservationItem
    Facility "1" --o "0..*" ReservationItem : dipesan_di

    %% Facility memiliki banyak Rating
    Facility "1" --o "0..*" Rating : dinilai_oleh

    %%============================================================
    %% RELATIONSHIPS - RESERVATION (Inti Bisnis)
    %%============================================================

    %% Reservation dimiliki oleh User
    Reservation "0..*" --* "1" User : dimiliki_oleh

    %% Reservation memiliki status
    Reservation "0..*" --* "1" ReservationStatus : berstatus

    %% Reservation memiliki banyak ReservationItem
    Reservation "1" --* "1..*" ReservationItem : berisi

    %% Reservation memiliki log approval
    Reservation "1" --o "0..*" ApprovalLog : memiliki_log

    %% Reservation memiliki audit trail
    Reservation "1" --o "0..*" ReservationAudit : memiliki_audit

    %% Reservation memicu Notification
    Reservation "1" --o "0..*" Notification : memicu

    %% Reservation bisa di-rating
    Reservation "1" --o "0..1" Rating : dapat_dinilai

    %%============================================================
    %% RELATIONSHIPS - ENUM/TYPE USAGE
    %%============================================================

    %% ApprovalLog menggunakan ApprovalAction enum
    ApprovalLog "0..*" --* "1" ApprovalAction : menggunakan

    %% ReservationAudit menggunakan AuditChangeType enum  
    ReservationAudit "0..*" --* "1" AuditChangeType : menggunakan

    %% Notification mereferensi ReservationStatus
    Notification "0..*" --o "0..1" ReservationStatus : mereferensi

    %%============================================================
    %% RELATIONSHIPS - CROSS ENTITY
    %%============================================================

    %% ReservationItem terhubung ke Facility
    ReservationItem "0..*" --* "1" Facility : untuk_fasilitas

    %% Rating terhubung ke Facility dan Reservation
    Rating "0..*" --* "1" Facility : untuk
    Rating "0..*" --* "1" Reservation : dari
```

### 1.1.1 Matriks Relasi Antar Entitas

| Dari | Ke | Tipe Relasi | Kardinalitas | Keterangan |
|------|-----|-------------|--------------|------------|
| **User** | UserRole | Composition | 1:1 | Setiap user memiliki 1 role |
| **User** | Reservation | Aggregation | 1:N | User membuat banyak reservasi |
| **User** | Notification | Aggregation | 1:N | User menerima banyak notifikasi |
| **User** | Rating | Aggregation | 1:N | User menulis banyak rating |
| **User** | ApprovalLog | Aggregation | 1:N | Admin melakukan banyak approval |
| **User** | ReservationAudit | Aggregation | 1:N | User mencatat banyak perubahan |
| **User** | SystemToken | Dependency | N:1 | User validasi dengan token |
| **Building** | Facility | Aggregation | 1:N | Gedung memiliki banyak fasilitas |
| **FacilityType** | Facility | Aggregation | 1:N | Tipe mengkategorikan fasilitas |
| **Facility** | ReservationItem | Aggregation | 1:N | Fasilitas dipesan di banyak item |
| **Facility** | Rating | Aggregation | 1:N | Fasilitas memiliki banyak rating |
| **Reservation** | User | Composition | N:1 | Reservasi dimiliki 1 user |
| **Reservation** | ReservationStatus | Composition | N:1 | Reservasi memiliki 1 status |
| **Reservation** | ReservationItem | Composition | 1:N | Reservasi berisi banyak item |
| **Reservation** | ApprovalLog | Aggregation | 1:N | Reservasi memiliki log approval |
| **Reservation** | ReservationAudit | Aggregation | 1:N | Reservasi memiliki audit trail |
| **Reservation** | Notification | Aggregation | 1:N | Reservasi memicu notifikasi |
| **Reservation** | Rating | Aggregation | 1:0..1 | Reservasi bisa di-rating sekali |
| **ReservationItem** | Facility | Composition | N:1 | Item untuk 1 fasilitas |
| **ApprovalLog** | ApprovalAction | Composition | N:1 | Log menggunakan 1 action enum |
| **ReservationAudit** | AuditChangeType | Composition | N:1 | Audit menggunakan 1 change type |
| **Notification** | ReservationStatus | Aggregation | N:0..1 | Notifikasi bisa referensi status |
| **Rating** | Facility | Composition | N:1 | Rating untuk 1 fasilitas |
| **Rating** | Reservation | Composition | N:1 | Rating dari 1 reservasi |

---

### 1.2 Service Layer Classes

```mermaid
classDiagram
    direction TB

    %%============================================================
    %% BASE SERVICE
    %%============================================================

    class BaseService~T~ {
        <<abstract>>
        #repository: BaseRepository~T~
        +findAll() T[]
        +findById(id: int) T
        +create(data: object) T
        +update(id: int, data: object) T
        +delete(id: int) boolean
    }

    %%============================================================
    %% USER SERVICE
    %%============================================================

    class UserService {
        <<Service>>
        -userRepository: UserRepository
        +findAll() User[]
        +findById(id: int) User
        +findByUsername(username: string) User
        +create(data: UserCreateDTO) User
        +update(id: int, data: UserUpdateDTO) User
        +delete(id: int) boolean
        +validateAdminToken(token: string) boolean
        +validateResetToken(token: string) boolean
        +hashPassword(password: string) string
        +comparePassword(plain: string, hash: string) boolean
    }

    %%============================================================
    %% FACILITY SERVICE
    %%============================================================

    class FacilityService {
        <<Service>>
        -facilityRepository: FacilityRepository
        +findAll(filters: FacilityFilter) Facility[]
        +findById(id: int) Facility
        +create(data: FacilityCreateDTO) Facility
        +update(id: int, data: FacilityUpdateDTO) Facility
        +delete(id: int) boolean
        +checkAvailability(facilityId: int, date: string, start: string, end: string) boolean
        +setMaintenance(id: int, until: datetime, reason: string) Facility
        +clearMaintenance(id: int) Facility
    }

    %%============================================================
    %% RESERVATION SERVICE
    %%============================================================

    class ReservationService {
        <<Service>>
        -reservationRepository: ReservationRepository
        -facilityRepository: FacilityRepository
        -userRepository: UserRepository
        -notificationRepository: NotificationRepository
        +create(data: ReservationCreateDTO) Reservation
        +getUserReservations(userId: int) Reservation[]
        +getAllReservations() Reservation[]
        +getById(id: int, requesterId: int) Reservation
        +update(id: int, userId: int, data: ReservationUpdateDTO) Reservation
        +updateStatus(id: int, status: string) Reservation
        +cancel(id: int, userId: int) boolean
        +checkConflict(facilityId: int, start: datetime, end: datetime) boolean
        +sendNotification(userId: int, message: string) void
    }

    %%============================================================
    %% NOTIFICATION SERVICE
    %%============================================================

    class NotificationService {
        <<Service>>
        -notificationRepository: NotificationRepository
        +getUserNotifications(userId: int) Notification[]
        +create(data: NotificationCreateDTO) Notification
        +markAsRead(userId: int, notificationId: int) boolean
        +markAllAsRead(userId: int) boolean
        +deleteNotification(userId: int, notificationId: int) boolean
    }

    %%============================================================
    %% RATING SERVICE
    %%============================================================

    class RatingService {
        <<Service>>
        -ratingRepository: RatingRepository
        +createRating(data: RatingCreateDTO) Rating
        +getRatingsByFacility(facilityId: int) Rating[]
        +getAverageRatingForFacility(facilityId: int) number
        +getUserRatingForReservation(userId: int, reservationId: int) Rating
        +validateRating(rating: int) boolean
    }

    %%============================================================
    %% INHERITANCE
    %%============================================================

    BaseService <|-- UserService
    BaseService <|-- FacilityService
    BaseService <|-- ReservationService
    BaseService <|-- NotificationService
    BaseService <|-- RatingService
```

---

### 1.3 Repository Layer Classes

```mermaid
classDiagram
    direction TB

    %%============================================================
    %% BASE REPOSITORY
    %%============================================================

    class BaseRepository~T~ {
        <<abstract>>
        #tableName: string
        #primaryKey: string
        #db: DatabaseConnection
        +findAll() Promise~T[]~
        +findById(id: int) Promise~T~
        +create(data: Partial~T~) Promise~T~
        +update(id: int, data: Partial~T~) Promise~T~
        +delete(id: int) Promise~boolean~
        #query(sql: string, params: any[]) Promise~QueryResult~
    }

    %%============================================================
    %% USER REPOSITORY
    %%============================================================

    class UserRepository {
        <<Repository>>
        +findAll() Promise~User[]~
        +findById(id: int) Promise~User~
        +findByUsername(username: string) Promise~User~
        +create(data: Partial~User~) Promise~User~
        +update(id: int, data: Partial~User~) Promise~User~
        +delete(id: int) Promise~boolean~
    }

    %%============================================================
    %% FACILITY REPOSITORY
    %%============================================================

    class FacilityRepository {
        <<Repository>>
        +findAll(filters: object) Promise~Facility[]~
        +findById(id: int) Promise~Facility~
        +findByBuilding(buildingId: int) Promise~Facility[]~
        +findByType(typeId: int) Promise~Facility[]~
        +create(data: Partial~Facility~) Promise~Facility~
        +update(id: int, data: Partial~Facility~) Promise~Facility~
        +delete(id: int) Promise~boolean~
    }

    %%============================================================
    %% BUILDING REPOSITORY
    %%============================================================

    class BuildingRepository {
        <<Repository>>
        +findAll() Promise~Building[]~
        +findById(id: int) Promise~Building~
    }

    %%============================================================
    %% FACILITY TYPE REPOSITORY
    %%============================================================

    class FacilityTypeRepository {
        <<Repository>>
        +findAll() Promise~FacilityType[]~
        +findById(id: int) Promise~FacilityType~
    }

    %%============================================================
    %% RESERVATION REPOSITORY
    %%============================================================

    class ReservationRepository {
        <<Repository>>
        +findAll() Promise~Reservation[]~
        +findById(id: int) Promise~Reservation~
        +findByUserId(userId: int) Promise~Reservation[]~
        +create(data: Partial~Reservation~) Promise~Reservation~
        +update(id: int, data: Partial~Reservation~) Promise~Reservation~
        +updateStatus(id: int, statusId: int) Promise~Reservation~
        +createItem(data: ReservationItem) Promise~ReservationItem~
        +updateItem(id: int, data: Partial~ReservationItem~) Promise~ReservationItem~
        +deleteItems(reservationId: int) Promise~boolean~
        +checkConflict(facilityId: int, start: string, end: string, excludeId: int) Promise~boolean~
    }

    %%============================================================
    %% NOTIFICATION REPOSITORY
    %%============================================================

    class NotificationRepository {
        <<Repository>>
        +findByUserId(userId: int) Promise~Notification[]~
        +create(data: Partial~Notification~) Promise~Notification~
        +markAsRead(userId: int, notificationId: int) Promise~boolean~
        +markAllAsRead(userId: int) Promise~boolean~
        +delete(userId: int, notificationId: int) Promise~boolean~
    }

    %%============================================================
    %% RATING REPOSITORY
    %%============================================================

    class RatingRepository {
        <<Repository>>
        +findByFacilityId(facilityId: int) Promise~Rating[]~
        +getAverageByFacilityId(facilityId: int) Promise~number~
        +findByUserAndReservation(userId: int, reservationId: int) Promise~Rating~
        +create(data: Partial~Rating~) Promise~Rating~
    }

    %%============================================================
    %% INHERITANCE
    %%============================================================

    BaseRepository <|-- UserRepository
    BaseRepository <|-- FacilityRepository
    BaseRepository <|-- BuildingRepository
    BaseRepository <|-- FacilityTypeRepository
    BaseRepository <|-- ReservationRepository
    BaseRepository <|-- NotificationRepository
    BaseRepository <|-- RatingRepository
```

---

### 1.4 Controller Layer Classes

```mermaid
classDiagram
    direction TB

    %%============================================================
    %% AUTH CONTROLLER
    %%============================================================

    class AuthController {
        <<Controller>>
        -userService: UserService
        +register(req: Request, res: Response) void
        +login(req: Request, res: Response) void
        +getMe(req: Request, res: Response) void
        +resetPassword(req: Request, res: Response) void
    }

    %%============================================================
    %% USER CONTROLLER
    %%============================================================

    class UserController {
        <<Controller>>
        -userService: UserService
        +getAllUsers(req: Request, res: Response) void
        +getUserById(req: Request, res: Response) void
        +createUser(req: Request, res: Response) void
        +updateUser(req: Request, res: Response) void
        +deleteUser(req: Request, res: Response) void
        +promoteToAdmin(req: Request, res: Response) void
        +demoteToUser(req: Request, res: Response) void
        +suspendUser(req: Request, res: Response) void
        +unsuspendUser(req: Request, res: Response) void
        +getMyProfile(req: Request, res: Response) void
        +updateMyProfile(req: Request, res: Response) void
        +updateProfileAvatar(req: Request, res: Response) void
        +deleteProfileAvatar(req: Request, res: Response) void
    }

    %%============================================================
    %% FACILITY CONTROLLER
    %%============================================================

    class FacilityController {
        <<Controller>>
        -facilityService: FacilityService
        +getAllFacilities(req: Request, res: Response) void
        +getFacilityById(req: Request, res: Response) void
        +createFacility(req: Request, res: Response) void
        +updateFacility(req: Request, res: Response) void
        +deleteFacility(req: Request, res: Response) void
        +getFacilityReservations(req: Request, res: Response) void
        +setMaintenance(req: Request, res: Response) void
        +clearMaintenance(req: Request, res: Response) void
    }

    %%============================================================
    %% BUILDING CONTROLLER
    %%============================================================

    class BuildingController {
        <<Controller>>
        +getAllBuildings(req: Request, res: Response) void
    }

    %%============================================================
    %% FACILITY TYPE CONTROLLER
    %%============================================================

    class FacilityTypeController {
        <<Controller>>
        +getAllFacilityTypes(req: Request, res: Response) void
    }

    %%============================================================
    %% RESERVATION CONTROLLER
    %%============================================================

    class ReservationController {
        <<Controller>>
        -reservationService: ReservationService
        +createReservation(req: Request, res: Response) void
        +getUserReservations(req: Request, res: Response) void
        +getAllReservations(req: Request, res: Response) void
        +getReservationById(req: Request, res: Response) void
        +updateReservation(req: Request, res: Response) void
        +updateReservationStatus(req: Request, res: Response) void
        +cancelReservation(req: Request, res: Response) void
        +getReservationStats(req: Request, res: Response) void
        +getFacilityUtilization(req: Request, res: Response) void
        +getUserActivity(req: Request, res: Response) void
    }

    %%============================================================
    %% NOTIFICATION CONTROLLER
    %%============================================================

    class NotificationController {
        <<Controller>>
        -notificationService: NotificationService
        +getUserNotifications(req: Request, res: Response) void
        +markNotificationAsRead(req: Request, res: Response) void
        +markAllNotificationsAsRead(req: Request, res: Response) void
        +deleteNotification(req: Request, res: Response) void
    }

    %%============================================================
    %% RATING CONTROLLER
    %%============================================================

    class RatingController {
        <<Controller>>
        -ratingService: RatingService
        +createRating(req: Request, res: Response) void
        +getRatingsByFacility(req: Request, res: Response) void
        +getAverageRatingForFacility(req: Request, res: Response) void
        +getUserRatingForReservation(req: Request, res: Response) void
    }

    %%============================================================
    %% DASHBOARD CONTROLLER
    %%============================================================

    class DashboardController {
        <<Controller>>
        +getDashboardStats(req: Request, res: Response) void
        +getSystemTokens(req: Request, res: Response) void
    }

    %%============================================================
    %% UPLOAD CONTROLLER
    %%============================================================

    class UploadController {
        <<Controller>>
        +uploadFile(req: Request, res: Response) void
    }
```

---

## 📋 2. Tabel Entitas

### 2.1 Tabel User

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | user_id | INT | Primary Key, Auto Increment |
| 2 | username | VARCHAR(255) | Username unik, NOT NULL |
| 3 | password_hash | VARCHAR(255) | Password terenkripsi, NOT NULL |
| 4 | full_name | VARCHAR(255) | Nama lengkap, NOT NULL |
| 5 | role | ENUM | 'admin' atau 'user' |
| 6 | profile_picture_url | VARCHAR(255) | URL foto profil |
| 7 | verification_token | VARCHAR(255) | Token verifikasi email |
| 8 | recovery_token | VARCHAR(255) | Token reset password |
| 9 | is_suspended | BOOLEAN | Status akun suspended |
| 10 | created_at | TIMESTAMP | Waktu pembuatan akun |
| 11 | last_login_at | TIMESTAMP | Waktu login terakhir |

**Methods:**
| No | Method | Return Type | Deskripsi |
|----|--------|-------------|-----------|
| 1 | register() | User | Mendaftarkan user baru |
| 2 | login() | Token | Login dan mendapatkan token |
| 3 | logout() | void | Logout dari sistem |
| 4 | updateProfile() | User | Mengupdate profil user |
| 5 | changePassword() | boolean | Mengubah password |
| 6 | uploadAvatar() | string | Upload foto profil |
| 7 | deleteAvatar() | boolean | Hapus foto profil |

---

### 2.2 Tabel Building

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | building_id | INT | Primary Key, Auto Increment |
| 2 | name | VARCHAR(255) | Nama gedung, NOT NULL |
| 3 | code | VARCHAR(50) | Kode gedung |
| 4 | location_description | TEXT | Deskripsi lokasi gedung |
| 5 | image_url | VARCHAR(255) | URL gambar gedung |
| 6 | created_at | TIMESTAMP | Waktu pembuatan |
| 7 | updated_at | TIMESTAMP | Waktu update terakhir |

**Methods:**
| No | Method | Return Type | Deskripsi |
|----|--------|-------------|-----------|
| 1 | getAll() | Building[] | Mendapatkan semua gedung |
| 2 | getById() | Building | Mendapatkan gedung by ID |
| 3 | create() | Building | Membuat gedung baru |
| 4 | update() | Building | Mengupdate data gedung |
| 5 | delete() | boolean | Menghapus gedung |

---

### 2.3 Tabel FacilityType

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | type_id | INT | Primary Key, Auto Increment |
| 2 | name | VARCHAR(255) | Nama tipe fasilitas, NOT NULL |
| 3 | description | TEXT | Deskripsi tipe fasilitas |

**Methods:**
| No | Method | Return Type | Deskripsi |
|----|--------|-------------|-----------|
| 1 | getAll() | FacilityType[] | Mendapatkan semua tipe |
| 2 | getById() | FacilityType | Mendapatkan tipe by ID |
| 3 | create() | FacilityType | Membuat tipe baru |
| 4 | update() | FacilityType | Mengupdate tipe |
| 5 | delete() | boolean | Menghapus tipe |

---

### 2.4 Tabel Facility

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | facility_id | INT | Primary Key, Auto Increment |
| 2 | type_id | INT | Foreign Key ke FacilityType |
| 3 | building_id | INT | Foreign Key ke Building |
| 4 | name | VARCHAR(255) | Nama fasilitas, NOT NULL |
| 5 | room_number | VARCHAR(50) | Nomor ruangan |
| 6 | capacity | INT | Kapasitas ruangan |
| 7 | floor | INT | Lantai lokasi |
| 8 | description | TEXT | Deskripsi fasilitas |
| 9 | layout_description | TEXT | Deskripsi layout |
| 10 | photo_url | VARCHAR(255) | URL foto fasilitas |
| 11 | is_active | BOOLEAN | Status aktif |
| 12 | maintenance_until | TIMESTAMP | Maintenance sampai tanggal |
| 13 | maintenance_reason | TEXT | Alasan maintenance |
| 14 | created_at | TIMESTAMP | Waktu pembuatan |
| 15 | updated_at | TIMESTAMP | Waktu update terakhir |

**Methods:**
| No | Method | Return Type | Deskripsi |
|----|--------|-------------|-----------|
| 1 | getAll() | Facility[] | Mendapatkan semua fasilitas |
| 2 | getById() | Facility | Mendapatkan fasilitas by ID |
| 3 | create() | Facility | Membuat fasilitas baru |
| 4 | update() | Facility | Mengupdate fasilitas |
| 5 | delete() | boolean | Menghapus fasilitas |
| 6 | setMaintenance() | Facility | Set status maintenance |
| 7 | clearMaintenance() | Facility | Clear status maintenance |
| 8 | checkAvailability() | boolean | Cek ketersediaan |
| 9 | getReservations() | Reservation[] | Mendapatkan reservasi |

---

### 2.5 Tabel ReservationStatus

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | status_id | INT | Primary Key, Auto Increment |
| 2 | name | VARCHAR(50) | Nama status, NOT NULL |
| 3 | description | TEXT | Deskripsi status |

**Status Values:**
| ID | Name | Deskripsi |
|----|------|-----------|
| 1 | PENDING | Menunggu persetujuan admin |
| 2 | APPROVED | Reservasi disetujui |
| 3 | REJECTED | Reservasi ditolak |
| 4 | CANCELED | Reservasi dibatalkan |

---

### 2.6 Tabel Reservation

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | reservation_id | INT | Primary Key, Auto Increment |
| 2 | requester_id | INT | Foreign Key ke User, NOT NULL |
| 3 | status_id | INT | Foreign Key ke ReservationStatus, NOT NULL |
| 4 | purpose | TEXT | Tujuan reservasi, NOT NULL |
| 5 | attendees | INT | Jumlah peserta |
| 6 | proposal_url | VARCHAR(255) | URL file proposal |
| 7 | is_canceled | BOOLEAN | Flag pembatalan |
| 8 | created_at | TIMESTAMP | Waktu pembuatan |
| 9 | updated_at | TIMESTAMP | Waktu update terakhir |

**Methods:**
| No | Method | Return Type | Deskripsi |
|----|--------|-------------|-----------|
| 1 | create() | Reservation | Membuat reservasi baru |
| 2 | update() | Reservation | Mengupdate reservasi |
| 3 | cancel() | boolean | Membatalkan reservasi |
| 4 | approve() | Reservation | Menyetujui reservasi |
| 5 | reject() | Reservation | Menolak reservasi |
| 6 | getById() | Reservation | Mendapatkan reservasi by ID |
| 7 | getByUser() | Reservation[] | Mendapatkan reservasi by user |
| 8 | getAll() | Reservation[] | Mendapatkan semua reservasi |

---

### 2.7 Tabel ReservationItem

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | item_id | INT | Primary Key, Auto Increment |
| 2 | reservation_id | INT | Foreign Key ke Reservation, NOT NULL |
| 3 | facility_id | INT | Foreign Key ke Facility, NOT NULL |
| 4 | start_datetime | TIMESTAMP | Waktu mulai, NOT NULL |
| 5 | end_datetime | TIMESTAMP | Waktu selesai, NOT NULL |
| 6 | created_at | TIMESTAMP | Waktu pembuatan |

**Constraints:**
- `CHECK (end_datetime > start_datetime)`
- `CHECK (facility_id IS NOT NULL)`

**Methods:**
| No | Method | Return Type | Deskripsi |
|----|--------|-------------|-----------|
| 1 | create() | ReservationItem | Membuat item baru |
| 2 | update() | ReservationItem | Mengupdate item |
| 3 | delete() | boolean | Menghapus item |
| 4 | checkConflict() | boolean | Cek konflik jadwal |

---

### 2.8 Tabel ApprovalLog

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | approval_id | INT | Primary Key, Auto Increment |
| 2 | reservation_id | INT | Foreign Key ke Reservation, NOT NULL |
| 3 | acted_by | INT | Foreign Key ke User (Admin), NOT NULL |
| 4 | action | ENUM | PENDING/APPROVED/REJECTED/CANCELED |
| 5 | comment | TEXT | Komentar approval |
| 6 | acted_at | TIMESTAMP | Waktu aksi |

**Methods:**
| No | Method | Return Type | Deskripsi |
|----|--------|-------------|-----------|
| 1 | create() | ApprovalLog | Membuat log baru |
| 2 | getByReservation() | ApprovalLog[] | Mendapatkan log by reservasi |

---

### 2.9 Tabel ReservationAudit

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | audit_id | INT | Primary Key, Auto Increment |
| 2 | reservation_id | INT | Foreign Key ke Reservation, NOT NULL |
| 3 | changed_by | INT | Foreign Key ke User |
| 4 | change_type | ENUM | CREATE/UPDATE/DELETE/CANCEL |
| 5 | change_data | JSONB | Data perubahan |
| 6 | changed_at | TIMESTAMP | Waktu perubahan |

**Methods:**
| No | Method | Return Type | Deskripsi |
|----|--------|-------------|-----------|
| 1 | create() | ReservationAudit | Membuat audit log |
| 2 | getByReservation() | ReservationAudit[] | Mendapatkan audit by reservasi |

---

### 2.10 Tabel Notification

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | notification_id | INT | Primary Key, Auto Increment |
| 2 | user_id | INT | Foreign Key ke User, NOT NULL |
| 3 | reservation_id | INT | Foreign Key ke Reservation |
| 4 | title | VARCHAR(255) | Judul notifikasi |
| 5 | message | TEXT | Isi pesan notifikasi |
| 6 | is_read | BOOLEAN | Status sudah dibaca |
| 7 | status_id | INT | Foreign Key ke ReservationStatus |
| 8 | created_at | TIMESTAMP | Waktu pembuatan |

**Methods:**
| No | Method | Return Type | Deskripsi |
|----|--------|-------------|-----------|
| 1 | create() | Notification | Membuat notifikasi baru |
| 2 | getByUser() | Notification[] | Mendapatkan notifikasi user |
| 3 | markAsRead() | boolean | Tandai sudah dibaca |
| 4 | markAllAsRead() | boolean | Tandai semua sudah dibaca |
| 5 | delete() | boolean | Hapus notifikasi |

---

### 2.11 Tabel Rating

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | rating_id | INT | Primary Key, Auto Increment |
| 2 | user_id | INT | Foreign Key ke User, NOT NULL |
| 3 | facility_id | INT | Foreign Key ke Facility, NOT NULL |
| 4 | reservation_id | INT | Foreign Key ke Reservation, NOT NULL |
| 5 | rating | INT | Nilai rating 1-5, NOT NULL |
| 6 | review | TEXT | Ulasan text |
| 7 | created_at | TIMESTAMP | Waktu pembuatan |

**Constraints:**
- `CHECK (rating >= 1 AND rating <= 5)`

**Methods:**
| No | Method | Return Type | Deskripsi |
|----|--------|-------------|-----------|
| 1 | create() | Rating | Membuat rating baru |
| 2 | getByFacility() | Rating[] | Mendapatkan rating fasilitas |
| 3 | getAverageByFacility() | number | Mendapatkan rata-rata rating |
| 4 | getByUserReservation() | Rating | Mendapatkan rating user |

---

### 2.12 Tabel SystemToken

| No | Atribut | Tipe Data | Keterangan |
|----|---------|-----------|------------|
| 1 | key | VARCHAR(255) | Primary Key |
| 2 | value | VARCHAR(255) | Nilai token, NOT NULL |
| 3 | description | TEXT | Deskripsi token |

**Token Types:**
| Key | Deskripsi |
|-----|-----------|
| ADMIN_REG_TOKEN | Token untuk registrasi admin |
| RESET_PASS_TOKEN | Token untuk reset password |

**Methods:**
| No | Method | Return Type | Deskripsi |
|----|--------|-------------|-----------|
| 1 | get() | string | Mendapatkan nilai token |
| 2 | set() | boolean | Set nilai token |
| 3 | validate() | boolean | Validasi token |

---

## 📐 3. Relasi Antar Entitas

```mermaid
erDiagram
    USER ||--o{ RESERVATION : "creates"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ RATING : "writes"
    USER ||--o{ APPROVAL_LOG : "performs"
    USER ||--o{ RESERVATION_AUDIT : "logs"
    
    BUILDING ||--o{ FACILITY : "contains"
    FACILITY_TYPE ||--o{ FACILITY : "categorizes"
    
    FACILITY ||--o{ RESERVATION_ITEM : "booked in"
    FACILITY ||--o{ RATING : "rated by"
    
    RESERVATION ||--|{ RESERVATION_ITEM : "contains"
    RESERVATION }o--|| USER : "requested by"
    RESERVATION }o--|| RESERVATION_STATUS : "has status"
    RESERVATION ||--o{ APPROVAL_LOG : "has logs"
    RESERVATION ||--o{ RESERVATION_AUDIT : "has audit"
    RESERVATION ||--o{ NOTIFICATION : "triggers"
    RESERVATION ||--o| RATING : "rated by"
    
    NOTIFICATION }o--o| RESERVATION_STATUS : "references"
```

---

## 📊 4. Ringkasan Entitas

| No | Entitas | Jumlah Atribut | Jumlah Method | Deskripsi |
|----|---------|----------------|---------------|-----------|
| 1 | User | 11 | 7 | Pengguna sistem |
| 2 | Building | 7 | 5 | Gedung kampus |
| 3 | FacilityType | 3 | 5 | Tipe fasilitas |
| 4 | Facility | 15 | 9 | Fasilitas/ruangan |
| 5 | ReservationStatus | 3 | 3 | Status reservasi |
| 6 | Reservation | 9 | 8 | Data reservasi |
| 7 | ReservationItem | 6 | 4 | Item detail reservasi |
| 8 | ApprovalLog | 6 | 2 | Log persetujuan |
| 9 | ReservationAudit | 6 | 2 | Audit trail |
| 10 | Notification | 8 | 5 | Notifikasi pengguna |
| 11 | Rating | 7 | 4 | Rating & review |
| 12 | SystemToken | 3 | 3 | Token sistem |
| **Total** | **12 Entitas** | **94 Atribut** | **57 Methods** | |

---

## 📁 5. Lokasi File

| File | Lokasi | Deskripsi |
|------|--------|-----------|
| SKPL Class Diagram | `docs/SKPL_UML_Class_Diagram.md` | Dokumen ini |
| PlantUML Version | `docs/UML_Class_Diagram.puml` | Versi PlantUML |
| Mermaid Full | `docs/UML_Class_Diagram.mermaid.md` | Versi Mermaid lengkap |
| Documentation | `docs/UML_Class_Diagram.md` | Dokumentasi umum |

---

**Dibuat oleh:** Tim Pengembang AcademySpace  
**Tanggal:** 21 Desember 2025  
**Versi Dokumen:** 1.0
