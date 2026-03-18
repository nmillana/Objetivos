const STATUS_CONFIG = {
  "no-iniciado": { label: "To do", className: "no-iniciado" },
  "en-curso": { label: "In progress", className: "en-curso" },
  encaminado: { label: "On track", className: "encaminado" },
  "en-riesgo": { label: "At risk", className: "en-riesgo" },
  completado: { label: "Done", className: "completado" }
};

const BOARD_COLUMNS = [
  { key: "no-iniciado", title: "TO DO" },
  { key: "en-curso", title: "IN PROGRESS" },
  { key: "encaminado", title: "ON TRACK" },
  { key: "en-riesgo", title: "AT RISK" },
  { key: "completado", title: "DONE" }
];

const STORAGE_KEY = "panel-objetivos-gerencia-personas-v2";
const SESSION_KEY = "panel-objetivos-session-v1";
const TODAY = new Date();
const AI_ENDPOINT = "/api/ai/objective-draft";
const AI_HEALTH_ENDPOINT = "/api/ai/health";
const DEFAULT_AI_MODEL = "gpt-5-mini";

const refs = {
  loginShell: document.getElementById("loginShell"),
  appShell: document.getElementById("appShell"),
  loginForm: document.getElementById("loginForm"),
  loginError: document.getElementById("loginError"),
  logoutBtn: document.getElementById("logoutBtn"),
  searchInput: document.getElementById("searchInput"),
  areaFilter: document.getElementById("areaFilter"),
  statusFilter: document.getElementById("statusFilter"),
  ownerFilter: document.getElementById("ownerFilter"),
  dueSoonOnly: document.getElementById("dueSoonOnly"),
  atRiskOnly: document.getElementById("atRiskOnly"),
  addObjectiveBtn: document.getElementById("addObjectiveBtn"),
  objectiveDialog: document.getElementById("objectiveDialog"),
  objectiveForm: document.getElementById("objectiveForm"),
  closeDialogBtn: document.getElementById("closeDialogBtn"),
  cancelDialogBtn: document.getElementById("cancelDialogBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importInput: document.getElementById("importInput"),
  resetBtn: document.getElementById("resetBtn"),
  clearAreaFilterBtn: document.getElementById("clearAreaFilterBtn"),
  areaNav: document.getElementById("areaNav"),
  summaryGrid: document.getElementById("summaryGrid"),
  milestoneStrip: document.getElementById("milestoneStrip"),
  boardColumns: document.getElementById("boardColumns"),
  detailDialog: document.getElementById("detailDialog"),
  detailPanel: document.getElementById("detailPanel"),
  detailTitle: document.getElementById("detailTitle"),
  closeDetailDialogBtn: document.getElementById("closeDetailDialogBtn"),
  resultCount: document.getElementById("resultCount"),
  currentUserName: document.getElementById("currentUserName"),
  currentUserRole: document.getElementById("currentUserRole"),
  currentUserAvatar: document.getElementById("currentUserAvatar"),
  createAssistantBtn: document.getElementById("createAssistantBtn"),
  goalCreatorDialog: document.getElementById("goalCreatorDialog"),
  goalCreatorForm: document.getElementById("goalCreatorForm"),
  closeCreatorDialogBtn: document.getElementById("closeCreatorDialogBtn"),
  nextToStep2Btn: document.getElementById("nextToStep2Btn"),
  backToStep1Btn: document.getElementById("backToStep1Btn"),
  regenerateDraftBtn: document.getElementById("regenerateDraftBtn"),
  aiStatusMessage: document.getElementById("aiStatusMessage"),
  generatedMeta: document.getElementById("generatedMeta")
};

const state = {
  data: loadData(),
  session: loadSession(),
  filters: {
    area: "all",
    status: "all",
    owner: "all",
    search: "",
    dueSoonOnly: false,
    atRiskOnly: false
  },
  selectedObjectiveId: "",
  ai: {
    available: false,
    checked: false,
    lastModel: DEFAULT_AI_MODEL
  }
};

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return clone(window.SEED_DATA);
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.objectives)) throw new Error("invalid");
    if (!parsed.access) parsed.access = clone(window.SEED_DATA.access || {});
    return parsed;
  } catch {
    return clone(window.SEED_DATA);
  }
}

