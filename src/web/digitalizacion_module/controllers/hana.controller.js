const {executeQueryWithConnection} = require('./hana-util.controller');

const reporteEntregaDigitalizacion = async (startDate,endDate,search,skip,limit,sucCode) => {
  try {
    console.log('reporteEntregaDigitalizacion EXECUTE');
    
    const safeSearch = search ? search.replace(/'/g, "''") : '';
    const sucCodeParam = sucCode ? sucCode : 'NULL';

    let query;
    // Manejar correctamente los casos donde startDate o endDate son nulos
   if (!startDate && !endDate) {
      query = `CALL "LAB_IFA_LAPP"."IFASP_LAPP_GET_DELIVERY_PENDING_TO_DIGITALIZED"(NULL, NULL, '${safeSearch}', ${skip}, ${limit}, ${sucCodeParam});`;
    } else if (!startDate) {
      query = `CALL "LAB_IFA_LAPP"."IFASP_LAPP_GET_DELIVERY_PENDING_TO_DIGITALIZED"(NULL, '${endDate}', '${safeSearch}', ${skip}, ${limit}, ${sucCodeParam});`;
    } else if (!endDate) {
      query = `CALL "LAB_IFA_LAPP"."IFASP_LAPP_GET_DELIVERY_PENDING_TO_DIGITALIZED"('${startDate}', NULL, '${safeSearch}', ${skip}, ${limit}, ${sucCodeParam});`;
    } else {
      query = `CALL "LAB_IFA_LAPP"."IFASP_LAPP_GET_DELIVERY_PENDING_TO_DIGITALIZED"('${startDate}', '${endDate}', '${safeSearch}', ${skip}, ${limit}, ${sucCodeParam});`;
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

