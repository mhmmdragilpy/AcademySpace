
# Unified AcademySpace Architecture Class Diagram

This diagram represents the complete architecture of the AcademySpace system, including Entities, Services, Repositories, and Controllers, along with their relationships.

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
    %% ENTITIES (DOMAIN LAYER)
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

    class ReservationStatus {
        <<Entity>>
        -int status_id
        -string name
        -string description
        +getAll() ReservationStatus[]
        +getById() ReservationStatus
        +getByName() ReservationStatus
    }

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
    %% REPOSITORIES (DATA ACCESS LAYER)
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

    class UserRepository {
        <<Repository>>
        +findAll() Promise~User[]~
        +findById(id: int) Promise~User~
        +findByUsername(username: string) Promise~User~
        +create(data: Partial~User~) Promise~User~
        +update(id: int, data: Partial~User~) Promise~User~
        +delete(id: int) Promise~boolean~
    }

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

    class BuildingRepository {
        <<Repository>>
        +findAll() Promise~Building[]~
        +findById(id: int) Promise~Building~
    }

    class FacilityTypeRepository {
        <<Repository>>
        +findAll() Promise~FacilityType[]~
        +findById(id: int) Promise~FacilityType~
    }

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

    class NotificationRepository {
        <<Repository>>
        +findByUserId(userId: int) Promise~Notification[]~
        +create(data: Partial~Notification~) Promise~Notification~
        +markAsRead(userId: int, notificationId: int) Promise~boolean~
        +markAllAsRead(userId: int) Promise~boolean~
        +delete(userId: int, notificationId: int) Promise~boolean~
    }

    class RatingRepository {
        <<Repository>>
        +findByFacilityId(facilityId: int) Promise~Rating[]~
        +getAverageByFacilityId(facilityId: int) Promise~number~
        +findByUserAndReservation(userId: int, reservationId: int) Promise~Rating~
        +create(data: Partial~Rating~) Promise~Rating~
    }

    %%============================================================
    %% SERVICES (BUSINESS LOGIC LAYER)
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

    class NotificationService {
        <<Service>>
        -notificationRepository: NotificationRepository
        +getUserNotifications(userId: int) Notification[]
        +create(data: NotificationCreateDTO) Notification
        +markAsRead(userId: int, notificationId: int) boolean
        +markAllAsRead(userId: int) boolean
        +deleteNotification(userId: int, notificationId: int) boolean
    }

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
    %% CONTROLLERS (PRESENTATION LAYER)
    %%============================================================

    class AuthController {
        <<Controller>>
        -userService: UserService
        +register(req: Request, res: Response) void
        +login(req: Request, res: Response) void
        +getMe(req: Request, res: Response) void
        +resetPassword(req: Request, res: Response) void
        +logout(req: Request, res: Response) void
    }

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

    class BuildingController {
        <<Controller>>
        +getAllBuildings(req: Request, res: Response) void
    }

    class FacilityTypeController {
        <<Controller>>
        +getAllFacilityTypes(req: Request, res: Response) void
    }

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

    class NotificationController {
        <<Controller>>
        -notificationService: NotificationService
        +getUserNotifications(req: Request, res: Response) void
        +markNotificationAsRead(req: Request, res: Response) void
        +markAllNotificationsAsRead(req: Request, res: Response) void
        +deleteNotification(req: Request, res: Response) void
    }

    class RatingController {
        <<Controller>>
        -ratingService: RatingService
        +createRating(req: Request, res: Response) void
        +getRatingsByFacility(req: Request, res: Response) void
        +getAverageRatingForFacility(req: Request, res: Response) void
        +getUserRatingForReservation(req: Request, res: Response) void
    }

    class DashboardController {
        <<Controller>>
        +getDashboardStats(req: Request, res: Response) void
        +getSystemTokens(req: Request, res: Response) void
    }

    class UploadController {
        <<Controller>>
        +uploadFile(req: Request, res: Response) void
    }

    %%============================================================
    %% RELATIONSHIPS - INHERITANCE
    %%============================================================
    
    BaseRepository <|-- UserRepository
    BaseRepository <|-- FacilityRepository
    BaseRepository <|-- BuildingRepository
    BaseRepository <|-- FacilityTypeRepository
    BaseRepository <|-- ReservationRepository
    BaseRepository <|-- NotificationRepository
    BaseRepository <|-- RatingRepository

    BaseService <|-- UserService
    BaseService <|-- FacilityService
    BaseService <|-- ReservationService
    BaseService <|-- NotificationService
    BaseService <|-- RatingService

    %%============================================================
    %% RELATIONSHIPS - ARCHITECTURAL DEPENDENCIES
    %%============================================================

    %% Controller -> Service
    AuthController ..> UserService : uses
    UserController ..> UserService : uses
    FacilityController ..> FacilityService : uses
    ReservationController ..> ReservationService : uses
    NotificationController ..> NotificationService : uses
    RatingController ..> RatingService : uses

    %% Service -> Repository
    UserService ..> UserRepository : uses
    FacilityService ..> FacilityRepository : uses
    ReservationService ..> ReservationRepository : uses
    ReservationService ..> FacilityRepository : uses
    ReservationService ..> UserRepository : uses
    ReservationService ..> NotificationRepository : uses
    NotificationService ..> NotificationRepository : uses
    RatingService ..> RatingRepository : uses

    %%============================================================
    %% RELATIONSHIPS - ENTITIES (DOMAIN MODEL)
    %%============================================================
    
    %% User
    User "1" *-- "1" UserRole
    User "1" --o "0..*" Reservation : creates
    User "1" --o "0..*" Notification : receives
    User "1" --o "0..*" Rating : writes
    User "1" --o "0..*" ApprovalLog : performs
    User "1" --o "0..*" ReservationAudit : logs
    User "0..*" ..> "1" SystemToken : validates_with

    %% Building & Facility
    Building "1" --o "0..*" Facility : contains
    FacilityType "1" --o "0..*" Facility : categorizes
    Facility "1" --o "0..*" ReservationItem : booked_in
    Facility "1" --o "0..*" Rating : has_ratings

    %% Reservation
    Reservation "0..*" --* "1" User : requested_by
    Reservation "0..*" --* "1" ReservationStatus : status
    Reservation "1" *-- "1..*" ReservationItem : contains
    Reservation "1" --o "0..*" ApprovalLog : has_logs
    Reservation "1" --o "0..*" ReservationAudit : has_audit
    Reservation "1" --o "0..*" Notification : triggers
    Reservation "1" --o "0..1" Rating : rated

    %% Reservation Item
    ReservationItem "0..*" --* "1" Facility : for

    %% Enums Usage
    ApprovalLog "0..*" --* "1" ApprovalAction : uses
    ReservationAudit "0..*" --* "1" AuditChangeType : uses
    Notification "0..*" --o "0..1" ReservationStatus : references
```
