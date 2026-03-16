// =============================================
//  UNIVERSIDAD EL BOSQUE – Student Dashboard JS
// =============================================

let currentUser = null;
let currentGuideFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  currentUser = requireAuth('student');
  if (!currentUser) return;

  document.getElementById('student-name').textContent = currentUser.name;
  document.getElementById('student-code').textContent = currentUser.username;
  document.getElementById('student-avatar').textContent = currentUser.initials;
  document.getElementById('student-welcome').textContent = `¡Hola, ${currentUser.name.split(' ')[0]}!`;
  document.getElementById('student-subtitle').textContent = `${currentUser.semestre} Semestre · ${currentUser.programa} · Universidad El Bosque`;

  renderHome();
  renderGuides('all');
  renderGrades();
  renderCalendar();
});

// ---- NAVEGACIÓN ----
function showSection(name) {
  document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');
  document.getElementById(`sec-${name}`).style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  if (event) event.currentTarget.classList.add('active');
}

// ---- INICIO ----
function renderHome() {
  const prog = DB.getStudentProgress(currentUser.username);
  const subs = DB.getStudentSubmissions(currentUser.username);
  const pending = DB.guides.filter(g => {
    const sub = subs.find(s => s.guideId === g.id);
    return !sub || sub.status === 'pending';
  });

  document.getElementById('student-stats').innerHTML = `
    <div class="stat-card">
      <span class="stat-label">Guías Completadas</span>
      <span class="stat-value">${prog.completed}</span>
      <span class="stat-sub">De ${DB.guides.length} totales</span>
    </div>
    <div class="stat-card gold">
      <span class="stat-label">Mi Promedio</span>
      <span class="stat-value">${prog.avg || '—'}</span>
      <span class="stat-sub">Sobre 100 puntos</span>
    </div>
    <div class="stat-card ${pending.length > 0 ? 'red' : 'blue'}">
      <span class="stat-label">Pendientes</span>
      <span class="stat-value">${pending.length}</span>
      <span class="stat-sub">Sin entregar</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Avance</span>
      <span class="stat-value">${Math.round((prog.completed/DB.guides.length)*100)}%</span>
      <span class="stat-sub">Del semestre</span>
    </div>
  `;

  // Guías pendientes
  const pendingList = document.getElementById('home-pending-guides');
  if (pending.length === 0) {
    pendingList.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-gray)">🎉 ¡Estás al día con todas las guías!</div>`;
  } else {
    pendingList.innerHTML = pending.slice(0, 3).map(g => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:22px">${typeIcon(g.type)}</span>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:500">${g.title}</div>
          <div style="font-size:12px;color:var(--text-gray)">${g.subject} · Vence: ${formatDate(g.dueDate)}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openGuideModal(${g.id})">Ver</button>
      </div>
    `).join('');
  }

  // Progreso visual
  const progressDiv = document.getElementById('home-progress');
  progressDiv.innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:48px;font-weight:700;color:var(--green-mid)">${Math.round((prog.completed/DB.guides.length)*100)}%</div>
      <div style="font-size:13px;color:var(--text-gray)">completado</div>
    </div>
    <div class="progress-bar" style="width:100%;height:12px;margin-bottom:16px">
      <div class="progress-fill" style="width:${Math.round((prog.completed/DB.guides.length)*100)}%"></div>
    </div>
    ${DB.guides.map(g => {
      const sub = subs.find(s => s.guideId === g.id);
      const status = sub ? sub.status : 'pending';
      const dot = status === 'completed' ? '🟢' : status === 'late' ? '🟡' : '⚪';
      return `<div style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:6px">
        <span>${dot}</span>
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${g.title.slice(0,35)}…</span>
      </div>`;
    }).join('')}
  `;
}

// ---- GUÍAS ----
function renderGuides(filter) {
  currentGuideFilter = filter;
  const subs = DB.getStudentSubmissions(currentUser.username);
  const grid = document.getElementById('guides-grid');

  let guides = DB.guides;

  if (filter === 'pending') {
    guides = guides.filter(g => {
      const sub = subs.find(s => s.guideId === g.id);
      return !sub || sub.status === 'pending';
    });
  } else if (filter === 'completed') {
    guides = guides.filter(g => {
      const sub = subs.find(s => s.guideId === g.id);
      return sub && sub.status !== 'pending';
    });
  }

  grid.innerHTML = guides.map(g => {
    const sub = subs.find(s => s.guideId === g.id);
    const status = sub ? sub.status : 'pending';
    const cardClass = status === 'completed' ? 'completed' : status === 'late' ? '' : 'pending';
    const score = sub && sub.score !== null
      ? `<span style="font-size:18px;font-weight:700;color:var(--green-mid)">${sub.score}/${g.totalPoints}</span>`
      : '';

    return `
      <div class="guide-card ${cardClass}">
        <div class="guide-card-header">
          <span style="font-size:28px">${typeIcon(g.type)}</span>
          ${statusBadge(status)}
        </div>
        <h4>${g.title}</h4>
        <p class="subject">${g.subject} · Prof. ${g.professor}</p>
        <p style="font-size:13px;color:var(--text-gray);line-height:1.4">${g.description.slice(0, 90)}…</p>
        ${score}
        <p class="due-date">📅 Vence: ${formatDate(g.dueDate)} · ${g.totalPoints} pts</p>
        <div class="guide-actions">
          <button class="btn btn-primary btn-sm" onclick="openGuideModal(${g.id})">Ver Guía</button>
          ${status === 'pending'
            ? `<button class="btn btn-outline btn-sm" onclick="submitGuide(${g.id})">Marcar como Entregada</button>`
            : ''
          }
        </div>
      </div>
    `;
  }).join('');

  if (guides.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-gray)">No hay guías en esta categoría.</div>`;
  }
}

