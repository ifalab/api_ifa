const hana = require('@sap/hana-client');
const { executeQueryWithConnection, executeQueryParamsWithConnection } = require('../../utils/hana-util-connection');

// Configura la conexión a la base de datos HANA
const connOptions = {
    serverNode: `${process.env.HANASERVER}:${process.env.HANAPORT}`,
    uid: process.env.HANAUSER,
    pwd: process.env.HANAPASS
};

// Variable para almacenar la conexión a la base de datos
let connection = null;

// Función para conectar a la base de datos HANA
const connectHANA = () => {
    return new Promise((resolve, reject) => {
        connection = hana.createConnection();
        connection.connect(connOptions, (err) => {
            if (err) {
                console.error('Error de conexión a HANA:', err.message);
                reject(err);
            } else {
                console.log('Conectado a la base de datos HANA');
                resolve(connection);
            }
        });
    });
};


const executeQuery = async (query) => {
    return new Promise((resolve, reject) => {
        connection.exec(query, (err, result) => {
            if (err) {
                console.log('error en la consulta:', err.message)
                reject(new Error('error en la consulta'))
            } else {
                console.log('Datos obtenidos con exito');
                resolve(result);

            }
        })
    })
}

const parteDiario = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from lab_ifa_prd.ifa_fin_parte_diario`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en finanzas/ parteDiario:', error.message);
        return { message: 'Error al procesar la solicitud: finanzas/parteDiario user' }
    }
}

const abastecimiento = async (fecha) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call "LAB_IFA_PRD".IFA_LAPP_ABAS_COMPRASCOMERCIALES(${fecha})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimiento')
        console.log(error)
    }
}

const abastecimientoMesAnterior = async (fecha) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call "LAB_IFA_PRD".IFA_LAPP_ABAS_COMPRASCOMERCIALES__MES_ANT()`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimientoMesAnterior')
        console.log(error)
    }
}

const abastecimientoMesActual = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from LAB_IFA_PRD.IFA_LAPP_ABAST_COMPRASCOMERCIALES`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimientoMesActual')
        console.log(error)
    }
}

const abastecimientoPorMes = async (month, year) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL ${process.env.PRD}.IFASP_INV_CALCULATE_PLANT_PURCHASES(i_Year => ${year}, i_Month => ${month})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimientoPorMes')
        console.log(error)
    }
}

const abastecimientoPorFecha = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }

        const query = `call LAB_IFA_PRD.IFA_LAPP_ABAS_COMPRASCOMERCIALES_SEMESTRAL()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimientoPorFecha')
        console.log(error)
    }
}

const abastecimientoPorFechaAnual = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }

        const query = `call LAB_IFA_PRD.IFA_LAPP_ABAS_COMPRASCOMERCIALES_ANUAL()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimientoPorFechaAnual: ', error)
        return {
            error: 'no se pudo traer los datos'
        }

    }
}

const abastecimientoPorFecha_24_meses = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }

        const query = `call LAB_IFA_PRD.IFA_LAPP_ABAS_COMPRASCOMERCIALES_24MESES()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimientoPorFecha_24_meses: ', error)
        return {
            error: 'no se pudo traer los datos'
        }
    }
}

const findAllRegions = async () => {
    try {

        if (!connection) {
            await connectHANA();
        }

        console.log('findAllRegions execute')
        const query = `select * from LAB_IFA_PRD.ifa_dm_regiones`
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllRegions')
    }
}

const findAllLines = async () => {
    try {

        if (!connection) {
            await connectHANA();
        }

        console.log('findAllLines execute')
        const query = `select * from LAB_IFA_PRD.IFA_DM_LINEAS`
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllLines')
    }
}

const findAllSubLines = async () => {
    try {

        if (!connection) {
            await connectHANA();
        }

        console.log('findAllSubLines execute')
        const query = `select * from LAB_IFA_PRD.IFA_DM_SUBLINEAS`
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllSubLines')
    }
}

const findAllGroupAlmacenes = async () => {
    try {

        if (!connection) {
            await connectHANA();
        }

        console.log('findAllGroupAlmacenes execute')
        const query = `select * from lab_ifa_prd.ifa_dm_almacenes_grupo`
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllGroupAlmacenes')
    }
}

