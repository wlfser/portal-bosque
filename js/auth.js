// =============================================
//  UNIVERSIDAD EL BOSQUE – Auth Module
//  Manejo de login, sesión y roles
// =============================================

// Usuarios base (se combinan con los dinámicos guardados en localStorage)
const BASE_USERS = {
  // SUPERADMIN
  "superadmin": {
    password: "super2025",
    role: "superadmin",
    name: "Administrador General",
    initials: "SA"
  },
  // PROFESORES
  "prof.garcia": {
    password: "bosque2025",
    role: "admin",
    name: "Dr. Carlos García",
    initials: "CG",
    materia: "Biología Celular"
  },
  "prof.rodriguez": {
    password: "bosque2025",
    role: "admin",
    name: "Dra. María Rodríguez",
    initials: "MR",
    materia: "Anatomía"
  },
  "Chacon": {
    password: "unbosque",
    role: "admin",
    name: "Prof. Chacón",
    initials: "CH",
    materia: "General"
  },
  // ESTUDIANTES
  "20231001": {
    password: "estudiante123",
    role: "student",
    name: "Ana Sofía Martínez",
    initials: "AM",
    semestre: "4°",
    programa: "Medicina"
  },
  "20231002": {
    password: "estudiante123",
    role: "student",
    name: "Juan Pablo López",
    initials: "JL",
    semestre: "4°",
    programa: "Medicina"
  },
  "20231003": {
    password: "estudiante123",
    role: "student",
    name: "Valentina Torres",
    initials: "VT",
    semestre: "4°",
    programa: "Medicina"
  },
  "Jessica": {
    password: "123456789",
    role: "student",
    name: "Jessica",
    initials: "JE",
    semestre: "1°",
    programa: "Medicina"
  }
};

// Obtener todos los usuarios (base + dinámicos)
function getAllUsers() {
  const dynamic = JSON.parse(localStorage.getItem('ub_dynamic_users') || '{}');
  return { ...BASE_USERS, ...dynamic };
}

let currentRole = 'student';

function switchRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-role="${role}"]`).classList.add('active');

  const labelMap = {
    student:    'Código Estudiantil',
    admin:      'Usuario Docente',
    superadmin: 'Usuario Administrador'
  };
  const placeholderMap = {
    student:    'Ej: 20231001',
    admin:      'Ej: prof.garcia',
    superadmin: 'superadmin'
  };

  document.getElementById('user-label').textContent = labelMap[role];
  document.getElementById('username').placeholder = placeholderMap[role];
  document.getElementById('login-error').style.display = 'none';
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '❌ Usuario o contraseña incorrectos';

  const USERS = getAllUsers();
  const user = USERS[username];

  if (!user || user.password !== password) {
    errorEl.style.display = 'block';
    return;
  }

  if (user.role !== currentRole) {
    errorEl.textContent = `❌ Este usuario no tiene acceso como ${
      currentRole === 'admin' ? 'Profesor' :
      currentRole === 'superadmin' ? 'Administrador' : 'Estudiante'
    }`;
    errorEl.style.display = 'block';
    return;
  }

  sessionStorage.setItem('ub_user', JSON.stringify({ username, ...user }));

  if (user.role === 'superadmin') {
    window.location.href = 'pages/superadmin-dashboard.html';
  } else if (user.role === 'admin') {
    window.location.href = 'pages/admin-dashboard.html';
  } else {
    window.location.href = 'pages/student-dashboard.html';
  }
}

function requireAuth(expectedRole) {
  const raw = sessionStorage.getItem('ub_user');
  if (!raw) { window.location.href = '../index.html'; return null; }
  const user = JSON.parse(raw);
  if (user.role !== expectedRole) { window.location.href = '../index.html'; return null; }
  return user;
}

function logout() {
  sessionStorage.removeItem('ub_user');
  window.location.href = '../index.html';
}
