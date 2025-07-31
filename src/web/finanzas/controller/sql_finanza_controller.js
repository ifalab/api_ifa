const { sql,poolPromise } = require('../../config_db/config_db')

async function todosGastos() {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query('select * from hchGastosGestion WHERE Gestion >= 2024');
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

async function gastosGestionAgencia(gestion, cod) {

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Gestion', sql.Int, gestion) // Define el primer parámetro como @gestion
      .input('codAgencia', sql.Int, cod) // Define el segundo parámetro como @cod
      .execute('spHchGastoxGestion'); // Llama al procedimiento almacenado

    console.log('Resultados:', result.recordset);
    return result.recordset;
  } catch (err) {
    console.error('Error en la consulta:', err); // Corrige eliminando "result"
    throw err; // Lanza el error para manejarlo en el controlador
  }
}

async function getAgencias() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT agencia, nombre FROM pam_agencia');

    console.log('Resultados:', result.recordset);
    return result.recordset;
  } catch (error) {
    console.error('Error en la consulta:', err); // Corrige eliminando "result"
    throw err; // Lanza el error para manejarlo en el controlador
  }
}

module.exports = {
  todosGastos,
  gastosXAgencia,
  gastosGestionAgencia,
  getAgencias,
}