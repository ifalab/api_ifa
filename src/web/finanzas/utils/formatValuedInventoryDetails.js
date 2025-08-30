const formatValuedInventoryDetails = (data, whsCode = null) => {
  const sucMap = new Map();

  data.forEach(item => {
    const sucCode = item.SucCode;
    const sucName = item.SucName;

    if (!sucMap.has(sucCode)) {
      sucMap.set(sucCode, { 
        SucCode: sucCode, 
        SucName: sucName, 
        detalle: [] 
      });
    }

    const suc = sucMap.get(sucCode);

    // si whsCode viene, agrupamos por ItemCode
    const groupKey = whsCode ? item.ItemCode : item.WhsCode;

    let detalleItem = suc.detalle.find(d => 
      (whsCode ? d.ItemCode === item.ItemCode : d.WhsCode === item.WhsCode)
    );

    const totalInQty = parseFloat(item.TotalInQty);
    const totalOutQty = parseFloat(item.TotalOutQty);
    const totalInValue = parseFloat(item.TotalInValue);
    const totalOutValue = parseFloat(item.TotalOutValue);

    if (!detalleItem) {
      if (whsCode) {
        detalleItem = {
          ItemCode: item.ItemCode,
          ItemName: item.ItemName,
          Quantity: (totalInQty - totalOutQty),
          TotalComlPrice: (totalInValue - totalOutValue)
        };
      } else {
        detalleItem = {
          WhsCode: item.WhsCode,
          WhsName: item.WhsName,
          Quantity: (totalInQty - totalOutQty),
          TotalComlPrice: (totalInValue - totalOutValue)
        };
      }
      suc.detalle.push(detalleItem);
    } else {
      // acumular valores
      detalleItem.Quantity += (totalInQty - totalOutQty);
      detalleItem.TotalComlPrice += (totalInValue - totalOutValue);
    }
  });

  const result = Array.from(sucMap.values()).map(suc => {
    suc.detalle.sort((a, b) => b.TotalComlPrice - a.TotalComlPrice);
    return suc;
  });

  return result;
};

module.exports = { formatValuedInventoryDetails };
