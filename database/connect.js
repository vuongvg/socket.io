const { default: mongoose } = require("mongoose");
const connectToDb = async () => {
   try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connect DB");
   } catch (error) {
      console.log(`* ERROR Connect DB: *`, error);
   }
};
module.exports = { connectToDb }; 
