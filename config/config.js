const config = {
    // Mongodb connection string. Please activate the eosio::history_plugin and specify
    // the same url here as the node uses
    mongodbUrl: "mongodb://localhost:27017/EOS",

    // The period of updating information from the database
    dbUpdatePeriod: 5000,

    // The url of node api endpoint
    hayaNodeUrl: "https://explorer.dao.casino/node",

    // The period of updating information from the api
    hayaUpdatePeiod: 1000,

    // The name of the base token
    baseToken: "SYS",

    // The name of the token account
    tokenAccount: "eosio.token"
};

module.exports = config;
