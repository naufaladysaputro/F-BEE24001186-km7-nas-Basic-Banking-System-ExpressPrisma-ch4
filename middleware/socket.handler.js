function registerSocketEvents(io) {
    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);
  
      // Handler untuk user registration notification
      socket.on("userRegistered", (data) => {
        console.log(`User Registered: ${data.email}`);
        io.emit("notification", { type: "userRegistered", data });
      });
  
      // Handler untuk password reset notification
      socket.on("passwordReset", (data) => {
        console.log(`Password Reset: ${data.email}`);
        io.emit("notification", { type: "passwordReset", data });
      });
  
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }
  
  module.exports = { registerSocketEvents };
  