const reporteArticuloPendientes = async (startDate, endDate) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.ifa_lapp_inv_analisis_de_pendientes_por_fecha('${startDate}','${endDate}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en reporteArticuloPendientes')
        console.log(error)
    }
}

const reporteMargenComercial = async (startDate, endDate) => {
    try {
        const query = `
            CALL "LAB_IFA_DATA"."IFASP_SAL_CALCULATE_COMERCIAL_SALES_MARGINS"(
                i_ini_date => ?, 
                i_fin_date => ?, 
                o_result => ?
            );
        `;

        // Asegúrate de pasar las fechas en formato 'yyyyMMdd'
        const start = formatDate(startDate); // Ej: '20250101'
        const end = formatDate(endDate);     // Ej: '20250531'
        const result = await executeQueryParamsWithConnection(query, [start, end]);

        return result;
    } catch (error) {
        console.error('Error en reporteMargenComercial:', error);
        throw new Error(`Error en reporteMargenComercial: ${error.message}`);
    }
};

// Función utilitaria para convertir Date o string a 'yyyyMMdd'
function formatDate(date) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
}

const CommercialMarginByProducts = async (startDate, endDate, succode, divcode, lineCode) => {
    try {
        const query = `
      CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_ITEMS_COMERCIAL_MARGINS_BY_ITEMCODE (
        i_ini_date      => ?,     -- Fecha inicial
        i_fin_date      => ?,     -- Fecha final
        i_succode       => ?,     -- Código de sucursal (NULL para todos)
        i_divisioncode  => ?,     -- Código de división (NULL para todos)
        i_lineitemcode  => ?,     -- Código de línea (NULL para todos)
        o_result        => ?
      );
    `;
        const start = formatDate(startDate)
        const end = formatDate(endDate)
        console.log({ start, end, succode, divcode, lineCode })
        const result = await executeQueryParamsWithConnection(query, [
            start,
            end,
            succode,
            divcode,
            lineCode
        ]);

        return result;
    } catch (error) {
        console.error('Error en reporteMargenComercial:', error);
        throw new Error(`Error en reporteMargenComercial: ${error.message}`);
    }
};

const getMonthlyCommercialMargin = async (year) => {
    try {
        const query = `
      CALL "LAB_IFA_DATA"."IFASP_SAL_CALCULATE_MONTHLY_COMERCIAL_SALES_MARGINS"(
        i_Year => ?, 
        o_result => ?
      );
    `;
        const result = await executeQueryParamsWithConnection(query, [year]);
        return result;
    } catch (error) {
        console.error('Error in getMonthlyCommercialMargin:', error);
        throw new Error(`Error in getMonthlyCommercialMargin: ${error.message}`);
    }
};

const getReportBankMajor = async (startDate, endDate, skip, limit, search) => {
    try {
        const query = `
        CALL "LAB_IFA_PRD"."IFASP_ACC_GET_BANK_MAJOR"(
            i_dateIni => ?,
            i_dateFin => ?,
            i_skip => ?,
            i_limit => ?,
            i_search => ?
        );
    `;
        const start = formatDate(startDate)
        const end = formatDate(endDate)

        console.log(start, end, ">>>>>>>>>>")
        console.log({ query });
        const result = await executeQueryParamsWithConnection(query, [
            start,
            end,
            skip,
            limit,
            search
        ]);
        return result;

    } catch (error) {
        console.error('Error in getReportBankMajor:', error);
        throw new Error(`Error in getReportBankMajor: ${error.message}`);
    }
}


const getCommercialBankAccounts = async () => {
    try {
        const query = `call "LAB_IFA_PRD"."IFASP_ACC_GET_COMMERCIAL_BANK_ACCOUNT"`;
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.error('Error in getCommercialBankAccounts:', error);
        throw new Error(`Error in getCommercialBankAccounts: ${error.message}`);
    }
}

const getGastosGenesis = async () => {
    try {
        const query = `call "LAB_IFA_PRD"."IFASP_ACC_GET_COMMERCIAL_BANK_ACCOUNT"`;
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.error('Error in getCommercialBankAccounts:', error);
        throw new Error(`Error in getCommercialBankAccounts: ${error.message}`);
    }
}

const getGastosDB = async (SucCode) => {
    try {
        const query = `call ${process.env.PRD}.IFASP_GET_EXPENSES_BY_SUC('${SucCode}')`
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.error('Error in getGastosDB:', error);
        throw new Error(`Error in getGastosDB: ${error.message}`);
    }
}

