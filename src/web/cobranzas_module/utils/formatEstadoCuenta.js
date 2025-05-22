const formatData = (data) => {
  const clientesMap = {};

  data.forEach(transaccion => {
    console.log(transaccion);
    const clienteId = transaccion.CardCode;
    if (!clientesMap[clienteId]) {
      clientesMap[clienteId] = {
        CardCode: transaccion.CardCode,
        CardName: transaccion.CardName,
        CardFName: transaccion.CardFName,
        Descr: transaccion.Descr,
        LicTradNum: transaccion.LicTradNum,
        Phone1: transaccion.Phone1,
        Cellular: transaccion.Cellular,
        E_Mail: transaccion.E_Mail,
        PymntGroup: transaccion.PymntGroup,
        Balance: transaccion.Balance,
        transacciones: []
      };
    }

    const cliente = clientesMap[clienteId];

    // Usamos Documento como clave para agrupar, si es null usamos un índice único generado
    const docKey = transaccion.Documento !== null ? transaccion.Documento : `null_${transaccion.Nro}`;

    let transaccionExistente = cliente.transacciones.find(t => t._docKey === docKey);

    if (!transaccionExistente) {
      transaccionExistente = { factura: {}, pago: [], _docKey: docKey };
      cliente.transacciones.push(transaccionExistente);
    }

    if (transaccion.Transaccion === "Factura" || transaccion.Transaccion === "Carga") {
      transaccionExistente.factura = {
        vencimiento: transaccion.vencimiento,
        Balance: transaccion.Balance,
        Fecha: transaccion.Fecha,
        FechaVencimiento: transaccion.FechaVencimiento,
        Documento: transaccion.Documento,
        Transaccion: transaccion.Transaccion,
        Nro: transaccion.Nro,
        Cargo: transaccion.Cargo,
        Comentarios: transaccion.Comentarios,
        Saldo: transaccion.Saldo
      };
    } else if (transaccion.Transaccion === "Pago") {
      transaccionExistente.pago.push({ 
        pagovsvenc: transaccion.pagovsvenc,
        vencimiento: transaccion.vencimiento,
        Balance: transaccion.Balance,
        NroPago: transaccion.NroPago,
        FechaPago: transaccion.FechaPago,
        Transaccion: transaccion.Transaccion,
        Nro: transaccion.Nro,
        Abono: transaccion.Abono,
        Comentarios: transaccion.Comentarios
      });
    }
  });

  // Limpiar la clave interna _docKey y ordenar por fecha descendente
  Object.values(clientesMap).forEach(cliente => {
    cliente.transacciones.forEach(t => delete t._docKey);
    cliente.transacciones.sort((a, b) => {
      const fechaA = new Date(a.factura.Fecha || a.pago.FechaPago || 0);
      const fechaB = new Date(b.factura.Fecha || b.pago.FechaPago || 0);
      return fechaB - fechaA;
    });
  });

  return Object.values(clientesMap);
};

module.exports = formatData;
