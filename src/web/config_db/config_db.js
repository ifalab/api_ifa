const sql = require('mssql');

// Configuración de la conexión
const config = {
  user: process.env.USER_SERVER,
  password: process.env.PASS_SERVER,
  server: process.env.SERVIDOR,
  database: process.env.BD_SERVER,
  options: {
    encrypt: false, // Configura según tus necesidades
    trustServerCertificate: true, // Útil para entornos locales
  },
  connectionTimeout: 30000, 
  requestTimeout: 60000, 
  
};

// Exportar el pool de conexión
const poolPromise = sql.connect(config)
  .then((pool) => {
    console.log('Conexión exitosa a SQL Server');
    return pool;
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos:', err.message);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};