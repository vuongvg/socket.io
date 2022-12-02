const { customError } = require("./customError");

const wrap = async (fn) => {
   return async(...arg)=>{
      try {
         await fn(arg);
      } catch (error) {
         if (error.name === "ValidationError") {
            const message = Object.values(error.errors)
            .map((val) => val.message)
            .join(". ");
            throw customError(400, message);
         }
         throw customError(400, error);
         // next({ message: error.message, stack: error.stack, status: error.status });
      }
   }
};
module.exports = { wrap };
