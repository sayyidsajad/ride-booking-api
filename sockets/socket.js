module.exports = function setupSocket(io, prisma) {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("register", async ({ userId }) => {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { socketId: socket.id, isOnline: true },
        });
      } catch (err) {
        console.error("Failed to register socket:", err);
      }
    });

    socket.on("request-ride", async ({ riderId }) => {
      try {
        const ride = await prisma.ride.create({
          data: {
            riderId,
            status: "PENDING",
          },
          include: {
            rider: true,
            driver: true,
          },
        });

        const availableDrivers = await prisma.user.findMany({
          where: {
            role: "DRIVER",
            isAvailable: true,
            isOnline: true,
            socketId: { not: null },
          },
        });

        availableDrivers.forEach((driver) => {
          io.to(driver.socketId).emit("ride-request", {
            rideId: ride.id,
            riderId: ride.riderId,
          });
        });

        console.log(
          `Ride requested by rider ${riderId}, notified ${availableDrivers.length} drivers.`
        );
      } catch (err) {
        console.error("Error handling ride request:", err);
      }
    });

    socket.on("accept-ride", async ({ rideId, driverId }) => {
      try {
        const ride = await prisma.ride.update({
          where: { id: rideId },
          data: {
            driverId,
            status: "ASSIGNED",
          },
          include: {
            rider: true,
            driver: true,
          },
        });

        if (ride.rider?.socketId) {
          io.to(ride.rider.socketId).emit("ride-accepted", { ride });
        }
      } catch (err) {
        console.error("Error accepting ride:", err);
      }
    });

    socket.on("disconnect", async () => {
      try {
        await prisma.user.updateMany({
          where: { socketId: socket.id },
          data: { socketId: null, isOnline: false },
        });
        console.log("Disconnected:", socket.id);
      } catch (err) {
        console.error("Error on disconnect:", err);
      }
    });
  });
};
