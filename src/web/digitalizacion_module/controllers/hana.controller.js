const {executeQueryWithConnection} = require('./hana-util.controller');

const reporteEntregaDigitalizacion = async (startDate,endDate,search,skip,limit) => {
  try {
    console.log('reporteEntregaDigitalizacion EXECUTE');
    
    let query;
    // Manejar correctamente los casos donde startDate o endDate son nulos
    if (!startDate && !endDate) {
      query = `CALL "LAB_IFA_LAPP"."IFASP_LAPP_GET_DELIVERY_DIGITALIZED"(NULL, NULL, '${search}', ${skip}, ${limit});`;
    } else if (!startDate) {
      query = `CALL "LAB_IFA_LAPP"."IFASP_LAPP_GET_DELIVERY_DIGITALIZED"(NULL, '${endDate}', '${search}', ${skip}, ${limit});`;
    } else if (!endDate) {
      query = `CALL "LAB_IFA_LAPP"."IFASP_LAPP_GET_DELIVERY_DIGITALIZED"('${startDate}', NULL, '${search}', ${skip}, ${limit});`;
    } else {
      query = `CALL "LAB_IFA_LAPP"."IFASP_LAPP_GET_DELIVERY_DIGITALIZED"('${startDate}', '${endDate}', '${search}', ${skip}, ${limit});`;
    }
    return await executeQueryWithConnection(query);
  } catch (error) {
    console.log({ error });
    throw new Error('error en reporteEntregaDigitalizacion');
  }
};

module.exports = {
    reporteEntregaDigitalizacion
}

