const sql = require('mssql');

// Configuración de la conexión
const configGenesisSpeaking = {
    user: process.env.USER_GENESIS_SERVER_SPEACKING,
    password: process.env.PASS_GENESIS_SERVER_SPEACKING,
    server: process.env.SERVIDOR_GENESIS_SPEACKING,
    database: process.env.BD_GENESIS_SERVER_SPEACKING,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    connectionTimeout: 30000,
    requestTimeout: 60000,
};

const poolGenesisSpeackingPromise = new sql.ConnectionPool(configGenesisSpeaking)
  .connect()
  .then((pool) => {
    console.log('Conexión exitosa a SQL GENESIS Server para consultas al Speacking');
    return pool;
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos Genesis Speacking:', err.message);
    throw err;
  });


module.exports = {
    sql,
    poolGenesisSpeackingPromise,
};