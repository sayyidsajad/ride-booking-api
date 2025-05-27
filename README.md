+----------------+           +-----------------+           +----------------+
|     User       |<--------->|      Ride       |<--------->|     User       |
|----------------|   Rider   |-----------------|   Driver  |----------------|
| id (PK)        |           | id (PK)         |           | id (PK)        |
| name           |           | riderId (FK)    |           | name           |
| role (enum)    |           | driverId (FK)   |           | role (enum)    |
| socketId       |           | status (enum)   |           | socketId       |
| isOnline       |           | startedAt       |           | isOnline       |
| isAvailable    |           | endedAt         |           | isAvailable    |
| createdAt      |           | createdAt       |           | createdAt      |
| updatedAt      |           | updatedAt       |           | updatedAt      |
+----------------+           +-----------------+           +----------------+

Legend:
- PK = Primary Key
- FK = Foreign Key
- <---------> = One-to-Many Relationship
- Each Ride has:
  - One Rider (User with role = RIDER)
  - One optional Driver (User with role = DRIVER)
- A User can have many rides as a rider or driver