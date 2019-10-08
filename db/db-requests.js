const config = require('../config/config');

class DbRequests {
    constructor(mongoClient) {
        this.db = mongoClient.db(mongoClient.s.options.dbName);
    }

    async update() {
        // TODO: Check if we will calculate activeStakeTotal via this tool or some contract in blockchain
        let result = await Promise.all([
            this.volumeTotal(),
            this.createdAccountsTotal(),
            this.createdSmartContractsTotal(),
            this.activeAccountsDaily(),
            // this.activeStakeTotal(),
        ]);

        return {
            volumeTotal: {value: result[0], type: "counter"},
            createdAccountsTotal: {value: result[1], type: "counter"},
            createdSmartContractsTotal: {value: result[2], type: "counter"},
            activeAccountsDaily: {value: result[3], type: "gauge"},
            // stakeNetQuantityTotal: {value: result[4][0], type: "counter"},
            // stakeCpuQuantityTotal: {value: result[4][1], type: "counter"},
            // stakeVoteQuantityTotal: {value: result[4][2], type: "counter"},
        }
    }

    daily() {
        const lastDate = new Date();
        lastDate.setTime(lastDate.getTime() - 1000 * 60 * 60 * 24);
        return lastDate;
    }

    async volumeTotal() {
        let queryRes = await this.db.collection("action_traces").aggregate([
            {
                $match: {
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

    async activeStakeTotal() {
        let queryRes = await this.db.collection("action_traces").aggregate([
            {
                $match: {
                    "act.account": "eosio",
                    "act.name": "delegatebw",
                }
            },
            {
                $project: {
                    stakeNetQuantity: {
                        $toDecimal: {
                            $arrayElemAt: [{
                                $split: ["$act.data.stake_net_quantity", " "],
                            }, 0],
                        },
                    },
                    stakeCpuQuantity: {
                        $toDecimal: {
                            $arrayElemAt: [{
                                $split: ["$act.data.stake_cpu_quantity", " "],
                            }, 0],
                        },
                    },
                    stakeVoteQuantity: {
                        $toDecimal: {
                            $arrayElemAt: [{
                                $split: ["$act.data.stake_vote_quantity", " "],
                            }, 0],
                        },
                    },
                }
            },
            {
                $group: {
                    _id: null,
                    stakeNetQuantityTotal: {$sum: "stakeNetQuantity"},
                    stakeCpuQuantityTotal: {$sum: "stakeCpuQuantity"},
                    stakeVoteQuantityTotal: {$sum: "stakeVoteQuantity"}
                }
            }
        ])
            .toArray();

        if (queryRes.length !== 0) {
            return Object.values(queryRes[0]).map(value => Number(value.toString()));
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
                $group: {_id: "$act.authorization.actor"}
            },
            {
                $group: {
                    _id: null, count: {
                        $sum: 1
                    }
                }
            },
        ]).toArray();

        if (queryRes.length !== 0) {
            return queryRes[0].count;
        }
        return 0;
    }

}

module.exports = DbRequests;

