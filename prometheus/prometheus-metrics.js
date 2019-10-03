const client = require('prom-client');

class PrometheusMetrics {
    constructor() {
        this.totalActivatedStake = new client.Gauge({
            name: 'total_activated_stake',
            help: 'total_activated_stake'
        });

        this.totalRamStake = new client.Gauge({
            name: 'total_ram_stake',
            help: 'total_ram_stake'
        });

        this.volumePastDay = new client.Gauge({
            name: 'volume_past_day',
            help: 'volume_past_day'
        });

        this.volumePastMonth = new client.Gauge({
            name: 'volume_past_month',
            help: 'volume_past_month'
        });

        this.volumeTotal = new client.Gauge({
            name: 'volume_total',
            help: 'volume_total'
        });

        this.createdAccountsTotal = new client.Gauge({
            name: 'created_accounts_total',
            help: 'created_accounts_total'
        });

        this.createdSmartContractsTotal = new client.Gauge({
            name: 'created_smart_contracts_total',
            help: 'created_smart_contracts_total'
        });

        this.activeAccountsDaily = new client.Gauge({
            name: 'active_accounts_daily',
            help: 'active_accounts_daily'
        });
    }

    updateMongoData(mongoData) {
        this.volumePastDay.set(mongoData.volumePastDay);
        this.volumePastMonth.set(mongoData.volumePastMonth);
        this.volumeTotal.set(mongoData.volumeTotal);
        this.createdAccountsTotal.set(mongoData.createdAccountsTotal);
        this.createdSmartContractsTotal.set(mongoData.createdSmartContractsTotal);
        this.activeAccountsDaily.set(mongoData.activeAccountsDaily);
    }

    updateHayaData(hayaData) {
        this.totalActivatedStake.set(hayaData.totalActivatedStake);
        this.totalRamStake.set(hayaData.totalRamStake);
    }

    getMetrics() {
        return client.register.metrics();
    }
}

module.exports = PrometheusMetrics;
