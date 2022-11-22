const { listRoom } = require("../globalVar");


exports.getListRoom = ({socket}) => {
   console.log(` getListRoom`,listRoom.length);
   socket.emit("renderListRoom", listRoom);
};

exports.createRoom =({data}) => {
    // console.log("createRoom", data);
    listRoom.push(data);
    // console.log(`  ~ listRoom`, listRoom)
}