function filterGuides(filter, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGuides(filter);
}

// ---- NOTAS ----
function renderGrades() {
  const subs = DB.getStudentSubmissions(currentUser.username);
  const graded = subs.filter(s => s.score !== null);
  const avg = graded.length
    ? Math.round(graded.reduce((a,b) => a + b.score, 0) / graded.length)
    : 0;
  const best = graded.length ? Math.max(...graded.map(s => s.score)) : 0;
  const lowest = graded.length ? Math.min(...graded.map(s => s.score)) : 0;

  document.getElementById('grades-stats').innerHTML = `
    <div class="stat-card">
      <span class="stat-label">Promedio</span>
      <span class="stat-value">${avg || '—'}</span>
      <span class="stat-sub">Sobre 100 puntos</span>
    </div>
    <div class="stat-card gold">
      <span class="stat-label">Mejor Nota</span>
      <span class="stat-value">${best || '—'}</span>
      <span class="stat-sub">Tu máximo</span>
    </div>
    <div class="stat-card blue">
      <span class="stat-label">Actividades Calificadas</span>
      <span class="stat-value">${graded.length}</span>
      <span class="stat-sub">Con nota asignada</span>
    </div>
    <div class="stat-card ${lowest < 60 ? 'red' : ''}">
      <span class="stat-label">Nota Más Baja</span>
      <span class="stat-value">${graded.length ? lowest : '—'}</span>
      <span class="stat-sub">A mejorar</span>
    </div>
  `;

  const tbody = document.getElementById('grades-tbody');
  tbody.innerHTML = DB.guides.map(g => {
    const sub = subs.find(s => s.guideId === g.id);
    const status = sub ? sub.status : 'pending';
    return `
      <tr>
        <td style="font-weight:500">${g.title}</td>
        <td style="font-size:13px;color:var(--text-gray)">${g.subject}</td>
        <td><span class="badge badge-gray">${typeLabel(g.type)}</span></td>
        <td>${statusBadge(status)}</td>
        <td>
          ${sub && sub.score !== null
            ? `<strong style="color:${sub.score >= 60 ? 'var(--green-mid)' : 'var(--red)'}">${sub.score}/${g.totalPoints}</strong>`
            : '<span style="color:var(--text-gray)">—</span>'
          }
        </td>
        <td style="font-size:12px;color:var(--text-gray)">${sub && sub.submittedAt ? sub.submittedAt : '—'}</td>
        <td style="font-size:12px;color:var(--text-gray);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${sub && sub.comment ? sub.comment : '—'}
        </td>
      </tr>
    `;
  }).join('');
}

// ---- CALENDARIO ----
function renderCalendar() {
  const subs = DB.getStudentSubmissions(currentUser.username);
  const sorted = [...DB.guides].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  const now = new Date();

  document.getElementById('calendar-list').innerHTML = sorted.map(g => {
    const due = new Date(g.dueDate);
    const sub = subs.find(s => s.guideId === g.id);
    const isOverdue = due < now && (!sub || sub.status === 'pending');
    const isPending = !sub || sub.status === 'pending';
    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    return `
      <div style="display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid var(--border)">
        <div style="text-align:center;min-width:50px">
          <div style="font-size:22px;font-weight:700;color:${isOverdue ? 'var(--red)' : 'var(--green-mid)'}">${due.getDate()}</div>
          <div style="font-size:11px;color:var(--text-gray);text-transform:uppercase">${due.toLocaleString('es',{month:'short'})}</div>
        </div>
        <span style="font-size:20px">${typeIcon(g.type)}</span>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:500">${g.title}</div>
          <div style="font-size:12px;color:var(--text-gray)">${g.subject}</div>
        </div>
        ${sub && sub.status !== 'pending'
          ? `<span class="badge badge-green">✅ Entregada</span>`
          : isOverdue
          ? `<span class="badge badge-red">⚠️ Vencida</span>`
          : daysLeft <= 3
          ? `<span class="badge badge-yellow">⏰ ${daysLeft} días</span>`
          : `<span class="badge badge-blue">📅 ${daysLeft} días</span>`
        }
      </div>
    `;
  }).join('');
}

