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
    
        // Agrupar por Sección
        const agrupadoPorSeccion = resultadosFiltrados.reduce((acc, item) => {
          const seccion = item.Seccion;
          const cuenta = item.Cuenta;
    
          // Si la sección no existe, inicialízala
          if (!acc[seccion]) {
            acc[seccion] = {
              totalIngreso: 0,
              totalEgreso: 0,
              cuentas: {}
            };
          }
    
          // Si la cuenta no existe dentro de la sección, inicialízala
          if (!acc[seccion].cuentas[cuenta]) {
            acc[seccion].cuentas[cuenta] = {
              Cuenta: item.Cuenta,
              NombreDeCuenta: item['Nombre de Cuenta'],
              Ingreso: 0,
              Egreso: 0,
              Detalles: []
            };
          }
    
          // Agregar los ingresos y egresos a la cuenta correspondiente
          acc[seccion].cuentas[cuenta].Ingreso += parseFloat(item.Ingreso);
          acc[seccion].cuentas[cuenta].Egreso += parseFloat(item.Egreso);
          acc[seccion].totalIngreso += parseFloat(item.Ingreso);
          acc[seccion].totalEgreso += parseFloat(item.Egreso);
    
          // Añadir el detalle específico (por si necesitas mantener los detalles)
          acc[seccion].cuentas[cuenta].Detalles.push(item);
    
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
        })

    }
}

module.exports = {
    parteDiaroController
}