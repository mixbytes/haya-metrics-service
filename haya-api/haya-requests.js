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
            totalActivatedStake: Number(global.total_activated_stake),
            totalRamStake: global.total_ram_stake,
        };
    }
}

module.exports = HayaRequests;
