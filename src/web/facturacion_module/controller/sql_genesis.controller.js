const { sql, poolGenesisPromise } = require('../service/sqlGenesis')

async function spObtenerCUF(nroDocumento) {
    try {
        const pool = await poolGenesisPromise;
        console.log({pool})
        console.log({nroDocumento:+nroDocumento})
        const result = await pool.request().query(`exec spObtenerCUF ${+nroDocumento}`);
        console.log('Resultados:', result.recordset);
        return result.recordset
    } catch (err) {
        console.error('Error en la consulta:', err);
        return {message: `Error en la consulta spObtenerCUF`}
    }
}

async function spEstadoFactura(cuf) {
    try {
        const pool = await poolGenesisPromise;
        console.log({pool})
        console.log({cuf})
        const result = await pool.request().query(`exec spEstadoFactura '${cuf}'`);
        console.log('Resultados:', result.recordset);
        return result.recordset
    } catch (err) {
        console.error('Error en la consulta:', err);
        return {message: `Error en la consulta spEstadoFactura`}
    }
}

module.exports = {
    spObtenerCUF,
    spEstadoFactura,
}