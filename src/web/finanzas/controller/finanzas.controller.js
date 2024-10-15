const { parteDiario, abastecimiento, abastecimientoMesActual } = require("./hana.controller")

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

    // Agrupar por sección y crear la lista de descripciones
    const agrupadoPorSeccion = resultadosFiltrados.reduce((acc, item) => {
      const seccion = item.Seccion;

      if (!acc[seccion]) {
        acc[seccion] = {
          totalIngreso: 0,
          totalEgreso: 0,
          descripcion: [],
        };
      }

      acc[seccion].totalIngreso += parseFloat(item.Ingreso);
      acc[seccion].totalEgreso += parseFloat(item.Egreso);

      if(seccion=='3. GASTO'){
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
          Seccion: item.Seccion,
        });
      }

      return acc;
    }, {});

    // Ordenar las secciones numéricamente o alfabéticamente
    const seccionesOrdenadas = Object.keys(agrupadoPorSeccion)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .reduce((obj, key) => {
        obj[key] = agrupadoPorSeccion[key];
        return obj;
      }, {});

    // Calcular totales generales
    let totalGeneralIngreso = 0;
    let totalGeneralEgreso = 0;

    for (const seccion in seccionesOrdenadas) {
      totalGeneralIngreso += seccionesOrdenadas[seccion].totalIngreso;
      totalGeneralEgreso += seccionesOrdenadas[seccion].totalEgreso;
    }

    const resultadoFinal = {
      agrupadoPorSeccion: seccionesOrdenadas,
      totalGeneralIngreso,
      totalGeneralEgreso,
    };

    return res.status(200).json(resultadoFinal);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'error en el controlador parteDiarioController',
      error,
    });
  }
};


const parteDiaroMesActualController = async (req, res) => {
  try {
    const result = await parteDiario();

    // Obtener el mes y año actuales
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth(); // 0 = Enero, 1 = Febrero, etc.
    const anioActual = fechaActual.getFullYear();

    // Filtrar los resultados por el mes y año actuales
    const resultadosFiltrados = result.filter(item => {
      const fechaItem = new Date(item.Fecha);
      const mesItem = fechaItem.getMonth();
      const anioItem = fechaItem.getFullYear();
      return mesItem === mesActual && anioItem === anioActual;
    });

    // Agrupar por sección y crear la lista de descripciones
    const agrupadoPorSeccion = resultadosFiltrados.reduce((acc, item) => {
      const seccion = item.Seccion;

      if (!acc[seccion]) {
        acc[seccion] = {
          totalIngreso: 0,
          totalEgreso: 0,
          descripcion: [],
        };
      }

      acc[seccion].totalIngreso += parseFloat(item.Ingreso);
      acc[seccion].totalEgreso += parseFloat(item.Egreso);

      if(seccion=='3. GASTO'){
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
          Seccion: item.Seccion,
        });
      }
      

      return acc;
    }, {});

    // Ordenar las secciones numéricamente o alfabéticamente
    const seccionesOrdenadas = Object.keys(agrupadoPorSeccion)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .reduce((obj, key) => {
        obj[key] = agrupadoPorSeccion[key];
        return obj;
      }, {});

    let totalGeneralIngreso = 0;
    let totalGeneralEgreso = 0;

    for (const seccion in seccionesOrdenadas) {
      totalGeneralIngreso += seccionesOrdenadas[seccion].totalIngreso;
      totalGeneralEgreso += seccionesOrdenadas[seccion].totalEgreso;
    }

    const resultadoFinal = {
      agrupadoPorSeccion: seccionesOrdenadas,
      totalGeneralIngreso,
      totalGeneralEgreso,
    };

    return res.status(200).json(resultadoFinal);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'error en el controlador parteDiarioController',
      error,
    });
  }
};

const abastecimientoController = async (req, res) => {
  try {
    const { fecha } = req.body
    const result = await abastecimiento(fecha)
    let data = []
    let response = []
    let totalBs = 0, totalDolares = 0, totalPorcentaje = 1
    result.map((item) => {
      const newData = {
        Tipo: item.Tipo,
        CostoComercial: item["Costo Comercial"],
        CostoComercialDolares: item["SUM(ROUND(COSTO COMERCIAL TOTAL/6.96,2))"]
      }
      data.push(newData)
    })

    data.map((item) => {
      totalBs += +item.CostoComercial
      totalDolares += +item.CostoComercialDolares
    })

    if (totalBs > 0) {
      data.map((item) => {
        let porcentaje = 0
        if (item.CostoComercial != 0) {
          porcentaje = item.CostoComercial / totalBs
        }
        const newData = {
          ...item,
          porcentaje
        }
        response.push(newData)
      })
    }
    return res.status(200).json({ response, totalBs, totalDolares, totalPorcentaje })
  } catch (error) {
    console.log('error en abastecimiento controller')
    console.log(error)
    return res.status(500).json({
      mensaje: 'error en el controlador',
      error
    })
  }
}

const abastecimientoMesActualController = async (req, res) => {
  try {
    
    const result = await abastecimientoMesActual()
    let data = []
    let response = []
    let totalBs = 0, totalDolares = 0, totalPorcentaje = 1
    result.map((item) => {
      const newData = {
        Tipo: item.Tipo,
        CostoComercial: item["Costo Comercial"],
        CostoComercialDolares: item["SUM(ROUND(COSTO COMERCIAL TOTAL/6.96,2))"]
      }
      data.push(newData)
    })

    data.map((item) => {
      totalBs += +item.CostoComercial
      totalDolares += +item.CostoComercialDolares
    })

    if (totalBs > 0) {
      data.map((item) => {
        let porcentaje = 0
        if (item.CostoComercial != 0) {
          porcentaje = item.CostoComercial / totalBs
        }
        const newData = {
          ...item,
          porcentaje
        }
        response.push(newData)
      })
    }
    return res.status(200).json({ response, totalBs, totalDolares, totalPorcentaje })
  } catch (error) {
    console.log('error en abastecimiento controller')
    console.log(error)
    return res.status(500).json({
      mensaje: 'error en el controlador',
      error
    })
  }
}
module.exports = {
  parteDiaroController,
  abastecimientoController,
  abastecimientoMesActualController,
  parteDiaroMesActualController,
}