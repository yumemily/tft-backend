const AppError = require("../utils/appError")

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(400, message);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`
    return new AppError(400, message);
};

const handleDuplicateErrorDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
    const message = `Duplicate field value: ${value[0]}, please try again with different value`;
    return new AppError(400, message);
};


module.exports = function (err, req, res, next) {
    err.status = err.status || "error"
    err.statusCode = err.statusCode || "500"
    if (err) {
        if (process.env.NODE_ENV === "development") {
            return res
                .status(err.statusCode)
                .json({
                    status: err.status,
                    message: err.message,
                    error: err,
                    stack: err.stack
                })
        } else if (process.env.NODE_ENV = "production") {
            let error = { ...err }

            // invalid field format (mongodb)
            if (error.name === "CastError")
                error = handleCastErrorDB(error);

            // duplicate error (generated by mongodb driver: mongoose)
            if (error.code === 11000)
                error = handleDuplicateErrorDB(error);

            // mongoose validation error
            if (error.name === "ValidationError")
                error = handleValidationErrorDB(error)

            return res
                .status(error.statusCode)
                .json({
                    status: error.status,
                    message: error.message
                })
        }
    }
    next()
}

