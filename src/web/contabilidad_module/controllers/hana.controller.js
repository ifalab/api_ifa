// const hana = require('@sap/hana-client');
const {executeQueryWithConnection} = require('./hana-util.controller');

// Configura la conexión a la base de datos HANA
// const connOptions = {
//     serverNode: `${process.env.HANASERVER}:${process.env.HANAPORT}`,
//     uid: process.env.HANAUSER,
//     pwd: process.env.HANAPASS
// };

// Variable para almacenar la conexión a la base de datos
// let connection = null;

// Función para conectar a la base de datos HANA
// const connectHANA = () => {
//     return new Promise((resolve, reject) => {
//         connection = hana.createConnection();
//         connection.connect(connOptions, (err) => {
//             if (err) {
//                 console.error('Error de conexión a HANA:', err.message);
//                 reject(err);
//             } else {
//                 console.log('Conectado a la base de datos HANA');
//                 resolve(connection);
//             }
//         });
//     });
// };


// const executeQuery = async (query) => {
//     return new Promise((resolve, reject) => {
//         console.log(query)
//         connection.exec(query, (err, result) => {
//             if (err) {
//                 console.log('error en la consulta:', err.message)
//                 reject(new Error('error en la consulta'))
//             } else {
//                 console.log('Datos obtenidos con exito');
//                 resolve(result);
//                 // console.log({result})
//             }
//         })
//     })
// }


const tipoDeCambio = async () => {
  try {
    console.log('tipoDeCambio EXECUTE');
    const query = `CALL "${process.env.PRD}".IFA_CON_MONEDAS_TIPOS();`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    console.log({ error });
    throw new Error('error en tipoDeCambio');
  }
};

const tipoDeCambioByFecha = async (fecha) => {
  try {
    console.log('tipoDeCambio EXECUTE');
    const query = `CALL "${process.env.PRD}".IFA_CON_MONEDAS_TIPOS_BY_FECHA('${fecha}');`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    console.log({ error });
    throw new Error('error en tipoDeCambioByFecha');
  }
};

const empleadosHana = async () => {
  try {
    console.log('empleadosHana EXECUTE');
    const query = `SELECT * FROM "${process.env.PRD}"."IFA_DM_EMPLEADOS"`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    console.log({ error });
    throw new Error('error en empleadosHana');
  }
};

const findEmpleadoByCode = async (code) => {
  try {
    console.log('findEmpleadoByCode EXECUTE');
    const query = `CALL "${process.env.PRD}".IFA_DM_BUSCAR_EMPLEADO_POR_CODIGO('${code}')`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    console.log({ error });
    throw new Error('error en findEmpleadoByCode');
  }
};

const findAllBancos = async () => {
  try {
    console.log('findAllBancos EXECUTE');
    const query = `SELECT * FROM "${process.env.PRD}"."IFA_DM_TODOS_BANCOS"`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    console.log({ error });
    throw new Error('error en findAllBancos');
  }
};

const findAllAccount = async () => {
  try {
    console.log('findAllAccount EXECUTE');
    const query = `SELECT "AcctCode", "AcctName" FROM ${process.env.PRD}.ifa_dm_cuentas WHERE "AcctCode" IN ('1120501','1110301')`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    console.log({ error });
    throw new Error('error en findAllAccount');
  }
};

const dataCierreCaja = async (id) => {
  try {
    console.log('dataCierreCaja EXECUTE');
    const query = `CALL ${process.env.PRD}.ifa_lapp_rw_obtener_caja_para_cerrar(${id})`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    console.log({ error });
    throw new Error('error en dataCierreCaja');
  }
};

const cuentasCC = async () => {
  console.log('cuentasCC EXECUTE');
  const query = `SELECT "AcctCode", "AcctName" FROM LAB_IFA_COM.ACCOUNT WHERE "Postable" = 'Y'`;
  return await executeQueryWithConnection(query);
};

const sucursalesCC = async () => {
  console.log('sucursalesCC EXECUTE');
  const query = `SELECT * FROM LAB_IFA_COM.DIM1`;
  return await executeQueryWithConnection(query);
};

const tipoClienteCC = async () => {
  console.log('tipoClienteCC EXECUTE');
  const query = `SELECT * FROM LAB_IFA_COM.DIM2`;
  return await executeQueryWithConnection(query);
};

const lineaCC = async () => {
  console.log('lineaCC EXECUTE');
  const query = `SELECT * FROM LAB_IFA_COM.DIM3`;
  return await executeQueryWithConnection(query);
};

const subLineaCC = async () => {
  console.log('subLineaCC EXECUTE');
  const query = `SELECT * FROM LAB_IFA_COM.DIM31`;
  return await executeQueryWithConnection(query);
};

const asientosContablesCC = async () => {
  console.log('asientosContablesCC EXECUTE');
  const query = `SELECT * FROM LAB_IFA_COM.IFA_CC_JOURNAL`;
  return await executeQueryWithConnection(query);
};

const asientosPreliminaresCC = async (id) => {
  console.log('asientosPreliminaresCC EXECUTE');
  const query = `SELECT * FROM LAB_IFA_COM."IFA_CC_JOURNAL_PRELIMINAR" WHERE "TransId" = ${id}`;
  return await executeQueryWithConnection(query);
};

const asientosPreliminaresCCIds = async () => {
  console.log('asientosPreliminaresCCIds EXECUTE');
  const query = `SELECT * FROM LAB_IFA_COM."IFA_CC_JOURNAL_PRELIMINAR_IDS"`;
  return await executeQueryWithConnection(query);
};

