const { parteDiario, abastecimiento, abastecimientoMesActual, abastecimientoMesAnterior, findAllRegions, findAllLines, findAllSubLines, findAllGroupAlmacenes, abastecimientoPorFecha, abastecimientoPorFechaAnual, abastecimientoPorFecha_24_meses, reporteArticuloPendientes } = require("./hana.controller")
const { todosGastos, gastosXAgencia, gastosGestionAgencia } = require('./sql_finanza_controller')

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

      if (seccion == '3. GASTO') {
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

      if (seccion == '3. GASTO') {
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

const abastecimientoMesAnteriorController = async (req, res) => {
  try {
    const result = await abastecimientoMesAnterior()
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
    console.log('error en abastecimientoMesAnteriorController')
    console.log(error)
    return res.status(500).json({
      mensaje: 'error en el abastecimientoMesAnteriorController',
      error
    })
  }
}

const abastecimientoPorFechaController = async (req, res) => {
  try {

    const sapResponse = await abastecimientoPorFecha();
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ]
    let data = []
    let response = []
    let totalBs = 0, totalDolares = 0, totalPorcentaje = 1
    sapResponse.map((item) => {
      const newData = {
        year: item.year,
        month: item.month,
        monthName: `${meses[item.month - 1]}`,
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

    const agrupadoPorMes = response.reduce((acc, item) => {
      const { year, month, monthName, Tipo, CostoComercial, CostoComercialDolares, porcentaje } = item;

      let mesExistente = acc.find(mes => mes.year === year && mes.month === month);

      if (!mesExistente) {
        mesExistente = {
          year,
          month,
          monthName,
          Tipo: []
        };
        acc.push(mesExistente);
      }

      mesExistente.Tipo.push({
        name: Tipo,
        CostoComercial,
        CostoComercialDolares,
        porcentaje
      });

      return acc;
    }, []);

    const ordenarTiposYCalcularVariacion = (agrupadoPorMes) => {
      // Ordenar los tipos en cada mes alfabéticamente por el atributo 'name'
      agrupadoPorMes.forEach(mes => {
        mes.Tipo.sort((a, b) => a.name.localeCompare(b.name));
      });

      // Calcular variación después de ordenar los tipos
      agrupadoPorMes.forEach((mesActual, index) => {
        // No calcular variación para el primer mes, pues no tiene mes anterior
        if (index === 0) {
          mesActual.Tipo.forEach(tipo => tipo.variacion = 0);
          return;
        }

        // Obtener el mes anterior, que también tiene los tipos ordenados
        const mesAnterior = agrupadoPorMes[index - 1];

        // Calcular variación directamente para cada tipo (mismo orden)
        mesActual.Tipo.forEach((tipoActual, idx) => {
          const tipoAnterior = mesAnterior.Tipo[idx];


          if (tipoAnterior && tipoAnterior.name === tipoActual.name) {
            const variacion = (parseFloat(tipoActual.CostoComercial) / parseFloat(tipoAnterior.CostoComercial)) - 1;
            tipoActual.variacion = variacion;
          } else {

            tipoActual.variacion = 0;
          }
        });
      });

      return agrupadoPorMes;
    };

    const result = ordenarTiposYCalcularVariacion(agrupadoPorMes);
    return res.status(200).json({ result });

  } catch (error) {
    console.log('error en abastecimientoPorFechaController')
    console.log(error)
    return res.status(500).json({
      mensaje: 'error en el abastecimientoPorFechaController',
      error
    })
  }
}

const abastecimientoFechaAnualController = async (req, res) => {
  try {
    const sapResponse = await abastecimientoPorFechaAnual();
    // return res.json({sapResponse})
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ]
    let data = []
    let response = []
    let totalBs = 0, totalDolares = 0, totalPorcentaje = 1
    sapResponse.map((item) => {
      const newData = {
        year: item.year,
        month: item.month,
        monthName: `${meses[item.month - 1]}`,
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

    const agrupadoPorMes = response.reduce((acc, item) => {
      const { year, month, monthName, Tipo, CostoComercial, CostoComercialDolares, porcentaje } = item;

      let mesExistente = acc.find(mes => mes.year === year && mes.month === month);

      if (!mesExistente) {
        mesExistente = {
          year,
          month,
          monthName,
          Tipo: []
        };
        acc.push(mesExistente);
      }

      mesExistente.Tipo.push({
        name: Tipo,
        CostoComercial,
        CostoComercialDolares,
        porcentaje
      });

      return acc;
    }, []);

    const ordenarTiposYCalcularVariacion = (agrupadoPorMes) => {
      // Ordenar los tipos en cada mes alfabéticamente por el atributo 'name'
      agrupadoPorMes.forEach(mes => {
        mes.Tipo.sort((a, b) => a.name.localeCompare(b.name));
      });

      // Calcular variación después de ordenar los tipos
      agrupadoPorMes.forEach((mesActual, index) => {
        // No calcular variación para el primer mes, pues no tiene mes anterior
        if (index === 0) {
          mesActual.Tipo.forEach(tipo => tipo.variacion = 0);
          return;
        }

        // Obtener el mes anterior, que también tiene los tipos ordenados
        const mesAnterior = agrupadoPorMes[index - 1];

        // Calcular variación directamente para cada tipo (mismo orden)
        mesActual.Tipo.forEach((tipoActual, idx) => {
          const tipoAnterior = mesAnterior.Tipo[idx];


          if (tipoAnterior && tipoAnterior.name === tipoActual.name) {
            const variacion = (parseFloat(tipoActual.CostoComercial) / parseFloat(tipoAnterior.CostoComercial)) - 1;
            tipoActual.variacion = variacion;
          } else {

            tipoActual.variacion = 0;
          }
        });
      });

      return agrupadoPorMes;
    };

    const result = ordenarTiposYCalcularVariacion(agrupadoPorMes);
    return res.status(200).json({ result });

  } catch (error) {
    console.log('error en abastecimientoPorFechaController')
    console.log(error)
    return res.status(500).json({
      mensaje: 'error en el abastecimientoPorFechaController',
      error
    })
  }
}

const abastecimientoFecha24MesesController = async (req, res) => {
  try {
    const sapResponse = await abastecimientoPorFecha_24_meses();
    // return res.json({sapResponse})
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ]
    let data = []
    let response = []
    let totalBs = 0, totalDolares = 0, totalPorcentaje = 1
    sapResponse.map((item) => {
      const newData = {
        year: item.year,
        month: item.month,
        monthName: `${meses[item.month - 1]}`,
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

    const agrupadoPorMes = response.reduce((acc, item) => {
      const { year, month, monthName, Tipo, CostoComercial, CostoComercialDolares, porcentaje } = item;

      let mesExistente = acc.find(mes => mes.year === year && mes.month === month);

      if (!mesExistente) {
        mesExistente = {
          year,
          month,
          monthName,
          Tipo: []
        };
        acc.push(mesExistente);
      }

      mesExistente.Tipo.push({
        name: Tipo,
        CostoComercial,
        CostoComercialDolares,
        porcentaje
      });

      return acc;
    }, []);

    const ordenarTiposYCalcularVariacion = (agrupadoPorMes) => {
      // Ordenar los tipos en cada mes alfabéticamente por el atributo 'name'
      agrupadoPorMes.forEach(mes => {
        mes.Tipo.sort((a, b) => a.name.localeCompare(b.name));
      });

      // Calcular variación después de ordenar los tipos
      agrupadoPorMes.forEach((mesActual, index) => {
        // No calcular variación para el primer mes, pues no tiene mes anterior
        if (index === 0) {
          mesActual.Tipo.forEach(tipo => tipo.variacion = 0);
          return;
        }

        // Obtener el mes anterior, que también tiene los tipos ordenados
        const mesAnterior = agrupadoPorMes[index - 1];

        // Calcular variación directamente para cada tipo (mismo orden)
        mesActual.Tipo.forEach((tipoActual, idx) => {
          const tipoAnterior = mesAnterior.Tipo[idx];


          if (tipoAnterior && tipoAnterior.name === tipoActual.name) {
            const variacion = (parseFloat(tipoActual.CostoComercial) / parseFloat(tipoAnterior.CostoComercial)) - 1;
            tipoActual.variacion = variacion;
          } else {

            tipoActual.variacion = 0;
          }
        });
      });

      return agrupadoPorMes;
    };

    const result = ordenarTiposYCalcularVariacion(agrupadoPorMes);
    return res.status(200).json({ result });

  } catch (error) {
    console.log('error en abastecimientoPorFechaController')
    console.log(error)
    return res.status(500).json({
      mensaje: 'error en el abastecimientoPorFechaController',
      error
    })
  }
}

const findAllRegionsController = async (req, res) => {
  try {
    const regiones = await findAllRegions()
    return res.json({ regiones })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllRegionsController ' })
  }
}

const findAllLineController = async (req, res) => {
  try {
    const lines = await findAllLines()
    return res.json({ lines })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllRegionsController ' })
  }
}

const findAllSublineController = async (req, res) => {
  try {
    const sublines = await findAllSubLines()
    return res.json({ sublines })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllRegionsController ' })
  }
}

const findAllGroupAlmacenController = async (req, res) => {
  try {
    const groupAlmacen = await findAllGroupAlmacenes()
    return res.json({ groupAlmacen })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllGroupAlmacenController ' })
  }
}

const findAllGastosController = async (req, res) => {
  try {
    const gastos = await todosGastos()
    const datosProcesados = procesarGastos(gastos);
    const data = calcularPorcentajes(datosProcesados);

    const totalByYearArray = Object.entries(data.totalByYear).map(([year, total]) => ({
      year,
      total,
    }));

    let processData = [];
    data.datosConPorcentajes.map((item) => {
      const { desc_grupo, montos, porcentajes, ...rest } = item;
      const montosArray = Object.entries(montos).map(([year, monto]) => ({
        year,
        monto,
      }));

      const porcentajesArray = Object.entries(porcentajes).map(([year, porcentaje]) => ({
        year,
        porcentaje,
      }));

      const newData = {
        desc_grupo: desc_grupo.trim(),
        montos: montosArray,
        porcentajes: porcentajesArray,
        ...rest,
      };
      processData.push(newData);
    });

    const { datosConPorcentajes, ...restData } = data;

    return res.json({ ...restData, totalByYear: totalByYearArray, processData });
    // return res.json({mensaje:'modificar codigo'})
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllGroupAlmacenController ' })
  }
}

const findAllSimpleGastosController = async (req, res) => {
  try {
    const gastos = await todosGastos()
    const datosProcesados = procesarGastos(gastos);
    const data = calcularPorcentajes(datosProcesados);

    const totalByYearArray = Object.entries(data.totalByYear).map(([year, total]) => ({
      date: year,
      monto: total,
    }));

    let processData = [];
    data.datosConPorcentajes.map((item) => {
      const { desc_grupo, montos, porcentajes, ...rest } = item;
      const montosArray = Object.entries(montos).map(([year, monto]) => ({
        year,
        monto,
      }));

      const porcentajesArray = Object.entries(porcentajes).map(([year, porcentaje]) => ({
        year,
        porcentaje,
      }));

      const newData = {
        desc_grupo: desc_grupo.trim(),
        montos: montosArray,
        porcentajes: porcentajesArray,
        ...rest,
      };
      processData.push(newData);
    });

    const { datosConPorcentajes, ...restData } = data;
    const montos = processData[0].montos
    const year = []
    montos.map((item) => {
      year.push(item.year)
    })

    const formatDataByYear = (processData) => {
      // Inicializamos un objeto para almacenar los datos agrupados por año
      const groupedData = processData.reduce((acc, item) => {
        const { desc_grupo, montos, porcentajes, total } = item;

        // Iteramos sobre los años en montos
        montos.forEach((montoItem) => {
          const date = montoItem.year;
          const monto = montoItem.monto;

          // Buscamos el porcentaje correspondiente para este año
          const porcentajeObj = porcentajes.find((p) => p.year === date);
          const porcentaje = porcentajeObj ? porcentajeObj.porcentaje : null;

          // Creamos un objeto de detalle
          const detalle = {
            desc_grupo,
            monto,
            porcentaje,
          };

          // Si el año no existe en el acumulador, lo inicializamos
          if (!acc[date]) {
            acc[date] = { date, detalle: [] };
          }

          // Agregamos el detalle al año correspondiente
          acc[date].detalle.push(detalle);
        });

        return acc;
      }, {});

      // Convertimos el objeto agrupado en un array
      return Object.values(groupedData);
    };

    const formattedData = formatDataByYear(processData);
    // formattedData.map((item))
    let totalizado = []
    processData.map((item) => {
      totalizado.push({
        desc_grupo: item.desc_grupo,
        monto: item.total
      })
    })

    formattedData.push({ date: 'Total', detalle: totalizado })
    return res.json({ totalByYear: totalByYearArray, formattedData });
    // return res.json({ totalByYear:12 });
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findAllGroupAlmacenController ' })
  }
}

const findXAgenciaSimpleGastosController = async (req, res) => {
  try {
    const codigo = req.query.codigo;
    console.log(codigo)

    const gastos = await gastosXAgencia(codigo)
    const datosProcesados = procesarGastos(gastos);
    console.log({ datosProcesados })
    const data = calcularPorcentajes(datosProcesados);
    // return res.json({data})
    const totalByYearArray = Object.entries(data.totalByYear).map(([year, total]) => ({
      date: year,
      monto: total,
    }));

    let processData = [];
    data.datosConPorcentajes.map((item) => {
      const { desc_grupo, montos, porcentajes, ...rest } = item;
      const montosArray = Object.entries(montos).map(([year, monto]) => ({
        year,
        monto,
      }));

      const porcentajesArray = Object.entries(porcentajes).map(([year, porcentaje]) => ({
        year,
        porcentaje,
      }));

      const newData = {
        desc_grupo: desc_grupo.trim(),
        montos: montosArray,
        porcentajes: porcentajesArray,
        ...rest,
      };
      processData.push(newData);
    });
    // return res.json({ data })
    const { datosConPorcentajes, ...restData } = data;
    const montos = processData[0].montos
    const year = []
    montos.map((item) => {
      year.push(item.year)
    })

    const formatDataByYear = (processData) => {
      // Inicializamos un objeto para almacenar los datos agrupados por año
      const groupedData = processData.reduce((acc, item) => {
        const { desc_grupo, montos, porcentajes, total } = item;

        // Iteramos sobre los años en montos
        montos.forEach((montoItem) => {
          const date = montoItem.year;
          const monto = montoItem.monto;

          // Buscamos el porcentaje correspondiente para este año
          const porcentajeObj = porcentajes.find((p) => p.year === date);
          const porcentaje = porcentajeObj ? porcentajeObj.porcentaje : null;

          // Creamos un objeto de detalle
          const detalle = {
            desc_grupo,
            monto,
            porcentaje,
          };

          // Si el año no existe en el acumulador, lo inicializamos
          if (!acc[date]) {
            acc[date] = { date, detalle: [] };
          }

          // Agregamos el detalle al año correspondiente
          acc[date].detalle.push(detalle);
        });

        return acc;
      }, {});

      // Convertimos el objeto agrupado en un array
      return Object.values(groupedData);
    };

    // return res.json({ formatDataByYear })

    const formattedData = formatDataByYear(processData);
    // formattedData.map((item))
    let totalizado = []
    processData.map((item) => {
      totalizado.push({
        desc_grupo: item.desc_grupo,
        monto: item.total
      })
    })

    formattedData.push({ date: 'Total', detalle: totalizado })
    return res.json({ totalByYear: totalByYearArray, formattedData });
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'Error en findXAgenciaSimpleGastosController ' })
  }
}

const procesarGastos = (gastos) => {
  const resultado = {};

  // Agrupar por desc_grupo
  gastos.forEach((gasto) => {
    const { Gestion, desc_grupo, monto } = gasto;
    if (!resultado[desc_grupo]) {
      resultado[desc_grupo] = { desc_grupo, montos: {}, total: 0 };
    }
    // Agregar monto por año (Gestion)
    resultado[desc_grupo].montos[Gestion] =
      (resultado[desc_grupo].montos[Gestion] || 0) + monto;

    // Sumar al total
    resultado[desc_grupo].total += monto;
  });

  // Formatear el resultado en un array para mayor flexibilidad
  return Object.values(resultado);
};

const calcularPorcentajes = (datosProcesados) => {
  // Calcular el total general por año
  const totalByYear = {};

  datosProcesados.forEach((grupo) => {
    Object.entries(grupo.montos).forEach(([year, monto]) => {
      totalByYear[year] = (totalByYear[year] || 0) + monto;
    });
  });

  // Agregar porcentajes al resultado
  const datosConPorcentajes = datosProcesados.map((grupo) => {
    const porcentajes = {};
    Object.entries(grupo.montos).forEach(([year, monto]) => {
      porcentajes[year] = ((monto / totalByYear[year]) * 100).toFixed(2); // Formatear a 2 decimales
    });
    return {
      ...grupo,
      porcentajes,
    };
  });

  return { datosConPorcentajes, totalByYear };
};

const gastosGestionAgenciaController = async (req, res) => {

  try {
    const gestion = req.query.gestion
    const codigo = req.query.codigo
    const response = await gastosGestionAgencia(+gestion, +codigo)
    const agrupado = agruparPorMes(response);
    return res.json({ gestion, codigo, agrupado })
    // return res.json({ mensaje:'modificar' })

  } catch (error) {

    console.log({ error })
    return res.status(500).json({ mensaje: 'error en el controlador' })

  }
}

function agruparPorMes(data) {
  const resultado = data.reduce((acumulador, item) => {
    const mes = item.mes.trim(); // Asegúrate de eliminar espacios
    const desc_grupo = item.desc_grupo.trim(); // Asegúrate de eliminar espacios

    // Busca si el mes ya existe en el acumulador
    let entradaMes = acumulador.find((entrada) => entrada.date === mes);

    if (!entradaMes) {
      // Si el mes no existe, inicialízalo
      entradaMes = { date: mes, detalle: [] };
      acumulador.push(entradaMes);
    }

    // Busca si el desc_grupo ya existe en el detalle de este mes
    let entradaGrupo = entradaMes.detalle.find((detalle) => detalle.desc_grupo === desc_grupo);

    if (!entradaGrupo) {
      // Si el grupo no existe, inicialízalo
      entradaGrupo = { desc_grupo: desc_grupo, monto: 0 };
      entradaMes.detalle.push(entradaGrupo);
    }

    // Suma el monto al grupo
    entradaGrupo.monto += parseFloat(item.monto);

    return acumulador;
  }, []);

  return resultado;
}

const reporteArticulosPendientesController = async (req, res) => {
  try {
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const response  = await reporteArticuloPendientes(startDate,endDate)
    return res.json(response)
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ mensaje: 'error en el controlador' })
  }
}


module.exports = {
  parteDiaroController,
  abastecimientoController,
  abastecimientoMesActualController,
  parteDiaroMesActualController,
  abastecimientoMesAnteriorController,
  findAllRegionsController,
  findAllLineController,
  findAllSublineController,
  findAllGroupAlmacenController,
  abastecimientoPorFechaController,
  abastecimientoFechaAnualController,
  abastecimientoFecha24MesesController,
  findAllGastosController,
  findAllSimpleGastosController,
  findXAgenciaSimpleGastosController,
  gastosGestionAgenciaController,
  reporteArticulosPendientesController
}