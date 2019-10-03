const config = require('../config/config');

class DbRequests {
    constructor(mongoClient) {
        this.db = mongoClient.db("EOS");
    }

    async update() {
        let result = await Promise.all([
            this.volumePastDay(),
            this.volumePastMonth(),
            this.volumeTotal(),
            this.createdAccountsTotal(),
            this.createdSmartContractsTotal(),
            this.activeAccountsDaily(),
        ]);

        return {
            volumePastDay: result[0],
            volumePastMonth: result[1],
            volumeTotal: result[2],
            createdAccountsTotal: result[3],
            createdSmartContractsTotal: result[4],
            activeAccountsDaily: result[5],
        }
    }

    daily() {
        const lastDate = new Date();
        lastDate.setTime(lastDate.getTime() - 1000 * 60 * 60 * 24);
        return lastDate;
    }

    monthly() {
        const lastDate = new Date();
        lastDate.setTime(lastDate.getTime() - 1000 * 60 * 60 * 24 * 30);
        return lastDate;
    }

    // Volume part

    async _volumePastDate(date) {
        let dateParam = {};
        if (date) {
            dateParam = {
                "createdAt": {
                    $gte: date
                },
            }
        }

        let queryRes = await this.db.collection("action_traces").aggregate([
            {
                $match: {
                    ...dateParam,
                    "act.account": config.tokenAccount,
                    "act.name": "transfer",
                    "act.data.quantity": {$regex: ".* " + config.baseToken + "$"}
                }
            },
            {
                $project: {
                    quantity: {
                        $toDecimal: {
                            $arrayElemAt: [{
                                $split: ["$act.data.quantity", " "],
                            }, 0],
                        },
                    }
                }
            },
            {
                $group: {_id: null, quantitySum: {$sum: "$quantity"}}
            }
        ])
            .toArray();

        if (queryRes.length !== 0) {
            return Number(queryRes[0].quantitySum.toString());
        }
        return 0;
    }

    async volumeTotal() {
        return this._volumePastDate(null);
    }

    async volumePastDay() {
        return this._volumePastDate(this.daily());
    }

    async volumePastMonth() {
        return this._volumePastDate(this.monthly());
    }

    // Created smart contracts part

    async createdSmartContractsTotal() {
        let queryRes = await this.db.collection("action_traces").aggregate([
            {
                $match: {
                    "act.account": "eosio",
                    "act.name": "setcode"
                }
            },
            {
                $group: {_id: null, count: {$sum: 1}}
            }
        ]).toArray();

        if (queryRes.length !== 0) {
            return queryRes[0].count;
        }
        return 0;
    }

    // Created accounts part

    async createdAccountsTotal() {
        let queryRes = await this.db.collection("action_traces").aggregate([
            {
                $match: {
                    "act.account": "eosio",
                    "act.name": "newaccount"
                }
            },
            {
                $group: {_id: null, count: {$sum: 1}}
            }
        ]).toArray();

        if (queryRes.length !== 0) {
            return queryRes[0].count;
        }
        return 0;
    }

    async activeAccountsDaily() {
        let queryRes = await this.db.collection("action_traces").aggregate([
            {
                $match: {
                    "createdAt": {
                        $gte: this.daily()
                    },
                }
            },
            {
                $group: { _id: "$act.authorization.actor"}
            },
            {
                $group: { _id: null, count: {
                        $sum: 1
                    }}
            },
        ]).toArray();

        if (queryRes.length !== 0) {
            return queryRes[0].count;
        }
        return 0;
    }

}

module.exports = DbRequests;