// ---- MODAL GUÍA ----
function openGuideModal(guideId) {
  const g = DB.getGuideById(guideId);
  const sub = DB.submissions.find(s => s.studentCode === currentUser.username && s.guideId === guideId);
  const status = sub ? sub.status : 'pending';

  document.getElementById('modal-guide-content').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <span style="font-size:40px">${typeIcon(g.type)}</span>
      <div>
        <h3 style="font-family:'Playfair Display',serif;font-size:20px;color:var(--green-dark)">${g.title}</h3>
        <p style="font-size:13px;color:var(--text-gray)">${g.subject} · ${g.professor}</p>
      </div>
    </div>
    <div style="background:#f4f7f5;border-radius:10px;padding:16px;margin-bottom:18px">
      <h4 style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--green-dark)">Descripción</h4>
      <p style="font-size:14px;line-height:1.6;color:var(--text-dark)">${g.description}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:18px">
      <div style="background:#f4f7f5;border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:11px;color:var(--text-gray)">Tipo</div>
        <div style="font-weight:600;font-size:13px">${typeLabel(g.type)}</div>
      </div>
      <div style="background:#f4f7f5;border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:11px;color:var(--text-gray)">Fecha Límite</div>
        <div style="font-weight:600;font-size:13px">${formatDate(g.dueDate)}</div>
      </div>
      <div style="background:#f4f7f5;border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:11px;color:var(--text-gray)">Puntos</div>
        <div style="font-weight:600;font-size:13px">${g.totalPoints}</div>
      </div>
    </div>
    ${sub && sub.score !== null ? `
      <div style="background:#f0faf5;border:1px solid #86efac;border-radius:10px;padding:14px;margin-bottom:8px">
        <div style="font-size:13px;font-weight:600;color:var(--green-dark);margin-bottom:4px">✅ Calificada</div>
        <div style="font-size:24px;font-weight:700;color:var(--green-mid)">${sub.score} / ${g.totalPoints}</div>
        ${sub.comment ? `<div style="font-size:13px;color:var(--text-gray);margin-top:6px">💬 ${sub.comment}</div>` : ''}
      </div>
    ` : ''}
    ${g.fileData ? `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px;display:flex;align-items:center;gap:12px">
        <span style="font-size:28px">📎</span>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600;color:#1d4ed8">Archivo adjunto</div>
          <div style="font-size:12px;color:var(--text-gray)">${g.fileData.name}</div>
        </div>
        <a href="${g.fileData.data}" download="${g.fileData.name}"
          style="background:#2563eb;color:white;padding:8px 14px;border-radius:8px;font-size:13px;text-decoration:none;font-weight:500">
          ⬇️ Descargar
        </a>
      </div>
    ` : ''}
  `;

  document.getElementById('modal-guide-footer').innerHTML = `
    <button class="btn btn-outline" onclick="closeGuideModal()">Cerrar</button>
    ${status === 'pending'
      ? `<button class="btn btn-primary" onclick="submitGuide(${g.id},true)">✅ Marcar como Entregada</button>`
      : `<span class="badge badge-green" style="align-self:center">Entregada ${sub.submittedAt}</span>`
    }
  `;

  document.getElementById('modal-guide').style.display = 'flex';
}

function closeGuideModal(e) {
  if (!e || e.target === document.getElementById('modal-guide')) {
    document.getElementById('modal-guide').style.display = 'none';
  }
}

function submitGuide(guideId, fromModal = false) {
  DB.submitGuide(currentUser.username, guideId);
  if (fromModal) closeGuideModal();
  renderGuides(currentGuideFilter);
  renderHome();
  renderGrades();
  renderCalendar();
  showToast('✅ Guía marcada como entregada');
}

// ---- HELPERS ----
function typeIcon(type) {
  return { lab: '🔬', taller: '📝', quiz: '📋' }[type] || '📄';
}

function typeLabel(type) {
  return { lab: 'Laboratorio', taller: 'Taller', quiz: 'Evaluación' }[type] || 'Guía';
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
