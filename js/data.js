// =============================================
//  UNIVERSIDAD EL BOSQUE – Data Store
//  Base de datos en memoria (mock)
// =============================================

const DB = {

  // Guías disponibles
  guides: [
    {
      id: 1,
      title: "Guía de Laboratorio N°1 – Microscopía Óptica",
      subject: "Biología Celular",
      professor: "Dr. Carlos García",
      description: "Reconocimiento del microscopio óptico y preparación de muestras histológicas básicas.",
      dueDate: "2025-04-10",
      totalPoints: 100,
      type: "lab",
      status: "active"
    },
    {
      id: 2,
      title: "Taller N°2 – Membrana Celular y Transporte",
      subject: "Biología Celular",
      professor: "Dr. Carlos García",
      description: "Análisis de mecanismos de transporte activo y pasivo a través de la membrana plasmática.",
      dueDate: "2025-04-18",
      totalPoints: 80,
      type: "taller",
      status: "active"
    },
    {
      id: 3,
      title: "Evaluación – Sistema Musculoesquelético",
      subject: "Anatomía",
      professor: "Dra. María Rodríguez",
      description: "Identificación de estructuras óseas y musculares en modelos anatómicos.",
      dueDate: "2025-04-05",
      totalPoints: 100,
      type: "quiz",
      status: "active"
    },
    {
      id: 4,
      title: "Guía de Laboratorio N°2 – Tejido Epitelial",
      subject: "Biología Celular",
      professor: "Dr. Carlos García",
      description: "Observación y clasificación de tejidos epiteliales en placas histológicas.",
      dueDate: "2025-04-25",
      totalPoints: 100,
      type: "lab",
      status: "active"
    },
    {
      id: 5,
      title: "Taller N°3 – Sistema Nervioso Central",
      subject: "Anatomía",
      professor: "Dra. María Rodríguez",
      description: "Estudio de la estructura del encéfalo y médula espinal con material cadavérico.",
      dueDate: "2025-05-02",
      totalPoints: 90,
      type: "taller",
      status: "active"
    }
  ],

  // Estudiantes registrados
  students: [
    { code: "20231001", name: "Ana Sofía Martínez",   semestre: "4°", programa: "Medicina", email: "a.martinez@unbosque.edu.co" },
    { code: "20231002", name: "Juan Pablo López",     semestre: "4°", programa: "Medicina", email: "j.lopez@unbosque.edu.co" },
    { code: "20231003", name: "Valentina Torres",     semestre: "4°", programa: "Medicina", email: "v.torres@unbosque.edu.co" },
    { code: "20231004", name: "Sebastián Herrera",    semestre: "4°", programa: "Medicina", email: "s.herrera@unbosque.edu.co" },
    { code: "20231005", name: "Isabella Morales",     semestre: "4°", programa: "Medicina", email: "i.morales@unbosque.edu.co" },
    { code: "20231006", name: "Andrés Felipe Ruiz",   semestre: "4°", programa: "Medicina", email: "a.ruiz@unbosque.edu.co" },
    { code: "20231007", name: "Camila Jiménez",       semestre: "4°", programa: "Medicina", email: "c.jimenez@unbosque.edu.co" },
    { code: "20231008", name: "Daniel Orozco",        semestre: "4°", programa: "Medicina", email: "d.orozco@unbosque.edu.co" },
  ],

  // Entregas de guías por estudiante
  submissions: [
    // Guía 1
    { studentCode: "20231001", guideId: 1, status: "completed", score: 95, submittedAt: "2025-04-08 10:23", comment: "Excelente descripción de las partes del microscopio." },
    { studentCode: "20231002", guideId: 1, status: "completed", score: 88, submittedAt: "2025-04-09 14:05", comment: "Buena preparación de muestras." },
    { studentCode: "20231003", guideId: 1, status: "completed", score: 72, submittedAt: "2025-04-10 09:50", comment: "Falta profundizar en la técnica de tinción." },
    { studentCode: "20231004", guideId: 1, status: "late",      score: 60, submittedAt: "2025-04-12 16:30", comment: "Entrega tardía." },
    { studentCode: "20231005", guideId: 1, status: "completed", score: 91, submittedAt: "2025-04-07 11:00", comment: "" },
    { studentCode: "20231006", guideId: 1, status: "pending",   score: null, submittedAt: null, comment: "" },
    { studentCode: "20231007", guideId: 1, status: "completed", score: 85, submittedAt: "2025-04-09 08:40", comment: "" },
    { studentCode: "20231008", guideId: 1, status: "pending",   score: null, submittedAt: null, comment: "" },

    // Guía 2
    { studentCode: "20231001", guideId: 2, status: "completed", score: 80, submittedAt: "2025-04-15 09:10", comment: "" },
    { studentCode: "20231002", guideId: 2, status: "pending",   score: null, submittedAt: null, comment: "" },
    { studentCode: "20231003", guideId: 2, status: "pending",   score: null, submittedAt: null, comment: "" },
    { studentCode: "20231004", guideId: 2, status: "completed", score: 76, submittedAt: "2025-04-16 15:00", comment: "" },
    { studentCode: "20231005", guideId: 2, status: "pending",   score: null, submittedAt: null, comment: "" },

    // Guía 3
    { studentCode: "20231001", guideId: 3, status: "completed", score: 90, submittedAt: "2025-04-03 08:30", comment: "" },
    { studentCode: "20231002", guideId: 3, status: "completed", score: 82, submittedAt: "2025-04-04 10:20", comment: "" },
    { studentCode: "20231003", guideId: 3, status: "late",      score: 55, submittedAt: "2025-04-07 18:00", comment: "Entrega tardía." },
  ],

  // Métodos de consulta
  getStudentSubmissions(studentCode) {
    return this.submissions.filter(s => s.studentCode === studentCode);
  },

  getGuideSubmissions(guideId) {
    return this.submissions.filter(s => s.guideId === guideId);
  },

  getGuideById(id) {
    return this.guides.find(g => g.id === id);
  },

  getStudentByCode(code) {
    return this.students.find(s => s.code === code);
  },

  getStudentProgress(studentCode) {
    const subs = this.getStudentSubmissions(studentCode);
    const completed = subs.filter(s => s.status === 'completed' || s.status === 'late').length;
    const scores = subs.filter(s => s.score !== null).map(s => s.score);
    const avg = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
    return { completed, total: this.guides.length, avg };
  },

  // Agregar guía
  addGuide(guide) {
    const id = Math.max(...this.guides.map(g => g.id)) + 1;
    this.guides.push({ id, status: 'active', ...guide });
    return id;
  },

  // Calificar entrega
  gradeSubmission(studentCode, guideId, score, comment) {
    const sub = this.submissions.find(s => s.studentCode === studentCode && s.guideId === guideId);
    if (sub) {
      sub.score = score;
      sub.comment = comment;
      sub.status = 'completed';
      sub.submittedAt = new Date().toLocaleString('es-CO');
    }
  },

  // Entregar guía (estudiante)
  submitGuide(studentCode, guideId) {
    const existing = this.submissions.find(s => s.studentCode === studentCode && s.guideId === guideId);
    if (existing) {
      existing.status = 'completed';
      existing.submittedAt = new Date().toLocaleString('es-CO');
    } else {
      this.submissions.push({
        studentCode, guideId, status: 'completed',
        score: null,
        submittedAt: new Date().toLocaleString('es-CO'),
        comment: ''
      });
    }
  }
};
