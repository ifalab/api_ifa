const esDatoValido = (dato) => {
    return (
        typeof dato.codigoZona === 'number' &&
        typeof dato.itemCode === 'string' &&
        typeof dato.cantidad === 'number'
    );
}

const validarExcel = (jsonData) => {
    if (!Array.isArray(jsonData)) {
        return { valido: false, error: 'Los datos no son un arreglo.' };
    }

    for (let i = 0; i < jsonData.length; i++) {
        const fila = jsonData[i];

        if (
            !fila.hasOwnProperty('codigoZona') ||
            !fila.hasOwnProperty('itemCode') ||
            !fila.hasOwnProperty('cantidad')
        ) {
            return { valido: false, error: `Falta una propiedad en la fila ${i + 1}` };
        }

        if (!esDatoValido(fila)) {
            return { valido: false, error: `Tipos de datos inválidos en la fila ${i + 2}` };
        }
    }

    return { valido: true };
}

module.exports = {
    esDatoValido,
    validarExcel,
}