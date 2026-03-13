window.SEED_DATA = {
  metadata: {
    title: "Panel de objetivos gerencia de personas",
    lastUpdated: "2026-03-13",
    sources: ["OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx", "Objetivos_DO_2026.docx"]
  },
  access: {
    type: "local-demo",
    workspace: "Objetivos Gerencia Personas",
    users: [
      {
        id: "user-admin",
        name: "Natalia Millana",
        role: "Administradora",
        email: "nmillana@eess.cl",
        password: "Objetivos2026!",
        avatar: "NM"
      },
      {
        id: "user-maca",
        name: "Maca",
        role: "Cultura y DO",
        email: "maca@gerenciapersonas.local",
        password: "Maca2026!",
        avatar: "MA"
      },
      {
        id: "user-paula",
        name: "Paula",
        role: "Compensacion y estructura",
        email: "paula@gerenciapersonas.local",
        password: "Paula2026!",
        avatar: "PA"
      },
      {
        id: "user-carlos",
        name: "Carlos",
        role: "Servicios generales",
        email: "carlos@gerenciapersonas.local",
        password: "Carlos2026!",
        avatar: "CA"
      }
    ]
  },
  objectives: [
    {
      id: "obj-cultura-modelo",
      area: "Cultura y calidad de vida",
      title: "Instalar una cultura organizacional unica y compartida",
      owner: "Maca",
      type: "Estrategico",
      status: "en-curso",
      progress: 26,
      source: ["OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx"],
      tags: ["cultura", "liderazgo", "alineamiento"],
      description: "Instalar un modelo cultural corporativo adoptado por las gerencias, con principios aprobados por directorio y lineamientos de liderazgo integrados.",
      executiveNote: "Usar como paraguas de cultura, consistencia de liderazgo y pulso estrategico.",
      dueDate: "2026-12-31",
      nextFollowUp: "2026-03-27",
      milestones: [
        { id: "m1", label: "Validacion del modelo cultural", date: "2026-04-15", owner: "Maca" },
        { id: "m2", label: "Pulso de alineamiento estrategico", date: "2026-08-31", owner: "Maca" }
      ],
      kpis: [
        { name: "Adopcion del modelo cultural", target: "100% de gerencias", frequency: "Trimestral", milestone: "Diciembre 2026" },
        { name: "Comprension del modelo", target: "80% o mas de lideres", frequency: "Semestral", milestone: "Agosto 2026" },
        { name: "Alineamiento estrategico", target: "+10% en pulso corporativo", frequency: "Anual", milestone: "Diciembre 2026" }
      ],
      meetings: []
    },
    {
      id: "obj-clima-ssindex",
      area: "Cultura y calidad de vida",
      title: "Clima organizacional: mejora en indicadores criticos del SSINDEX",
      owner: "Equipo DO",
      type: "Operativo",
      status: "encaminado",
      progress: 41,
      source: ["Objetivos_DO_2026.docx"],
      tags: ["clima", "ssindex", "feedback", "retencion"],
      description: "Priorizar dimensiones criticas del SSINDEX y ejecutar planes de accion por gerencia, con foco en carrera, retroalimentacion, comunicacion, reconocimiento y lealtad.",
      executiveNote: "Conviene revisar mensualmente y consolidar formalmente al menos una vez por trimestre.",
      dueDate: "2026-12-31",
      nextFollowUp: "2026-03-20",
      milestones: [
        { id: "m3", label: "Top 5 dimensiones con plan definido", date: "2026-03-31", owner: "Equipo DO" },
        { id: "m4", label: "Primer corte de implementacion", date: "2026-06-30", owner: "Equipo DO" }
      ],
      kpis: [
        { name: "Planes de accion por gerencia", target: "Top 5 dimensiones con plan definido", frequency: "Trimestral", milestone: "Marzo 2026" },
        { name: "Avance de acciones", target: "80% o mas ejecutadas", frequency: "Trimestral", milestone: "Diciembre 2026" },
        { name: "Mejora de indicadores criticos", target: "+5 puntos o mas", frequency: "Anual", milestone: "Diciembre 2026" }
      ],
      meetings: []
    },
    {
      id: "obj-remuneraciones-variable",
      area: "Relaciones laborales y remuneraciones",
      title: "Fortalecer compromiso y retencion mediante compensacion variable ejecutiva",
      owner: "Paula",
      type: "Estrategico",
      status: "en-riesgo",
      progress: 19,
      source: ["OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx"],
      tags: ["remuneraciones", "retencion", "variable"],
      description: "Disenar un sistema de compensacion variable para primera y segunda linea ejecutiva, resguardando equidad interna y competitividad de mercado.",
      executiveNote: "Revisar benchmark, dependencias legales y alineacion con metas de negocio.",
      dueDate: "2026-03-31",
      nextFollowUp: "2026-03-18",
      milestones: [
        { id: "m5", label: "Diseno preliminar del esquema", date: "2026-03-20", owner: "Paula" },
        { id: "m6", label: "Cierre de validacion ejecutiva", date: "2026-03-31", owner: "Paula" }
      ],
      kpis: [
        { name: "Diseno del esquema", target: "Propuesta definida en Q1", frequency: "Unico", milestone: "Marzo 2026" },
        { name: "Equidad y competitividad", target: "Modelo validado por comite", frequency: "Unico", milestone: "Marzo 2026" }
      ],
      meetings: []
    },
    {
      id: "obj-cargos-estructura",
      area: "Compensacion y seleccion",
      title: "Estructura corporativa, digitalizacion de cargos y pesajes",
      owner: "Paula / Equipo DO",
      type: "Mixto",
      status: "en-curso",
      progress: 21,
      source: ["OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx", "Objetivos_DO_2026.docx"],
      tags: ["estructura", "roles", "cargos", "pesaje"],
      description: "Consolidar una estructura corporativa unificada, definir roles criticos, digitalizar descripciones de cargo e implementar flujo de aprobacion y apoyo en pesajes.",
      executiveNote: "Es el puente mas natural entre estructura, seleccion y compensaciones.",
      dueDate: "2026-12-31",
      nextFollowUp: "2026-03-25",
      milestones: [
        { id: "m7", label: "Inventario completo de cargos", date: "2026-04-30", owner: "Equipo DO" },
        { id: "m8", label: "90% de cargos criticos digitalizados", date: "2026-09-30", owner: "Equipo DO" },
        { id: "m9", label: "Pesaje validado", date: "2026-12-15", owner: "Paula" }
      ],
      kpis: [
        { name: "Roles criticos definidos", target: "100% roles criticos", frequency: "Trimestral", milestone: "Julio 2026" },
        { name: "Cargos digitalizados", target: "90% de cargos criticos", frequency: "Trimestral", milestone: "Septiembre 2026" },
        { name: "Flujo y pesaje operativo", target: "Flujo documentado + 100% cargos afectos pesados", frequency: "Semestral", milestone: "Diciembre 2026" }
      ],
      meetings: []
    },
    {
      id: "obj-evaluacion-desempeno",
      area: "Desarrollo y capacitacion",
      title: "Evaluacion de desempeno agil y como herramienta de liderazgo",
      owner: "Equipo DO",
      type: "Operativo",
      status: "encaminado",
      progress: 34,
      source: ["Objetivos_DO_2026.docx"],
      tags: ["desempeno", "buk", "objetivos", "liderazgo"],
      description: "Redisenar el proceso de evaluacion de desempeno, validar competencias en BUK y capacitar a jefaturas y equipos en formulacion y seguimiento de objetivos.",
      executiveNote: "La secuencia clave es competencias, rediseno, formacion y luego ciclo completo en BUK.",
      dueDate: "2026-12-31",
      nextFollowUp: "2026-03-19",
      milestones: [
        { id: "m10", label: "Modelo de competencias operativo en BUK", date: "2026-05-04", owner: "Equipo DO" },
        { id: "m11", label: "Proceso aprobado por gerencia", date: "2026-06-30", owner: "Equipo DO" },
        { id: "m12", label: "80% de jefaturas capacitadas", date: "2026-09-30", owner: "Equipo DO" }
      ],
      kpis: [
        { name: "Competencias en BUK", target: "100% operativo al 04/05/2026", frequency: "Unico", milestone: "4 mayo 2026" },
        { name: "Proceso redisenado", target: "Aprobado por gerencia", frequency: "Trimestral", milestone: "Junio 2026" },
        { name: "Capacitacion de jefaturas y equipos", target: "80% o mas capacitados", frequency: "Semestral", milestone: "Octubre 2026" }
      ],
      meetings: []
    },
    {
      id: "obj-operativa-sistema",
      area: "Servicios generales",
      title: "Modernizar la gestion de personas para ganar eficiencia operativa",
      owner: "Carlos",
      type: "Estrategico",
      status: "en-curso",
      progress: 29,
      source: ["OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx"],
      tags: ["sistema uno", "operacion", "reporteria", "adopcion"],
      description: "Asegurar la salida a produccion de Sistema Uno, estabilizar la operacion, eliminar procesos paralelos y generar reporteria ejecutiva con mejor trazabilidad.",
      executiveNote: "El foco inicial debiera ser adopcion real y retiro de paralelos.",
      dueDate: "2026-12-31",
      nextFollowUp: "2026-03-24",
      milestones: [
        { id: "m13", label: "Sistema Uno en produccion", date: "2026-05-31", owner: "Carlos" },
        { id: "m14", label: "Reporterias automaticas mensuales", date: "2026-07-31", owner: "Carlos" }
      ],
      kpis: [
        { name: "Puesta en produccion", target: "Sistema estable en mayo 2026", frequency: "Unico", milestone: "Mayo 2026" },
        { name: "Procesos dentro del sistema", target: "95% o mas", frequency: "Mensual", milestone: "Diciembre 2026" },
        { name: "Adopcion y eficiencia", target: "85% uso real y menor costo operativo", frequency: "Trimestral", milestone: "Diciembre 2026" }
      ],
      meetings: []
    }
  ]
};