function saveData() {
  state.data.metadata.lastUpdated = formatDateInput(new Date());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function loadSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(user) {
  state.session = user;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  state.session = null;
  sessionStorage.removeItem(SESSION_KEY);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function init() {
  populateStaticSelects();
  bindEvents();
  syncAccess();
  if (state.session) render();
}

function populateStaticSelects() {
  refs.statusFilter.innerHTML = ['<option value="all">Todos los estados</option>']
    .concat(Object.entries(STATUS_CONFIG).map(([key, item]) => `<option value="${esc(key)}">${esc(item.label)}</option>`))
    .join("");
  refs.objectiveForm.querySelector("#newStatus").value = "en-curso";
}

function populateAreaOptions() {
  const areas = getAreas();
  const areaOptions = ['<option value="all">Todas las areas</option>']
    .concat(areas.map((area) => `<option value="${esc(area)}">${esc(area)}</option>`))
    .join("");
  refs.areaFilter.innerHTML = areaOptions;
  document.getElementById("newArea").innerHTML = areas
    .map((area) => `<option value="${esc(area)}">${esc(area)}</option>`)
    .join("");
  refs.areaFilter.value = areas.includes(state.filters.area) ? state.filters.area : "all";
  state.filters.area = refs.areaFilter.value;
  // Also populate creator area
  populateCreatorAreaOptions();
}

function populateOwnerOptions() {
  const owners = [...new Set(state.data.objectives.map((item) => item.owner))].sort();
  refs.ownerFilter.innerHTML = ['<option value="all">Todos los responsables</option>']
    .concat(owners.map((owner) => `<option value="${esc(owner)}">${esc(owner)}</option>`))
    .join("");
  refs.ownerFilter.value = owners.includes(state.filters.owner) ? state.filters.owner : "all";
  state.filters.owner = refs.ownerFilter.value;
}

function bindEvents() {
  refs.loginForm.addEventListener("submit", handleLogin);
  refs.logoutBtn.addEventListener("click", handleLogout);
  refs.searchInput.addEventListener("input", (event) => {
    state.filters.search = normalize(event.target.value);
    render();
  });
  refs.areaFilter.addEventListener("change", (event) => {
    state.filters.area = event.target.value;
    render();
  });
  refs.statusFilter.addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    render();
  });
  refs.ownerFilter.addEventListener("change", (event) => {
    state.filters.owner = event.target.value;
    render();
  });
  if (refs.dueSoonOnly) {
    refs.dueSoonOnly.addEventListener("change", (event) => {
      state.filters.dueSoonOnly = event.target.checked;
      render();
    });
  }
  refs.atRiskOnly.addEventListener("change", (event) => {
    state.filters.atRiskOnly = event.target.checked;
    render();
  });
  refs.clearAreaFilterBtn.addEventListener("click", () => {
    state.filters.area = "all";
    refs.areaFilter.value = "all";
    render();
  });
  refs.areaNav.addEventListener("click", (event) => {
    const target = event.target.closest("[data-area-pill]");
    if (!target) return;
    state.filters.area = target.getAttribute("data-area-pill");
    refs.areaFilter.value = state.filters.area;
    render();
  });
  refs.addObjectiveBtn.addEventListener("click", openDialog);
  refs.closeDialogBtn.addEventListener("click", closeDialog);
  refs.cancelDialogBtn.addEventListener("click", closeDialog);
  refs.objectiveForm.addEventListener("submit", submitObjective);
  refs.boardColumns.addEventListener("click", (event) => {
    const card = event.target.closest("[data-open-objective]");
    if (!card) return;
    state.selectedObjectiveId = card.getAttribute("data-open-objective");
    render();
    openDetailDialog();
  });
  if (refs.detailPanel) {
    refs.detailPanel.addEventListener("submit", (event) => {
      if (event.target.matches("#quickUpdateForm")) {
        event.preventDefault();
        submitQuickUpdate(event);
        return;
      }
      if (event.target.matches("#meetingForm")) {
        event.preventDefault();
        submitMeeting(event);
      }
    });
    refs.detailPanel.addEventListener("click", (event) => {
      const deleteMeetingButton = event.target.closest("[data-delete-meeting]");
      const deleteObjectiveButton = event.target.closest("[data-delete-objective]");
      if (deleteMeetingButton) removeMeeting(deleteMeetingButton.getAttribute("data-delete-meeting"));
      if (deleteObjectiveButton) removeObjective(deleteObjectiveButton.getAttribute("data-delete-objective"));
    });
  }
  refs.resetBtn.addEventListener("click", resetSeed);
  refs.createAssistantBtn.addEventListener("click", openCreatorDialog);
  refs.closeCreatorDialogBtn.addEventListener("click", closeCreatorDialog);
  if (refs.closeDetailDialogBtn) refs.closeDetailDialogBtn.addEventListener("click", closeDetailDialog);
  refs.nextToStep2Btn.addEventListener("click", nextToStep2);
  refs.backToStep1Btn.addEventListener("click", backToStep1);
  refs.regenerateDraftBtn.addEventListener("click", nextToStep2);
  refs.goalCreatorForm.addEventListener("submit", submitGoalCreator);
}
function syncAccess() {
  const loggedIn = Boolean(state.session);
  refs.loginShell.classList.toggle("is-hidden", loggedIn);
  refs.appShell.classList.toggle("is-hidden", !loggedIn);
  if (!loggedIn) return;
  refs.currentUserName.textContent = state.session.name;
  refs.currentUserRole.textContent = state.session.role;
  refs.currentUserAvatar.textContent = state.session.avatar;
}