const rendicionesPorCaja = async (idCaja) => {
  console.log('rendicionesPorCaja EXECUTE');
  const query = `CALL ${process.env.PRD}.ifa_rw_obtener_rendiciones_por_caja(${idCaja});`;
  console.log({query})
  return await executeQueryWithConnection(query);
};





const sociosNegocio = async () => {
  console.log('sociosNegocio EXECUTE');
  const query = `SELECT "CardCode", "CardName" FROM LAB_IFA_COM.PARTNERS`;
  return await executeQueryWithConnection(query);
};

const cuentasPorCodigoNombre = async (param) => {
  console.log('cuentasPorCodigo EXECUTE');
  const query = `CALL ${process.env.PRD}.ifasp_md_get_all_accounts_by_code_or_name('${param}');`;
  console.log({query})
  return await executeQueryWithConnection(query);
};


const getAccountLedgerData = async (fechaInicio, fechaFin, accountCode) => {
  try {
    console.log('getAccountLedgerData EXECUTE');

    const formattedFechaInicio = fechaInicio.replace(/-/g, '');
    const formattedFechaFin = fechaFin.replace(/-/g, '');
    const safeAccountCode = accountCode ? accountCode.replace(/'/g, "''") : '';


    const query = `CALL ${process.env.PRD}.IFASP_ACC_GET_ACCOUNT_LEDGER(
      i_dateIni => '${formattedFechaInicio}',
      i_dateFin => '${formattedFechaFin}',
      i_account => '${safeAccountCode}'
    );`;

    console.log('Query a ejecutar:', query);

    const rawResult = await executeQueryWithConnection(query); // <-- Resultado crudo de la DB

    // --- ¡CORRECCIÓN CLAVE AQUÍ! ---
    // Si executeQueryWithConnection retorna un array de objetos directamente (ej. [{...}, {...}])
    // entonces 'rawResult' ya es el array de datos que necesitas.
    // Solo necesitamos verificar que sea un array válido.
    if (!rawResult || !Array.isArray(rawResult)) {
        console.warn('executeQueryWithConnection no retornó un array o es nulo/indefinido:', rawResult);
        return []; // Retorna un array vacío si el resultado no es el esperado
    }

    // Si llegamos aquí, 'rawResult' *es* el array de datos de la tabla.
    return rawResult; // ¡Simplemente retorna el rawResult tal cual!

  } catch (error) {
    console.error('Error en getAccountLedgerData:', error);
    throw new Error('Error al obtener datos del Libro Mayor');
  }
};

const getAccountLedgerBalancePrev = async (fechaInicio, accountCode) => {
  try {
    console.log('getAccountLedgerBalancePrev EXECUTE');

    const formattedFechaInicio = fechaInicio.replace(/-/g, '');
    const safeAccountCode = accountCode ? accountCode.replace(/'/g, "''") : '';


    const query = `CALL ${process.env.PRD}.IFASP_ACC_GET_ACCOUNT_LEDGER_PREV(
      i_dateIni => '${formattedFechaInicio}',
      i_account => '${safeAccountCode}'
    );`;

    console.log('Query a ejecutar:', query);

    const rawResult = await executeQueryWithConnection(query); 

    if (!rawResult || !Array.isArray(rawResult)) {
        console.warn('executeQueryWithConnection no retornó un array o es nulo/indefinido:', rawResult);
        return []; // Retorna un array vacío si el resultado no es el esperado
    }

    // Si llegamos aquí, 'rawResult' *es* el array de datos de la tabla.
    return rawResult; // ¡Simplemente retorna el rawResult tal cual!

  } catch (error) {
    console.error('Error en getAccountLedgerData:', error);
    throw new Error('Error al obtener datos del Libro Mayor');
  }
};



const getBankingByDate = async (fechaInicio, fechaFin) => {
  try {
    console.log('getBankingByDate EXECUTE');

    const formattedFechaInicio = fechaInicio.replace(/-/g, '');
    const formattedFechaFin = fechaFin.replace(/-/g, '');


    const query = `CALL ${process.env.PRD}.IFASP_SAL_GET_BANKING_PURCHASES(
      i_dateIni => '${formattedFechaInicio}',
      i_dateFin => '${formattedFechaFin}'
    );`;

    console.log('Query a ejecutar:', query);

    const rawResult = await executeQueryWithConnection(query); // <-- Resultado crudo de la DB


    if (!rawResult || !Array.isArray(rawResult)) {
        console.warn('executeQueryWithConnection no retornó un array o es nulo/indefinido:', rawResult);
        return []; 
    }


    return rawResult; 

  } catch (error) {
    console.error('Error en getAccountLedgerData:', error);
    throw new Error('Error al obtener datos del Libro Mayor');
  }
};

const getBeneficiarios = async () => {
  console.log('getBeneficiarios EXECUTE');
  const query = `SELECT * FROM LAB_IFA_PRD.IFA_DM_PROVEEDORES`;
  return await executeQueryWithConnection(query);
};





module.exports = {
    tipoDeCambio,
    empleadosHana,
    findEmpleadoByCode,
    findAllBancos,
    findAllAccount,
    dataCierreCaja,
    tipoDeCambioByFecha,
    cuentasCC,
    asientosContablesCC,
    sucursalesCC,
    tipoClienteCC,
    lineaCC,
    subLineaCC,
    rendicionesPorCaja,
    asientosPreliminaresCC,
    asientosPreliminaresCCIds,
    sociosNegocio,
    cuentasPorCodigoNombre,
    getAccountLedgerData,
    getAccountLedgerBalancePrev,
    getBankingByDate,
    getBeneficiarios
}