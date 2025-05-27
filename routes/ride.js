const express = require("express");

module.exports = function createRideRoutes(prisma, io) {
  const router = express.Router();

router.post("/book", async (req, res) => {
  const { riderId } = req.body;  

  try {
    const rider = await prisma.user.findUnique({
      where: { id: riderId },
    });

    if (!rider || rider.role !== "RIDER") {
      return res.status(400).json({ error: "Invalid rider ID" });
    }

    const driver = await prisma.user.findFirst({
      where: {
        role: "DRIVER",
        isAvailable: true,
        isOnline: true,
        socketId: { not: null },
      },
    });

    if (!driver) {
      return res.status(404).json({ error: "No available drivers" });
    }

    const ride = await prisma.ride.create({
      data: {
        riderId: rider.id,
        driverId: driver.id,
        status: "PENDING",
      },
      include: {
        rider: true,
        driver: true,
      },
    });

    await prisma.user.update({
      where: { id: driver.id },
      data: { isAvailable: false },
    });

    const driverSocket = io.sockets.sockets.get(driver.socketId);
    if (driverSocket) {
      driverSocket.emit("ride-request", { ride });
    }

    res.status(201).json(ride);
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Failed to book ride" });
  }
});

  router.post("/start/:rideId", async (req, res) => {
    const { rideId } = req.params;

    try {
      const ride = await prisma.ride.update({
        where: { id: rideId },
        data: {
          status: "STARTED",
          startedAt: new Date(),
        },
        include: { rider: true },
      });

      if (ride.rider?.socketId) {
        io.to(ride.rider.socketId).emit("ride-started", { ride });
      }

      res.json(ride);
    } catch (error) {
      console.error("Start ride error:", error);
      res.status(500).json({ error: "Failed to start ride" });
    }
  });

  router.post("/end/:rideId", async (req, res) => {
    const { rideId } = req.params;

    try {
      const ride = await prisma.ride.update({
        where: { id: rideId },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
        },
        include: { rider: true, driver: true },
      });

      if (ride.driverId) {
        await prisma.user.update({
          where: { id: ride.driverId },
          data: { isAvailable: true },
        });
      }

      if (ride.rider?.socketId) {
        io.to(ride.rider.socketId).emit("ride-ended", { ride });
      }

      res.json(ride);
    } catch (error) {
      console.error("End ride error:", error);
      res.status(500).json({ error: "Failed to end ride" });
    }
  });

  return router;
};