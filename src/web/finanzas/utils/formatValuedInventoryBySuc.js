const formatValuedInventory = (rows = []) => {
  if (!rows || rows.length === 0) {
    return { summary: {}, sucursales: [] };
  }

  const round2 = num => Number(num.toFixed(2));
  const roundInt = num => Math.round(num);

  const summary = {
    totalInQty: 0,
    totalOutQty: 0,
    saldoQty: 0,
    totalInValue: 0,
    totalOutValue: 0,
    saldoValue: 0
  };

  rows.forEach(row => {
    const totalInQty = Number(row.totalInQty) || 0;
    const totalOutQty = Number(row.totalOutQty) || 0;
    const saldoQty = Number((row.saldoQty || 0)) || 0;

    const totalInValue = parseFloat(row.totalInValue) || 0;
    const totalOutValue = parseFloat(row.totalOutValue) || 0;
    const saldoValue = parseFloat(row.saldoValue || 0) || 0;

    summary.totalInQty += totalInQty;
    summary.totalOutQty += totalOutQty;
    summary.saldoQty += saldoQty;
    summary.totalInValue += totalInValue;
    summary.totalOutValue += totalOutValue;
    summary.saldoValue += saldoValue;
  });

  // Redondeo final
  summary.totalInQty = round2(summary.totalInQty);
  summary.totalOutQty = round2(summary.totalOutQty);
  summary.saldoQty = round2(summary.saldoQty);
  summary.totalInValue = round2(summary.totalInValue);
  summary.totalOutValue = round2(summary.totalOutValue);
  summary.saldoValue = round2(summary.saldoValue);

  // Devolver sucursales tal cual
  const sucursales = rows.map(row => ({
    ...row,
    totalInQty: round2(Number(row.totalInQty)),
    totalOutQty: round2(Number(row.totalOutQty)),
    saldoQty: round2(Number(row.saldoQty || 0)),
    totalInValue: round2(parseFloat(row.totalInValue) || 0),
    totalOutValue: round2(parseFloat(row.totalOutValue) || 0),
    saldoValue: round2(parseFloat(row.saldoValue || row.TotalComlPrice || 0))
  }));

  return { summary, sucursales };
};

module.exports = { formatValuedInventory };
