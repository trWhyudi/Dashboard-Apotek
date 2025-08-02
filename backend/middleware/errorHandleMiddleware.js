export const errorHandleMiddleware = (errorfunction) => {
    return (req, res, next) => {
        Promise.resolve(errorfunction(req, res, next)).catch(next);
    }
}