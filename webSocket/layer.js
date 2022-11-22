const { layer, layerStorage } = require("../globalVar");

exports.addLayer = ({data, socket,room}) => {
   console.log("🚀 ~ data addLayer", data);
   layer.numLayer++;
   console.log(`  ~ layer.numLayer`, layer.numLayer)
   layerStorage.push({
      id: layer.numLayer,
      canvas: {
         backgroundColor: "#ffffff",
         gridObj: null,
      },
   });

   socket.to(room).emit("addLayer", data);
};

exports.deleteLayer = ({data,socket,room}) => {
   console.log("🚀 ~ data deleteLayer", data);

   layerStorage = layerStorage.filter((item) => item.id !== data.id);
   drawData = drawData.filter((item) => item.layer !== data.id);

   socket.to(room).emit("deleteLayer", data); 
};
