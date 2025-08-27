const { sql, poolGenesisSpeackingPromise } = require('../../service/sqlGenesisSpeacking')
async function kpiEstadosSpeacking(start,end,tipo) {
    try {
        const pool = await poolGenesisSpeackingPromise;
        console.log({pool})
        console.log({query:`exec kpi_contador_estado @i_fecha_desde = '${start}', @i_fecha_hasta = '${end}', @i_agencia = '', @i_almacen = ''`})
        const result = await pool.request().query(`exec kpi_contador_estado @i_fecha_desde = '${start}', @i_fecha_hasta = '${end}', @i_agencia = '', @i_almacen = ''`);
        console.log('Resultados:', result.recordset);
        return result.recordset
    } catch (err) {
        console.error('Error en la consulta:', err);
        return {message: `Error en la consulta kpiEstadosSpeacking. ${err.message || ''}`}
    }
}

module.exports = {
    kpiEstadosSpeacking
}