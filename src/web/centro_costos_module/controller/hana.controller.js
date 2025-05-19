const { executeQueryWithConnection } = require('../../utils/hana-util-connection');

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
        const query = `SELECT * FROM lab_ifa_lapp.clasificacion_gastos`;
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
module.exports = {
    ObtenerLibroMayor,
    cuentasCC,
    getNombreUsuario,
    getDocFuentes,
    getPlantillas,
    getClasificacionGastos,
    postDocFuente,
    asientosContablesCCById,
    getIdReserva
};
