class apiError extends Error{

    constructor(statusCode, message, stack = "", errors = []){
        super(message),
        this.message = message,
        this.data = null
        this.statusCode = statusCode,
        this.errors = errors
        this.success = false

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {apiError}