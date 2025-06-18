const { executeQueryWithConnection, executeQueryParamsWithConnection } = require('../../utils/hana-util-connection');

const ObtenerLibroMayor = async (cuenta) => {
    try {
        const number_cuenta = Number(cuenta);
        if (!number_cuenta || isNaN(number_cuenta)) {
          throw new Error(`Cuenta inválida: ${cuenta}`);
        }

        console.log('ObtenerLibroMayor EXECUTE');
        const query = `CALL LAB_IFA_COM.FIN_OBTENER_MAYOR_POR_CUENTA(${number_cuenta})`;
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.log({ error });
        throw new Error(`error en ObtenerLibroMayor, ${error}`);
    }
};

const ObtenerLibroMayorFiltrado = async (body) => {
    console.log(body);
    try {
        const {
            cuenta,
            fechaInicio,
            fechaFin,
            socioNombre,
            agencia = '',
            docFuente = '',
            dim1 = 0,
            dim2 = 0,
            dim3 = 0
        } = body;

        const number_cuenta = Number(cuenta);
        if (!number_cuenta || isNaN(number_cuenta)) {
        throw new Error(`Cuenta inválida: ${cuenta}`);
        }

        console.log('ObtenerLibroMayor EXECUTE');

        const query = `
        CALL LAB_IFA_COM.fin_obtener_mayor_general_filtrado(
            '${number_cuenta}',
            '${fechaInicio || '1900-01-01'}',
            '${fechaFin || '9999-12-31'}',
            '${socioNombre || ''}',
            '${agencia}',
            '${docFuente}',
            ${dim1},
            ${dim2},
            ${dim3}
        )
        `;

        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.log({ error });
        throw new Error(`error en ObtenerLibroMayor, ${error}`);
    }
};

const cuentasCC = async () => {
    try {
        console.log('cuentasCC EXECUTE');
        const query = `SELECT "AcctCode", "AcctName" FROM LAB_IFA_COM.ACCOUNT WHERE "Postable" = 'Y'`;
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.log({ error });
        throw new Error(`error en cuentasCC', ${error}`);
    }
};

const getNombreUsuario = async (id) => {
    try {
        console.log('getNombreUsuario EXECUTE');
        const query = `SELECT id, username FROM lab_ifa_lapp.lapp_usuario WHERE id = ${id}`;
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.log({ error });
        throw new Error(`error en getNombreUsuario, ${error}`);
    }
};

const getDocFuentes = async () => {
    try {
        console.log('getDocFuentes EXECUTE');
        const query = `SELECT * FROM LAB_IFA_COM.IFA_CC_DOCUMENTOS_FUENTES`;
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.log({ error });
        throw new Error(`error en getDocFuentes, ${error}`);
    }
};

const postDocFuente = async (codigo, descripcion, id, etiqueta) => {
    try {
        console.log('postDocFuente EXECUTE');
        const query = `CALL "LAB_IFA_COM"."IFA_CC_INSERT_DOCUMENTO_FUENTE"('${codigo}', '${descripcion}', ${id}, '${etiqueta}')`;
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.log({ error });
        throw new Error(`error en postDocFuente, ${error}`);
    }
};

const getPlantillas = async (id) => {
    try {
        console.log('getPlantillas EXECUTE');
        const query = `SELECT * FROM LAB_IFA_COM.IFA_CC_JOURNAL_COST_CENTER_DETAILS WHERE "TransId" = ${id}`;
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.log({ error });
        throw new Error(`Error en getPlantillas, ${error}`);
    }
};

const getClasificacionGastos = async () => {
    try {
        console.log('getClasificacionGastos EXECUTE');
        const query = `SELECT * FROM lab_ifa_com.cost_clasification`;
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.log({ error });
        throw new Error(`Error en getClasificacionGastos, ${error}`);
    }
};

const asientosContablesCCById = async (id) => {
  console.log('asientosContablesCC EXECUTE');
  const query = `SELECT * FROM LAB_IFA_COM.IFA_CC_JOURNAL WHERE "TransId" = ${id}`;
  return await executeQueryWithConnection(query);
};

const getIdReserva = async () => {
    try {
        console.log('getIdReserva EXECUTE');
        const query = `CALL LAB_IFA_COM.IFA_CC_RESERVAR_ASIENTO()`;
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.log({ error });
        throw new Error(`Error en getIdReserva, ${error}`);
    }
}

