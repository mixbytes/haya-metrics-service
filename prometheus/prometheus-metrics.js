const client = require('prom-client');

class PrometheusMetrics {
    constructor(data) {
        Object.keys(data).forEach(key => {
            let snake = key.replace(/(.+?)([A-Z])/g, "$1_$2").toLowerCase();
            let config = {
                name: snake,
                help: snake
            };

            switch (data[key].type) {
                case "gauge":
                    this[key] = new client.Gauge(config);
                    this[key].set(data[key].value);
                    break;
                case "counter":
                    this[key] = new client.Counter(config);
                    this[key].inc(data[key].value);
                    break;
            }
        });
    }

    updateData(data) {
        Object.keys(data).forEach(key => {
            if (!this[key])
                return;
            switch (data[key].type) {
                case "gauge":
                    this[key].set(data[key].value);
                    break;
                case "counter":
                    this[key].inc(data[key].value - this[key].get().values[0].value);
                    break;
            }
        });
    }

    getMetrics() {
        return client.register.metrics();
    }
}

module.exports = PrometheusMetrics;
