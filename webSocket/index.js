const { drawData, layer, layerStorage, listRoom } = require("../globalVar");
const { getListRoom, createRoom } = require("./classRoom");
const { addLayer } = require("./layer");
const { drawing } = require("./tools");

exports.webSocket = (socket, io) => {
   socket.on("getListRoom", (data) => socket.emit("renderListRoom", listRoom));

   socket.on("createRoom", (data) => listRoom.push(data));

   socket.on("joinRoom", ({ room, userID }) => {
       drawData[room]=drawData[room]?drawData[room]:[]
      let isCheckLoginJoinRoom = false;
      const { userCreate, socketIDUserCreate } = listRoom.find((item) => item.roomName === room);
      const socketIDUser = socket.id;
      if (userCreate !== userID) {
         socket.to(`${socketIDUserCreate}`).emit("loginRoom", { room, userID, socketIDUser });
         console.log(`  ~ checkLoginRoom`);
      } else {
         isCheckLoginJoinRoom = true;
      }

      socket.on("resultJoinRoom", (data) => {
         console.log(`  ~ resultJoinRoom`, data);
         socket.to(`${data.socketIDUser}`).emit("resultJoinRoom", data);
         isCheckLoginJoinRoom = data.joinRoom;
         if (isCheckLoginJoinRoom) {
            const indexRoom = listRoom.map(item=>item.roomName).indexOf( room );
            listRoom[indexRoom].member.push(userID);
            socket.join(room);
         }
      });

      // console.log(`  ~ loginRoom`);

      if (isCheckLoginJoinRoom) {
         socket.join(room);
      }
      
      console.log(`  ~ isLoginRoom`);
      socket.emit("resultJoinRoom", { joinRoom: true });
      
      //////////////////

      socket.join(room);

      socket.on("pathMoving", (data) => {
         console.log("🚀 ~ data pathMoving", data);
         drawData[room].forEach((o) => {
            if (o.objectID === data.objectID) {
               o.data.isMoving = data.moving;
            }
         });
         socket.to(room).emit("pathMoving", data);
      });

      socket.on("drawing", ({ data, userID }) => drawing({ data, userID, socket, room }));

      // socket.on("addLayer", (data) => {
      //    console.log("🚀 ~ data addLayer", data);
      //    layer.numLayer++;
      //    layerStorage.push({
      //       id: layer.numLayer,
      //       canvas: {
      //          backgroundColor: "#ffffff",
      //          gridObj: null,
      //       },
      //    });
      //    socket.to(room).emit("addLayer", data);
      // });

      socket.on("addLayer", (data) => addLayer({ data, socket, room }));

      socket.on("deleteLayer", (data) => {
         console.log("🚀 ~ data deleteLayer", data);
         layerStorage = layerStorage.filter((item) => item.id !== data.id);
         drawData[room] = drawData[room].filter((item) => item.layer !== data.id);
         socket.to(room).emit("deleteLayer", data);
      });

      socket.on("update", (data) => {
         console.log("🚀 ~ data update", data);
         drawData[room] = data;
         socket.to(room).emit("update", data);
      });

      socket.on("loadData", (data) => {
         console.log("🚀 ~ data loadData", Object.keys(data));
         layer.numLayer = data.layerNum;
         layerStorage = data.layerStorage;
         drawData[room] = data.pool_data;
         socket.to(room).emit("loadData", data);
      });

      socket.on("fetch-data-request", (room) => {
         // console.log("fetch-data-request", room,socket.id);
         // socket.join(socket.id);
         // io.to(`${socket.id}`).to(room).emit("fetch-data-to-client", { drawData, layer, layerStorage });
         // socket.emit("fetch-data-to-client", { drawData, layer, layerStorage });
         // socket.to(socket.id).emit("fetch-data-to-client", { drawData, layer, layerStorage });
         io.to(room).emit("fetch-data-to-client", { drawData:drawData[room], layer: layer.numLayer, layerStorage });
      });

      socket.on("changeBgColor", (data) => {
         console.log("🚀 ~ data changeBgColor", data);
         layerStorage.forEach((item) => {
            if (item.id === data.id) {
               item.canvas.backgroundColor = data.backgroundColor;
            }
         });
         socket.to(room).emit("changeBgColor", data);
      });

      socket.on("changeGrid", (data) => {
         console.log("🚀 ~ data changeGrid", data);
         layerStorage.forEach((item) => {
            if (item.id === data.id) {
               item.canvas.gridObj = data.gridObj;
            }
         });
         socket.to(room).emit("changeGrid", data);
      });

      socket.on("privatemessage", (data) => {
         console.log("🚀 ~ data privatemessage", data);
      });

      socket.on("deleteObject", (data) => {
         console.log("🚀 ~ data deleteObject", data);
         deleteObjInPool(data.objectID, drawData[room], data.layer);
         socket.to(room).emit("deleteObject", data);
      });

      socket.on("generate-signature", (obj) => {
         var signature = generateSignature(obj.apiKey, obj.apiSecret, obj.meetingNumber, obj.role);
         socket.to(room).emit("generate-signature-to-client", signature);
      });

      socket.on("init-zoom", (user) => {
         console.log("init-zoom");
         socket.to(room).emit("init-zoom-to-client", user);
      });

      socket.on("join-zoom", (user) => {
         console.log("join-zoom");
         socket.to(room).emit("join-zoom-to-client", user);
      });

      socket.on("zoom-full-screen", (user) => {
         console.log("zoom-full-screen");
         socket.to(room).emit("full-screen-to-client", user);
      });

      socket.on("suonacamp", function (data) {
         socket.to(room).emit("suonacampser", data);
      });

      socket.on("setuproom", function (data) {
         var myregexp = /^[a-zA-Z0-9]+$/;

         if (myregexp.test(data.room) === true) {
            socket.leave("public");
            socket.join(data.room);
            socket.nickname = data.usernamerem;
            var listautenti = "";
            listautenti = "LIST USERS IN THIS ROOM: " + listautenti;

            socket.emit("setuproomser", {
               room: data.room,
               inforoom: "YOUR ROOM NAME IS VALID,<br />NOW YOUR PRIVATE ROOM IS " + data.room + "<br />",
               listautenti: listautenti,
            });
            socket.to(room).emit("suonacampser", data);
            socket.to(room).emit("listautentiser", {
               listautenti: listautenti,
            });
         } else {
            socket.join("public");
            socket.nickname = data.usernamerem;
            // console.log('ERRORE STANZA');
            // console.log (Object.keys(io.sockets.manager.rooms));
            socket.emit("setuproomserKO", {
               room: "public",
               inforoom:
                  "YOUR ROOM NAME IS NOT VALID,   REMEMBER TO USE AT LEAST THREE CHARACTERS OF TYPE ONLY LETTERS AND/OR NUMBERS, NOTHING ELSE.  NOW YOUR ROOM IS PUBLIC",
            });

            var roster = io.sockets.clients("public");
            var listautenti = "";
            roster.forEach(function (client) {
               listautenti = listautenti + client.nickname + "<br />";
            });
            // console.log(listautenti);
            listautenti = "LIST USERS IN THIS ROOM: " + listautenti;
            socket.to(room).emit("listautentiser", {
               listautenti: listautenti,
            });
         }
      });

      // Start listening for mouse move events
      socket.on("mousemove", function (data) {
         socket.to(room).emit("moving", data);
      });

      socket.on("salvasulserver", function (data) {
         //	var object = { foo: data.dataserver };
         var datidalclient = data.dataserver.replace(/^data:image\/\w+;base64,/, "");
         var buf = new Buffer(datidalclient, "base64");
         //var string = 'scrivo qualche cosa';
         var req = client.put(data.orario + ".png", {
            "Content-Length": buf.length,
            "Content-Type": "image/png",
         });
         req.on("response", function (res) {
            if (200 == res.statusCode) {
               // console.log('saved to %s', req.url);
            }
         });
         req.end(buf);
      });

      socket.on("doppioclick", function (data) {
         // This line sends the event (broadcasts it)
         // to everyone except the originating client.
         socket.to(room).emit("doppioclickser", data);
      });

      socket.on("chat", function (data) {
         // This line sends the event (broadcasts it)
         // to everyone except the originating client.
         socket.to(room).emit("chatser", data);
      });
      socket.on("fileperaltri", function (data) {
         // This line sends the event (broadcasts it)
         // to everyone except the originating client.
         socket.to(room).emit("fileperaltriser", data);
      });

      socket.on("updated", function (data) {
         if (data.objectID) {
            updateObjectByID(drawData[room], data);
         }
         socket.to(room).emit("updated", data);
      });

      socket.on("color", function (data) {
         currentCanvasColor = data;
         socket.to(room).emit("canvasColor", data);
      });

      socket.on("video", function (data) {
         console.log(data);
         socket.to(room).emit("video", data);
      });

      socket.on("changefont", function (data) {
         console.log(data);
         socket.to(room).emit("changefont", data);
      });

      socket.on("changesize", function (data) {
         socket.to(room).emit("changesize", data);
      });

      socket.on("camperaltri", function (data) {
         socket.to(room).emit("camperaltriser", data);
         //.to(data.room)
      });

      //   socket.on('connected', function (data) {
      //       console.log("🚀 ~ connected", data)
      //       drawData.push(data);
      //       socket.to(room).emit('connecter', data);
      //   });

      socket.on("connect-objects", function (data) {
         console.log("🚀 ~ objects", data);
         socket.to(room).emit("connect-objects", data);
      });

      socket.on("change-coordinate-line-connect", function (data) {
         console.log("🚀 ~ change-coordinate-line-connect", data);
         socket.to(room).emit("change-coordinate-line-connect", data);
      });

      socket.on("onOffName", function (data) {
         turnOnOffUsernamePoolData(data.userID, drawData[room], data.name);
         socket.to(room).emit("onOffName", data);
      });

      socket.on("ready888", function (data) {
         console.log("ready888", data);
         socket.to(room).emit("callback888", data);
      });
      socket.on("initDataNotepad", function (data) {
         console.log("initDataNotepad", data);
         socket.to(room).emit("callbackNotepad", data);
      });
   });
};

function deleteObjInPool(data, pool_data) {
   const indexDelete = pool_data.findIndex((item) => item.objectID === data);
   console.log({ indexDelete });
   pool_data.splice(indexDelete, 1);
}

function updateObjectByID(pool_data, data) {
   var index = pool_data.findIndex((item) => item.objectID == data.objectID);
   if (index >= 0) {
      if (data.moving) {
         Object.keys(data.dataChange).forEach((key) => {
            pool_data[index].data[key] = data.dataChange[key];
         });
      } else {
         pool_data[index].data = data.dataChange;
      }
   }
}
