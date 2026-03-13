const AREAS = [
  "Cultura y calidad de vida",
  "Relaciones laborales y remuneraciones",
  "Compensación y selección",
  "Desarrollo y capacitación",
  "Servicios generales",
];

const STATUS = {
  "no-iniciado": { label: "No iniciado", className: "status-no-iniciado" },
  "en-curso": { label: "En curso", className: "status-en-curso" },
  encaminado: { label: "Encaminado", className: "status-encaminado" },
  "en-riesgo": { label: "En riesgo", className: "status-en-riesgo" },
  completado: { label: "Completado", className: "status-completado" },
};

const STORAGE_KEY = "panel-objetivos-gerencia-personas-v1";
const TODAY = new Date("2026-03-13T00:00:00");

const state = {
  data: loadData(),
  filters: { area: "all", status: "all", owner: "all", search: "", dueSoonOnly: false, atRiskOnly: false },
  selectedObjectiveId: "",
};

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return clone(window.SEED_DATA);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.objectives) ? parsed : clone(window.SEED_DATA);
  } catch {
    return clone(window.SEED_DATA);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveData() {
  state.data.metadata.lastUpdated = formatDateStorage(new Date());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function init() {
  state.selectedObjectiveId = state.data.objectives[0]?.id || "";
  fillSelects();
  bindEvents();
  render();
}

function fillSelects() {
  document.getElementById("areaFilter").innerHTML = ['<option value="all">Todas las áreas</option>']
    .concat(AREAS.map((area) => `<option value="${esc(area)}">${esc(area)}</option>`)).join("");
  document.getElementById("statusFilter").innerHTML = ['<option value="all">Todos los estados</option>']
    .concat(Object.entries(STATUS).map(([key, item]) => `<option value="${esc(key)}">${esc(item.label)}</option>`)).join("");
  document.getElementById("newArea").innerHTML = AREAS.map((area) => `<option value="${esc(area)}">${esc(area)}</option>`).join("");
}

function bindEvents() {
  document.getElementById("areaFilter").addEventListener("change", (e) => { state.filters.area = e.target.value; render(); });
  document.getElementById("statusFilter").addEventListener("change", (e) => { state.filters.status = e.target.value; render(); });
  document.getElementById("ownerFilter").addEventListener("change", (e) => { state.filters.owner = e.target.value; render(); });
  document.getElementById("searchInput").addEventListener("input", (e) => { state.filters.search = e.target.value.trim().toLowerCase(); render(); });
  document.getElementById("dueSoonOnly").addEventListener("change", (e) => { state.filters.dueSoonOnly = e.target.checked; render(); });
  document.getElementById("atRiskOnly").addEventListener("change", (e) => { state.filters.atRiskOnly = e.target.checked; render(); });

  document.getElementById("addObjectiveBtn").addEventListener("click", () => {
    document.getElementById("objectiveForm").reset();
    document.getElementById("newStatus").value = "en-curso";
    document.getElementById("newProgress").value = 0;
    document.getElementById("objectiveDialog").showModal();
  });
  document.getElementById("closeDialogBtn").addEventListener("click", closeDialog);
  document.getElementById("cancelDialogBtn").addEventListener("click", closeDialog);
  document.getElementById("objectiveForm").addEventListener("submit", submitObjective);
  document.getElementById("exportBtn").addEventListener("click", exportBackup);
  document.getElementById("importInput").addEventListener("change", importBackup);
  document.getElementById("resetBtn").addEventListener("click", resetSeed);

  document.getElementById("areaGrid").addEventListener("click", (e) => {
    const card = e.target.closest("[data-area-card]");
    if (!card) return;
    const area = card.getAttribute("data-area-card");
    state.filters.area = state.filters.area === area ? "all" : area;
    document.getElementById("areaFilter").value = state.filters.area;
    render();
  });

  document.getElementById("objectiveList").addEventListener("click", (e) => {
    const openButton = e.target.closest("[data-open-objective]");
    const card = e.target.closest("[data-objective-card]");
    if (openButton) {
      state.selectedObjectiveId = openButton.getAttribute("data-open-objective");
      render();
      return;
    }
    if (card && !e.target.closest("select") && !e.target.closest("input")) {
      state.selectedObjectiveId = card.getAttribute("data-objective-card");
      render();
    }
  });

  document.getElementById("objectiveList").addEventListener("change", (e) => {
    const id = e.target.getAttribute("data-objective-id");
    if (!id) return;
    const objective = byId(id);
    if (!objective) return;
    if (e.target.matches("[data-status-select]")) objective.status = e.target.value;
    if (e.target.matches("[data-progress-range]")) objective.progress = clamp(e.target.value, 0, 100);
    saveData();
    render();
  });

  document.getElementById("detailPanel").addEventListener("submit", (e) => {
    if (e.target.matches("#quickUpdateForm")) { e.preventDefault(); submitQuickUpdate(e); }
    if (e.target.matches("#meetingForm")) { e.preventDefault(); submitMeeting(e); }
  });

  document.getElementById("detailPanel").addEventListener("click", (e) => {
    const deleteMeeting = e.target.closest("[data-delete-meeting]");
    const deleteObjective = e.target.closest("[data-delete-objective]");
    if (deleteMeeting) removeMeeting(deleteMeeting.getAttribute("data-delete-meeting"));
    if (deleteObjective) removeObjective(deleteObjective.getAttribute("data-delete-objective"));
  });
}

function render() {
  renderOwners();
  renderSummary();
  renderMilestones();
  renderAreas();
  renderObjectives();
  renderDetail();
}

function renderOwners() {
  const owners = [...new Set(state.data.objectives.map((item) => item.owner))].sort();
  const select = document.getElementById("ownerFilter");
  const current = state.filters.owner;
  select.innerHTML = ['<option value="all">Todos los responsables</option>']
    .concat(owners.map((owner) => `<option value="${esc(owner)}">${esc(owner)}</option>`)).join("");
  select.value = owners.includes(current) ? current : "all";
  state.filters.owner = select.value;
}

function renderSummary() {
  const items = state.data.objectives;
  const cards = [
    { label: "Objetivos activos", value: items.length, meta: `${AREAS.length} áreas en seguimiento` },
    { label: "Avance promedio", value: `${avg(items, "progress")}%`, meta: "Promedio del avance registrado en el panel" },
    { label: "Objetivos en riesgo", value: items.filter((item) => item.status === "en-riesgo").length, meta: `${upcoming(items, 45).length} hitos en 45 días` },
    { label: "Comentarios cargados", value: items.reduce((sum, item) => sum + item.meetings.length, 0), meta: "Notas guardadas en este navegador" },
  ];
  document.getElementById("summaryGrid").innerHTML = cards.map((card) => `
    <article class="summary-card">
      <p class="summary-label">${esc(card.label)}</p>
      <p class="summary-value">${esc(String(card.value))}</p>
      <p class="summary-meta">${esc(card.meta)}</p>
    </article>
  `).join("");
}

function renderMilestones() {
  const items = upcoming(state.data.objectives, 120).slice(0, 8);
  const box = document.getElementById("milestoneList");
  if (!items.length) {
    box.innerHTML = `<div class="empty-state"><div><strong>No hay hitos próximos cargados.</strong><p>Agrega hitos desde un objetivo nuevo o actualiza las fechas en el panel.</p></div></div>`;
    return;
  }
  box.innerHTML = items.map(({ objective, milestone }) => `
    <article class="milestone-card">
      <div class="objective-topline">
        <span class="badge badge-area">${esc(objective.area)}</span>
        <span class="badge ${statusOf(objective.status).className}">${esc(statusOf(objective.status).label)}</span>
      </div>
      <h3>${esc(milestone.label)}</h3>
      <p>${esc(objective.title)}</p>
      <div class="metric-row"><span>Fecha</span><strong>${esc(formatDate(milestone.date))}</strong></div>
      <div class="metric-row"><span>Responsable</span><strong>${esc(milestone.owner || objective.owner)}</strong></div>
    </article>
  `).join("");
}

function renderAreas() {
  const filtered = filteredObjectives();
  document.getElementById("areaGrid").innerHTML = AREAS.map((area) => {
    const items = state.data.objectives.filter((item) => item.area === area);
    const active = state.filters.area === area ? "active" : "";
    return `
      <article class="area-card ${active}" data-area-card="${esc(area)}">
        <div class="area-topline">
          <span class="area-chip badge-area">${esc(area)}</span>
          <span class="small-chip">${filtered.filter((item) => item.area === area).length}/${items.length} visibles</span>
        </div>
        <h3>${esc(area)}</h3>
        <div class="area-stats">
          <div class="metric-row"><span>Objetivos cargados</span><strong>${items.length}</strong></div>
          <div class="metric-row"><span>Avance promedio</span><strong>${avg(items, "progress")}%</strong></div>
          <div class="progress-track"><div class="progress-fill" style="width: ${avg(items, "progress")}%"></div></div>
          <p class="progress-caption">Haz clic para filtrar esta área.</p>
        </div>
      </article>
    `;
  }).join("");
}
function renderObjectives() {
  const items = filteredObjectives();
  document.getElementById("resultCount").textContent = String(items.length);
  const box = document.getElementById("objectiveList");
  if (!items.length) {
    box.innerHTML = `<div class="empty-state"><div><strong>No hay objetivos para este filtro.</strong><p>Ajusta los filtros o crea un nuevo objetivo.</p></div></div>`;
    return;
  }
  box.innerHTML = items.map((item) => {
    const next = nextMilestone(item);
    return `
      <article class="objective-card" data-objective-card="${esc(item.id)}">
        <div class="objective-meta">
          <div class="objective-topline">
            <span class="badge badge-area">${esc(item.area)}</span>
            <span class="badge ${statusOf(item.status).className}">${esc(statusOf(item.status).label)}</span>
            <span class="small-chip">${esc(item.type || "Objetivo")}</span>
          </div>
        </div>
        <div><h3>${esc(item.title)}</h3><p class="description">${esc(item.description)}</p></div>
        <div class="metric-row"><span>Responsable</span><strong>${esc(item.owner)}</strong></div>
        <div class="metric-row"><span>Próximo hito</span><strong>${esc(next ? `${next.label} · ${formatDate(next.date)}` : "Sin fecha")}</strong></div>
        <div class="metric-row"><span>Próximo seguimiento</span><strong>${esc(item.nextFollowUp ? formatDate(item.nextFollowUp) : "Sin agendar")}</strong></div>
        <div>
          <div class="metric-row"><span>Avance</span><strong>${item.progress}%</strong></div>
          <div class="progress-track"><div class="progress-fill" style="width: ${item.progress}%"></div></div>
        </div>
        <div class="card-actions">
          <div class="inline-field"><label>Estado</label><select data-status-select data-objective-id="${esc(item.id)}">${statusOptions(item.status)}</select></div>
          <div class="inline-field"><label>Avance</label><input type="range" min="0" max="100" value="${item.progress}" data-progress-range data-objective-id="${esc(item.id)}"></div>
          <button type="button" class="secondary-button" data-open-objective="${esc(item.id)}">Abrir seguimiento</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderDetail() {
  const item = byId(state.selectedObjectiveId) || filteredObjectives()[0];
  const panel = document.getElementById("detailPanel");
  if (!item) {
    panel.innerHTML = `<div class="detail-placeholder"><strong>Selecciona un objetivo para ver su seguimiento.</strong><p>Desde aquí podrás dejar comentarios de reuniones, acuerdos, bloqueos y próximos pasos.</p></div>`;
    return;
  }
  state.selectedObjectiveId = item.id;
  const meetings = [...item.meetings].sort((a, b) => new Date(b.date) - new Date(a.date));
  panel.innerHTML = `
    <div class="detail-stack">
      <section class="detail-section">
        <div class="detail-head">
          <div>
            <p class="section-kicker">Detalle del objetivo</p>
            <h2>${esc(item.title)}</h2>
            <p>${esc(item.description)}</p>
          </div>
          <button type="button" class="ghost-button" data-delete-objective="${esc(item.id)}">Eliminar</button>
        </div>
        <div class="detail-badges">
          <span class="badge badge-area">${esc(item.area)}</span>
          <span class="badge ${statusOf(item.status).className}">${esc(statusOf(item.status).label)}</span>
          <span class="small-chip">Responsable: ${esc(item.owner)}</span>
          <span class="small-chip">Avance: ${item.progress}%</span>
        </div>
      </section>

      <section class="detail-section">
        <h3>Actualización rápida</h3>
        <form id="quickUpdateForm" class="meeting-form">
          <input type="hidden" name="objectiveId" value="${esc(item.id)}">
          <div class="quick-update-grid">
            <label class="field"><span>Estado</span><select name="status">${statusOptions(item.status)}</select></label>
            <label class="field"><span>Avance (%)</span><input name="progress" type="number" min="0" max="100" value="${item.progress}"></label>
            <label class="field"><span>Próximo seguimiento</span><input name="nextFollowUp" type="date" value="${esc(item.nextFollowUp || "")}"></label>
            <label class="field"><span>Fecha compromiso general</span><input name="dueDate" type="date" value="${esc(item.dueDate || "")}"></label>
            <label class="field field-full"><span>Nota ejecutiva</span><textarea name="executiveNote" rows="4">${esc(item.executiveNote || "")}</textarea></label>
          </div>
          <div class="dialog-actions"><button type="submit" class="primary-button">Guardar actualización</button></div>
        </form>
      </section>

      <section class="detail-section">
        <h3>KPIs e hitos base</h3>
        <div class="kpi-list">${item.kpis.map((kpi) => `
          <article class="kpi-card">
            <h3>${esc(kpi.name)}</h3>
            <div class="metric-row"><span>Meta</span><strong>${esc(kpi.target)}</strong></div>
            <div class="metric-row"><span>Frecuencia</span><strong>${esc(kpi.frequency || "No definida")}</strong></div>
            <div class="metric-row"><span>Hito</span><strong>${esc(kpi.milestone || "No definido")}</strong></div>
          </article>
        `).join("")}</div>
      </section>

      <section class="detail-section">
        <h3>Fuentes consideradas</h3>
        <div class="source-list">
          ${item.source.map((source) => `<span class="source-chip">${esc(source)}</span>`).join("")}
          ${item.tags.map((tag) => `<span class="small-chip">#${esc(tag)}</span>`).join("")}
        </div>
      </section>

      <section class="detail-section">
        <h3>Registrar comentario de reunión</h3>
        <form id="meetingForm" class="meeting-form">
          <input type="hidden" name="objectiveId" value="${esc(item.id)}">
          <div class="meeting-form-grid">
            <label class="field"><span>Fecha</span><input type="date" name="date" value="${esc(formatDateStorage(new Date()))}" required></label>
            <label class="field"><span>Instancia</span><input type="text" name="title" placeholder="Ej. Comité semanal" required></label>
            <label class="field field-full"><span>Comentario principal</span><textarea name="summary" rows="4" placeholder="Qué se revisó y qué quedó pendiente" required></textarea></label>
            <label class="field field-full"><span>Acuerdos</span><textarea name="agreements" rows="3" placeholder="Decisiones o compromisos"></textarea></label>
            <label class="field field-full"><span>Bloqueos o riesgos</span><textarea name="risks" rows="3" placeholder="Dependencias o alertas"></textarea></label>
            <label class="field field-full"><span>Próximos pasos</span><textarea name="nextSteps" rows="3" placeholder="Acciones antes de la próxima reunión"></textarea></label>
          </div>
          <div class="dialog-actions"><button type="submit" class="primary-button">Guardar comentario</button></div>
        </form>
      </section>

      <section class="detail-section">
        <div class="detail-head"><div><h3>Historial de reuniones</h3><p>${meetings.length ? "Seguimiento guardado en el panel." : "Todavía no hay comentarios registrados para este objetivo."}</p></div></div>
        <div class="timeline-list">${meetings.length ? meetings.map((meeting) => `
          <article class="timeline-card">
            <div class="timeline-meta">
              <div><h3>${esc(meeting.title)}</h3><p>${esc(formatDate(meeting.date))}</p></div>
              <button type="button" class="delete-link" data-delete-meeting="${esc(meeting.id)}">Eliminar</button>
            </div>
            <div class="timeline-block"><strong>Comentario principal</strong><p>${multiline(meeting.summary)}</p></div>
            ${meeting.agreements ? `<div class="timeline-block"><strong>Acuerdos</strong><p>${multiline(meeting.agreements)}</p></div>` : ""}
            ${meeting.risks ? `<div class="timeline-block"><strong>Bloqueos o riesgos</strong><p>${multiline(meeting.risks)}</p></div>` : ""}
            ${meeting.nextSteps ? `<div class="timeline-block"><strong>Próximos pasos</strong><p>${multiline(meeting.nextSteps)}</p></div>` : ""}
          </article>
        `).join("") : `<div class="empty-state"><div><strong>Sin comentarios todavía.</strong><p>Usa el formulario anterior para dejar acuerdos, riesgos y próximos pasos.</p></div></div>`}</div>
      </section>
    </div>
  `;
}

function filteredObjectives() {
  return state.data.objectives.filter((item) => {
    if (state.filters.area !== "all" && item.area !== state.filters.area) return false;
    if (state.filters.status !== "all" && item.status !== state.filters.status) return false;
    if (state.filters.owner !== "all" && item.owner !== state.filters.owner) return false;
    if (state.filters.atRiskOnly && item.status !== "en-riesgo") return false;
    if (state.filters.dueSoonOnly) {
      const next = nextMilestone(item);
      if (!next || !withinDays(next.date, 45)) return false;
    }
    if (!state.filters.search) return true;
    return [item.title, item.area, item.owner, item.description, ...(item.tags || [])].join(" ").toLowerCase().includes(state.filters.search);
  });
}

function submitObjective(event) {
  event.preventDefault();
  const data = new FormData(event.target);
  const milestoneName = String(data.get("milestoneName") || "").trim();
  const milestoneDate = String(data.get("milestoneDate") || "").trim();
  const owner = String(data.get("owner") || "").trim();
  const item = {
    id: `obj-${Date.now()}`,
    area: String(data.get("area")),
    title: String(data.get("title") || "").trim(),
    owner,
    type: "Manual",
    status: String(data.get("status")),
    progress: clamp(data.get("progress"), 0, 100),
    source: ["Creado en panel"],
    tags: String(data.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    description: String(data.get("description") || "").trim(),
    executiveNote: "",
    dueDate: milestoneDate || "",
    nextFollowUp: "",
    milestones: milestoneName && milestoneDate ? [{ id: `m-${Date.now()}`, label: milestoneName, date: milestoneDate, owner }] : [],
    kpis: [],
    meetings: [],
  };
  state.data.objectives.unshift(item);
  state.selectedObjectiveId = item.id;
  saveData();
  closeDialog();
  render();
}

function submitQuickUpdate(event) {
  const data = new FormData(event.target);
  const item = byId(String(data.get("objectiveId")));
  if (!item) return;
  item.status = String(data.get("status"));
  item.progress = clamp(data.get("progress"), 0, 100);
  item.nextFollowUp = String(data.get("nextFollowUp") || "");
  item.dueDate = String(data.get("dueDate") || "");
  item.executiveNote = String(data.get("executiveNote") || "").trim();
  saveData();
  render();
}

function submitMeeting(event) {
  const data = new FormData(event.target);
  const item = byId(String(data.get("objectiveId")));
  if (!item) return;
  item.meetings.unshift({
    id: `meeting-${Date.now()}`,
    date: String(data.get("date")),
    title: String(data.get("title") || "").trim(),
    summary: String(data.get("summary") || "").trim(),
    agreements: String(data.get("agreements") || "").trim(),
    risks: String(data.get("risks") || "").trim(),
    nextSteps: String(data.get("nextSteps") || "").trim(),
  });
  if (!item.nextFollowUp) item.nextFollowUp = String(data.get("date"));
  saveData();
  render();
}

function removeMeeting(id) {
  const item = byId(state.selectedObjectiveId);
  if (!item || !confirm("¿Quieres eliminar este comentario de seguimiento?")) return;
  item.meetings = item.meetings.filter((meeting) => meeting.id !== id);
  saveData();
  render();
}

function removeObjective(id) {
  const item = byId(id);
  if (!item || !confirm(`¿Quieres eliminar el objetivo \"${item.title}\" del panel?`)) return;
  state.data.objectives = state.data.objectives.filter((objective) => objective.id !== id);
  state.selectedObjectiveId = state.data.objectives[0]?.id || "";
  saveData();
  render();
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `panel-objetivos-gerencia-personas-${formatDateStorage(new Date())}.json`;
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
      if (!parsed || !Array.isArray(parsed.objectives)) throw new Error("Formato inválido");
      state.data = parsed;
      state.selectedObjectiveId = parsed.objectives[0]?.id || "";
      saveData();
      render();
    } catch {
      alert("No se pudo importar el archivo. Verifica que sea un respaldo exportado desde este panel.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function resetSeed() {
  if (!confirm("¿Quieres restaurar la base inicial? Se perderán los cambios guardados en este navegador.")) return;
  state.data = clone(window.SEED_DATA);
  state.selectedObjectiveId = state.data.objectives[0]?.id || "";
  saveData();
  render();
}

function closeDialog() { document.getElementById("objectiveDialog").close(); }
function byId(id) { return state.data.objectives.find((item) => item.id === id); }
function statusOf(key) { return STATUS[key] || STATUS["no-iniciado"]; }
function statusOptions(selected) { return Object.entries(STATUS).map(([key, item]) => `<option value="${esc(key)}" ${key === selected ? "selected" : ""}>${esc(item.label)}</option>`).join(""); }
function avg(items, field) { return items.length ? Math.round(items.reduce((sum, item) => sum + Number(item[field] || 0), 0) / items.length) : 0; }
function nextMilestone(item) { return (item.milestones || []).filter((m) => new Date(m.date) >= TODAY).sort((a, b) => new Date(a.date) - new Date(b.date))[0] || item.milestones?.[0] || null; }
function upcoming(items, days) { return items.flatMap((objective) => (objective.milestones || []).map((milestone) => ({ objective, milestone }))).filter(({ milestone }) => withinDays(milestone.date, days)).sort((a, b) => new Date(a.milestone.date) - new Date(b.milestone.date)); }
function withinDays(dateString, days) { const date = new Date(dateString); const diff = date - TODAY; return !Number.isNaN(date.getTime()) && diff >= 0 && diff <= days * 86400000; }
function clamp(value, min, max) { const n = Number.parseInt(String(value), 10); return Number.isNaN(n) ? min : Math.min(max, Math.max(min, n)); }
function formatDate(dateString) { const d = new Date(dateString); return Number.isNaN(d.getTime()) ? (dateString || "Sin fecha") : new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" }).format(d); }
function formatDateStorage(date) { return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"); }
function multiline(value) { return esc(value).replace(/\n/g, "<br>"); }
function esc(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }

init();
