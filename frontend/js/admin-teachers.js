
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  /*
   * LOCAL DEVELOPMENT:
   * Backend runs on http://localhost:8080.
   *
   * For deployment, set window.POWER_SCHOOL_API_BASE before this script
   * loads, or change API_BASE to your deployed Render backend URL.
   */
  const API_BASE = (
    window.POWER_SCHOOL_API_BASE || "http://localhost:8080"
  ).replace(/\/+$/, "");

  const API_URL = `${API_BASE}/api/admin/teachers`;

  const ui = {
    sidebar: $("sidebar"),
    navList: $("navList"),
    navSlider: $("navSlider"),
    table: $("teacherTableBody"),
    search: $("teacherSearch"),
    status: $("statusFilter"),
    count: $("recordCount"),
    empty: $("emptyState"),
    modal: $("teacherModal"),
    form: $("teacherForm"),
    message: $("formMessage"),
    save: $("saveTeacher"),
    refresh: $("refreshTeachers"),
    add: $("addTeacherButton")
  };

  let teachers = [];
  let editingId = null;
  let loading = false;
  let saving = false;
  let lastFocusedElement = null;

  function getToken() {
    /*
     * Check common token keys so this page can integrate with an existing
     * login page. If your login uses a different key, add it here.
     */
    const keys = [
      "ps_token",
      "token",
      "accessToken",
      "access_token",
      "jwtToken",
      "jwt",
      "authToken"
    ];

    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) return value;
    }

    // Some projects store the token inside the user object.
    const userKeys = ["ps_user", "user", "currentUser"];
    for (const key of userKeys) {
      try {
        const user = JSON.parse(localStorage.getItem(key) || "null");
        if (user && typeof user.token === "string" && user.token) {
          return user.token;
        }
      } catch {
        // Ignore invalid JSON in optional storage keys.
      }
    }

    return null;
  }

  function getStoredUser() {
    for (const key of ["ps_user", "user", "currentUser"]) {
      try {
        const user = JSON.parse(localStorage.getItem(key) || "null");
        if (user && typeof user === "object") return user;
      } catch {
        // Ignore malformed optional user data.
      }
    }
    return null;
  }

  function getUserDisplayName() {
    const user = getStoredUser();
    return user?.fullName || user?.name || user?.username ||
      "School Administrator";
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function initials(name) {
    return String(name || "?")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase();
  }

  function setDate() {
    const now = new Date();

    $("dayName").textContent = new Intl.DateTimeFormat("en-IN", {
      weekday: "long"
    }).format(now);

    $("todayDate").textContent = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(now);
  }

  function moveNavSlider() {
    if (!ui.navList || !ui.navSlider) return;

    const active = ui.navList.querySelector(".nav-link.active");
    if (!active) return;

    ui.navSlider.style.height = `${active.offsetHeight}px`;
    ui.navSlider.style.transform = `translateY(${active.offsetTop}px)`;
  }

  function normalizeTeacher(raw) {
    /*
     * These aliases allow the frontend to tolerate either a direct array
     * response or common wrapper names. The backend DTO fields remain the
     * source of truth.
     */
    return {
      id: raw.id,
      employeeId: raw.employeeId ?? raw.teacherId ?? "",
      fullName: raw.fullName ?? raw.name ?? "",
      email: raw.email ?? "",
      username: raw.username ?? "",
      active: raw.active === true
    };
  }

  function setMessage(message, type = "error") {
    ui.message.textContent = message;
    ui.message.style.color = type === "success" ? "#168052" : "#b33c3c";
  }

  function setLoading(value) {
    loading = value;
    ui.refresh.disabled = value;
    ui.add.disabled = value;
    ui.refresh.textContent = value ? "Loading..." : "↻ Refresh";
  }

  async function apiRequest(path = "", options = {}) {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Your login token was not found. Please sign in again, then reopen the Teachers page."
      );
    }

    const headers = {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    };

    let response;

    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
      });
    } catch {
      throw new Error(
        `Cannot connect to the backend at ${API_BASE}. Check that Spring Boot is running and that CORS allows this frontend origin.`
      );
    }

    if (response.status === 401) {
      throw new Error(
        "Your session has expired or your login token is invalid. Please sign in again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "Access denied. This endpoint requires an administrator account. Check your login role and backend security configuration."
      );
    }

    if (response.status === 404) {
      throw new Error(
        "The requested API endpoint was not found. Verify the backend controller URL."
      );
    }

    if (!response.ok) {
      let detail = "";
      try {
        const body = await response.json();
        detail = body.message || body.error || body.detail || "";
      } catch {
        // Response may have no JSON body.
      }

      throw new Error(
        detail || `Request failed with HTTP ${response.status}.`
      );
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  function extractTeacherList(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    if (data && Array.isArray(data.teachers)) return data.teachers;
    if (data && Array.isArray(data.data)) return data.data;

    throw new Error(
      "The teachers API returned an unexpected response format. Expected an array of teacher records."
    );
  }

  function updateStats() {
    const total = teachers.length;
    const active = teachers.filter(t => t.active).length;

    $("totalTeachers").textContent = total;
    $("activeTeachers").textContent = active;
    $("inactiveTeachers").textContent = total - active;
  }

  function filteredTeachers() {
    const query = ui.search.value.trim().toLowerCase();
    const status = ui.status.value;

    return teachers.filter(teacher => {
      const searchable = [
        teacher.fullName,
        teacher.employeeId,
        teacher.username,
        teacher.email
      ].some(value =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        !status ||
        (status === "ACTIVE" && teacher.active) ||
        (status === "INACTIVE" && !teacher.active);

      return searchable && matchesStatus;
    });
  }

  function makeCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text || "—";
    return cell;
  }

  function renderTable() {
    const records = filteredTeachers();

    ui.count.textContent =
      `${records.length} teacher${records.length === 1 ? "" : "s"}`;

    ui.table.replaceChildren();
    ui.empty.hidden = records.length > 0;

    if (!records.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.className = "table-message";
      cell.textContent = teachers.length
        ? "No teachers match your search or filter."
        : "No teacher records were returned by the backend.";

      row.appendChild(cell);
      ui.table.appendChild(row);
      return;
    }

    records.forEach(teacher => {
      const row = document.createElement("tr");

      const teacherCell = document.createElement("td");
      const wrapper = document.createElement("div");
      wrapper.className = "teacher-cell";

      const avatar = document.createElement("span");
      avatar.className = "teacher-avatar";
      avatar.textContent = initials(teacher.fullName);

      const identity = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = teacher.fullName || "Unnamed teacher";

      const email = document.createElement("small");
      email.textContent = teacher.email || "No email";

      identity.append(name, email);
      wrapper.append(avatar, identity);
      teacherCell.appendChild(wrapper);

      const employeeCell = makeCell(teacher.employeeId);
      const usernameCell = makeCell(teacher.username);
      const emailCell = makeCell(teacher.email);

      const statusCell = document.createElement("td");
      const pill = document.createElement("span");
      pill.className = `status-pill ${teacher.active ? "active" : "inactive"}`;
      pill.textContent = teacher.active ? "Active" : "Inactive";
      statusCell.appendChild(pill);

      const actionsCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "edit-button";
      editButton.textContent = "✎ Edit";
      editButton.dataset.edit = String(teacher.id);
      editButton.setAttribute("aria-label", `Edit ${teacher.fullName}`);

      const statusButton = document.createElement("button");
      statusButton.type = "button";
      statusButton.className = "edit-button";
      statusButton.dataset.toggleStatus = String(teacher.id);
      statusButton.dataset.active = String(!teacher.active);
      statusButton.textContent = teacher.active ? "Disable" : "Enable";
      statusButton.setAttribute(
        "aria-label",
        `${teacher.active ? "Disable" : "Enable"} account for ${teacher.fullName}`
      );

      actionsCell.append(editButton, statusButton);
      row.append(
        teacherCell,
        employeeCell,
        usernameCell,
        emailCell,
        statusCell,
        actionsCell
      );

      ui.table.appendChild(row);
    });
  }

  async function loadTeachers() {
    if (loading) return;

    setLoading(true);
    ui.table.innerHTML =
      '<tr><td colspan="6" class="table-message">Loading teachers from the backend...</td></tr>';

    try {
      const data = await apiRequest();
      teachers = extractTeacherList(data).map(normalizeTeacher);

      updateStats();
      renderTable();

      $("lastUpdated").textContent = new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date());
    } catch (error) {
      ui.table.replaceChildren();

      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.className = "table-message";
      cell.textContent = error.message || "Unable to load teachers.";

      row.appendChild(cell);
      ui.table.appendChild(row);

      ui.count.textContent = "Unavailable";
      ui.empty.hidden = true;

      $("totalTeachers").textContent = "—";
      $("activeTeachers").textContent = "—";
      $("inactiveTeachers").textContent = "—";
      $("lastUpdated").textContent = "Failed";

      console.error("Load teachers failed:", error);
    } finally {
      setLoading(false);
    }
  }

  function openModal(id = null) {
    if (saving) return;

    editingId = id;
    lastFocusedElement = document.activeElement;
    ui.form.reset();
    setMessage("");

    const teacher = id === null
      ? null
      : teachers.find(t => String(t.id) === String(id));

    if (id !== null && !teacher) {
      alert("The selected teacher was not found. Refresh the directory.");
      return;
    }

    $("modalTitle").textContent = teacher ? "Edit Teacher" : "Add Teacher";
    ui.save.textContent = teacher ? "Save Changes" : "Create Account";
    $("recordId").value = teacher ? teacher.id : "";

    $("fullName").value = teacher?.fullName || "";
    $("teacherId").value = teacher?.employeeId || "";
    $("teacherEmail").value = teacher?.email || "";
    $("teacherUsername").value = teacher?.username || "";

    /*
     * The API does not provide an endpoint to reset an existing password.
     * Password is required for account creation only.
     */
    $("teacherPassword").value = "";
    $("teacherPassword").required = !teacher;
    $("teacherPassword").disabled = Boolean(teacher);
    $("passwordField").hidden = Boolean(teacher);

    ui.modal.hidden = false;
    $("fullName").focus();
  }

  function closeModal() {
    if (saving) return;

    ui.modal.hidden = true;
    ui.form.reset();
    setMessage("");
    editingId = null;

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function validateForm() {
    const fullName = $("fullName").value.trim();
    const employeeId = $("teacherId").value.trim();
    const email = $("teacherEmail").value.trim().toLowerCase();
    const username = $("teacherUsername").value.trim();
    const password = $("teacherPassword").value;

    if (!fullName || !employeeId || !email || !username) {
      setMessage("Complete all required fields.");
      return null;
    }

    if (username.length < 3 || username.length > 50) {
      setMessage("Username must contain between 3 and 50 characters.");
      return null;
    }

    if (editingId === null && (password.length < 8 || password.length > 100)) {
      setMessage("Initial password must contain between 8 and 100 characters.");
      return null;
    }

    const duplicateEmployeeId = teachers.some(t =>
      String(t.id) !== String(editingId) &&
      t.employeeId.toLowerCase() === employeeId.toLowerCase()
    );

    const duplicateEmail = teachers.some(t =>
      String(t.id) !== String(editingId) &&
      t.email.toLowerCase() === email
    );

    const duplicateUsername = teachers.some(t =>
      String(t.id) !== String(editingId) &&
      t.username.toLowerCase() === username.toLowerCase()
    );

    if (duplicateEmployeeId) {
      setMessage("This employee ID is already present in the loaded records.");
      return null;
    }

    if (duplicateEmail) {
      setMessage("This email is already present in the loaded records.");
      return null;
    }

    if (duplicateUsername) {
      setMessage("This username is already present in the loaded records.");
      return null;
    }

    return {
      employeeId,
      fullName,
      email,
      username,
      ...(editingId === null ? { password } : {})
    };
  }

  async function saveForm(event) {
    event.preventDefault();
    if (saving) return;

    const payload = validateForm();
    if (!payload) return;

    saving = true;
    ui.save.disabled = true;
    $("cancelModal").disabled = true;
    $("closeModal").disabled = true;
    ui.save.textContent = editingId === null ? "Creating..." : "Saving...";

    try {
      if (editingId === null) {
        await apiRequest("", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      } else {
        /*
         * UpdateTeacherRequest accepts employeeId, fullName and email.
         * Username and password are intentionally not sent to PUT because
         * the supplied backend update DTO does not support those fields.
         */
        await apiRequest(`/${encodeURIComponent(editingId)}`, {
          method: "PUT",
          body: JSON.stringify({
            employeeId: payload.employeeId,
            fullName: payload.fullName,
            email: payload.email
          })
        });
      }

      ui.modal.hidden = true;
      ui.form.reset();
      editingId = null;

      await loadTeachers();
      alert("Teacher record saved successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to save teacher.");
      console.error("Save teacher failed:", error);
    } finally {
      saving = false;
      ui.save.disabled = false;
      $("cancelModal").disabled = false;
      $("closeModal").disabled = false;
      ui.save.textContent = editingId === null ? "Create Account" : "Save Changes";
    }
  }

  async function toggleTeacherStatus(id, active) {
    const teacher = teachers.find(t => String(t.id) === String(id));
    if (!teacher) return;

    const action = active ? "enable" : "disable";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${teacher.fullName}'s account?`
    );

    if (!confirmed) return;

    const buttons = ui.table.querySelectorAll(
      `[data-toggle-status="${CSS.escape(String(id))}"]`
    );
    buttons.forEach(button => {
      button.disabled = true;
      button.textContent = "Updating...";
    });

    try {
      await apiRequest(
        `/${encodeURIComponent(id)}/status?active=${active}`,
        { method: "PATCH" }
      );

      await loadTeachers();
    } catch (error) {
      alert(error.message || "Unable to change account status.");
      console.error("Toggle teacher status failed:", error);
    }
  }

  ui.search.addEventListener("input", renderTable);
  ui.status.addEventListener("change", renderTable);

  $("resetFilters").addEventListener("click", () => {
    ui.search.value = "";
    ui.status.value = "";
    renderTable();
  });

  ui.refresh.addEventListener("click", loadTeachers);
  ui.add.addEventListener("click", () => openModal());

  ui.table.addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit]");
    if (editButton) {
      openModal(editButton.dataset.edit);
      return;
    }

    const toggleButton = event.target.closest("[data-toggle-status]");
    if (toggleButton) {
      toggleTeacherStatus(
        toggleButton.dataset.toggleStatus,
        toggleButton.dataset.active === "true"
      );
    }
  });

  ui.form.addEventListener("submit", saveForm);
  $("closeModal").addEventListener("click", closeModal);
  $("cancelModal").addEventListener("click", closeModal);

  ui.modal.addEventListener("click", event => {
    if (event.target === ui.modal) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !ui.modal.hidden) closeModal();
  });

  $("mobileMenu").addEventListener("click", () => {
    const isOpen = ui.sidebar.classList.toggle("open");
    $("mobileMenu").setAttribute("aria-expanded", String(isOpen));
  });

  $("logoutButton").addEventListener("click", () => {
    if (typeof window.logout === "function") {
      window.logout();
      return;
    }

    /*
     * Replace this fallback with the same logout function/key cleanup
     * used by your existing login page if it doesn't expose window.logout.
     */
    const confirmed = window.confirm("Log out of Power School?");
    if (!confirmed) return;

    [
      "ps_token", "token", "accessToken", "access_token",
      "jwtToken", "jwt", "authToken",
      "ps_user", "user", "currentUser"
    ].forEach(key => localStorage.removeItem(key));

    window.location.href = "../../login.html";
  });

  window.addEventListener("resize", moveNavSlider);

  const storedUser = getStoredUser();
  $("adminName").textContent = getUserDisplayName();
  $("adminInitial").textContent = initials(getUserDisplayName());

  // Fail early with a useful message when a non-admin is signed in.
  if (storedUser?.role && !String(storedUser.role).toUpperCase().includes("ADMIN")) {
    console.warn("The current stored user does not appear to have an ADMIN role.");
  }

  setDate();
  moveNavSlider();
  loadTeachers();
});
