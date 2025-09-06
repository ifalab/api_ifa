const ExcelJS = require('exceljs');

const generateVisitsExcel = async (dataVisit, dataNoVisit, dataPending, slpName) => {
  const workbook = new ExcelJS.Workbook();

  const visitHeadersMap = {
    VISITID: 'Visita ID',
    SLPCODE: 'Código Vendedor',
    SLPNAME: 'Vendedor',
    CLIENTCODE: 'Código Cliente',
    CLIENTNAME: 'Cliente',
    PLANID: 'Plan ID',
    PLANDETAILID: 'Detalle ID',
    VISITDATE: 'Día Visita',
    VISITTIME: 'Tiempo Visita',
    VISITSTATUS: 'Estado',
    COMMENTS: 'Comentario',
    LONGITUDE: 'Ubicación Maps',
    LATITUDE: '', // se combina con LONGITUDE
    REASONNOTVISIT: 'Razón de no visita',
    CREATEDATE: 'Día Creado',
    CREATETIME: 'Tiempo Creado',
    CREATEDBY: 'Creado por',
    PlanificadoStatus: 'Estado Planificación',
  };

  const pendingHeadersMap = {
    PlanDetailID: 'Detalle ID',
    PlanID: 'Plan ID',
    ClientCode: 'Código Cliente',
    ClientName: 'Nombre Cliente',
    PlanVisitDate: 'Planificación Día Visita',
    PlanVisitTimeFrom: 'Planificación Desde',
    PlanVisitTimeTo: 'Hasta',
    SlpCode: 'Código Vendedor',
    SlpName: 'Vendedor',
    Comments: 'Comentarios',
    CreateDate: 'Día Creación',
    CreateTime: 'Tiempo Creación',
    CreatedBy: 'Creado por',
    STATUS: 'Estado',
    // STATUSUPDATEDATE y STATUSUPDATEDBY no se incluyen
  };

  // === FUNCION AUXILIAR PARA CREAR HOJAS ===
  const createSheet = (sheetName, data, headersMap) => {
    const sheet = workbook.addWorksheet(sheetName);
    // Título arriba
    sheet.mergeCells('A1:R1');
    sheet.getCell('A1').value = `${sheetName} - Vendedor ${slpName}`;
    sheet.getCell('A1').font = { size: 14, bold: true };
    sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    if (!data || data.length === 0) return;
    // Encabezados (primer fila con color)
    const headers = Object.keys(headersMap);
    const translatedHeaders = Object.values(headersMap);

    const headerRow = sheet.addRow(translatedHeaders);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB0C4DE' }, // color azul claro
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Datos
    data.forEach((item) => {
      const rowData = headers.map((h) => {
        if (h === 'LONGITUDE') {
          // Generamos link a Google Maps con LAT/LON
          const lat = item['LATITUDE'];
          const lon = item['LONGITUDE'];
          return lat && lon
            ? `https://www.google.com/maps?q=${lat},${lon}`
            : '';
        }
        if (h === 'LATITUDE') return undefined; // no la duplicamos
        return item[h];
      });
      sheet.addRow(rowData);
    });

    // Ancho columnas
    sheet.columns.forEach((col) => {
      col.width = 20;
    });
  };

  // Crear hojas
  if (dataVisit && dataVisit.length > 0) createSheet('Visitas Registradas', dataVisit, visitHeadersMap);
  if (dataNoVisit && dataNoVisit.length > 0) createSheet('No Visitados', dataNoVisit, visitHeadersMap);
  if (dataPending && dataPending.length > 0) createSheet('Pendientes', dataPending, pendingHeadersMap);

  // Guardar en buffer y devolverlo
  return workbook;
};

module.exports = { generateVisitsExcel };