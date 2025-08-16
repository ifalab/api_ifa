const xlsx = require('xlsx');

const validateExcelDimensionado = (file) => {
  const workbook = xlsx.read(file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

  const erroresPorFila = [];

  data.forEach((row, index) => {
    const fila = index + 2; // fila real en Excel
    const errores = [];

    const cuenta = (row['Cuenta'] ?? '').toString().trim();
    const camposSucursal = ['SucCode', 'SucName'];
    const camposDivisionLinea = ['DivisionCode', 'DivisionName', 'LineCode', 'LineName'];

    // Validación 1: cuenta vacía
    if (!cuenta) {
      errores.push('El campo "Cuenta" no puede estar vacío.');
    }

    // Validación 2: cuenta que no empieza con 6 → campos relacionados deben estar vacíos
    if (cuenta && !cuenta.startsWith('6')) {
      for (const campo of [...camposSucursal, ...camposDivisionLinea]) {
        if ((row[campo] || '').toString().trim() !== '') {
          errores.push(`El campo "${campo}" debe estar vacío porque la cuenta "${cuenta}" no empieza con 6.`);
        }
      }
    }
    // Validación 3: si hay Division/Line, debe haber Sucursal
    const sucCodeValor = (row['SucCode'] ?? '').toString().trim();
    console.log(sucCodeValor);
    const tieneDivisionOLinea = camposDivisionLinea.some(campo => (row[campo] || '').toString().trim() !== '');
    const faltaSucursal = camposSucursal.some(campo => (row[campo] || '').toString().trim() === '');

    if (tieneDivisionOLinea && sucCodeValor !== '0' && faltaSucursal) {
      errores.push('Si hay datos en división o línea, los campos "SucCode" y "SucName" son obligatorios.');
    }

    // Si hay errores en esta fila, los agregamos
    if (errores.length > 0) {
      erroresPorFila.push({
        fila,
        errores
      });
    }
  });

  return erroresPorFila; // Array con errores por fila
};

module.exports = {
  validateExcelDimensionado
};
