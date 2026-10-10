
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const ui = {
    sidebar: $("sidebar"),
    navList: $("navList"),
    navSlider: $("navSlider"),
    table: $("teacherTableBody"),
    search: $("teacherSearch"),
    department: $("departmentFilter"),
    subject: $("subjectFilter"),
    count: $("recordCount"),
    empty: $("emptyState"),
    modal: $("teacherModal"),
    form: $("teacherForm"),
    message: $("formMessage"),
    save: $("saveTeacher")
  };

  // DEMO RECORDS: replace with API data when the endpoint is confirmed.
  let teachers = [
    { id: 1, name: "Suresh Kumar", teacherId: "TCH001", department: "Mathematics", subject: "Maths", qualification: "M.Sc., B.Ed", gender: "Male", email: "suresh@example.com", status: "ACTIVE" },
    { id: 2, name: "Priya Sharma", teacherId: "TCH004", department: "Science", subject: "Physics", qualification: "M.Sc., B.Ed", gender: "Female", email: "priya@example.com", status: "ACTIVE" },
    { id: 3, name: "Sangeetha H", teacherId: "TCH024", department: "Science", subject: "Chemistry", qualification: "M.Sc., B.Ed", gender: "Female", email: "sangeetha@example.com", status: "ACTIVE" },
    { id: 4, name: "Aravind K", teacherId: "TCH006", department: "Social Science", subject: "History", qualification: "M.A., B.Ed", gender: "Male", email: "aravind@example.com", status: "ACTIVE" },
    { id: 5, name: "Kavitha F", teacherId: "TCH076", department: "Computer Science", subject: "Python", qualification: "M.Tech., B.Ed", gender: "Female", email: "kavitha@example.com", status: "ACTIVE" }
  ];

  let nextId = 6;
  let editingId = null;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function initials(name) {
    return String(name || "?").trim().split(/\s+/)
      .slice(0, 2).map(word => word.charAt(0)).join("").toUpperCase();
  }

  function setDate() {
    const now = new Date();
    $("dayName").textContent = new Intl.DateTimeFormat("en-IN", {
      weekday: "long"
    }).format(now);
    $("todayDate").textContent = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    }).format(now);
  }

  function moveNavSlider() {
    const active = ui.navList.querySelector(".nav-link.active");
    if (!active) return;
    ui.navSlider.style.height = `${active.offsetHeight}px`;
    ui.navSlider.style.transform = `translateY(${active.offsetTop}px)`;
  }

  function populateFilter(select, property, label) {
    const previous = select.value;
    const values = [...new Set(teachers.map(t => t[property]).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));

    select.replaceChildren(new Option(label, ""));
    values.forEach(value => select.add(new Option(value, value)));

    if (values.includes(previous)) select.value = previous;
  }

  function updateStats() {
    $("totalTeachers").textContent = teachers.length;
    $("maleTeachers").textContent = teachers.filter(t => t.gender === "Male").length;
    $("femaleTeachers").textContent = teachers.filter(t => t.gender === "Female").length;
    $("activeTeachers").textContent = teachers.filter(t => t.status === "ACTIVE").length;
  }

  function filteredTeachers() {
    const query = ui.search.value.trim().toLowerCase();
    const department = ui.department.value;
    const subject = ui.subject.value;

    return teachers.filter(t => {
      const searchable = [
        t.name, t.teacherId, t.department, t.subject,
        t.qualification, t.email
      ].some(value => String(value || "").toLowerCase().includes(query));

      return searchable &&
        (!department || t.department === department) &&
        (!subject || t.subject === subject);
    });
  }

  function renderTable() {
    const records = filteredTeachers();

    ui.count.textContent = `${records.length} teacher${records.length === 1 ? "" : "s"}`;
    ui.empty.hidden = records.length > 0;
    ui.table.replaceChildren();

    records.forEach(teacher => {
      const row = document.createElement("tr");
      const active = teacher.status === "ACTIVE";

      row.innerHTML = `
        <td>
          <div class="teacher-cell">
            <span class="teacher-avatar">${escapeHtml(initials(teacher.name))}</span>
            <div>
              <strong>${escapeHtml(teacher.name)}</strong>
              <small>${escapeHtml(teacher.email)}</small>
            </div>
          </div>
        </td>
        <td>${escapeHtml(teacher.teacherId)}</td>
        <td>${escapeHtml(teacher.department)}</td>
        <td>${escapeHtml(teacher.subject)}</td>
        <td>${escapeHtml(teacher.qualification)}</td>
        <td>
          <span class="status-pill ${active ? "active" : "inactive"}">
            ${active ? "Active" : "Inactive"}
          </span>
        </td>
        <td>
          <button class="edit-button" type="button" data-edit="${teacher.id}">
            ✎ Edit
          </button>
        </td>
      `;
      ui.table.appendChild(row);
    });

    if (!records.length) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="7" class="table-message">No matching teachers.</td>`;
      ui.table.appendChild(row);
    }
  }

  function refresh() {
    populateFilter(ui.department, "department", "All Departments");
    populateFilter(ui.subject, "subject", "All Subjects");
    updateStats();
    renderTable();
  }

  function openModal(id = null) {
    editingId = id;
    ui.form.reset();
    ui.message.textContent = "";

    const teacher = id === null ? null : teachers.find(t => t.id === id);
    if (id !== null && !teacher) return;

    $("modalTitle").textContent = teacher ? "Edit Teacher" : "Add Teacher";
    $("saveTeacher").textContent = teacher ? "Save Changes" : "Add Teacher";
    $("recordId").value = teacher ? teacher.id : "";

    $("fullName").value = teacher?.name || "";
    $("teacherId").value = teacher?.teacherId || "";
    $("teacherEmail").value = teacher?.email || "";
    $("teacherDepartment").value = teacher?.department || "";
    $("teacherSubject").value = teacher?.subject || "";
    $("teacherQualification").value = teacher?.qualification || "";
    $("teacherGender").value = teacher?.gender || "";
    $("teacherStatus").value = teacher?.status || "ACTIVE";

    ui.modal.hidden = false;
    $("fullName").focus();
  }

  function closeModal() {
    ui.modal.hidden = true;
    ui.form.reset();
    ui.message.textContent = "";
    editingId = null;
  }

  function saveForm(event) {
    event.preventDefault();

    const record = {
      name: $("fullName").value.trim(),
      teacherId: $("teacherId").value.trim(),
      email: $("teacherEmail").value.trim().toLowerCase(),
      department: $("teacherDepartment").value.trim(),
      subject: $("teacherSubject").value.trim(),
      qualification: $("teacherQualification").value.trim(),
      gender: $("teacherGender").value,
      status: $("teacherStatus").value
    };

    if (!record.name || !record.teacherId || !record.email ||
        !record.department || !record.subject || !record.qualification) {
      ui.message.textContent = "Complete all required fields.";
      return;
    }

    const duplicateId = teachers.some(t =>
      t.id !== editingId &&
      t.teacherId.toLowerCase() === record.teacherId.toLowerCase()
    );
    const duplicateEmail = teachers.some(t =>
      t.id !== editingId &&
      t.email.toLowerCase() === record.email.toLowerCase()
    );

    if (duplicateId) {
      ui.message.textContent = "This Teacher ID is already in use.";
      return;
    }
    if (duplicateEmail) {
      ui.message.textContent = "This email is already in use.";
      return;
    }

    // DEMO ONLY: this does not persist changes to the backend/database.
    if (editingId === null) {
      teachers.push({ id: nextId++, ...record });
    } else {
      const index = teachers.findIndex(t => t.id === editingId);
      if (index === -1) {
        ui.message.textContent = "Teacher record no longer exists.";
        return;
      }
      teachers[index] = { ...teachers[index], ...record };
    }

    closeModal();
    refresh();
  }

  ui.search.addEventListener("input", renderTable);
  ui.department.addEventListener("change", renderTable);
  ui.subject.addEventListener("change", renderTable);

  $("resetFilters").addEventListener("click", () => {
    ui.search.value = "";
    ui.department.value = "";
    ui.subject.value = "";
    renderTable();
  });

  ui.table.addEventListener("click", event => {
    const button = event.target.closest("[data-edit]");
    if (button) openModal(Number(button.dataset.edit));
  });

  $("addTeacherButton").addEventListener("click", () => openModal());
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
    ui.sidebar.classList.toggle("open");
  });

  $("logoutButton").addEventListener("click", () => {
    // Reuse the existing logout/auth utility when connecting this page.
    if (typeof window.logout === "function") {
      window.logout();
    } else {
      alert("Connect this button to your existing authentication logout function.");
    }
  });

  window.addEventListener("resize", moveNavSlider);

  setDate();
  refresh();
  moveNavSlider();
});
