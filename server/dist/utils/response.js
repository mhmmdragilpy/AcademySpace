export const sendResponse = (res, statusCode, data, message = null, status = 'success') => {
    const response = {
        status,
        data,
        message,
    };
    res.status(statusCode).json(response);
};
export const sendSuccess = (res, data, message = null) => {
    sendResponse(res, 200, data, message, 'success');
};
export const sendCreated = (res, data, message = null) => {
    sendResponse(res, 201, data, message, 'success');
};
export const sendError = (res, statusCode, message, status = 'error') => {
    sendResponse(res, statusCode, null, message, status);
};
//# sourceMappingURL=response.js.map