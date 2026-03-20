function handleError(statusCode, message, res, responseTime = '', access_expire = false, refresh_expire = false) {
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        access_expire,
        refresh_expire,
        ...((responseTime !== '') && {responseTime: `${responseTime}ms`})
    });
}

function handleSuccess(statusCode, message, data, res, responseTime = '') {
    // data = JSON.parse((JSON.stringify(data).replace(/null/g, '""')));
    res.status(statusCode).json({
        status: 'success',
        statusCode,
        message,
        data,
        ...((responseTime !== '') && {responseTime: `${responseTime}ms`})
    });
}


export {handleError, handleSuccess};
