const { drawData, listRoom } = require("../globalVar");

exports.pathMoving = ({ data, socket, room }) => {
   console.log("🚀 ~ data pathMoving", data);
   drawData[room].forEach((o) => {
      if (o.objectID === data.objectID) {
         o.data.isMoving = data.moving;
      }
   });
   socket.to(room).emit("pathMoving", data);
};

exports.drawing = ({ data, userID, socket, room }) => {
   console.log(`  ~ userID`, userID);
   // console.log("🚀 ~ drawing",  Object.keys(data))
   drawData[room].push(data);
   console.log(`  ~ drawData`, drawData[room]);
   const roomItem = listRoom.find((item) => item.roomName === room);
//    if (roomItem.userCreate != userID) return;
   socket.to(room).emit("drawing", data);
   // io.to(room).emit('drawing', data);
};
