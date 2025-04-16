const { sql, poolGenesisPromise } = require('../service/sqlGenesis')

async function getFacturasParaDevolucion(cardCode, itemCode, lote) {
    try {
        const pool = await poolGenesisPromise;
        const result = await pool.request()
            .input('I_CardCode', sql.VarChar(50), cardCode)
            .input('I_ItemCode', sql.VarChar(50), itemCode)
            .input('I_Lote', sql.VarChar(50), lote)
            .execute('spVentaCliente');
        console.log('Resultados:', result.recordset);
        return result.recordset
    } catch (err) {
        console.error('Error en la consulta getFacturasParaDevolucion:', err);
        return {message: `Error en la consulta getFacturasParaDevolucion: ${err.message}`}
    }
}

async function getDetalleFacturasParaDevolucion(nro_cuenta) {
    try {
        const pool = await poolGenesisPromise;
        // const result = await pool.request().query(`exec spDetalleVenta @I_NroCuenta ='${nro_cuenta}'`);
        const result = await pool.request()
            .input('I_NroCuenta', sql.BigInt, nro_cuenta)
            .execute('spDetalleVenta');
        console.log('Resultados:', result.recordset);
        return result.recordset
    } catch (err) {
        console.error('Error en la consulta getDetalleFacturasParaDevolucion:', err);
        return {message: `Error en la consulta getDetalleFacturasParaDevolucion: ${err.message}`}
    }
}

module.exports = {
    getFacturasParaDevolucion,
    getDetalleFacturasParaDevolucion
}