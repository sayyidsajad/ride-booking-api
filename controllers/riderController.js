module.exports = function createRideController(io, prisma) {
  return {
    bookRide: async (req, res) => {
      try {
        const { riderId } = req.body;
        const driver = await prisma.user.findFirst({
          where: {
            role: "DRIVER",
            isAvailable: true,
            isOnline: true,
            socketId: { not: null },
          },
        });

        if (!driver) {
          return res.status(404).json({ msg: "No drivers available" });
        }

        const ride = await prisma.ride.create({
          data: {
            riderId,
            driverId: driver.id,
            status: "PENDING",
          },
        });

        await prisma.user.update({
          where: { id: driver.id },
          data: { isAvailable: false },
        });

        const driverSocket = io.sockets.sockets.get(driver.socketId);
        if (driverSocket) {
          driverSocket.emit("ride-request", {
            rideId: ride.id,
            riderId: ride.riderId,
          });
        }

        res.json({ ride });
      } catch (error) {
        console.error("Error booking ride:", error);
        res.status(500).json({ error: "Failed to book ride" });
      }
    },

    startRide: async (req, res) => {
      try {
        const { rideId } = req.body;

        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (!ride) return res.status(404).json({ msg: "Ride not found" });

        const updatedRide = await prisma.ride.update({
          where: { id: rideId },
          data: {
            status: "STARTED",
            startedAt: new Date(),
          },
        });

        const rider = await prisma.user.findUnique({
          where: { id: updatedRide.riderId },
        });

        const riderSocket = io.sockets.sockets.get(rider?.socketId || "");
        if (riderSocket) {
          riderSocket.emit("ride-started", { rideId });
        }

        res.json({ ride: updatedRide });
      } catch (error) {
        console.error("Error starting ride:", error);
        res.status(500).json({ error: "Failed to start ride" });
      }
    },

    endRide: async (req, res) => {
      try {
        const { rideId } = req.body;

        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (!ride) return res.status(404).json({ msg: "Ride not found" });

        const updatedRide = await prisma.ride.update({
          where: { id: rideId },
          data: {
            status: "COMPLETED",
            endedAt: new Date(),
          },
        });

        if (ride.driverId) {
          await prisma.user.update({
            where: { id: ride.driverId },
            data: { isAvailable: true },
          });
        }

        const rider = await prisma.user.findUnique({
          where: { id: ride.riderId },
        });

        const riderSocket = io.sockets.sockets.get(rider?.socketId || "");
        if (riderSocket) {
          riderSocket.emit("ride-ended", { rideId });
        }

        res.json({ ride: updatedRide });
      } catch (error) {
        console.error("Error ending ride:", error);
        res.status(500).json({ error: "Failed to end ride" });
      }
    },
  };
};
