// =============================================
//  UNIVERSIDAD EL BOSQUE – Superadmin JS
// =============================================

let currentUser = null;
let modalMode = ''; // 'prof' | 'student'
let editingUsername = null;
let deleteTarget = null;

// Usuarios base que NO se pueden eliminar
const PROTECTED = ['superadmin', 'prof.garcia', 'prof.rodriguez'];

document.addEventListener('DOMContentLoaded', () => {
  currentUser = requireAuth('superadmin');
  if (!currentUser) return;
  renderAll();
});

function renderAll() {
  renderStats();
  renderOverviewLists();
  renderProfessors();
  renderStudents();
}

// ---- NAVEGACIÓN ----
function showSection(name) {
  document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');
  document.getElementById(`sec-${name}`).style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  if (event) event.currentTarget.classList.add('active');
}

// ---- STATS ----
function renderStats() {
  const all = getAllUsers();
  const profs    = Object.values(all).filter(u => u.role === 'admin').length;
  const students = Object.values(all).filter(u => u.role === 'student').length;
  const dynamic  = JSON.parse(localStorage.getItem('ub_dynamic_users') || '{}');
  const newUsers = Object.keys(dynamic).length;

  document.getElementById('sa-stats').innerHTML = `
    <div class="stat-card" style="border-left-color:#7c3aed">
      <span class="stat-label">Total Usuarios</span>
      <span class="stat-value">${profs + students + 1}</span>
      <span class="stat-sub">En el sistema</span>
    </div>
    <div class="stat-card gold">
      <span class="stat-label">Profesores</span>
      <span class="stat-value">${profs}</span>
      <span class="stat-sub">Docentes activos</span>
    </div>
    <div class="stat-card blue">
      <span class="stat-label">Estudiantes</span>
      <span class="stat-value">${students}</span>
      <span class="stat-sub">Registrados</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Usuarios Nuevos</span>
      <span class="stat-value">${newUsers}</span>
      <span class="stat-sub">Agregados dinámicamente</span>
    </div>
  `;
}

// ---- OVERVIEW LISTS ----
function renderOverviewLists() {
  const all = getAllUsers();

  const profs = Object.entries(all).filter(([,u]) => u.role === 'admin');
  document.getElementById('sa-prof-list').innerHTML = profs.map(([username, u]) => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div class="user-avatar" style="width:32px;height:32px;font-size:12px;background:#7c3aed">${u.initials||'P'}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${u.name}</div>
        <div style="font-size:11px;color:var(--text-gray)">@${username}</div>
      </div>
      <span class="badge badge-blue">${u.materia||'—'}</span>
    </div>
  `).join('');

  const students = Object.entries(all).filter(([,u]) => u.role === 'student').slice(0,5);
  document.getElementById('sa-student-list').innerHTML = students.map(([username, u]) => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div class="user-avatar" style="width:32px;height:32px;font-size:12px">${u.initials||u.name[0]}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${u.name}</div>
        <div style="font-size:11px;color:var(--text-gray)">@${username}</div>
      </div>
      <span class="badge badge-green">${u.semestre||'—'}</span>
    </div>
  `).join('');
}

