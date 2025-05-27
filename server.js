const express = require("express");
const http = require("http");
const cors = require("cors");
const { PrismaClient } = require("./generated/prisma");
const createRideRoutes = require("./routes/ride");
const setupSocket = require("./sockets/socket");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const rideRoutes = createRideRoutes(prisma);
app.use("/ride", rideRoutes);

setupSocket(io, prisma);

server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
