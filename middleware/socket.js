const { registerSocketEvents } = require("./socket.handler"); // Import handler

let io;

function initIo(server) {
  io = require("socket.io")(server);
  console.log("Socket.IO initialized!");

  // Panggil handler untuk mendaftarkan event
  registerSocketEvents(io);
}

function getIo() {
  if (!io) {
    throw new Error("Socket.IO belum diinisialisasi!");
  }
  return io;
}

module.exports = { initIo, getIo };