const getGastosHanna = async (SucCode) => {
    try {
        const query = `call ${process.env.PRD}.IFASP_GET_EXPENSES_BY_SUC('${SucCode}')`
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.error('Error in getGastosHanna:', error);
        throw new Error(`Error in getGastosHanna: ${error.message}`);
    }
}


const getBalanceGeneral = async(fechaInicio, fechaFin) => {
    try {
        console.log('getBalanceGeneral EXECUTE');
        const query = `call ${process.env.PRD}.IFASP_FIN_BALANCE_BY_DATE('${fechaInicio}','${fechaFin}')`
        console.log(query);
        return await executeQueryWithConnection(query);
    } catch (error) {
        console.error({ error });
        throw new Error(`Error en getBalanceGeneral: ${error.message}`);
    }
}





const getGastosSAPHana = async (codigoDimensionA = 0) => {
    console.log(codigoDimensionA);
    try {
        if (codigoDimensionA == 120) {
            return []; // o puedes lanzar un error si lo prefieres
        }

        let query = `
            SELECT 
                YEAR("Date") AS "Año",
                SUM("SalesNetTotal") AS "TotalVentasNetas",
                SUM("SalesComercialCost") AS "CostoComercialTotal",
                (SUM("SalesNetTotal") - SUM("SalesComercialCost")) AS "UtilidadBruta",
                CASE 
                    WHEN SUM("SalesNetTotal") = 0 THEN 0
                    ELSE (SUM("SalesNetTotal" - "SalesComercialCost") / SUM("SalesNetTotal")) * 100
                END AS "MargenPorcentual"
            FROM 
                LAB_IFA_DATA.KDS_SALES_ANALYSIS
            WHERE 
                "Type" = 'SALES'
        `;

        const params = [];

        // Si el código es distinto de 0, agregamos el filtro por dimensión
        if (codigoDimensionA == 110) {
            query += ` AND "DimensionACode" IN (?, ?)`;
            params.push(110, 120);
        } else if (codigoDimensionA != 0) {
            query += ` AND "DimensionACode" = ?`;
            params.push(codigoDimensionA);
        }


        query += `
            GROUP BY YEAR("Date")
            ORDER BY "Año"
        `;
        console.log(query);
        const result = await executeQueryParamsWithConnection(query, params);
        return result;

    } catch (error) {
        console.error('Error in getGastosSAPHana:', error);
        throw new Error(`Error in getGastosSAPHana: ${error.message}`);
    }
};

const getGastosAgenciaxGestionSAPHana = async (gestion, codigoDimensionA = 0) => {
    console.log(codigoDimensionA);
     try {
        if (codigoDimensionA === 120) {
            return []; // Sucursal inválida
        }

        let query = `
            SELECT 
                MONTH("Date") AS "Mes",
                SUM("SalesNetTotal") AS "TotalVentasNetas",
                SUM("SalesComercialCost") AS "CostoComercialTotal",
                SUM("SalesNetTotal" - "SalesComercialCost") AS "UtilidadBruta",
                CASE 
                    WHEN SUM("SalesNetTotal") = 0 THEN 0
                    ELSE (SUM("SalesNetTotal" - "SalesComercialCost") / SUM("SalesNetTotal")) * 100
                END AS "MargenPorcentual"
            FROM 
                LAB_IFA_DATA.KDS_SALES_ANALYSIS
            WHERE 
                "Type" = 'SALES'
                AND YEAR("Date") = ?
        `;

        const params = [gestion];

        if (codigoDimensionA === 110) {
            query += ` AND "DimensionACode" IN (?, ?)`;
            params.push(110, 120);
        } else if (codigoDimensionA !== 0) {
            query += ` AND "DimensionACode" = ?`;
            params.push(codigoDimensionA);
        }

        query += `
            GROUP BY MONTH("Date")
            ORDER BY "Mes"
        `;

        console.log(query, params);
        const result = await executeQueryParamsWithConnection(query, params);
        return result;

    } catch (error) {
        console.error('Error in getGastosMensualesPorSucursalSAPHana:', error);
        throw new Error(`Error in getGastosMensualesPorSucursalSAPHana: ${error.message}`);
    }
};

