/* =========================================================
   POWER SCHOOL
   ADMIN - STUDENTS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       AUTHENTICATION
       ===================================================== */

    if (!isAuthenticated()) {

        window.location.href =
            "../../index.html";

        return;
    }


    const currentUser =
        getCurrentUser();


    if (
        !currentUser ||
        currentUser.role !== "ADMIN"
    ) {

        window.location.href =
            "../../index.html";

        return;
    }


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const sidebarDay =
        document.getElementById(
            "sidebarDay"
        );

    const sidebarDate =
        document.getElementById(
            "sidebarDate"
        );

    const mobileMenuButton =
        document.getElementById(
            "mobileMenuButton"
        );

    const pageMessage =
        document.getElementById(
            "pageMessage"
        );


    /* =====================================================
       STUDENT LIST
       ===================================================== */

    const addStudentButton =
        document.getElementById(
            "addStudentButton"
        );

    const studentSearch =
        document.getElementById(
            "studentSearch"
        );

    const classFilter =
        document.getElementById(
            "classFilter"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const studentsLoading =
        document.getElementById(
            "studentsLoading"
        );

    const studentsError =
        document.getElementById(
            "studentsError"
        );

    const studentsEmpty =
        document.getElementById(
            "studentsEmpty"
        );

    const studentsTableContainer =
        document.getElementById(
            "studentsTableContainer"
        );

    const studentsTableBody =
        document.getElementById(
            "studentsTableBody"
        );

    const retryStudentsButton =
        document.getElementById(
            "retryStudentsButton"
        );


    /* =====================================================
       SUMMARY
       ===================================================== */

    const studentCount =
        document.getElementById(
            "studentCount"
        );

    const activeStudentCount =
        document.getElementById(
            "activeStudentCount"
        );

    const inactiveStudentCount =
        document.getElementById(
            "inactiveStudentCount"
        );


    /* =====================================================
       MODAL
       ===================================================== */

    const studentModal =
        document.getElementById(
            "studentModal"
        );

    const closeStudentModal =
        document.getElementById(
            "closeStudentModal"
        );

    const cancelStudentButton =
        document.getElementById(
            "cancelStudentButton"
        );

    const studentModalTitle =
        document.getElementById(
            "studentModalTitle"
        );

    const studentModalSubtitle =
        document.getElementById(
            "studentModalSubtitle"
        );

    const studentForm =
        document.getElementById(
            "studentForm"
        );

    const studentFormMessage =
        document.getElementById(
            "studentFormMessage"
        );

    const saveStudentButton =
        document.getElementById(
            "saveStudentButton"
        );

    const saveStudentText =
        document.getElementById(
            "saveStudentText"
        );

    const saveStudentSpinner =
        document.getElementById(
            "saveStudentSpinner"
        );


    /* =====================================================
       FORM INPUTS
       ===================================================== */

    const admissionNumber =
        document.getElementById(
            "admissionNumber"
        );

    const firstName =
        document.getElementById(
            "firstName"
        );

    const lastName =
        document.getElementById(
            "lastName"
        );

    const dateOfBirth =
        document.getElementById(
            "dateOfBirth"
        );

    const gender =
        document.getElementById(
            "gender"
        );

    const studentClass =
        document.getElementById(
            "studentClass"
        );

    const studentSection =
        document.getElementById(
            "studentSection"
        );

    const admissionDate =
        document.getElementById(
            "admissionDate"
        );

    const guardianName =
        document.getElementById(
            "guardianName"
        );

    const guardianPhone =
        document.getElementById(
            "guardianPhone"
        );

    const studentEmail =
        document.getElementById(
            "studentEmail"
        );

    const studentAddress =
        document.getElementById(
            "studentAddress"
        );

    const studentActive =
        document.getElementById(
            "studentActive"
        );


    /* =====================================================
       STATE
       ===================================================== */

    let students = [];

    let classes = [];

    let sections = [];

    let editingStudentId = null;


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    updateDate();

    loadAcademicData();

    loadStudents();


    /* =====================================================
       DATE
       ===================================================== */

    function updateDate() {

        const now =
            new Date();


        sidebarDay.textContent =
            now.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long"
                }
            );


        sidebarDate.textContent =
            now.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

                if (
                    typeof clearAuthentication ===
                    "function"
                ) {

                    clearAuthentication();

                } else {

                    localStorage.removeItem(
                        "ps_token"
                    );

                    localStorage.removeItem(
                        "ps_user"
                    );
                }


                window.location.href =
                    "../../index.html";
            }
        );
    }


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    if (mobileMenuButton) {

        mobileMenuButton.addEventListener(
            "click",
            () => {

                /*
                 * The common responsive navigation can be
                 * connected here if your shared sidebar
                 * implementation provides one.
                 */

                document.body.classList.toggle(
                    "mobile-sidebar-open"
                );
            }
        );
    }


    /* =====================================================
       LOAD CLASSES + SECTIONS
       ===================================================== */

    async function loadAcademicData() {

        try {

            const [
                classData,
                sectionData
            ] = await Promise.all([

                apiRequest(
                    "/admin/classes"
                ),

                apiRequest(
                    "/admin/sections"
                )

            ]);


            classes =
                Array.isArray(classData)
                    ? classData
                    : [];


            sections =
                Array.isArray(sectionData)
                    ? sectionData
                    : [];


            populateClassFilter();

            populateStudentClassDropdown();


        } catch (error) {

            console.error(
                "Failed to load academic data:",
                error
            );

            handleApiError(error);
        }
    }


    /* =====================================================
       LOAD STUDENTS
       ===================================================== */

    async function loadStudents() {

        showStudentsLoading();

        try {

            /*
             * Backend endpoint planned:
             *
             * GET /api/v1/admin/students
             *
             * apiRequest() already handles the
             * /api/v1 base path.
             */

            const data =
                await apiRequest(
                    "/admin/students"
                );


            students =
                Array.isArray(data)
                    ? data
                    : [];


            updateSummary();

            renderStudents();


        } catch (error) {

            console.error(
                "Failed to load students:",
                error
            );

            handleApiError(error);

            showStudentsError();
        }
    }


    /* =====================================================
       CLASS FILTER
       ===================================================== */

    function populateClassFilter() {

        classFilter.innerHTML = `
            <option value="">
                All Classes
            </option>
        `;


        classes.forEach(
            (schoolClass) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    schoolClass.id;


                option.textContent =
                    `${schoolClass.name} — Grade ${schoolClass.gradeLevel}`;


                classFilter.appendChild(
                    option
                );
            }
        );
    }


    /* =====================================================
       STUDENT CLASS DROPDOWN
       ===================================================== */

    function populateStudentClassDropdown(
        selectedId = ""
    ) {

        studentClass.innerHTML = `
            <option value="">
                Select a class
            </option>
        `;


        classes.forEach(
            (schoolClass) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    schoolClass.id;


                option.textContent =
                    `${schoolClass.name} — Grade ${schoolClass.gradeLevel}`;


                if (
                    String(
                        schoolClass.id
                    ) === String(selectedId)
                ) {

                    option.selected =
                        true;
                }


                studentClass.appendChild(
                    option
                );
            }
        );


        updateSectionDropdown();
    }


    /* =====================================================
       SECTION DROPDOWN
       ===================================================== */

    function updateSectionDropdown(
        selectedSectionId = ""
    ) {

        const classId =
            studentClass.value;


        studentSection.innerHTML = "";


        if (!classId) {

            studentSection.disabled =
                true;


            studentSection.innerHTML = `
                <option value="">
                    Select a class first
                </option>
            `;

            return;
        }


        const matchingSections =
            sections.filter(
                (section) => {

                    return (
                        String(
                            getSectionClassId(
                                section
                            )
                        ) === String(classId)
                    );
                }
            );


        studentSection.disabled =
            false;


        if (
            matchingSections.length ===
            0
        ) {

            studentSection.innerHTML = `
                <option value="">
                    No sections available
                </option>
            `;

            return;
        }


        studentSection.innerHTML = `
            <option value="">
                Select a section
            </option>
        `;


        matchingSections.forEach(
            (section) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    section.id;


                option.textContent =
                    section.name;


                if (
                    String(
                        section.id
                    ) === String(
                        selectedSectionId
                    )
                ) {

                    option.selected =
                        true;
                }


                studentSection.appendChild(
                    option
                );
            }
        );
    }


    /*
     * Existing Sections API uses class information.
     * Support both classId and nested class.id so the
     * frontend remains compatible with the backend DTO.
     */

    function getSectionClassId(
        section
    ) {

        if (
            section.classId !==
            undefined &&
            section.classId !== null
        ) {

            return section.classId;
        }


        if (
            section.class &&
            section.class.id
        ) {

            return section.class.id;
        }


        return "";
    }


    studentClass.addEventListener(
        "change",
        () => {

            updateSectionDropdown();
        }
    );


    /* =====================================================
       FILTERS
       ===================================================== */

    studentSearch.addEventListener(
        "input",
        renderStudents
    );


    classFilter.addEventListener(
        "change",
        renderStudents
    );


    statusFilter.addEventListener(
        "change",
        renderStudents
    );


    /* =====================================================
       RENDER STUDENTS
       ===================================================== */

    function renderStudents() {

        studentsLoading.classList.add(
            "hidden"
        );

        studentsError.classList.add(
            "hidden"
        );


        const filteredStudents =
            getFilteredStudents();


        studentsTableBody.innerHTML =
            "";


        if (
            filteredStudents.length ===
            0
        ) {

            studentsEmpty.classList.remove(
                "hidden"
            );

            studentsTableContainer.classList.add(
                "hidden"
            );

            return;
        }


        studentsEmpty.classList.add(
            "hidden"
        );

        studentsTableContainer.classList.remove(
            "hidden"
        );


        filteredStudents.forEach(
            (student, index) => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML =
                    createStudentRow(
                        student,
                        index
                    );


                studentsTableBody.appendChild(
                    row
                );
            }
        );
    }


    /* =====================================================
       FILTER LOGIC
       ===================================================== */

    function getFilteredStudents() {

        const search =
            studentSearch.value
                .trim()
                .toLowerCase();


        const selectedClass =
            classFilter.value;


        const selectedStatus =
            statusFilter.value;


        return students.filter(
            (student) => {

                const fullName =
                    getStudentName(
                        student
                    ).toLowerCase();


                const admission =
                    String(
                        student.admissionNumber ||
                        ""
                    ).toLowerCase();


                const email =
                    String(
                        student.email ||
                        student.studentEmail ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    fullName.includes(search) ||
                    admission.includes(search) ||
                    email.includes(search);


                const studentClassId =
                    getStudentClassId(
                        student
                    );


                const matchesClass =
                    !selectedClass ||
                    String(
                        studentClassId
                    ) === String(
                        selectedClass
                    );


                const studentStatus =
                    getStudentStatus(
                        student
                    );


                const matchesStatus =
                    !selectedStatus ||
                    studentStatus ===
                    selectedStatus;


                return (
                    matchesSearch &&
                    matchesClass &&
                    matchesStatus
                );
            }
        );
    }


    /* =====================================================
       STUDENT ROW
       ===================================================== */

    function createStudentRow(
        student,
        index
    ) {

        const fullName =
            getStudentName(
                student
            );


        const initials =
            getInitials(
                fullName
            );


        const email =
            student.email ||
            student.studentEmail ||
            "";


        const admission =
            student.admissionNumber ||
            "—";


        const className =
            getStudentClassName(
                student
            );


        const sectionName =
            getStudentSectionName(
                student
            );


        const guardian =
            student.guardianName ||
            student.parentName ||
            student.parentGuardianName ||
            "—";


        const phone =
            student.guardianPhone ||
            student.parentPhone ||
            student.parentGuardianPhone ||
            "";


        const status =
            getStudentStatus(
                student
            );


        const statusClass =
            status === "ACTIVE"
                ? "status-active"
                : "status-disabled";


        const statusText =
            status === "ACTIVE"
                ? "Active"
                : "Disabled";


        return `

            <td>
                ${index + 1}
            </td>


            <td>

                <div class="student-name-cell">

                    <div class="student-avatar">
                        ${escapeHtml(initials)}
                    </div>

                    <div>

                        <div class="student-name">
                            ${escapeHtml(fullName)}
                        </div>

                        ${
                            email
                                ? `
                                    <div class="student-email">
                                        ${escapeHtml(email)}
                                    </div>
                                  `
                                : ""
                        }

                    </div>

                </div>

            </td>


            <td>
                <span class="admission-number">
                    ${escapeHtml(admission)}
                </span>
            </td>


            <td>
                ${escapeHtml(className)}
            </td>


            <td>
                ${escapeHtml(sectionName)}
            </td>


            <td>

                <div class="parent-cell">

                    <span class="parent-name">
                        ${escapeHtml(guardian)}
                    </span>

                    ${
                        phone
                            ? `
                                <span class="parent-phone">
                                    ${escapeHtml(phone)}
                                </span>
                              `
                            : ""
                    }

                </div>

            </td>


            <td>

                <span
                    class="status-badge ${statusClass}"
                >
                    ${statusText}
                </span>

            </td>


            <td>

                <div class="action-buttons">

                    <button
                        type="button"
                        class="action-button"
                        title="Edit student"
                        data-action="edit"
                        data-id="${escapeHtml(
                            student.id
                        )}"
                    >
                        ✎
                    </button>


                    <button
                        type="button"
                        class="action-button ${
                            status === "ACTIVE"
                                ? "danger"
                                : ""
                        }"
                        title="${
                            status === "ACTIVE"
                                ? "Disable student"
                                : "Enable student"
                        }"
                        data-action="toggle"
                        data-id="${escapeHtml(
                            student.id
                        )}"
                    >
                        ${
                            status === "ACTIVE"
                                ? "⊘"
                                : "✓"
                        }
                    </button>

                </div>

            </td>
        `;
    }


    /* =====================================================
       TABLE ACTIONS
       ===================================================== */

    studentsTableBody.addEventListener(
        "click",
        async (event) => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const studentId =
                button.dataset.id;


            const action =
                button.dataset.action;


            if (action === "edit") {

                editStudent(
                    studentId
                );

                return;
            }


            if (action === "toggle") {

                await toggleStudentStatus(
                    studentId,
                    button
                );
            }
        }
    );


    /* =====================================================
       ADD STUDENT
       ===================================================== */

    addStudentButton.addEventListener(
        "click",
        () => {

            openAddStudentModal();
        }
    );


    function openAddStudentModal() {

        editingStudentId =
            null;


        studentForm.reset();


        studentModalTitle.textContent =
            "Add Student";


        studentModalSubtitle.textContent =
            "Create a new student record.";


        saveStudentText.textContent =
            "Save Student";


        studentActive.checked =
            true;


        clearFormMessage(
            studentFormMessage
        );


        populateStudentClassDropdown();


        setDefaultAdmissionDate();


        openModal(
            studentModal
        );


        setTimeout(
            () => {

                admissionNumber.focus();

            },
            100
        );
    }


    /* =====================================================
       EDIT STUDENT
       ===================================================== */

    function editStudent(
        studentId
    ) {

        const student =
            students.find(
                (item) =>
                    String(item.id) ===
                    String(studentId)
            );


        if (!student) {

            showPageMessage(
                "Student record could not be found.",
                "error"
            );

            return;
        }


        editingStudentId =
            student.id;


        studentModalTitle.textContent =
            "Edit Student";


        studentModalSubtitle.textContent =
            "Update the student record.";


        saveStudentText.textContent =
            "Update Student";


        clearFormMessage(
            studentFormMessage
        );


        admissionNumber.value =
            student.admissionNumber ||
            "";


        firstName.value =
            student.firstName ||
            "";


        lastName.value =
            student.lastName ||
            "";


        dateOfBirth.value =
            formatDateForInput(
                student.dateOfBirth
            );


        gender.value =
            student.gender ||
            "";


        const classId =
            getStudentClassId(
                student
            );


        const sectionId =
            getStudentSectionId(
                student
            );


        populateStudentClassDropdown(
            classId
        );


        updateSectionDropdown(
            sectionId
        );


        admissionDate.value =
            formatDateForInput(
                student.admissionDate
            );


        guardianName.value =
            student.guardianName ||
            student.parentName ||
            student.parentGuardianName ||
            "";


        guardianPhone.value =
            student.guardianPhone ||
            student.parentPhone ||
            student.parentGuardianPhone ||
            "";


        studentEmail.value =
            student.email ||
            student.studentEmail ||
            "";


        studentAddress.value =
            student.address ||
            student.studentAddress ||
            "";


        studentActive.checked =
            getStudentStatus(
                student
            ) === "ACTIVE";


        openModal(
            studentModal
        );
    }


    /* =====================================================
       SAVE / UPDATE STUDENT
       ===================================================== */

    studentForm.addEventListener(
        "submit",
        saveStudent
    );


    async function saveStudent(
        event
    ) {

        event.preventDefault();


        if (
            saveStudentButton.disabled
        ) {

            return;
        }


        clearFormMessage(
            studentFormMessage
        );


        const data =
            collectStudentFormData();


        const validationError =
            validateStudentData(
                data
            );


        if (validationError) {

            showFormMessage(
                studentFormMessage,
                validationError
            );

            return;
        }


        setStudentSaving(
            true
        );


        try {

            if (
                editingStudentId
            ) {

                await apiRequest(
                    `/admin/students/${editingStudentId}`,
                    {
                        method: "PUT",

                        body:
                            JSON.stringify(
                                data
                            )
                    }
                );


                showPageMessage(
                    "Student updated successfully.",
                    "success"
                );

            } else {

                await apiRequest(
                    "/admin/students",
                    {
                        method: "POST",

                        body:
                            JSON.stringify(
                                data
                            )
                    }
                );


                showPageMessage(
                    "Student created successfully.",
                    "success"
                );
            }


            closeModal(
                studentModal
            );


            resetStudentForm();


            await loadStudents();


        } catch (error) {

            console.error(
                "Save student failed:",
                error
            );


            if (
                error?.status === 409
            ) {

                showFormMessage(
                    studentFormMessage,
                    "A student with this admission number already exists."
                );

            } else {

                showFormMessage(
                    studentFormMessage,
                    getErrorMessage(
                        error
                    )
                );
            }


        } finally {

            setStudentSaving(
                false
            );
        }
    }


    /* =====================================================
       COLLECT FORM
       ===================================================== */

    function collectStudentFormData() {

        return {

            admissionNumber:
                admissionNumber.value.trim(),

            firstName:
                firstName.value.trim(),

            lastName:
                lastName.value.trim(),

            dateOfBirth:
                dateOfBirth.value ||
                null,

            gender:
                gender.value ||
                null,

            classId:
                studentClass.value
                    ? Number(
                        studentClass.value
                    )
                    : null,

            sectionId:
                studentSection.value
                    ? Number(
                        studentSection.value
                    )
                    : null,

            guardianName:
                guardianName.value.trim() ||
                null,

            guardianPhone:
                guardianPhone.value.trim() ||
                null,

            email:
                studentEmail.value.trim() ||
                null,

            address:
                studentAddress.value.trim() ||
                null,

            admissionDate:
                admissionDate.value ||
                null,

            active:
                studentActive.checked
        };
    }


    /* =====================================================
       VALIDATION
       ===================================================== */

    function validateStudentData(
        data
    ) {

        if (!data.admissionNumber) {

            admissionNumber.focus();

            return "Admission number is required.";
        }


        if (!data.firstName) {

            firstName.focus();

            return "First name is required.";
        }


        if (!data.classId) {

            studentClass.focus();

            return "Please select a class.";
        }


        if (!data.sectionId) {

            studentSection.focus();

            return "Please select a section.";
        }


        if (
            data.email &&
            !isValidEmail(
                data.email
            )
        ) {

            studentEmail.focus();

            return "Please enter a valid email address.";
        }


        if (
            data.guardianPhone &&
            !isValidPhone(
                data.guardianPhone
            )
        ) {

            guardianPhone.focus();

            return "Please enter a valid guardian phone number.";
        }


        return null;
    }


    function isValidEmail(
        value
    ) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(value);
    }


    function isValidPhone(
        value
    ) {

        return /^[0-9+\-\s()]{7,20}$/
            .test(value);
    }


    /* =====================================================
       ENABLE / DISABLE STUDENT
       ===================================================== */

    async function toggleStudentStatus(
        studentId,
        button
    ) {

        if (
            button.disabled
        ) {

            return;
        }


        const student =
            students.find(
                (item) =>
                    String(item.id) ===
                    String(studentId)
            );


        if (!student) {
            return;
        }


        const currentStatus =
            getStudentStatus(
                student
            );


        const isActive =
            currentStatus ===
            "ACTIVE";


        const actionText =
            isActive
                ? "disable"
                : "enable";


        const confirmed =
            window.confirm(
                `Are you sure you want to ${actionText} this student?`
            );


        if (!confirmed) {
            return;
        }


        button.disabled =
            true;


        try {

            await apiRequest(
                `/admin/students/${studentId}/status`,
                {
                    method: "PATCH",

                    body:
                        JSON.stringify({
                            active:
                                !isActive
                        })
                }
            );


            showPageMessage(
                isActive
                    ? "Student disabled successfully."
                    : "Student enabled successfully.",
                "success"
            );


            await loadStudents();


        } catch (error) {

            console.error(
                "Toggle student status failed:",
                error
            );


            handleApiError(
                error
            );

        } finally {

            button.disabled =
                false;
        }
    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function updateSummary() {

        const active =
            students.filter(
                (student) =>
                    getStudentStatus(
                        student
                    ) === "ACTIVE"
            ).length;


        const inactive =
            students.length -
            active;


        studentCount.textContent =
            students.length;


        activeStudentCount.textContent =
            active;


        inactiveStudentCount.textContent =
            inactive;
    }


    /* =====================================================
       STUDENT DATA HELPERS
       ===================================================== */

    function getStudentName(
        student
    ) {

        const name =
            [
                student.firstName,
                student.lastName
            ]
                .filter(Boolean)
                .join(" ")
                .trim();


        return (
            name ||
            student.fullName ||
            "Unnamed Student"
        );
    }


    function getInitials(
        name
    ) {

        const parts =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!parts.length) {
            return "?";
        }


        return parts
            .slice(0, 2)
            .map(
                (part) =>
                    part.charAt(0)
                        .toUpperCase()
            )
            .join("");
    }


    function getStudentStatus(
        student
    ) {

        if (
            student.active !==
            undefined
        ) {

            return student.active
                ? "ACTIVE"
                : "DISABLED";
        }


        if (
            student.enabled !==
            undefined
        ) {

            return student.enabled
                ? "ACTIVE"
                : "DISABLED";
        }


        if (
            student.status
        ) {

            return String(
                student.status
            ).toUpperCase() ===
            "ACTIVE"
                ? "ACTIVE"
                : "DISABLED";
        }


        return "ACTIVE";
    }


    function getStudentClassId(
        student
    ) {

        if (
            student.classId !==
            undefined &&
            student.classId !== null
        ) {

            return student.classId;
        }


        if (
            student.schoolClass &&
            student.schoolClass.id
        ) {

            return student.schoolClass.id;
        }


        if (
            student.class &&
            student.class.id
        ) {

            return student.class.id;
        }


        return "";
    }


    function getStudentSectionId(
        student
    ) {

        if (
            student.sectionId !==
            undefined &&
            student.sectionId !== null
        ) {

            return student.sectionId;
        }


        if (
            student.section &&
            student.section.id
        ) {

            return student.section.id;
        }


        return "";
    }


    function getStudentClassName(
        student
    ) {

        if (
            student.className
        ) {

            return student.className;
        }


        if (
            student.schoolClass &&
            student.schoolClass.name
        ) {

            return student.schoolClass.name;
        }


        if (
            student.class &&
            student.class.name
        ) {

            return student.class.name;
        }


        const classId =
            getStudentClassId(
                student
            );


        const found =
            classes.find(
                (schoolClass) =>
                    String(
                        schoolClass.id
                    ) === String(
                        classId
                    )
            );


        return found
            ? found.name
            : "—";
    }


    function getStudentSectionName(
        student
    ) {

        if (
            student.sectionName
        ) {

            return student.sectionName;
        }


        if (
            student.section &&
            student.section.name
        ) {

            return student.section.name;
        }


        const sectionId =
            getStudentSectionId(
                student
            );


        const found =
            sections.find(
                (section) =>
                    String(
                        section.id
                    ) === String(
                        sectionId
                    )
            );


        return found
            ? found.name
            : "—";
    }


    /* =====================================================
       MODAL
       ===================================================== */

    closeStudentModal.addEventListener(
        "click",
        closeStudentForm
    );


    cancelStudentButton.addEventListener(
        "click",
        closeStudentForm
    );


    studentModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                studentModal
            ) {

                closeStudentForm();
            }
        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                !studentModal.classList.contains(
                    "hidden"
                )
            ) {

                closeStudentForm();
            }
        }
    );


    function openModal(
        modal
    ) {

        modal.classList.remove(
            "hidden"
        );

        document.body.style.overflow =
            "hidden";
    }


    function closeModal(
        modal
    ) {

        modal.classList.add(
            "hidden"
        );

        document.body.style.overflow =
            "";
    }


    function closeStudentForm() {

        closeModal(
            studentModal
        );

        resetStudentForm();
    }


    function resetStudentForm() {

        studentForm.reset();

        editingStudentId =
            null;

        clearFormMessage(
            studentFormMessage
        );

        setStudentSaving(
            false
        );


        studentSection.disabled =
            true;


        studentSection.innerHTML = `
            <option value="">
                Select a class first
            </option>
        `;
    }


    /* =====================================================
       DEFAULT ADMISSION DATE
       ===================================================== */

    function setDefaultAdmissionDate() {

        if (
            !admissionDate.value
        ) {

            const today =
                new Date();


            const year =
                today.getFullYear();


            const month =
                String(
                    today.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    today.getDate()
                ).padStart(
                    2,
                    "0"
                );


            admissionDate.value =
                `${year}-${month}-${day}`;
        }
    }


    /* =====================================================
       SAVING STATE
       ===================================================== */

    function setStudentSaving(
        saving
    ) {

        saveStudentButton.disabled =
            saving;


        if (saving) {

            saveStudentText.textContent =
                editingStudentId
                    ? "Updating..."
                    : "Saving...";


            saveStudentSpinner.classList.remove(
                "hidden"
            );

        } else {

            saveStudentText.textContent =
                editingStudentId
                    ? "Update Student"
                    : "Save Student";


            saveStudentSpinner.classList.add(
                "hidden"
            );
        }
    }


    /* =====================================================
       LOADING / ERROR STATES
       ===================================================== */

    function showStudentsLoading() {

        studentsLoading.classList.remove(
            "hidden"
        );

        studentsError.classList.add(
            "hidden"
        );

        studentsEmpty.classList.add(
            "hidden"
        );

        studentsTableContainer.classList.add(
            "hidden"
        );
    }


    function showStudentsError() {

        studentsLoading.classList.add(
            "hidden"
        );

        studentsError.classList.remove(
            "hidden"
        );

        studentsEmpty.classList.add(
            "hidden"
        );

        studentsTableContainer.classList.add(
            "hidden"
        );
    }


    retryStudentsButton.addEventListener(
        "click",
        loadStudents
    );


    /* =====================================================
       FORM MESSAGES
       ===================================================== */

    function showFormMessage(
        element,
        message
    ) {

        element.textContent =
            message;

        element.className =
            "form-message";
    }


    function clearFormMessage(
        element
    ) {

        element.textContent =
            "";

        element.className =
            "form-message hidden";
    }


    /* =====================================================
       PAGE MESSAGE
       ===================================================== */

    function showPageMessage(
        message,
        type
    ) {

        pageMessage.textContent =
            message;

        pageMessage.className =
            `page-message ${type}`;


        clearTimeout(
            showPageMessage.timeout
        );


        showPageMessage.timeout =
            setTimeout(
                () => {

                    pageMessage.classList.add(
                        "hidden"
                    );

                },
                4000
            );
    }


    /* =====================================================
       API ERROR
       ===================================================== */

    function handleApiError(
        error
    ) {

        if (
            error?.status ===
            401
        ) {

            if (
                typeof clearAuthentication ===
                "function"
            ) {

                clearAuthentication();
            }


            window.location.href =
                "../../index.html";

            return;
        }


        if (
            error?.status ===
            403
        ) {

            showPageMessage(
                "You do not have permission to access this page.",
                "error"
            );

            return;
        }


        showPageMessage(
            getErrorMessage(
                error
            ),
            "error"
        );
    }


    function getErrorMessage(
        error
    ) {

        if (!error) {

            return "Something went wrong. Please try again.";
        }


        if (
            error.status ===
            409
        ) {

            return "This record already exists.";
        }


        return (
            error.message ||
            "Something went wrong. Please try again."
        );
    }


    /* =====================================================
       DATE FORMAT
       ===================================================== */

    function formatDateForInput(
        value
    ) {

        if (!value) {
            return "";
        }


        if (
            typeof value ===
            "string"
        ) {

            return value.substring(
                0,
                10
            );
        }


        return "";
    }


    /* =====================================================
       HTML SAFETY
       ===================================================== */

    function escapeHtml(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";
        }


        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }

});