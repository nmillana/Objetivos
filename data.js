window.SEED_DATA = {
  metadata: {
    title: "Panel de objetivos gerencia de personas",
    lastUpdated: "2026-03-13",
    sources: ["OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx", "Objetivos_DO_2026.docx"],
  },
  objectives: [
    {
      id: "obj-cultura-modelo",
      area: "Cultura y calidad de vida",
      title: "Instalar una cultura organizacional única y compartida",
      owner: "Maca",
      type: "Estratégico",
      status: "en-curso",
      progress: 26,
      source: ["OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx"],
      tags: ["cultura", "liderazgo", "alineamiento"],
      description: "Instalar un modelo cultural corporativo adoptado por las gerencias, con principios aprobados por directorio y lineamientos de liderazgo integrados.",
      executiveNote: "Usar como paraguas de cultura, consistencia de liderazgo y pulso estratégico.",
      dueDate: "2026-12-31",
      nextFollowUp: "2026-03-27",
      milestones: [
        { id: "m1", label: "Validación del modelo cultural", date: "2026-04-15", owner: "Maca" },
        { id: "m2", label: "Pulso de alineamiento estratégico", date: "2026-08-31", owner: "Maca" }
      ],
      kpis: [
        { name: "Adopción del modelo cultural", target: "100% de gerencias", frequency: "Trimestral", milestone: "Diciembre 2026" },
        { name: "Comprensión del modelo", target: "80% o más de líderes", frequency: "Semestral", milestone: "Agosto 2026" },
        { name: "Alineamiento estratégico", target: "+10% en pulso corporativo", frequency: "Anual", milestone: "Diciembre 2026" }
      ],
      meetings: []
    },
    {
      id: "obj-clima-ssindex",
      area: "Cultura y calidad de vida",
      title: "Clima organizacional: mejora en indicadores críticos del SSINDEX",
      owner: "Equipo DO",
      type: "Operativo",
      status: "encaminado",
      progress: 41,
      source: ["Objetivos_DO_2026.docx"],
      tags: ["clima", "ssindex", "feedback", "retención"],
      description: "Priorizar dimensiones críticas del SSINDEX y ejecutar planes de acción por gerencia, con foco en carrera, retroalimentación, comunicación, reconocimiento y lealtad.",
      executiveNote: "Conviene revisar mensualmente y consolidar formalmente al menos una vez por trimestre.",
      dueDate: "2026-12-31",
      nextFollowUp: "2026-03-20",
      milestones: [
        { id: "m3", label: "Top 5 dimensiones con plan definido", date: "2026-03-31", owner: "Equipo DO" },
        { id: "m4", label: "Primer corte de implementación", date: "2026-06-30", owner: "Equipo DO" }
      ],
      kpis: [
        { name: "Planes de acción por gerencia", target: "Top 5 dimensiones con plan definido", frequency: "Trimestral", milestone: "Marzo 2026" },
        { name: "Avance de acciones", target: "80% o más ejecutadas", frequency: "Trimestral", milestone: "Diciembre 2026" },
        { name: "Mejora de indicadores críticos", target: "+5 puntos o más", frequency: "Anual", milestone: "Diciembre 2026" }
      ],
      meetings: []
    },
    {
      id: "obj-remuneraciones-variable",
      area: "Relaciones laborales y remuneraciones",
      title: "Fortalecer compromiso y retención mediante compensación variable ejecutiva",
      owner: "Paula",
      type: "Estratégico",
      status: "en-riesgo",
      progress: 19,
      source: ["OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx"],
      tags: ["remuneraciones", "retención", "variable"],
      description: "Diseñar un sistema de compensación variable para primera y segunda línea ejecutiva, resguardando equidad interna y competitividad de mercado.",
      executiveNote: "Revisar benchmark, dependencias legales y alineación con metas de negocio.",
      dueDate: "2026-03-31",
      nextFollowUp: "2026-03-18",
      milestones: [
        { id: "m5", label: "Diseño preliminar del esquema", date: "2026-03-20", owner: "Paula" },
        { id: "m6", label: "Cierre de validación ejecutiva", date: "2026-03-31", owner: "Paula" }
      ],
      kpis: [
        { name: "Diseño del esquema", target: "Propuesta definida en Q1", frequency: "Único", milestone: "Marzo 2026" },
        { name: "Equidad y competitividad", target: "Modelo validado por comité", frequency: "Único", milestone: "Marzo 2026" }
      ],
      meetings: []
    },
    {
      id: "obj-cargos-estructura",
      area: "Compensación y selección",
      title: "Estructura corporativa, digitalización de cargos y pesajes",
      owner: "Paula / Equipo DO",
      type: "Mixto",
      status: "en-curso",
      progress: 21,
      source: ["OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx", "Objetivos_DO_2026.docx"],
      tags: ["estructura", "roles", "cargos", "pesaje"],
      description: "Consolidar una estructura corporativa unificada, definir roles críticos, digitalizar descripciones de cargo e implementar flujo de aprobación y apoyo en pesajes.",
      executiveNote: "Es el puente más natural entre estructura, selección y compensaciones.",
      dueDate: "2026-12-31",
      nextFollowUp: "2026-03-25",
      milestones: [
        { id: "m7", label: "Inventario completo de cargos", date: "2026-04-30", owner: "Equipo DO" },
        { id: "m8", label: "90% de cargos críticos digitalizados", date: "2026-09-30", owner: "Equipo DO" },
        { id: "m9", label: "Pesaje validado", date: "2026-12-15", owner: "Paula" }
      ],
      kpis: [
        { name: "Roles críticos definidos", target: "100% roles críticos", frequency: "Trimestral", milestone: "Julio 2026" },
        { name: "Cargos digitalizados", target: "90% de cargos críticos", frequency: "Trimestral", milestone: "Septiembre 2026" },
        { name: "Flujo y pesaje operativo", target: "Flujo documentado + 100% cargos afectos pesados", frequency: "Semestral", milestone: "Diciembre 2026" }
      ],
      meetings: []
    },
    {
      id: "obj-evaluacion-desempeno",
      area: "Desarrollo y capacitación",
      title: "Evaluación de desempeño ágil y como herramienta de liderazgo",
      owner: "Equipo DO",
      type: "Operativo",
      status: "encaminado",
      progress: 34,
      source: ["Objetivos_DO_2026.docx"],
      tags: ["desempeño", "buk", "objetivos", "liderazgo"],
      description: "Rediseñar el proceso de evaluación de desempeño, validar competencias en BUK y capacitar a jefaturas y equipos en formulación y seguimiento de objetivos.",
      executiveNote: "La secuencia clave es competencias, rediseño, formación y luego ciclo completo en BUK.",
      dueDate: "2026-12-31",
      nextFollowUp: "2026-03-19",
      milestones: [
        { id: "m10", label: "Modelo de competencias operativo en BUK", date: "2026-05-04", owner: "Equipo DO" },
        { id: "m11", label: "Proceso aprobado por gerencia", date: "2026-06-30", owner: "Equipo DO" },
        { id: "m12", label: "80% de jefaturas capacitadas", date: "2026-09-30", owner: "Equipo DO" }
      ],
      kpis: [
        { name: "Competencias en BUK", target: "100% operativo al 04/05/2026", frequency: "Único", milestone: "4 mayo 2026" },
        { name: "Proceso rediseñado", target: "Aprobado por gerencia", frequency: "Trimestral", milestone: "Junio 2026" },
        { name: "Capacitación de jefaturas y equipos", target: "80% o más capacitados", frequency: "Semestral", milestone: "Octubre 2026" }
      ],
      meetings: []
    },
    {
      id: "obj-operativa-sistema",
      area: "Servicios generales",
      title: "Modernizar la gestión de personas para ganar eficiencia operativa",
      owner: "Carlos",
      type: "Estratégico",
      status: "en-curso",
      progress: 29,
      source: ["OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx"],
      tags: ["sistema uno", "operación", "reportería", "adopción"],
      description: "Asegurar la salida a producción de Sistema Uno, estabilizar la operación, eliminar procesos paralelos y generar reportería ejecutiva con mejor trazabilidad.",
      executiveNote: "El foco inicial debiera ser adopción real y retiro de paralelos.",
      dueDate: "2026-12-31",
      nextFollowUp: "2026-03-24",
      milestones: [
        { id: "m13", label: "Sistema Uno en producción", date: "2026-05-31", owner: "Carlos" },
        { id: "m14", label: "Reporterías automáticas mensuales", date: "2026-07-31", owner: "Carlos" }
      ],
      kpis: [
        { name: "Puesta en producción", target: "Sistema estable en mayo 2026", frequency: "Único", milestone: "Mayo 2026" },
        { name: "Procesos dentro del sistema", target: "95% o más", frequency: "Mensual", milestone: "Diciembre 2026" },
        { name: "Adopción y eficiencia", target: "85% uso real y menor costo operativo", frequency: "Trimestral", milestone: "Diciembre 2026" }
      ],
      meetings: []
    }
  ]
};
