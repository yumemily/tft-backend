
class AppError extends Error { //class inherits error from built in library
    constructor(statusCode, message) {
        super(message) //call the message from the error
        this.statusCode = statusCode;
        this.message = message;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        // create a stack trace for debugging (Error obj, void obj to avoid stack polution)
        Error.captureStackTrace(this, this.constructor);
    }
}

//next(new AppError(401, "unathorized"))

module.exports = AppError;