const getGastosCCHanna = async (anio, sucCode) => {
    try {
        sucCode = Number(sucCode); 
        let query = '';
        let params = [];

        if (sucCode === 0) {
            // 👉 Caso: todas las sucursales (suma total)
            query = `
                SELECT 
                    "Anio",
                    "Mes",
                    SUM("Devoluciones") AS "Devoluciones",
                    SUM("GastosAdministrativos") AS "GastosAdministrativos",
                    SUM("GastosComerciales") AS "GastosComerciales",
                    SUM("GastosExportacion") AS "GastosExportacion",
                    SUM("PartidasNoMuevenEfectivo") AS "PartidasNoMuevenEfectivo",
                    SUM("RecursosHumanos") AS "RecursosHumanos"
                FROM LAB_IFA_PRD.IFA_CC_GASTOS
                WHERE "Anio" = ?
                GROUP BY "Anio", "Mes"
                ORDER BY "Mes"
            `;
            params = [anio];
        } else {
            // 👉 Caso: una sucursal específica
            query = `
                SELECT *
                FROM LAB_IFA_PRD.IFA_CC_GASTOS
                WHERE "SucCode" = ?
                  AND "Anio" = ?
                ORDER BY "Mes"
            `;
            params = [sucCode, anio];
        }

        console.log(query, params);
        const result = await executeQueryParamsWithConnection(query, params);
        return result;

    } catch (error) {
        console.error('Error in getGastosCCHanna:', error);
        throw new Error(`Error in getGastosCCHanna: ${error.message}`);
    }
};

const getHanaValuedInventoryBySuc = async (isGerencia = false) => {
  try {
    // ✅ Escogemos la vista según el tipo de reporte
    const viewName = isGerencia
      ? 'LAB_IFA_PRD.IFA_INV_VALUED_STOCK_BY_SUC_GERENCIA'
      : 'LAB_IFA_PRD.IFA_INV_VALUED_STOCK_BY_SUC';

    const query = `SELECT * FROM ${viewName}`;

    // Si en el futuro necesitas parámetros, puedes agregarlos aquí
    const params = [];

    console.log("Executing query:", query, "with params:", params);

    const result = await executeQueryParamsWithConnection(query, params);

    return result;
  } catch (error) {
    console.error("Error in getHanaValuedInventoryBySuc:", error);
    throw new Error(`Error in getHanaValuedInventoryBySuc: ${error.message}`);
  }
};

const getHanaValuedInventoryDetails = async ({
  sucCode,
  lineItemCode,
  subLineItemCode,
  whsCode,
  itemCode,
  isGerenciaReport = 'N', // por defecto 'N'
}) => {
  try {
    const query = `
      CALL LAB_IFA_PRD.IFASP_INV_CALCULATE_STOCK_COMMERCIAL_VALUE(?, ?, ?, ?, ?, ?)
    `;

    // Los parámetros se pasan en orden según la definición del procedimiento
    const params = [
      sucCode,
      lineItemCode,
      subLineItemCode,
      whsCode,
      itemCode,
      isGerenciaReport
    ];

    console.log("Executing query:", query, "with params:", params);

    const result = await executeQueryParamsWithConnection(query, params);
    return result;

  } catch (error) {
    console.error("Error in getHanaValuedInventoryDetails:", error);
    throw new Error(`Error in getHanaValuedInventoryDetails: ${error.message}`);
  }
};

module.exports = {
    parteDiario,
    abastecimiento,
    abastecimientoMesActual,
    abastecimientoMesAnterior,
    findAllRegions,
    findAllLines,
    findAllSubLines,
    findAllGroupAlmacenes,
    abastecimientoPorFecha,
    abastecimientoPorFechaAnual,
    abastecimientoPorFecha_24_meses,
    reporteArticuloPendientes,
    reporteMargenComercial,
    CommercialMarginByProducts,
    abastecimientoPorMes,
    getMonthlyCommercialMargin,
    getReportBankMajor,
    getCommercialBankAccounts,
    getGastosSAPHana,
    getGastosAgenciaxGestionSAPHana,
    getGastosDB,
    getGastosHanna,
    getBalanceGeneral,
    getGastosCCHanna,
    getHanaValuedInventoryBySuc,
    getHanaValuedInventoryDetails
}