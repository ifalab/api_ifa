const { sql, poolGenesisPromise } = require('../service/sqlGenesis')
// import sql from 'mssql';
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

async function spObtenerCUFString(nroDocumento) {
    try {
        const pool = await poolGenesisPromise;
        console.log({pool})
        console.log({nroDocumento:+nroDocumento})
        const result = await pool.request().query(`exec spObtenerCUF '${nroDocumento}'`);
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

async function getFacturasParaDevolucion(cardCode, itemCode, lote) {
    try {
        const pool = await poolGenesisPromise;
        // console.log({pool})
        // const query = `exec spVentaCliente '${cardCode}', '${itemCode}', '${lote}'`
        // const query = `exec spVentaCliente @I_CardCode='${cardCode}', @I_ItemCode='${itemCode}', @I_Lote='${lote}'`
        const query= `
            exec spVentaCliente 
            @I_CardCode = 'C002446', 
            @I_ItemCode = '101-009-001', 
            @I_Lote = 112052
        `
        console.log({query})
        // const result = await pool.request().query(query);

        // console.log({request})
        const result = await pool.request()
            .input('I_CardCode', sql.VarChar(50), cardCode)
            .input('I_ItemCode', sql.VarChar(50), itemCode)
            .input('I_Lote', sql.VarChar(50), lote)
            .execute('spVentaCliente');
        console.log('Resultados:', result);
        return result.recordset
    } catch (err) {
        console.error('Error en la consulta getFacturasParaDevolucion:', err);
        return {message: `Error en la consulta getFacturasParaDevolucion: ${err.message}`}
    }
}

async function getDetalleFacturasParaDevolucion(nro_cuenta) {
    try {
        const pool = await poolGenesisPromise;
        console.log({pool})
        const result = await pool.request().query(`exec spDetalleVenta @I_NroCuenta =${nro_cuenta}`);
        console.log('Resultados:', result.recordset);
        return result.recordset
    } catch (err) {
        console.error('Error en la consulta getDetalleFacturasParaDevolucion:', err);
        return {message: `Error en la consulta getDetalleFacturasParaDevolucion: ${err.message}`}
    }
}


module.exports = {
    spObtenerCUF,
    spEstadoFactura,
    listaFacturasSfl,
    listaFacturasAnuladasSfl,
    spObtenerCUFString,
    getFacturasParaDevolucion,
    getDetalleFacturasParaDevolucion
}