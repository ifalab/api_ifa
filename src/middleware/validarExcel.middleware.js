const validarArchivoExcel = (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ mensaje: 'No hay un archivo que subir' });
    }

    const archivo = req.files.find(file => file.fieldname === 'archivo');

    if (!archivo) {
        return res.status(400).json({ mensaje: 'No se encontró el archivo con el nombre esperado' });
    }

    const { mimetype } = archivo;
    const allowedMimes = [
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];

    if (!allowedMimes.includes(mimetype)) {
        return res.status(400).json({ mensaje: 'El archivo debe ser un Excel (.xls, .xlsx)' });
    }

    req.archivo = archivo;

    next(); // Continúa con el siguiente middleware o controlador
};

module.exports = { validarArchivoExcel };