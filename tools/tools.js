function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}

function timeout(delay) {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    })
}

async function retry(obj, func, delay, ...args) {
    let retryCounter = 0;
    let lastError = null;
    while (true) {
        try {
            return await func.apply(obj, args);
        } catch (e) {
            retryCounter++;
            if (!lastError || e.toString() !== lastError.toString()) {
                console.warn(e);
                lastError = e;
            }
            console.warn("Retrying " + retryCounter + "...");
            await timeout(delay);
        }
    }
}

module.exports = {normalizePort, retry};