function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const user = (state.data.access?.users || []).find(
    (item) => item.email.toLowerCase() === email && item.password === password
  );
  if (!user) {
    refs.loginError.hidden = false;
    return;
  }
  refs.loginError.hidden = true;
  saveSession({ id: user.id, name: user.name, role: user.role, email: user.email, avatar: user.avatar });
  state.selectedObjectiveId = "";
  syncAccess();
  render();
}

function handleLogout() {
  clearSession();
  refs.loginForm.reset();
  refs.loginError.hidden = true;
  syncAccess();
}

function render() {
  if (!state.session) return;
  populateAreaOptions();
  populateOwnerOptions();
  const visibleObjectives = filteredObjectives();
  ensureSelection(visibleObjectives);
  renderAreaNav(visibleObjectives);
  renderSummary(visibleObjectives);
  renderBoardColumns(visibleObjectives);
  renderDetail();
  refs.resultCount.textContent = String(visibleObjectives.length);
}
function filteredObjectives() {
  return state.data.objectives.filter((item) => {
    if (state.filters.area !== "all" && item.area !== state.filters.area) return false;
    if (state.filters.status !== "all" && item.status !== state.filters.status) return false;
    if (state.filters.owner !== "all" && item.owner !== state.filters.owner) return false;
    if (state.filters.atRiskOnly && item.status !== "en-riesgo") return false;
    if (state.filters.dueSoonOnly) {
      const next = nextMilestone(item);
      if (!next || !isWithinDays(next.date, 45)) return false;
    }
    if (!state.filters.search) return true;
    const haystack = normalize([item.title, item.area, item.owner, item.description, ...(item.tags || [])].join(" "));
    return haystack.includes(state.filters.search);
  });
}

function ensureSelection(visibleObjectives) {
  const exists = visibleObjectives.some((item) => item.id === state.selectedObjectiveId);
  if (!exists) {
    state.selectedObjectiveId = visibleObjectives[0]?.id || "";
  }
}

function renderAreaNav(visibleObjectives) {
  const areas = getAreas();
  refs.areaNav.innerHTML = areas.map((area) => {
    const total = state.data.objectives.filter((item) => item.area === area).length;
    const visible = visibleObjectives.filter((item) => item.area === area).length;
    const active = state.filters.area === area ? "active" : "";
    return `
      <button type="button" class="area-pill ${active}" data-area-pill="${esc(area)}">
        <span>${esc(area)}</span>
        <small>${visible}/${total}</small>
      </button>
    `;
  }).join("");
}

function renderSummary(items) {
  const pending = items.filter((item) => !item.nextFollowUp || new Date(item.nextFollowUp) <= TODAY).length;
  const cards = [
    { label: "Visibles", value: items.length, meta: "segun los filtros" },
    { label: "Pendientes", value: pending, meta: "sin seguimiento futuro" },
    { label: "En riesgo", value: items.filter((item) => item.status === "en-riesgo").length, meta: "requieren foco" },
    { label: "Seguimientos", value: items.reduce((sum, item) => sum + item.meetings.length, 0), meta: "comentarios cargados" }
  ];
  refs.summaryGrid.innerHTML = cards.map((card) => `
    <article class="summary-card">
      <span>${esc(card.label)}</span>
      <strong>${esc(String(card.value))}</strong>
      <span>${esc(card.meta)}</span>
    </article>
  `).join("");
}
function renderMilestones(items) {
  const milestones = upcomingMilestones(items, 120).slice(0, 4);
  if (!milestones.length) {
    refs.milestoneStrip.innerHTML = `<div class="empty-state"><div><strong>Sin hitos proximos.</strong><p>Agrega un hito nuevo o ajusta fechas para ver la agenda.</p></div></div>`;
    return;
  }
  refs.milestoneStrip.innerHTML = milestones.map(({ objective, milestone }) => `
    <article class="milestone-card">
      <div class="detail-topline">
        <span class="issue-chip">${esc(issueKey(objective))}</span>
        <span class="status-pill ${statusOf(objective.status).className}">${esc(statusOf(objective.status).label)}</span>
      </div>
      <h3>${esc(milestone.label)}</h3>
      <p>${esc(objective.title)}</p>
      <div class="metric-row"><span>Fecha</span><strong>${esc(formatDate(milestone.date))}</strong></div>
      <div class="metric-row"><span>Owner</span><strong>${esc(milestone.owner || objective.owner)}</strong></div>
    </article>
  `).join("");
}