// ---- PROFESORES ----
function renderProfessors(filter = '') {
  const all = getAllUsers();
  const profs = Object.entries(all).filter(([u, d]) =>
    d.role === 'admin' &&
    (u.toLowerCase().includes(filter.toLowerCase()) || d.name.toLowerCase().includes(filter.toLowerCase()))
  );
  const dynamic = JSON.parse(localStorage.getItem('ub_dynamic_users') || '{}');

  document.getElementById('prof-tbody').innerHTML = profs.map(([username, u]) => {
    const isDynamic = !!dynamic[username];
    const isProtected = PROTECTED.includes(username);
    return `
      <tr>
        <td><code style="background:#f3e8ff;padding:2px 8px;border-radius:4px;font-size:12px">${username}</code></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="user-avatar" style="width:28px;height:28px;font-size:11px;background:#7c3aed;flex-shrink:0">${u.initials||'P'}</div>
            ${u.name}
          </div>
        </td>
        <td style="font-size:13px">${u.materia||'—'}</td>
        <td>${isDynamic ? '<span class="badge badge-blue">Agregado</span>' : '<span class="badge badge-gray">Base</span>'}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-outline btn-sm" onclick="openEditModal('${username}')">✏️ Editar</button>
            ${!isProtected ? `<button class="btn btn-danger btn-sm" onclick="openDeleteModal('${username}')">🗑️ Eliminar</button>` : '<span style="font-size:12px;color:var(--text-gray)">Protegido</span>'}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ---- ESTUDIANTES ----
function renderStudents(filter = '') {
  const all = getAllUsers();
  const students = Object.entries(all).filter(([u, d]) =>
    d.role === 'student' &&
    (u.toLowerCase().includes(filter.toLowerCase()) || d.name.toLowerCase().includes(filter.toLowerCase()))
  );
  const dynamic = JSON.parse(localStorage.getItem('ub_dynamic_users') || '{}');

  document.getElementById('student-tbody').innerHTML = students.map(([username, u]) => {
    const isDynamic = !!dynamic[username];
    const isProtected = PROTECTED.includes(username);
    return `
      <tr>
        <td><code style="background:#f0faf5;padding:2px 8px;border-radius:4px;font-size:12px">${username}</code></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="user-avatar" style="width:28px;height:28px;font-size:11px;flex-shrink:0">${u.initials||u.name[0]}</div>
            ${u.name}
          </div>
        </td>
        <td>${u.semestre||'—'}</td>
        <td>${u.programa||'—'}</td>
        <td>${isDynamic ? '<span class="badge badge-blue">Agregado</span>' : '<span class="badge badge-gray">Base</span>'}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-outline btn-sm" onclick="openEditModal('${username}')">✏️ Editar</button>
            ${!isProtected ? `<button class="btn btn-danger btn-sm" onclick="openDeleteModal('${username}')">🗑️ Eliminar</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterTable(val) {
  renderProfessors(val);
  renderStudents(val);
}

// ---- MODAL AGREGAR/EDITAR ----
function openModal(type) {
  modalMode = type;
  editingUsername = null;
  document.getElementById('modal-title').textContent = type === 'prof' ? '👨‍🏫 Agregar Profesor' : '🎓 Agregar Estudiante';
  renderModalFields(type, null);
  document.getElementById('modal-user').style.display = 'flex';
}

function openEditModal(username) {
  const all = getAllUsers();
  const user = all[username];
  modalMode = user.role === 'admin' ? 'prof' : 'student';
  editingUsername = username;
  document.getElementById('modal-title').textContent = `✏️ Editar: ${user.name}`;
  renderModalFields(modalMode, { username, ...user });
  document.getElementById('modal-user').style.display = 'flex';
}

function renderModalFields(type, data) {
  const f = document.getElementById('modal-fields');
  if (type === 'prof') {
    f.innerHTML = `
      <div class="form-row">
        <label>Usuario (para login)</label>
        <input type="text" id="f-username" value="${data?.username||''}" placeholder="Ej: prof.perez" ${editingUsername ? 'readonly style="background:#f4f7f5"' : ''}/>
      </div>
      <div class="form-row">
        <label>Nombre completo</label>
        <input type="text" id="f-name" value="${data?.name||''}" placeholder="Ej: Dr. Pedro Pérez"/>
      </div>
      <div class="form-row">
        <label>Materia</label>
        <input type="text" id="f-materia" value="${data?.materia||''}" placeholder="Ej: Fisiología"/>
      </div>
      <div class="form-row">
        <label>Contraseña ${editingUsername ? '(dejar vacío para no cambiar)' : ''}</label>
        <input type="password" id="f-password" placeholder="••••••••"/>
      </div>
    `;
  } else {
    f.innerHTML = `
      <div class="form-row">
        <label>Usuario / Código</label>
        <input type="text" id="f-username" value="${data?.username||''}" placeholder="Ej: 20231010" ${editingUsername ? 'readonly style="background:#f4f7f5"' : ''}/>
      </div>
      <div class="form-row">
        <label>Nombre completo</label>
        <input type="text" id="f-name" value="${data?.name||''}" placeholder="Ej: Laura Gómez"/>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-row">
          <label>Semestre</label>
          <select id="f-semestre">
            ${['1°','2°','3°','4°','5°','6°','7°','8°','9°','10°'].map(s =>
              `<option value="${s}" ${data?.semestre===s?'selected':''}>${s}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-row">
          <label>Programa</label>
          <input type="text" id="f-programa" value="${data?.programa||'Medicina'}" placeholder="Medicina"/>
        </div>
      </div>
      <div class="form-row">
        <label>Contraseña ${editingUsername ? '(dejar vacío para no cambiar)' : ''}</label>
        <input type="password" id="f-password" placeholder="••••••••"/>
      </div>
    `;
  }
}

function saveUser() {
  const username = document.getElementById('f-username').value.trim();
  const name     = document.getElementById('f-name').value.trim();
  const password = document.getElementById('f-password').value;

  if (!username || !name) { showToast('❌ Completa usuario y nombre'); return; }

  const all = getAllUsers();
  if (!editingUsername && all[username]) {
    showToast('❌ Ese usuario ya existe'); return;
  }
  if (!editingUsername && !password) {
    showToast('❌ La contraseña es obligatoria'); return;
  }

  const dynamic = JSON.parse(localStorage.getItem('ub_dynamic_users') || '{}');
  const targetKey = editingUsername || username;
  const existing = dynamic[targetKey] || all[targetKey] || {};

  const initials = name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase();

  if (modalMode === 'prof') {
    dynamic[targetKey] = {
      ...existing,
      role: 'admin',
      name,
      initials,
      materia: document.getElementById('f-materia').value.trim(),
      password: password || existing.password
    };
  } else {
    dynamic[targetKey] = {
      ...existing,
      role: 'student',
      name,
      initials,
      semestre: document.getElementById('f-semestre').value,
      programa: document.getElementById('f-programa').value.trim() || 'Medicina',
      password: password || existing.password
    };
  }

  localStorage.setItem('ub_dynamic_users', JSON.stringify(dynamic));
  closeModal();
  renderAll();
  showToast(`✅ Usuario ${editingUsername ? 'actualizado' : 'creado'} exitosamente`);
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modal-user')) {
    document.getElementById('modal-user').style.display = 'none';
  }
}

// ---- ELIMINAR ----
function openDeleteModal(username) {
  const all = getAllUsers();
  const user = all[username];
  deleteTarget = username;
  document.getElementById('delete-msg').textContent = `¿Estás seguro de eliminar a "${user.name}" (@${username})? Esta acción no se puede deshacer.`;
  document.getElementById('modal-delete').style.display = 'flex';
}

function closeDeleteModal(e) {
  if (!e || e.target === document.getElementById('modal-delete')) {
    document.getElementById('modal-delete').style.display = 'none';
  }
}

function confirmDelete() {
  if (!deleteTarget) return;

  // Solo se pueden eliminar usuarios dinámicos
  const dynamic = JSON.parse(localStorage.getItem('ub_dynamic_users') || '{}');

  if (dynamic[deleteTarget]) {
    delete dynamic[deleteTarget];
    localStorage.setItem('ub_dynamic_users', JSON.stringify(dynamic));
  } else {
    // Marcar como eliminado en dynamic
    const all = getAllUsers();
    dynamic[deleteTarget] = { ...all[deleteTarget], deleted: true, role: 'deleted' };
    localStorage.setItem('ub_dynamic_users', JSON.stringify(dynamic));
  }

  closeDeleteModal();
  renderAll();
  showToast('🗑️ Usuario eliminado');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
