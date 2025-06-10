const estructurarBalanceParaTree = (dataPlano) => {
  const mapNivel1 = new Map();

  for (const item of dataPlano) {
    const nivel1Key = `${item['Nivel 1']} - ${item['Nombre Nivel 1']}`;
    const nivel2Key = `${item['Nivel 2']} - ${item['Nombre Nivel 2']}`;
    const nivel3Key = `${item['Nivel 3']} - ${item['Nombre Nivel 3']}`;
    const nivel4Key = `${item['Nivel 4']} - ${item['Nombre Nivel 4']}`;

    if (!mapNivel1.has(nivel1Key)) {
      mapNivel1.set(nivel1Key, { name: nivel1Key, children: [] });
    }
    const nivel1Node = mapNivel1.get(nivel1Key);

    let nivel2Node = nivel1Node.children.find(c => c.name === nivel2Key);
    if (!nivel2Node) {
      nivel2Node = { name: nivel2Key, children: [] };
      nivel1Node.children.push(nivel2Node);
    }

    let nivel3Node = nivel2Node.children.find(c => c.name === nivel3Key);
    if (!nivel3Node) {
      nivel3Node = { name: nivel3Key, children: [] };
      nivel2Node.children.push(nivel3Node);
    }

    let nivel4Node = nivel3Node.children.find(c => c.name === nivel4Key);
    if (!nivel4Node) {
      nivel4Node = { name: nivel4Key, items: [] };
      nivel3Node.children.push(nivel4Node);
    }

    nivel4Node.items.push({
      Cuenta: item['Cuenta'],
      NombreCuenta: item['Nombre de la Cuenta'],
      Debito: parseFloat(item['Debito']),
      Credito: parseFloat(item['Credito']),
      Saldo: parseFloat(item['Saldo']),
      Fecha: item['RefDate'],
    });
  }

  return Array.from(mapNivel1.values());
};

module.exports = {
  estructurarBalanceParaTree
}