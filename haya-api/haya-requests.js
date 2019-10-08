class HayaRequests {
    constructor(rpc) {
        this.rpc = rpc;
    }

    async update() {

        const global = (await this.rpc.get_table_rows({
            json: true,
            code: "eosio",
            scope: "eosio",
            table: "global",
        })).rows[0];

        return {
            totalActivatedStake: {value: (Number(global.total_activated_stake) / 10000), type: "gauge"},
            activeStake: {value: Number(global.active_stake / 10000), type: "gauge"},
            totalRamStake: {value: Number(global.total_ram_stake), type: "gauge"},
        };
    }
}

module.exports = HayaRequests;
