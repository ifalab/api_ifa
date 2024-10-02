const { parteDiario } = require("./hana.controller")

const parteDiaroController = async (req, res) => {
  try {
    const { fecha } = req.body;
    if (!fecha) {
      return res.status(400).json({ mensaje: 'Debe proporcionar una fecha' });
    }

    const fechaFiltro = new Date(fecha).toISOString().split('T')[0];
    const result = await parteDiario();
    const resultadosFiltrados = result.filter(item => {
      const fechaItem = new Date(item.Fecha).toISOString().split('T')[0];
      return fechaItem === fechaFiltro;
    });

    // Agrupar por Sección y crear la lista de descripciones
    const agrupadoPorSeccion = resultadosFiltrados.reduce((acc, item) => {
      const seccion = item.Seccion;

      // Si la sección no existe, iniciarla
      if (!acc[seccion]) {
        acc[seccion] = {
          totalIngreso: 0,
          totalEgreso: 0,
          descripcion: []
        };
      }

      // Agregar los ingresos y egresos a la sección correspondiente
      acc[seccion].totalIngreso += parseFloat(item.Ingreso);
      acc[seccion].totalEgreso += parseFloat(item.Egreso);

      // Añadir el detalle específico a la lista de descripciones
      acc[seccion].descripcion.push({
        Cuenta: item.Cuenta,
        Fecha: item.Fecha,
        "Proveedor/Cliente": item['Proveedor/Cliente'],
        Ingreso: item.Ingreso,
        Egreso: item.Egreso,
        Contracuenta: item.Contracuenta,
        "Nombre de Cuenta": item['Nombre de Cuenta'],
        Origen: item.Origen,
        Descripción: item.Descripción,
        Seccion: item.Seccion
      });

      return acc;
    }, {});

    // Calcular totales generales
    let totalGeneralIngreso = 0;
    let totalGeneralEgreso = 0;

    // Recorrer todas las secciones para calcular el total general
    for (const seccion in agrupadoPorSeccion) {
      totalGeneralIngreso += agrupadoPorSeccion[seccion].totalIngreso;
      totalGeneralEgreso += agrupadoPorSeccion[seccion].totalEgreso;
    }

    const resultadoFinal = {
      agrupadoPorSeccion,
      totalGeneralIngreso,
      totalGeneralEgreso
    };

    return res.status(200).json(resultadoFinal);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'error en el controlador parteDiarioController',
      error,
    });
  }
}

module.exports = {
    parteDiaroController
}