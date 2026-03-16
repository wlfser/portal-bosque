// =============================================
//  UNIVERSIDAD EL BOSQUE – Auth Module
//  Manejo de login, sesión y roles
// =============================================

// Usuarios de prueba (en producción esto sería una API real)
const USERS = {
  // PROFESORES / ADMIN
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
  }
};

let currentRole = 'student';

function switchRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-role="${role}"]`).classList.add('active');
  document.getElementById('user-label').textContent =
    role === 'admin' ? 'Usuario Docente' : 'Código Estudiantil';
  document.getElementById('username').placeholder =
    role === 'admin' ? 'Ej: prof.garcia' : 'Ej: 20231001';
  document.getElementById('login-error').style.display = 'none';
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');

  const user = USERS[username];

  if (!user || user.password !== password) {
    errorEl.style.display = 'block';
    return;
  }

  if (user.role !== currentRole) {
    errorEl.textContent = `❌ Este usuario no tiene acceso como ${currentRole === 'admin' ? 'Profesor' : 'Estudiante'}`;
    errorEl.style.display = 'block';
    return;
  }

  // Guardar sesión
  sessionStorage.setItem('ub_user', JSON.stringify({ username, ...user }));

  // Redirigir
  if (user.role === 'admin') {
    window.location.href = 'pages/admin-dashboard.html';
  } else {
    window.location.href = 'pages/student-dashboard.html';
  }
}

// Verificar sesión activa
function requireAuth(expectedRole) {
  const raw = sessionStorage.getItem('ub_user');
  if (!raw) {
    window.location.href = '../index.html';
    return null;
  }
  const user = JSON.parse(raw);
  if (user.role !== expectedRole) {
    window.location.href = '../index.html';
    return null;
  }
  return user;
}

function logout() {
  sessionStorage.removeItem('ub_user');
  window.location.href = '../index.html';
}