const getBeneficiarios = async () => {
    try {
        console.log('getBeneficiarios EXECUTE');
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_BENEFICIARIOS`;
        const result = await executeQueryWithConnection(query);
        return result;
    } catch (error) {
        console.log({ error });
        throw new Error(`Error en getBeneficiarios, ${error}`);
    }
}

const getAsientosSAP = async (codigo) => {
    try {
        console.log(codigo);
        const query = `SELECT * FROM LAB_IFA_PRD."IFA_CON_ASIENTOS" WHERE "TransId" = ${codigo};`;
        console.log(query);
        const result = await executeQueryWithConnection(query);
        return result || []; // Devuelve [] si es null/undefined
    } catch (error) {
        console.error({ error });
        throw new Error(`Error en getAsientosSAP, ${error}`);
    }
};

const ejecutarInsertSAP = async (codigo) => {
    try {
        const query = `
            CALL LAB_IFA_COM.IFA_CC_INSERTAR_ASIENTO_SAP(${codigo});
        `;
        const result = await executeQueryWithConnection(query);
        return result || []; // Devuelve [] si es null/undefined
    } catch (error) {
        console.error({ error });
        throw new Error(`Error en ejecutarInsertSAP, ${error}`);
    }
};

const updateAsientoContabilizado = async (TransId, Memo, Ref3) => {
    try {
        const query = `CALL "LAB_IFA_COM".ifa_cc_actualizar_asiento_memo_ref3(${TransId}, '${Memo}', ${Ref3})`;
        const result = await executeQueryWithConnection(query);
        return result || [];
    } catch (error) {
        console.error({ error });
        throw new Error(`Error en updateAsientoContabilizado: ${error.message}`);
    }
};

const asientoContableCC = async (id) => {
  console.log('asientosContablesCC EXECUTE');
  const query = `SELECT * FROM LAB_IFA_COM.IFA_CC_JOURNAL WHERE "TransId" = ${id}`;
  return await executeQueryWithConnection(query);
};

const postAnularAsientoCC = async(id) => {
    console.log('postAnularAsientoCC EXECUTE');
    const query = `CALL LAB_IFA_COM.IFA_CC_ANULAR_ASIENTO(${id})`;
    return await executeQueryWithConnection(query);
}

const postDescontabilizarAsientoCC = async(id) => {
    try {
        console.log('postDescontabilizarAsientoCC EXECUTE');
        const query = `CALL LAB_IFA_COM.IFA_CC_DESCONTABILIZAR_ASIENTO_CONTABLE(${id})`;
        console.log(query);
        return await executeQueryWithConnection(query);
    } catch (error) {
        console.error({ error });
        throw new Error(`Error en postDescontabilizarAsientoCC: ${error.message}`);
    }
}


const getBalanceGeneralCC = async() => {
    try {
        console.log('getBalanceGeneralCC EXECUTE');
        const query = `SELECT * FROM LAB_IFA_COM.FIN_BALANCE_SHEET`;
        console.log(query);
        return await executeQueryWithConnection(query);
    } catch (error) {
        console.error({ error });
        throw new Error(`Error en getBalanceGeneralCC: ${error.message}`);
    }
}

const getobtenerAsientoCompletos = async(ini, fin) => {
    try {
        console.log('getobtenerAsientoCompletos EXECUTE');
         const query = `
            SELECT * 
            FROM LAB_IFA_COM.IFA_CC_JOURNAL 
            WHERE "RefDate" BETWEEN '${ini}' AND '${fin}'
            AND "Account" LIKE '6%'
        `;
        console.log(query);
        return await executeQueryWithConnection(query);
    } catch (error) {
        console.error({ error });
        throw new Error(`Error en getobtenerAsientoCompletos: ${error.message}`);
    }
}

const saveClasificacionGastosHana = async (fila) => {
  try {
    const {
      area,
      tipo_cliente,
      linea,
      especialidad,
      clasificacion_gastos,
      conceptos_comerciales,
      cuenta_contable
    } = fila;

    const idArea = await saveAreaCC(area);
    const idTipo = await saveTipoClienteCC(tipo_cliente);
    const idLinea = await saveLineaCC(linea);
    const idEspecialidad = await saveEspecialidadCC(especialidad);
    const idClasificacion = await saveClasificacionCC(clasificacion_gastos);
    const idConcepto = await saveConceptosComCC(conceptos_comerciales);

    console.log(idArea, idTipo, idLinea, idClasificacion, idConcepto, idEspecialidad);

    const query = `
      CALL "LAB_IFA_COM"."IFA_CC_INSERT_CLASIFICACION_COMERCIAL" (
        ?, ?, ?, ?, ?, ?, ?
      );
    `;

    const params = [
      idArea,
      idTipo,
      idLinea,
      idEspecialidad,
      idClasificacion,
      idConcepto,
      cuenta_contable
    ];

    console.log('Ejecutando query saveClasificacionGastosHana con parámetros:', params);

    return await executeQueryParamsWithConnection(query, params);

  } catch (error) {
    console.error('Error en saveClasificacionGastosHana:', error);
    throw new Error(`Error en saveClasificacionGastosHana: ${error.message}`);
  }
};


const saveAreaCC = async (area) => {
    try {
        console.log(area)
       const query = `CALL "LAB_IFA_COM"."INSERT_AREAS"(?);`;
        const result = await executeQueryParamsWithConnection(query, [area]);
        const areaCode = result[0]?.AreaAdminCode;

        return areaCode;
    } catch (error) {
        console.error('Error en saveAreaCC:', error);
        throw new Error(`Error en saveAreaCC: ${error.message}`);
    }
};

const saveTipoClienteCC = async (tipo) => {
    try {
        console.log(tipo)
       const query = `CALL "LAB_IFA_COM"."IFA_CC_INSERT_TIPOS"(?);`;
        const result = await executeQueryParamsWithConnection(query, [tipo]);
        const typeCode = result[0]?.TypeCode;

        return typeCode;
    } catch (error) {
        console.error('Error en saveTipoClienteCC:', error);
        throw new Error(`Error en saveTipoClienteCC: ${error.message}`);
    }
};

const saveLineaCC = async (linea) => {
    try {
        console.log(linea)
       const query = `CALL "LAB_IFA_COM"."IFA_CC_INSERT_LINEAS"(?);`;
        const result = await executeQueryParamsWithConnection(query, [linea]);
        const lineCode = result[0]?.LineCode;

        return lineCode;
    } catch (error) {
        console.error('Error en saveLineaCC:', error);
        throw new Error(`Error en saveLineaCC: ${error.message}`);
    }
};

const saveClasificacionCC = async (clasificacion) => {
    try {
        console.log(clasificacion)
       const query = `CALL "LAB_IFA_COM"."IFA_CC_INSERT_CLASIFICACIONES"(?);`;
        const result = await executeQueryParamsWithConnection(query, [clasificacion]);
        const classificationCode = result[0]?.ClassificationCode;

        return classificationCode;
    } catch (error) {
        console.error('Error en saveClasificacionCC:', error);
        throw new Error(`Error en saveClasificacionCC: ${error.message}`);
    }
};

const saveConceptosComCC = async (conceptos) => {
    try {
        console.log(conceptos)
        const query = `CALL "LAB_IFA_COM"."IFA_CC_INSERT_CONCEPTOS"(?);`;
        const result = await executeQueryParamsWithConnection(query, [conceptos]);
        const comlConceptCode = result[0]?.ComlConceptCode;

        return comlConceptCode;
    } catch (error) {
        console.error('Error en saveClasificacionCC:', error);
        throw new Error(`Error en saveClasificacionCC: ${error.message}`);
    }
};

const saveEspecialidadCC = async (especialidad) => {
    try {
        console.log(especialidad)
        const query = `CALL "LAB_IFA_COM"."IFA_CC_INSERT_ESPECIALIDADES"(?);`;
        const result = await executeQueryParamsWithConnection(query, [especialidad]);
        const specialtyCode = result[0]?.SpecialtyCode;

        return specialtyCode;
    } catch (error) {
        console.error('Error en saveEspecialidadCC:', error);
        throw new Error(`Error en saveEspecialidadCC: ${error.message}`);
    }
};

module.exports = {
    ObtenerLibroMayor,
    cuentasCC,
    getNombreUsuario,
    getDocFuentes,
    getPlantillas,
    getClasificacionGastos,
    postDocFuente,
    asientosContablesCCById,
    getIdReserva,
    getBeneficiarios,
    ObtenerLibroMayorFiltrado,
    getAsientosSAP,
    ejecutarInsertSAP,
    updateAsientoContabilizado,
    asientoContableCC,
    postAnularAsientoCC,
    postDescontabilizarAsientoCC,
    getBalanceGeneralCC,
    getobtenerAsientoCompletos,
    saveClasificacionGastosHana,
    saveAreaCC,
    saveTipoClienteCC,
    saveLineaCC,
    saveClasificacionCC,
    saveConceptosComCC,
    saveEspecialidadCC
};
