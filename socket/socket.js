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
            if (!listRoom[room]) return socket.emit("joinRoom", { msg: "Not found room" });

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
                  const numClients = io.sockets.adapter.rooms.get(room);
                  if (!numClients?.size) {
                     delete listRoom[room];
                     drawData[room] = [];
                  }
               } catch (error) {
                  socket.emit("errorSocket", { msg: error.message, at: "disconnect" });
                  console.log(`  ~ error disconnect:`, error);
               }
            });

            socket.on("check", (data) => {
               console.log(data, socket.id);
               if (userCreate === userID) socket.to(room).emit("check", data);
            });
         } catch (error) {
            socket.emit("errorSocket", { msg: error.message, at: "join room" });
            console.log(`  ~ error join room`, error);
         }
      });
   });
};
