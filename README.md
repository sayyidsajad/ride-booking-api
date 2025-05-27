<pre lang="markdown">

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

</pre>
