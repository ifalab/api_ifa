const { sql, poolGenesisPromise } = require('../service/sqlGenesis')

async function spObtenerCUF(nroDocumento) {
    try {
        const pool = await poolGenesisPromise;
        console.log({pool})
        console.log({nroDocumento:+nroDocumento})
        const result = await pool.request().query(`exec spObtenerCUF ${nroDocumento}`);
        console.log('Resultados:', result.recordset);
        return result.recordset
    } catch (err) {
        console.error('Error en la consulta:', err);
        return {message: `Error en la consulta spObtenerCUF. ${err.message || ''}`}
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
        return {message: `Error en la consulta spEstadoFactura: ${err.message}`}
    }
}

async function listaFacturasSfl(matriz,startDate,endDate) {
    try {
        const pool = await poolGenesisPromise;
        console.log({pool})
        const result = await pool.request().query(`exec lista_factura_sfl @i_matriz=${matriz} , @i_fecha_desde='${startDate}', @i_fecha_hasta='${endDate}'`);
        console.log('Resultados:', result.recordset);
        return result.recordset
    } catch (err) {
        console.error('Error en la consulta:', err);
        console.log({matriz,startDate,endDate})
        return {message: `Error en la consulta listaFacturasSfl: ${err.message}`}
    }
}

async function listaFacturasAnuladasSfl(matriz,startDate,endDate) {
    try {
        const pool = await poolGenesisPromise;
        console.log({pool})
        console.log({cuf})
        const result = await pool.request().query(`exec lista_factura_anulada_sfl @i_matriz=${matriz} , @i_fecha_desde='${startDate}', @i_fecha_hasta='${endDate}'`);
        console.log('Resultados:', result.recordset);
        return result.recordset
    } catch (err) {
        console.error('Error en la consulta:', err);
        return {message: `Error en la consulta listaFacturasSfl: ${err.message}`}
    }
}

module.exports = {
    spObtenerCUF,
    spEstadoFactura,
    listaFacturasSfl,
    listaFacturasAnuladasSfl
}