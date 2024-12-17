const {poolPromise} = require('../../config_db/config_db')

async function todosGastos() {
    try {
      const pool = await poolPromise;
  
      const result = await pool.request().query('select * from hchGastosGestion');
      console.log('Resultados:', result.recordset);
      return result.recordset
    } catch (err) {
      console.error('Error en la consulta:', err);
    }
  }

  async function gastosXAgencia(cod) {
    const pool = await poolPromise;
    const result = await pool.request().query(`exec spHchGastoxAgencia ${cod}`);
    try {
      console.log('Resultados:', result.recordset);
      return result.recordset
    } catch (err) {
      console.error('Error en la consulta:', err, result);
    }
  }

module.exports = { todosGastos, gastosXAgencia }