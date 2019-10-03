const config = {
    mongodbUrl: "mongodb://localhost:27017/EOS",
    dbUpdatePeriod: 5000,

    // hayaNodeUrl: "http://127.0.0.1:8888",
    hayaNodeUrl: "https://explorer.dao.casino/node",
    hayaUpdatePeiod: 1000,

    baseToken: "SYS",
    tokenAccount: "eosio.token"
};

module.exports = config;
