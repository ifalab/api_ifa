const sql = require('mssql');

// Configuración de la conexión
const configGenesis = {
    user: process.env.USER_GENESIS_SERVER,
    password: process.env.PASS_GENESIS_SERVER,
    server: process.env.SERVIDOR_GENESIS,
    database: process.env.BD_GENESIS_SERVER,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    connectionTimeout: 30000,
    requestTimeout: 60000,

};

const poolGenesisPromise = new sql.ConnectionPool(configGenesis)
  .connect()
  .then((pool) => {
    console.log('Conexión exitosa a SQL GENESIS Server');
    return pool;
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos Genesis:', err.message);
    throw err;
  });


module.exports = {
    sql,
    poolGenesisPromise,
};