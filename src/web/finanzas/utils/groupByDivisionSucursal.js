/**
 * Agrupa los datos por Division y dentro de cada una por Sucursal.
 * También genera un resumen general (clave 'GENERAL') sumando todas las divisiones.
 * 
 * @param {Array} data - Arreglo plano de datos con campos como DivisionName, SucCode, TotalSales, etc.
 * @returns {Record<string, Array>} Objeto agrupado por DivisionName y una clave 'GENERAL' que contiene el resumen completo.
 */
const agruparPorDivisionYSucursal = (data) => {
  const divisionGroups = {};
  const generalGroup = {};

  for (const item of data) {
    const divisionName = item.DivisionName || 'SIN_DIVISION';
    const sucKey = item.SucCode;

    // Inicializar agrupación por división
    if (!divisionGroups[divisionName]) {
      divisionGroups[divisionName] = {};
    }

    if (!divisionGroups[divisionName][sucKey]) {
      divisionGroups[divisionName][sucKey] = {
        SucCode: item.SucCode,
        SucName: item.SucName,
        TotalSales: 0,
        TotalCostComercial: 0,
        ComercialProfit: 0,
        CommercialMarginPercent: 0,
        data: []
      };
    }

    const sucDiv = divisionGroups[divisionName][sucKey];

    // Acumular en división
    sucDiv.TotalSales += parseFloat(item.TotalSales);
    sucDiv.TotalCostComercial += parseFloat(item.TotalCostComercial);
    sucDiv.ComercialProfit += parseFloat(item.ComercialProfit);

    const cleanedItem = { ...item };
    delete cleanedItem.SucCode;
    delete cleanedItem.SucName;
    delete cleanedItem.DivisionCode;
    delete cleanedItem.DivisionName;

    sucDiv.data.push(cleanedItem);

    // Acumular también en grupo general
    if (!generalGroup[sucKey]) {
      generalGroup[sucKey] = {
        SucCode: item.SucCode,
        SucName: item.SucName,
        TotalSales: 0,
        TotalCostComercial: 0,
        ComercialProfit: 0,
        CommercialMarginPercent: 0,
        data: []
      };
    }

    const sucGen = generalGroup[sucKey];

    sucGen.TotalSales += parseFloat(item.TotalSales);
    sucGen.TotalCostComercial += parseFloat(item.TotalCostComercial);
    sucGen.ComercialProfit += parseFloat(item.ComercialProfit);

    // Agregar también al detalle general
    const cleanedItemWithDivision = { ...item };
    delete cleanedItemWithDivision.SucCode;
    delete cleanedItemWithDivision.SucName;

    sucGen.data.push(cleanedItemWithDivision);
  }

  // Calcular márgenes y formatear resultado final
  const resultadoFinal = {};

  for (const division in divisionGroups) {
    resultadoFinal[division] = Object.values(divisionGroups[division]).map(suc => {
      const utilidad = suc.ComercialProfit;
      const totalVentas = suc.TotalSales;

      suc.TotalSales = Number(totalVentas.toFixed(2));
      suc.TotalCostComercial = Number(suc.TotalCostComercial.toFixed(2));
      suc.ComercialProfit = Number(utilidad.toFixed(2));
      suc.CommercialMarginPercent = Number(((utilidad / totalVentas) * 100).toFixed(2));

      return suc;
    });
  }

  // Calcular también para el grupo general
  resultadoFinal['GENERAL'] = Object.values(generalGroup).map(suc => {
    const utilidad = suc.ComercialProfit;
    const totalVentas = suc.TotalSales;

    suc.TotalSales = Number(totalVentas.toFixed(2));
    suc.TotalCostComercial = Number(suc.TotalCostComercial.toFixed(2));
    suc.ComercialProfit = Number(utilidad.toFixed(2));
    suc.CommercialMarginPercent = Number(((utilidad / totalVentas) * 100).toFixed(2));

    return suc;
  });

  return resultadoFinal;
}


module.exports = {
  agruparPorDivisionYSucursal,
}