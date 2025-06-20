function groupBySucursalYVendedor(data){
  const sucursalesMap = new Map();

  for (const item of data) {
    // Obtener o crear la sucursal
    let sucursal = sucursalesMap.get(item.SucCode);
    if (!sucursal) {
      sucursal = {
        SucCode: item.SucCode,
        SucName: item.SucName,
        vendedores: []
      };
      sucursalesMap.set(item.SucCode, sucursal);
    }

    // Buscar vendedor dentro de la sucursal
    let vendedor = sucursal.vendedores.find(v => v.SlpCode === item.SlpCode);
    if (!vendedor) {
      vendedor = {
        SlpCode: item.SlpCode,
        SlpName: item.SlpName,
        data: []
      };
      sucursal.vendedores.push(vendedor);
    }

    // Agregar el item a la data del vendedor
    vendedor.data.push(item);
  }

  return Array.from(sucursalesMap.values());
}

module.exports = {
  groupBySucursalYVendedor
}