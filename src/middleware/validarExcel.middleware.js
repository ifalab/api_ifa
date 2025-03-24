const validarArchivoExcel = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ mensaje: 'No hay un archivo que subir' });
    }

    const { mimetype } = req.file;
    const allowedMimes = [
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];

    if (!allowedMimes.includes(mimetype)) {
        return res.status(400).json({ mensaje: 'El archivo debe ser un Excel (.xls, .xlsx)' });
    }

    next(); // Continúa con el siguiente middleware o controlador
};

module.exports = { validarArchivoExcel };