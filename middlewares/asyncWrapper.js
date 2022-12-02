const { customError } = require("../errors/customError");

const asyncWrapper = (fn) => {
   return async (req, res, next) => {
      try {
         await fn(req, res, next);
      } catch (error) {
         if (error.name === "ValidationError") {
            const message = Object.values(error.errors)
               .map((val) => val.message)
               .join(". ");

            next(customError(400, message));
         }
         next(error);
         // next({ message: error.message, stack: error.stack, status: error.status });
      }
   };
};
module.exports = { asyncWrapper };
