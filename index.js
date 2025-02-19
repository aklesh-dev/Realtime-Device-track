const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")))

io.on("connection", function (socket) {
  console.log('A user connected:', socket.id);

  // Handle location send
  socket.on('send-location', (data) => {
    // console.log('Location received from:', socket.id, data); // Logging for debugging
    io.emit('receive-location', { id: socket.id, ...data });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    io.emit("user-disconnected:", socket.id)
    console.log('User disconnected:', socket.id);
  });

  // Optionally, handle errors
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});


app.get("/", function (req, res) {
  res.render("index")
})

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
})