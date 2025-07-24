/**
 * Agrupa los datos por Division y dentro de cada una por Sucursal.
 * También genera un resumen general (clave 'GENERAL') sumando todas las divisiones.
 * 
 * @param {Array} data - Arreglo plano de datos con campos como DivisionName, SucCode, TotalSales, etc.
 * @returns {Record<string, Array>} Objeto agrupado por DivisionName y una clave 'GENERAL' que contiene el resumen completo.
 */
const agruparPorDivisionYSucursal = (data) => {
  // console.log(data);
  const divisionGroups = {};
  const divisionMetadata = {}; 
  const generalGroup = {};

  for (const item of data) {
    const divisionName = item.DivisionName || 'SIN_DIVISION';
    const divisionCode = item.DivisionCode || null;
    const sucKey = item.SucCode;

    // Inicializar agrupación por división
    if (!divisionMetadata[divisionName]) {
      divisionMetadata[divisionName] = divisionCode;
    }

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
    const cost = parseFloat(item.TotalCostComercial);
    sucDiv.TotalCostComercial += isNaN(cost) ? 0 : cost;

    if (isNaN(cost)) {
      console.warn('Valor inválido en TotalCostComercial:', item.TotalCostComercial, 'en sucursal', item.SucName);
    }

    const sales = parseFloat(item.TotalSales);
    sucDiv.TotalSales += isNaN(sales) ? 0 : sales;

    if (isNaN(sales)) {
      console.warn('Valor inválido en TotalSales:', item.TotalSales, 'en sucursal', item.SucName);
    }

    const profit = parseFloat(item.ComercialProfit);
    sucDiv.ComercialProfit += isNaN(profit) ? 0 : profit;

    if (isNaN(profit)) {
      console.warn('Valor inválido en ComercialProfit:', item.ComercialProfit, 'en sucursal', item.SucName);
    }

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

    sucGen.TotalSales += isNaN(sales) ? 0 : sales;
    sucGen.TotalCostComercial += isNaN(cost) ? 0 : cost;
    sucGen.ComercialProfit += isNaN(profit) ? 0 : profit;


    // Agregar también al detalle general
    const cleanedItemWithDivision = { ...item };
    delete cleanedItemWithDivision.SucCode;
    delete cleanedItemWithDivision.SucName;

    sucGen.data.push(cleanedItemWithDivision);
  }

  // Calcular márgenes y formatear resultado final
  const resultadoFinal = {};

  // for (const division in divisionGroups) {
  //   resultadoFinal[division] = Object.values(divisionGroups[division]).map(suc => {
  //     const utilidad = suc.ComercialProfit;
  //     const totalVentas = suc.TotalSales;

  //     suc.TotalSales = Number(totalVentas.toFixed(2));
  //     suc.TotalCostComercial = Number(suc.TotalCostComercial.toFixed(2));
  //     suc.ComercialProfit = Number(utilidad.toFixed(2));
  //     suc.CommercialMarginPercent = Number(((utilidad / totalVentas) * 100).toFixed(2));

  //     return suc;
  //   });
  // }

  // console.log(divisionGroups);
  for (const division in divisionGroups) {
    const divisionCode = divisionMetadata[division] ?? null;
    const sucursales = Object.values(divisionGroups[division]).map(suc => {
      const utilidad = suc.ComercialProfit;
      const totalVentas = suc.TotalSales;

      suc.TotalSales = Number(totalVentas.toFixed(2));
      suc.TotalCostComercial = Number(suc.TotalCostComercial.toFixed(2));
      suc.ComercialProfit = Number(utilidad.toFixed(2));
      suc.CommercialMarginPercent = Number(((utilidad / totalVentas) * 100).toFixed(2));

      return suc;
    });

    resultadoFinal[division] = [
      { DivisionName: division, DivisionCode: divisionCode },
      ...sucursales
    ];
  }

  // Calcular también para el grupo general
  const generalSucursales = Object.values(generalGroup).map(suc => {
    const utilidad = suc.ComercialProfit;
    const totalVentas = suc.TotalSales;

    suc.TotalSales = Number(totalVentas.toFixed(2));
    suc.TotalCostComercial = Number(suc.TotalCostComercial.toFixed(2));
    suc.ComercialProfit = Number(utilidad.toFixed(2));
    suc.CommercialMarginPercent = Number(((utilidad / totalVentas) * 100).toFixed(2));

    return suc;
  });

  resultadoFinal['GENERAL'] = [
    { DivisionName: null, DivisionCode: null },
    ...generalSucursales
  ];
  return resultadoFinal;
}


module.exports = {
  agruparPorDivisionYSucursal,
}