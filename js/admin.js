// =============================================
//  UNIVERSIDAD EL BOSQUE – Admin Dashboard JS
// =============================================

let currentUser = null;
let gradeTarget = null; // {studentCode, guideId}

document.addEventListener('DOMContentLoaded', () => {
  currentUser = requireAuth('admin');
  if (!currentUser) return;

  document.getElementById('admin-name').textContent = currentUser.name;
  document.getElementById('admin-avatar').textContent = currentUser.initials;
  document.getElementById('welcome-msg').textContent = `Bienvenido, ${currentUser.name.split(' ')[1]}`;

  renderOverview();
  renderGuidesAdmin();
  renderStudentsTable();
  loadGuideProgress('');
  populateGuideFilter();
});

// ---- NAVEGACIÓN ----
function showSection(name) {
  document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');
  document.getElementById(`sec-${name}`).style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

// ---- RESUMEN GENERAL ----
function renderOverview() {
  const totalStudents = DB.students.length;
  const totalGuides = DB.guides.length;
  const allSubs = DB.submissions.filter(s => s.score !== null);
  const avgScore = allSubs.length
    ? Math.round(allSubs.reduce((a,b) => a + b.score, 0) / allSubs.length)
    : 0;
  const pending = DB.submissions.filter(s => s.status === 'pending').length;

  document.getElementById('stats-overview').innerHTML = `
    <div class="stat-card">
      <span class="stat-label">Estudiantes</span>
      <span class="stat-value">${totalStudents}</span>
      <span class="stat-sub">Registrados en el grupo</span>
    </div>
    <div class="stat-card gold">
      <span class="stat-label">Guías Activas</span>
      <span class="stat-value">${totalGuides}</span>
      <span class="stat-sub">Este semestre</span>
    </div>
    <div class="stat-card blue">
      <span class="stat-label">Promedio General</span>
      <span class="stat-value">${avgScore}</span>
      <span class="stat-sub">Sobre 100 puntos</span>
    </div>
    <div class="stat-card red">
      <span class="stat-label">Pendientes</span>
      <span class="stat-value">${pending}</span>
      <span class="stat-sub">Sin entregar</span>
    </div>
  `;

  // Guías overview
  const gList = document.getElementById('guides-overview-list');
  gList.innerHTML = DB.guides.map(g => {
    const subs = DB.getGuideSubmissions(g.id);
    const done = subs.filter(s => s.status !== 'pending').length;
    const pct = Math.round((done / DB.students.length) * 100);
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:18px">${typeIcon(g.type)}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${g.title}</div>
          <div style="font-size:11px;color:var(--text-gray)">${done}/${DB.students.length} entregas</div>
        </div>
        <div>
          <div class="progress-bar" style="width:90px">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
          <div style="font-size:11px;color:var(--text-gray);text-align:right;margin-top:2px">${pct}%</div>
        </div>
      </div>
    `;
  }).join('');

  // Top estudiantes
  const topList = document.getElementById('top-students-list');
  const ranked = DB.students.map(st => {
    const prog = DB.getStudentProgress(st.code);
    return { ...st, ...prog };
  }).filter(s => s.avg > 0).sort((a,b) => b.avg - a.avg).slice(0,5);

  topList.innerHTML = ranked.map((s, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:18px;width:24px;text-align:center;font-weight:700;color:var(--gold)">${i+1}</span>
      <div class="user-avatar" style="width:32px;height:32px;font-size:12px;background:var(--green-mid)">${initials(s.name)}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${s.name}</div>
        <div style="font-size:11px;color:var(--text-gray)">${s.completed}/${DB.guides.length} guías</div>
      </div>
      <span style="font-weight:700;color:var(--green-mid)">${s.avg}</span>
    </div>
  `).join('');
}

// ---- GESTIÓN DE GUÍAS ----
function renderGuidesAdmin() {
  const container = document.getElementById('guides-admin-list');
  container.innerHTML = DB.guides.map(g => {
    const subs = DB.getGuideSubmissions(g.id);
    const done = subs.filter(s => s.status !== 'pending').length;
    const graded = subs.filter(s => s.score !== null).length;
    return `
      <div class="card" style="margin-bottom:14px">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:22px">${typeIcon(g.type)}</span>
            <div>
              <h3>${g.title}</h3>
              <span style="font-size:12px;color:var(--text-gray)">${g.subject} · Vence: ${formatDate(g.dueDate)} · ${g.totalPoints} pts</span>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <span class="badge badge-green">${done} entregas</span>
            <span class="badge badge-blue">${graded} calificadas</span>
          </div>
        </div>
        <p style="font-size:13px;color:var(--text-gray);margin-bottom:14px">${g.description}</p>
        <div class="progress-bar" style="width:100%;height:8px;margin-bottom:6px">
          <div class="progress-fill" style="width:${Math.round((done/DB.students.length)*100)}%"></div>
        </div>
        <span style="font-size:12px;color:var(--text-gray)">${done}/${DB.students.length} estudiantes han entregado (${Math.round((done/DB.students.length)*100)}%)</span>
        <div style="margin-top:14px">
          <button class="btn btn-outline btn-sm" onclick="viewGuideStudents(${g.id})">Ver Entregas Detalladas</button>
        </div>
      </div>
    `;
  }).join('');
}

function viewGuideStudents(guideId) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');
  document.getElementById('sec-progress').style.display = 'block';
  document.getElementById('guide-filter').value = guideId;
  loadGuideProgress(guideId);
}

// ---- ESTUDIANTES ----
function renderStudentsTable(filter = '') {
  const tbody = document.getElementById('students-tbody');
  const filtered = DB.students.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.code.includes(filter)
  );
  tbody.innerHTML = filtered.map(st => {
    const prog = DB.getStudentProgress(st.code);
    const statusBadge = prog.completed >= DB.guides.length
      ? `<span class="badge badge-green">Al día</span>`
      : prog.completed >= DB.guides.length / 2
      ? `<span class="badge badge-yellow">En progreso</span>`
      : `<span class="badge badge-red">Atrasado</span>`;
    return `
      <tr>
        <td><code style="background:#f0faf5;padding:2px 8px;border-radius:4px;font-size:12px">${st.code}</code></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="user-avatar" style="width:28px;height:28px;font-size:11px;flex-shrink:0">${initials(st.name)}</div>
            ${st.name}
          </div>
        </td>
        <td>${st.semestre} Semestre</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="progress-bar" style="width:80px"><div class="progress-fill" style="width:${Math.round((prog.completed/DB.guides.length)*100)}%"></div></div>
            <span style="font-size:12px">${prog.completed}/${DB.guides.length}</span>
          </div>
        </td>
        <td><strong style="color:var(--green-mid)">${prog.avg || '—'}</strong></td>
        <td>${statusBadge}</td>
        <td><button class="btn btn-outline btn-sm" onclick="viewStudentDetail('${st.code}')">Ver Detalle</button></td>
      </tr>
    `;
  }).join('');
}

