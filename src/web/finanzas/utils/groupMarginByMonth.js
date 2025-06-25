const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const groupMarginByMonth = (data) => {
  return data.map(item => ({
    mes: MONTHS_ES[item.Month - 1],
    anio: item.Year,
    TotalSales: Number(item.TotalSales),
    TotalCostComercial: Number(item.TotalCostComercial),
    ComercialProfit: Number(item.ComercialProfit),
    CommercialMarginPercent: Number(item.CommercialMarginPercent)
  }));
};


module.exports = {
  groupMarginByMonth
}