function renderBoardColumns(items) {
  refs.boardColumns.innerHTML = BOARD_COLUMNS.map((column) => {
    const columnItems = items.filter((item) => item.status === column.key);
    return `
      <section class="column">
        <div class="column-header">
          <strong>${column.title}</strong>
          <span>${columnItems.length}</span>
        </div>
        ${columnItems.length ? columnItems.map(renderObjectiveCard).join("") : `<div class="empty-state"><div><strong>Sin objetivos</strong><p>Esta columna no tiene tarjetas con los filtros actuales.</p></div></div>`}
      </section>
    `;
  }).join("");
}

function renderObjectiveCard(item) {
  const meetingCount = item.meetings.length;
  const selected = item.id === state.selectedObjectiveId ? "is-selected" : "";
  const followUp = item.nextFollowUp ? formatDate(item.nextFollowUp) : "Pendiente";
  const dueDate = item.dueDate ? formatDate(item.dueDate) : "Sin fecha";
  return `
    <article class="objective-card ${selected}" data-open-objective="${esc(item.id)}">
      <div class="card-meta">
        <div>
          <span class="issue-chip">${esc(issueKey(item))}</span>
          <span class="area-chip">${esc(item.area)}</span>
        </div>
        <span class="status-pill ${statusOf(item.status).className}">${esc(statusOf(item.status).label)}</span>
      </div>
      <div>
        <h3>${esc(item.title)}</h3>
        <p class="card-description">${esc(item.description)}</p>
      </div>
      <div>
        <div class="metric-row"><span>Avance</span><strong>${item.progress}%</strong></div>
        <div class="progress-track"><div class="progress-fill" style="width:${item.progress}%"></div></div>
      </div>
      <div class="summary-inline">
        <span class="tag-chip">Seguimiento: ${esc(followUp)}</span>
        <span class="tag-chip">Fecha objetivo: ${esc(dueDate)}</span>
      </div>
      <div class="card-footer">
        <div class="owner-avatar">${esc(initials(item.owner))}</div>
        <span>${esc(item.owner)}</span>
        <span>${meetingCount} seguimientos</span>
      </div>
    </article>
  `;
}
function renderDetail() {
  const item = state.data.objectives.find((objective) => objective.id === state.selectedObjectiveId);
  refs.detailTitle.textContent = item ? item.title : "Seguimiento del objetivo";
  if (!item) {
    refs.detailPanel.innerHTML = `<div class="empty-state"><div><strong>Sin objetivo seleccionado.</strong><p>Haz click en una tarjeta del board para abrir su seguimiento.</p></div></div>`;
    return;
  }

  const meetings = [...item.meetings].sort((a, b) => new Date(b.date) - new Date(a.date));
  refs.detailPanel.innerHTML = `
    <div class="detail-stack">
      <section class="detail-block">
        <div class="detail-topline">
          <div>
            <div class="summary-inline">
              <span class="issue-chip">${esc(issueKey(item))}</span>
              <span class="area-chip">${esc(item.area)}</span>
              <span class="status-pill ${statusOf(item.status).className}">${esc(statusOf(item.status).label)}</span>
              <span class="tag-chip">Avance: ${item.progress}%</span>
            </div>
          </div>
          <button type="button" class="delete-link" data-delete-objective="${esc(item.id)}">Eliminar objetivo</button>
        </div>
        <p>${esc(item.description)}</p>
        <div class="detail-badges">
          <div>
            <span class="tag-chip">Responsable: ${esc(item.owner)}</span>
            <span class="tag-chip">Seguimiento: ${esc(item.nextFollowUp ? formatDate(item.nextFollowUp) : "Pendiente")}</span>
            <span class="tag-chip">Fecha objetivo: ${esc(item.dueDate ? formatDate(item.dueDate) : "Sin fecha")}</span>
            <span class="tag-chip">${item.meetings.length} seguimientos</span>
          </div>
          ${item.executiveNote ? `<div><span class="tag-chip">Nota: ${esc(item.executiveNote)}</span></div>` : ""}
        </div>
      </section>

      <section class="detail-block">
        <h3>Editar objetivo</h3>
        <form id="quickUpdateForm" class="quick-form">
          <input type="hidden" name="objectiveId" value="${esc(item.id)}">
          <div class="form-grid">
            <label class="field field-full">
              <span>Titulo</span>
              <input name="title" type="text" value="${esc(item.title)}" required>
            </label>
            <label class="field">
              <span>Responsable</span>
              <input name="owner" type="text" value="${esc(item.owner)}" required>
            </label>
            <label class="field">
              <span>Estado</span>
              <select name="status">${statusOptions(item.status)}</select>
            </label>
            <label class="field">
              <span>Avance (%)</span>
              <input name="progress" type="number" min="0" max="100" value="${item.progress}">
            </label>
            <label class="field">
              <span>Proximo seguimiento</span>
              <input name="nextFollowUp" type="date" value="${esc(item.nextFollowUp || "")}">
            </label>
            <label class="field">
              <span>Fecha objetivo</span>
              <input name="dueDate" type="date" value="${esc(item.dueDate || "")}">
            </label>
            <label class="field field-full">
              <span>Descripcion</span>
              <textarea name="description" rows="4">${esc(item.description || "")}</textarea>
            </label>
            <label class="field field-full">
              <span>Nota ejecutiva</span>
              <textarea name="executiveNote" rows="3">${esc(item.executiveNote || "")}</textarea>
            </label>
          </div>
          <div class="dialog-actions">
            <button type="submit" class="primary-button">Guardar cambios</button>
          </div>
        </form>
      </section>

      <section class="detail-block">
        <h3>Registrar seguimiento</h3>
        <form id="meetingForm" class="meeting-form">
          <input type="hidden" name="objectiveId" value="${esc(item.id)}">
          <div class="form-grid">
            <label class="field">
              <span>Fecha</span>
              <input type="date" name="date" value="${esc(formatDateInput(new Date()))}" required>
            </label>
            <label class="field">
              <span>Instancia</span>
              <input type="text" name="title" placeholder="Ej. Reunion semanal de seguimiento" required>
            </label>
            <label class="field field-full">
              <span>Comentario principal</span>
              <textarea name="summary" rows="4" placeholder="Que se reviso, que se acordo y que quedo pendiente" required></textarea>
            </label>
            <label class="field field-full">
              <span>Acuerdos o decisiones</span>
              <textarea name="agreements" rows="3" placeholder="Compromisos o definiciones relevantes"></textarea>
            </label>
            <label class="field field-full">
              <span>Proximos pasos</span>
              <textarea name="nextSteps" rows="3" placeholder="Acciones para antes de la siguiente revision"></textarea>
            </label>
          </div>
          <div class="dialog-actions">
            <button type="submit" class="primary-button">Guardar seguimiento</button>
          </div>
        </form>
      </section>

      <section class="detail-block">
        <h3>Historial de seguimiento</h3>
        <div class="meeting-list">
          ${meetings.length ? meetings.map((meeting) => `
            <article class="meeting-card">
              <div class="timeline-head">
                <div>
                  <h3>${esc(meeting.title)}</h3>
                  <time>${esc(formatDate(meeting.date))}</time>
                </div>
                <button type="button" class="delete-link" data-delete-meeting="${esc(meeting.id)}">Eliminar</button>
              </div>
              <p><strong>Comentario:</strong> ${multiline(meeting.summary)}</p>
              ${meeting.agreements ? `<p><strong>Acuerdos:</strong> ${multiline(meeting.agreements)}</p>` : ""}
              ${meeting.risks ? `<p><strong>Riesgos:</strong> ${multiline(meeting.risks)}</p>` : ""}
              ${meeting.nextSteps ? `<p><strong>Proximos pasos:</strong> ${multiline(meeting.nextSteps)}</p>` : ""}
            </article>
          `).join("") : `<div class="empty-state"><div><strong>Sin seguimientos todavia.</strong><p>Registra el primer comentario desde este mismo objetivo.</p></div></div>`}
        </div>
      </section>
    </div>
  `;
}
function submitObjective(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const milestoneName = String(formData.get("milestoneName") || "").trim();
  const milestoneDate = String(formData.get("milestoneDate") || "").trim();
  const owner = String(formData.get("owner") || "").trim();
  const objective = {
    id: `obj-${Date.now()}`,
    area: String(formData.get("area")),
    title: String(formData.get("title") || "").trim(),
    owner,
    type: "Manual",
    status: String(formData.get("status") || "en-curso"),
    progress: clamp(formData.get("progress"), 0, 100),
    source: ["Creado en panel"],
    tags: String(formData.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    description: String(formData.get("description") || "").trim(),
    executiveNote: "",
    dueDate: milestoneDate || "",
    nextFollowUp: "",
    milestones: milestoneName && milestoneDate ? [{ id: `m-${Date.now()}`, label: milestoneName, date: milestoneDate, owner }] : [],
    kpis: [],
    meetings: []
  };
  state.data.objectives.unshift(objective);
  state.selectedObjectiveId = objective.id;
  saveData();
  closeDialog();
  render();
  openDetailDialog();
}
function submitQuickUpdate(event) {
  const formData = new FormData(event.target);
  const objective = byId(String(formData.get("objectiveId")));
  if (!objective) return;
  objective.title = String(formData.get("title") || objective.title).trim();
  objective.owner = String(formData.get("owner") || objective.owner).trim();
  objective.description = String(formData.get("description") || objective.description).trim();
  objective.status = String(formData.get("status") || objective.status);
  objective.progress = clamp(formData.get("progress"), 0, 100);
  objective.nextFollowUp = String(formData.get("nextFollowUp") || "");
  objective.dueDate = String(formData.get("dueDate") || "");
  objective.executiveNote = String(formData.get("executiveNote") || "").trim();
  saveData();
  render();
}
function submitMeeting(event) {
  const formData = new FormData(event.target);
  const objective = byId(String(formData.get("objectiveId")));
  if (!objective) return;
  objective.meetings.unshift({
    id: `meeting-${Date.now()}`,
    date: String(formData.get("date") || formatDateInput(new Date())),
    title: String(formData.get("title") || "").trim(),
    summary: String(formData.get("summary") || "").trim(),
    agreements: String(formData.get("agreements") || "").trim(),
    risks: String(formData.get("risks") || "").trim(),
    nextSteps: String(formData.get("nextSteps") || "").trim()
  });
  if (!objective.nextFollowUp) objective.nextFollowUp = String(formData.get("date") || "");
  saveData();
  render();
}

function removeMeeting(meetingId) {
  const objective = byId(state.selectedObjectiveId);
  if (!objective) return;
  if (!window.confirm("Quieres eliminar este comentario de seguimiento?")) return;
  objective.meetings = objective.meetings.filter((meeting) => meeting.id !== meetingId);
  saveData();
  render();
}

function removeObjective(objectiveId) {
  const objective = byId(objectiveId);
  if (!objective) return;
  if (!window.confirm(`Quieres eliminar el objetivo \"${objective.title}\"?`)) return;
  state.data.objectives = state.data.objectives.filter((item) => item.id !== objectiveId);
  state.selectedObjectiveId = "";
  saveData();
  closeDetailDialog();
  render();
}
function exportBackup() {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `panel-objetivos-${formatDateInput(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed || !Array.isArray(parsed.objectives)) throw new Error("invalid");
      if (!parsed.access) parsed.access = clone(window.SEED_DATA.access);
      state.data = parsed;
      state.selectedObjectiveId = "";
      saveData();
      render();
    } catch {
      window.alert("No se pudo importar el archivo. Usa un respaldo exportado desde este panel.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function resetSeed() {
  if (!window.confirm("Quieres restaurar la base inicial? Se perderan los cambios guardados en este navegador.")) return;
  state.data = clone(window.SEED_DATA);
  state.selectedObjectiveId = "";
  saveData();
  render();
}

function openDialog() {
  refs.objectiveForm.reset();
  document.getElementById("newStatus").value = "en-curso";
  document.getElementById("newProgress").value = 0;
  refs.objectiveDialog.showModal();
}

function closeDialog() {
  refs.objectiveDialog.close();
}

function openDetailDialog() {
  const item = byId(state.selectedObjectiveId);
  if (!item || !refs.detailDialog) return;
  renderDetail();
  if (!refs.detailDialog.open) refs.detailDialog.showModal();
}

function closeDetailDialog() {
  if (refs.detailDialog?.open) refs.detailDialog.close();
}
function openCreatorDialog() {
  refs.goalCreatorForm.reset();
  showCreatorStep(1);
  populateCreatorAreaOptions();
  document.getElementById("creatorModel").value = DEFAULT_AI_MODEL;
  refs.generatedMeta.textContent = "La IA completara este borrador con un titulo, descripcion, KPIs, tags y un primer paso sugerido.";
  setCreatorBusy(false);
  setAIStatus("Verificando conexion con la IA...", "info");
  refreshAIStatus();
  // Default due date to end of current year
  const endOfYear = `${new Date().getFullYear()}-12-31`;
  document.getElementById("generatedDueDate").value = endOfYear;
  refs.goalCreatorDialog.showModal();
}

function closeCreatorDialog() {
  setCreatorBusy(false);
  refs.goalCreatorDialog.close();
}

function populateCreatorAreaOptions() {
  const areas = getAreas();
  const areaSelect = document.getElementById("generatedArea");
  const selectedArea = areaSelect.value;
  areaSelect.innerHTML = areas
    .map((area) => `<option value="${esc(area)}">${esc(area)}</option>`)
    .join("");
  areaSelect.value = areas.includes(selectedArea) ? selectedArea : areas[0] || "";
}

async function nextToStep2() {
  const payload = collectCreatorPayload();
  const validationError = validateCreatorPayload(payload);

  if (validationError) {
    alert(validationError);
    return;
  }

  setCreatorBusy(true);
  setAIStatus("Redactando objetivo con GPT...", "working");

  try {
    const draft = await requestObjectiveDraft(payload);
    applyGeneratedDraft(draft, payload);
    showCreatorStep(2);
    setAIStatus(`IA disponible. Ultimo borrador generado con ${draft.model || payload.model}.`, "success");
  } catch (error) {
    setAIStatus(error.message, "error");
    alert(error.message);
  } finally {
    setCreatorBusy(false);
  }
}

function backToStep1() {
  showCreatorStep(1);
}

function submitGoalCreator(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const milestoneName = document.getElementById("generatedMilestone").value.trim();
  const dueDate = formData.get("dueDate");
  const modelUsed = String(formData.get("model") || state.ai.lastModel || DEFAULT_AI_MODEL);

  const kpiText = String(formData.get("kpis") || "").trim();
  const kpis = kpiText
    ? kpiText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ name: line, target: "" }))
    : [];
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const objective = {
    id: `obj-${Date.now()}`,
    area: String(formData.get("area")),
    title: String(formData.get("title")),
    owner: String(formData.get("owner")).trim(),
    type: "Asistente GPT",
    status: "no-iniciado",
    progress: 0,
    source: [`Redactado con ${modelUsed} via OpenAI Responses API`],
    tags: tags.length ? tags : ["gpt", "ia", "asistente"],
    description: String(formData.get("description")),
    executiveNote: "Borrador inicial generado con IA y afinado por el usuario.",
    dueDate: dueDate || "",
    nextFollowUp: "",
    milestones: milestoneName && dueDate ? [{ id: `m-${Date.now()}`, label: milestoneName, date: dueDate, owner: String(formData.get("owner")).trim() }] : [],
    kpis,
    meetings: []
  };
  state.data.objectives.unshift(objective);
  state.selectedObjectiveId = objective.id;
  saveData();
  closeCreatorDialog();
  render();
  openDetailDialog();
}
function showCreatorStep(stepNumber) {
  document.getElementById("step1").classList.toggle("active", stepNumber === 1);
  document.getElementById("step2").classList.toggle("active", stepNumber === 2);
}

function collectCreatorPayload() {
  return {
    management: document.getElementById("creatorManagement").value.trim(),
    areas: document.getElementById("creatorAreas").value.trim(),
    strategy: document.getElementById("creatorStrategy").value.trim(),
    projects: document.getElementById("creatorProjects").value.trim(),
    outcome: document.getElementById("creatorOutcome").value.trim(),
    constraints: document.getElementById("creatorConstraints").value.trim(),
    model: document.getElementById("creatorModel").value || DEFAULT_AI_MODEL
  };
}

function validateCreatorPayload(payload) {
  if (!payload.management || !payload.areas || !payload.strategy || !payload.projects) {
    return "Por favor, completa gerencia, areas, estrategia y proyectos antes de pedir la redaccion.";
  }
  return "";
}

async function refreshAIStatus() {
  if (window.location.protocol === "file:") {
    state.ai.available = false;
    state.ai.checked = true;
    setAIStatus("La IA requiere abrir la app desde el servidor local (server.ps1) y definir OPENAI_API_KEY.", "warning");
    return false;
  }

  try {
    const response = await fetch(AI_HEALTH_ENDPOINT, { cache: "no-store" });
    const payload = await response.json();
    state.ai.available = Boolean(payload.available);
    state.ai.checked = true;
    state.ai.lastModel = payload.model || DEFAULT_AI_MODEL;

    if (payload.available) {
      setAIStatus(`IA disponible. Modelo por defecto del servidor: ${state.ai.lastModel}.`, "success");
      return true;
    }

    setAIStatus("Servidor activo, pero falta OPENAI_API_KEY en el entorno o en .env.", "warning");
    return false;
  } catch {
    state.ai.available = false;
    state.ai.checked = true;
    setAIStatus("No pude conectar con /api/ai/health. Inicia server.ps1 para usar GPT.", "warning");
    return false;
  }
}

async function requestObjectiveDraft(payload) {
  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || "No pude generar el borrador con IA.");
  }

  state.ai.available = true;
  state.ai.checked = true;
  state.ai.lastModel = data.model || payload.model || DEFAULT_AI_MODEL;
  return data;
}

function applyGeneratedDraft(draft, payload) {
  document.getElementById("generatedTitle").value = draft.title || "";
  document.getElementById("generatedDescription").value = draft.description || "";
  document.getElementById("generatedKpis").value = Array.isArray(draft.kpis) ? draft.kpis.join("\n") : "";
  document.getElementById("generatedTags").value = Array.isArray(draft.tags) ? draft.tags.join(", ") : "gpt, ia, objetivo";
  document.getElementById("generatedMilestone").value = draft.milestone || "";
  refs.generatedMeta.textContent = `Borrador generado con ${draft.model || payload.model || DEFAULT_AI_MODEL}. Puedes editarlo antes de crear el objetivo.`;
}

function setAIStatus(message, tone) {
  if (!refs.aiStatusMessage) return;
  refs.aiStatusMessage.textContent = message;
  refs.aiStatusMessage.classList.remove("is-info", "is-success", "is-warning", "is-error", "is-working");
  refs.aiStatusMessage.classList.add(`is-${tone || "info"}`);
}

function setCreatorBusy(isBusy) {
  refs.nextToStep2Btn.disabled = isBusy;
  refs.regenerateDraftBtn.disabled = isBusy;
  refs.backToStep1Btn.disabled = isBusy;
  refs.closeCreatorDialogBtn.disabled = isBusy;
  refs.nextToStep2Btn.textContent = isBusy ? "Redactando con IA..." : "Generar borrador con IA";
  refs.regenerateDraftBtn.textContent = isBusy ? "Regenerando..." : "Regenerar con IA";
}

function byId(objectiveId) {
  return state.data.objectives.find((item) => item.id === objectiveId);
}

function getAreas() {
  return [...new Set(state.data.objectives.map((item) => item.area))].sort();
}

function statusOf(key) {
  return STATUS_CONFIG[key] || STATUS_CONFIG["no-iniciado"];
}

function statusOptions(selected) {
  return Object.entries(STATUS_CONFIG)
    .map(([key, item]) => `<option value="${esc(key)}" ${key === selected ? "selected" : ""}>${esc(item.label)}</option>`)
    .join("");
}

function average(items, field) {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + Number(item[field] || 0), 0) / items.length);
}

function nextMilestone(item) {
  const milestones = (item.milestones || [])
    .filter((milestone) => new Date(milestone.date) >= TODAY)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  return milestones[0] || item.milestones?.[0] || null;
}

function upcomingMilestones(items, days) {
  return items
    .flatMap((objective) => (objective.milestones || []).map((milestone) => ({ objective, milestone })))
    .filter(({ milestone }) => isWithinDays(milestone.date, days))
    .sort((a, b) => new Date(a.milestone.date) - new Date(b.milestone.date));
}

function isWithinDays(dateString, days) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  const diff = date - TODAY;
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function issueKey(item) {
  const index = state.data.objectives.findIndex((objective) => objective.id === item.id);
  return `GP-${101 + Math.max(index, 0)}`;
}

function initials(value) {
  return String(value || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString || "Sin fecha";
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function formatDateInput(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function clamp(value, min, max) {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function multiline(value) {
  return esc(value).replace(/\n/g, "<br>");
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

init();




