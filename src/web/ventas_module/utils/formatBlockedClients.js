const groupBySucursal = (items) => {
  const grouped = {};

  let OverdueClientsCount = 0;
  let TotalClients = 0;
  let TotalOverdueAmount = 0;

  for (const item of items) {
    const key = item.SucCode;

    if (!grouped[key]) {
      grouped[key] = {
        SucCode: item.SucCode,
        SucName: item.SucName,
        data: []
      };
    }

    const { SucCode, SucName, ...rest } = item;

    // Sumar para totales generales
    OverdueClientsCount += Number(rest.OverdueClientsCount) || 0;
    TotalClients += Number(rest.TotalClients) || 0;
    TotalOverdueAmount += Number(rest.TotalOverdueAmount) || 0;

    grouped[key].data.push(rest);
  }

  // Calcular porcentaje global (evitando división por 0)
  const Percent =
    TotalClients === 0 ? 0 : OverdueClientsCount / TotalClients;

  // Armar objeto de totales
  const totalesObj = {
    SucCode: 0,
    SucName: 'Totales',
    data: [
      {
        TotalClients,
        OverdueClientsCount,
        TotalOverdueAmount: TotalOverdueAmount.toFixed(6),
        Percent: Percent.toFixed(6)
      }
    ]
  };

  const resultado = Object.values(grouped);
  resultado.push(totalesObj);

  return resultado;
};

module.exports = {
  groupBySucursal
};
