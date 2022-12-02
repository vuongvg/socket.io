exports.webSocket = (io) => {
   const drawData = {};
   const listRoom = {};

   io.on("connection", function (socket) {
      socket.on("createRoom", (data) => {
         try {
            const { roomName, userCreate } = data;

            listRoom[roomName] = {
               ...data,
               socketIDUserCreate: socket.id,
               member: [{ username: userCreate, role: "master", socketID: socket.id, roomName }],
            };
         } catch (error) {
            socket.emit("errorSocket", { msg: error.message, at: "create Room" });
            console.log(`  ~ error createRoom`, error);
         }
      });

      socket.on("LoginRoom", ({ room, userID }) => {
         try {
            let isCheckLoginJoinRoom = false;
            const { userCreate, socketIDUserCreate } = listRoom[room];
            const socketIDUser = socket.id;

            if (userCreate !== userID) {
               socket.to(`${socketIDUserCreate}`).emit("loginRoom", { room, userID, socketIDUser });
            } else {
               isCheckLoginJoinRoom = true;
            }
         } catch (error) {
            socket.emit("errorSocket", { msg: error.message, at: " Login Room" });
            console.log(`  ~ error  Login Room`, error);
         }
      });

      socket.on("resultLoginRoom", (data) => {
         try {
            const { joinRoom, socketIDUser, room, userID } = data;

            socket.to(`${socketIDUser}`).emit("resultLoginRoom", data);

            if (joinRoom) {
               listRoom[room].member.push({ username: userID, role: "user", socketID: socketIDUser, roomName: room });
               socket.join(room);
            }
         } catch (error) {
            socket.emit("errorSocket", { msg: error.message, at: "resultLoginRoom room" });
            console.log(`  ~ error resultLoginRoom`, error);
         }
      });

      socket.on("joinRoom", ({ room, userID }) => {
         try {
            const { userCreate, roomName } = listRoom[room];

            socket.emit("joinRoom", { userCreate, roomName });

            if (userCreate === userID) listRoom[room].socketIDUserCreate = socket.id;
            if (!room) return;

            const checkUser = listRoom[room]?.member
               .map((user) => user.username)
               .flat()
               .filter((item) => item === userID);

            if (checkUser) socket.join(room);

            // drawData[room] = drawData[room] ? drawData[room] : {};

            socket.on("drawing", (data) => {
               try {
                  if (listRoom[room].userCreate != userID) return;

                  drawData[room] = data;

                  socket.to(room).emit("drawing", data);
               } catch (error) {
                  socket.emit("errorSocket", { msg: error.message, at: "drawing" });
                  console.log(`  ~ error drawing`, error);
               }
            });

            socket.on("load-data", (room) => {
               try {
                  socket.emit("load-data", drawData[room]);
               } catch (error) {
                  socket.emit("errorSocket", { msg: error.message, at: "load-data" });
                  console.log(`  ~ error load-data`, error);
               }
            });

            socket.on("disconnect", function (data) {
               try {
                  io.of("/")
                     .in(room)
                     .clients(function (error, clients) {
                        var numClients = clients.length;
                        if (numClients == 0) {
                           delete listRoom[room];
                           drawData[room] = [];
                        }
                     });
               } catch (error) {
                  socket.emit("errorSocket", { msg: error.message, at: "disconnect" });
                  console.log(`  ~ error disconnect`, error);
               }
            });

            // Start listening for mouse move events
            socket.on("mousemove", function (data) {
               try {
                  socket.broadcast.to(data.room).emit("moving", data);
               } catch (error) {
                  socket.emit("errorSocket", { msg: error.message, at: "mousemove" });
                  console.log(`  ~ error mousemove`, error);
               }
            });
         } catch (error) {
            socket.emit("errorSocket", { msg: error.message, at: "disconnect" });
            console.log(`  ~ error disconnect`, error);
         }
      });
   });
};
