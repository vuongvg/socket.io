const path = require("path");

const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.get("/", function (req, res) {
   res.sendFile(path.join(__dirname, "./index.html"));
});


io.on("connection", function (socket) {
   
   socket.on("joinRoom", ({ username, room }) => {
      users = [];

      socket.join(room)

      socket.on("setUsername", function ({ username, room }) {
         if (users.indexOf(username) > -1) {
            socket.emit("userExists", username + " username is taken! Try some other username.");
         } else {
            users.push(username); 
            socket.emit("userSet", { username });
         }
      });

      socket.on("msg", function (data) {
         //Send message to everyone
         // io.sockets.emit("newmsg", data);
         // io.emit("newmsg", data);
         io.to(room).emit("newmsg", data);
         // socket.broadcast.emit("newmsg", data);
         // socket.emit("newmsg", data);
      });
   });
});
http.listen(5001, function () {
   console.log("listening on localhost:5001");
});
