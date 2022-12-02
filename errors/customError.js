class CustomError extends Error {
   constructor(status, message) {
      super(message);
      this.status = status;
   }
}

const customError = (status, message) => {
   return new CustomError(status, message);
};
 
module.exports = { customError ,CustomError};