function filterStudents(val) {
  renderStudentsTable(val);
}

// ---- PROGRESO ----
function populateGuideFilter() {
  const sel = document.getElementById('guide-filter');
  DB.guides.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = g.title;
    sel.appendChild(opt);
  });
}

function loadGuideProgress(guideId) {
  const tbody = document.getElementById('progress-tbody');
  let rows = [];

  if (guideId) {
    const guide = DB.getGuideById(parseInt(guideId));
    DB.students.forEach(st => {
      const sub = DB.submissions.find(s => s.studentCode === st.code && s.guideId === parseInt(guideId));
      rows.push({ student: st, guide, sub: sub || null });
    });
  } else {
    DB.guides.forEach(g => {
      DB.students.forEach(st => {
        const sub = DB.submissions.find(s => s.studentCode === st.code && s.guideId === g.id);
        if (sub) rows.push({ student: st, guide: g, sub });
      });
    });
  }

  tbody.innerHTML = rows.map(({ student, guide, sub }) => {
    const status = sub ? sub.status : 'pending';
    const badge = statusBadge(status);
    const score = sub && sub.score !== null ? `<strong style="color:var(--green-mid)">${sub.score}/${guide.totalPoints}</strong>` : '—';
    const date = sub && sub.submittedAt ? sub.submittedAt : '—';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="user-avatar" style="width:26px;height:26px;font-size:11px;flex-shrink:0">${initials(student.name)}</div>
            <div>
              <div style="font-size:13px;font-weight:500">${student.name}</div>
              <div style="font-size:11px;color:var(--text-gray)">${student.code}</div>
            </div>
          </div>
        </td>
        <td style="font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${guide.title}</td>
        <td>${badge}</td>
        <td style="font-size:12px;color:var(--text-gray)">${date}</td>
        <td>${score}</td>
        <td>
          ${sub && sub.status !== 'pending'
            ? `<button class="btn btn-outline btn-sm" onclick="openGradeModal('${student.code}',${guide.id})">
                ${sub.score !== null ? '✏️ Editar' : '✅ Calificar'}
               </button>`
            : `<span style="font-size:12px;color:var(--text-gray)">Sin entrega</span>`
          }
        </td>
      </tr>
    `;
  }).join('');
}

// ---- MODAL GUÍA ----
function openNewGuideModal() {
  document.getElementById('modal-guide').style.display = 'flex';
}
function closeGuideModal(e) {
  if (!e || e.target === document.getElementById('modal-guide')) {
    document.getElementById('modal-guide').style.display = 'none';
  }
}
function saveGuide() {
  const title   = document.getElementById('g-title').value.trim();
  const subject = document.getElementById('g-subject').value.trim();
  const type    = document.getElementById('g-type').value;
  const desc    = document.getElementById('g-desc').value.trim();
  const due     = document.getElementById('g-due').value;
  const points  = parseInt(document.getElementById('g-points').value);

  if (!title || !subject || !due) { showToast('❌ Completa los campos obligatorios'); return; }

  DB.addGuide({ title, subject, type, description: desc, dueDate: due, totalPoints: points, professor: currentUser.name });
  closeGuideModal();
  renderGuidesAdmin();
  renderOverview();
  populateGuideFilter();
  showToast('✅ Guía creada exitosamente');
}

// ---- MODAL CALIFICAR ----
function openGradeModal(studentCode, guideId) {
  gradeTarget = { studentCode, guideId };
  const st = DB.getStudentByCode(studentCode);
  const g  = DB.getGuideById(guideId);
  const sub = DB.submissions.find(s => s.studentCode === studentCode && s.guideId === guideId);

  document.getElementById('grade-student-info').textContent = `${st.name} · ${g.title}`;
  document.getElementById('grade-max').textContent = g.totalPoints;
  document.getElementById('grade-score').max = g.totalPoints;
  document.getElementById('grade-score').value = sub && sub.score !== null ? sub.score : '';
  document.getElementById('grade-comment').value = sub ? sub.comment : '';
  document.getElementById('modal-grade').style.display = 'flex';
}
function closeGradeModal(e) {
  if (!e || e.target === document.getElementById('modal-grade')) {
    document.getElementById('modal-grade').style.display = 'none';
  }
}
function saveGrade() {
  const score = parseInt(document.getElementById('grade-score').value);
  const comment = document.getElementById('grade-comment').value;
  if (isNaN(score)) { showToast('❌ Ingresa una calificación válida'); return; }
  DB.gradeSubmission(gradeTarget.studentCode, gradeTarget.guideId, score, comment);
  closeGradeModal();
  loadGuideProgress(document.getElementById('guide-filter').value);
  renderOverview();
  showToast('✅ Calificación guardada');
}

// ---- MODAL ESTUDIANTE DETALLE ----
function viewStudentDetail(code) {
  const st = DB.getStudentByCode(code);
  const subs = DB.getStudentSubmissions(code);
  const prog = DB.getStudentProgress(code);

  document.getElementById('modal-student-name').textContent = `🎓 ${st.name}`;
  document.getElementById('modal-student-content').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
      <div style="background:#f4f7f5;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:var(--text-gray)">Código</div>
        <div style="font-weight:600">${st.code}</div>
      </div>
      <div style="background:#f4f7f5;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:var(--text-gray)">Promedio</div>
        <div style="font-weight:600;color:var(--green-mid)">${prog.avg || '—'}</div>
      </div>
      <div style="background:#f4f7f5;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:var(--text-gray)">Guías completadas</div>
        <div style="font-weight:600">${prog.completed} / ${DB.guides.length}</div>
      </div>
      <div style="background:#f4f7f5;border-radius:8px;padding:12px">
        <div style="font-size:11px;color:var(--text-gray)">Email</div>
        <div style="font-size:12px">${st.email}</div>
      </div>
    </div>
    <h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Detalle por Guía</h4>
    ${DB.guides.map(g => {
      const sub = subs.find(s => s.guideId === g.id);
      const status = sub ? sub.status : 'pending';
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:16px">${typeIcon(g.type)}</span>
          <div style="flex:1;font-size:13px">${g.title}</div>
          ${statusBadge(status)}
          <strong style="font-size:13px;color:var(--green-mid);min-width:40px;text-align:right">
            ${sub && sub.score !== null ? sub.score : '—'}
          </strong>
        </div>
      `;
    }).join('')}
  `;
  document.getElementById('modal-student').style.display = 'flex';
}
function closeStudentModal(e) {
  if (!e || e.target === document.getElementById('modal-student')) {
    document.getElementById('modal-student').style.display = 'none';
  }
}

// ---- REPORTES ----
function exportReport(type) {
  const reportDiv = document.getElementById('report-output');
  const contentDiv = document.getElementById('report-content');
  reportDiv.style.display = 'block';

  if (type === 'progress') {
    contentDiv.innerHTML = `
      <table>
        <thead><tr><th>Estudiante</th>${DB.guides.map(g => `<th style="font-size:11px;max-width:100px">${g.title.slice(0,30)}…</th>`).join('')}<th>Promedio</th></tr></thead>
        <tbody>
          ${DB.students.map(st => {
            const subs = DB.getStudentSubmissions(st.code);
            const prog = DB.getStudentProgress(st.code);
            return `<tr>
              <td style="font-size:13px">${st.name}</td>
              ${DB.guides.map(g => {
                const sub = subs.find(s => s.guideId === g.id);
                return `<td style="text-align:center">${sub && sub.score !== null ? sub.score : '—'}</td>`;
              }).join('')}
              <td style="text-align:center;font-weight:700;color:var(--green-mid)">${prog.avg || '—'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
    showToast('📊 Reporte generado');
  } else {
    // CSV
    let csv = 'Código,Nombre,Guía,Estado,Nota,Fecha\n';
    DB.submissions.forEach(sub => {
      const st = DB.getStudentByCode(sub.studentCode);
      const g = DB.getGuideById(sub.guideId);
      if (st && g) csv += `${st.code},"${st.name}","${g.title}",${sub.status},${sub.score||''},${sub.submittedAt||''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'calificaciones_bosque.csv'; a.click();
    showToast('📥 CSV descargado');
  }
}

// ---- HELPERS ----
function typeIcon(type) {
  return { lab: '🔬', taller: '📝', quiz: '📋' }[type] || '📄';
}

function initials(name) {
  return name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
}

function formatDate(d) {
  if (!d) return '—';
  const [y,m,day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function statusBadge(status) {
  const map = {
    completed: '<span class="badge badge-green">✅ Completada</span>',
    pending:   '<span class="badge badge-yellow">⏳ Pendiente</span>',
    late:      '<span class="badge badge-red">⚠️ Tardía</span>',
  };
  return map[status] || '<span class="badge badge-gray">—</span>';
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
