/* =========================================================
   POWER SCHOOL
   ADMIN - CLASSES & SECTIONS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       AUTHENTICATION
       ===================================================== */

    if (!isAuthenticated()) {
        window.location.href = "../../index.html";
        return;
    }

    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
        window.location.href = "../../index.html";
        return;
    }


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const logoutButton =
        document.getElementById("logoutButton");

    const sidebarDay =
        document.getElementById("sidebarDay");

    const sidebarDate =
        document.getElementById("sidebarDate");

    const pageMessage =
        document.getElementById("pageMessage");


    /* Classes */

    const addClassButton =
        document.getElementById("addClassButton");

    const classModal =
        document.getElementById("classModal");

    const closeClassModal =
        document.getElementById("closeClassModal");

    const cancelClassButton =
        document.getElementById("cancelClassButton");

    const classForm =
        document.getElementById("classForm");

    const classNameInput =
        document.getElementById("className");

    const gradeLevelInput =
        document.getElementById("gradeLevel");

    const saveClassButton =
        document.getElementById("saveClassButton");

    const saveClassText =
        document.getElementById("saveClassText");

    const saveClassSpinner =
        document.getElementById("saveClassSpinner");

    const classFormMessage =
        document.getElementById("classFormMessage");

    const classesLoading =
        document.getElementById("classesLoading");

    const classesError =
        document.getElementById("classesError");

    const classesEmpty =
        document.getElementById("classesEmpty");

    const classesTableContainer =
        document.getElementById("classesTableContainer");

    const classesTableBody =
        document.getElementById("classesTableBody");

    const classCount =
        document.getElementById("classCount");


    /* Sections */

    const addSectionButton =
        document.getElementById("addSectionButton");

    const sectionModal =
        document.getElementById("sectionModal");

    const closeSectionModal =
        document.getElementById("closeSectionModal");

    const cancelSectionButton =
        document.getElementById("cancelSectionButton");

    const sectionForm =
        document.getElementById("sectionForm");

    const sectionNameInput =
        document.getElementById("sectionName");

    const sectionClassSelect =
        document.getElementById("sectionClass");

    const saveSectionButton =
        document.getElementById("saveSectionButton");

    const saveSectionText =
        document.getElementById("saveSectionText");

    const saveSectionSpinner =
        document.getElementById("saveSectionSpinner");

    const sectionFormMessage =
        document.getElementById("sectionFormMessage");

    const sectionsLoading =
        document.getElementById("sectionsLoading");

    const sectionsError =
        document.getElementById("sectionsError");

    const sectionsEmpty =
        document.getElementById("sectionsEmpty");

    const sectionsTableContainer =
        document.getElementById("sectionsTableContainer");

    const sectionsTableBody =
        document.getElementById("sectionsTableBody");

    const sectionCount =
        document.getElementById("sectionCount");


    /* =====================================================
       STATE
       ===================================================== */

    let classes = [];
    let sections = [];


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    updateDate();

    loadClassesAndSections();


    /* =====================================================
       DATE
       ===================================================== */

    function updateDate() {

        const now = new Date();

        sidebarDay.textContent =
            now.toLocaleDateString("en-IN", {
                weekday: "long"
            });

        sidebarDate.textContent =
            now.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
    }


    /* =====================================================
       LOAD DATA
       ===================================================== */

    async function loadClassesAndSections() {

        showClassesLoading();
        showSectionsLoading();

        try {

            const [classData, sectionData] =
                await Promise.all([
                    apiRequest("/admin/classes"),
                    apiRequest("/admin/sections")
                ]);

            classes =
                Array.isArray(classData)
                    ? classData
                    : [];

            sections =
                Array.isArray(sectionData)
                    ? sectionData
                    : [];


            renderClasses();
            renderSections();
            populateClassDropdown();


        } catch (error) {

            console.error(
                "Failed to load academic structure:",
                error
            );

            handleApiError(error);

            showClassesError();
            showSectionsError();
        }
    }


    /* =====================================================
       RENDER CLASSES
       ===================================================== */

    function renderClasses() {

        classesLoading.classList.add("hidden");
        classesError.classList.add("hidden");

        classCount.textContent =
            classes.length;

        classesTableBody.innerHTML = "";


        if (classes.length === 0) {

            classesEmpty.classList.remove("hidden");

            classesTableContainer
                .classList
                .add("hidden");

            return;
        }


        classesEmpty.classList.add("hidden");

        classesTableContainer
            .classList
            .remove("hidden");


        classes.forEach((schoolClass, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${escapeHtml(schoolClass.name)}</td>
                <td>${escapeHtml(schoolClass.gradeLevel)}</td>
            `;


            classesTableBody.appendChild(row);
        });
    }


    /* =====================================================
       RENDER SECTIONS
       ===================================================== */

    function renderSections() {

        sectionsLoading.classList.add("hidden");
        sectionsError.classList.add("hidden");

        sectionCount.textContent =
            sections.length;

        sectionsTableBody.innerHTML = "";


        if (sections.length === 0) {

            sectionsEmpty.classList.remove("hidden");

            sectionsTableContainer
                .classList
                .add("hidden");

            return;
        }


        sectionsEmpty.classList.add("hidden");

        sectionsTableContainer
            .classList
            .remove("hidden");


        sections.forEach((section, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${escapeHtml(section.name)}</td>
                <td>${escapeHtml(section.className)}</td>
                <td>${escapeHtml(section.gradeLevel)}</td>
            `;


            sectionsTableBody.appendChild(row);
        });
    }


    /* =====================================================
       CLASS DROPDOWN
       ===================================================== */

    function populateClassDropdown() {

        sectionClassSelect.innerHTML = `
            <option value="">
                Select a class
            </option>
        `;


        classes.forEach((schoolClass) => {

            const option =
                document.createElement("option");

            option.value =
                schoolClass.id;

            option.textContent =
                `${schoolClass.name} — Grade ${schoolClass.gradeLevel}`;

            sectionClassSelect.appendChild(option);
        });
    }


    /* =====================================================
       ADD CLASS
       ===================================================== */

    addClassButton.addEventListener(
        "click",
        () => {

            resetClassForm();

            openModal(classModal);

            setTimeout(() => {
                classNameInput.focus();
            }, 100);
        }
    );


    classForm.addEventListener(
        "submit",
        createClass
    );


    async function createClass(event) {

        event.preventDefault();

        if (saveClassButton.disabled) {
            return;
        }


        clearFormMessage(classFormMessage);


        const name =
            classNameInput.value.trim();

        const gradeLevel =
            gradeLevelInput.value.trim();


        if (!name) {

            showFormMessage(
                classFormMessage,
                "Class name is required."
            );

            classNameInput.focus();

            return;
        }


        if (!gradeLevel) {

            showFormMessage(
                classFormMessage,
                "Grade level is required."
            );

            gradeLevelInput.focus();

            return;
        }


        setClassSaving(true);


        try {

            await apiRequest(
                "/admin/classes",
                {
                    method: "POST",

                    body: JSON.stringify({
                        name,
                        gradeLevel
                    })
                }
            );


            closeModal(classModal);

            resetClassForm();


            showPageMessage(
                "Class created successfully.",
                "success"
            );


            await loadClassesAndSections();


        } catch (error) {

            console.error(
                "Create class failed:",
                error
            );

            showFormMessage(
                classFormMessage,
                getErrorMessage(error)
            );


        } finally {

            setClassSaving(false);
        }
    }


    /* =====================================================
       ADD SECTION
       ===================================================== */

    addSectionButton.addEventListener(
        "click",
        () => {

            resetSectionForm();

            populateClassDropdown();

            openModal(sectionModal);

            setTimeout(() => {
                sectionNameInput.focus();
            }, 100);
        }
    );


    sectionForm.addEventListener(
        "submit",
        createSection
    );


    async function createSection(event) {

        event.preventDefault();

        if (saveSectionButton.disabled) {
            return;
        }


        clearFormMessage(sectionFormMessage);


        const name =
            sectionNameInput.value.trim();

        const classId =
            sectionClassSelect.value;


        if (!name) {

            showFormMessage(
                sectionFormMessage,
                "Section name is required."
            );

            sectionNameInput.focus();

            return;
        }


        if (!classId) {

            showFormMessage(
                sectionFormMessage,
                "Please select a class."
            );

            sectionClassSelect.focus();

            return;
        }


        setSectionSaving(true);


        try {

            await apiRequest(
                "/admin/sections",
                {
                    method: "POST",

                    body: JSON.stringify({
                        name,
                        classId: Number(classId)
                    })
                }
            );


            closeModal(sectionModal);

            resetSectionForm();


            showPageMessage(
                "Section created successfully.",
                "success"
            );


            await loadClassesAndSections();


        } catch (error) {

            console.error(
                "Create section failed:",
                error
            );

            showFormMessage(
                sectionFormMessage,
                getErrorMessage(error)
            );


        } finally {

            setSectionSaving(false);
        }
    }


    /* =====================================================
       MODAL CONTROLS
       ===================================================== */

    closeClassModal.addEventListener(
        "click",
        () => {

            closeModal(classModal);
            resetClassForm();
        }
    );


    cancelClassButton.addEventListener(
        "click",
        () => {

            closeModal(classModal);
            resetClassForm();
        }
    );


    closeSectionModal.addEventListener(
        "click",
        () => {

            closeModal(sectionModal);
            resetSectionForm();
        }
    );


    cancelSectionButton.addEventListener(
        "click",
        () => {

            closeModal(sectionModal);
            resetSectionForm();
        }
    );


    classModal.addEventListener(
        "click",
        (event) => {

            if (event.target === classModal) {

                closeModal(classModal);
                resetClassForm();
            }
        }
    );


    sectionModal.addEventListener(
        "click",
        (event) => {

            if (event.target === sectionModal) {

                closeModal(sectionModal);
                resetSectionForm();
            }
        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Escape") {
                return;
            }


            if (
                !classModal.classList.contains("hidden")
            ) {

                closeModal(classModal);
                resetClassForm();
            }


            if (
                !sectionModal.classList.contains("hidden")
            ) {

                closeModal(sectionModal);
                resetSectionForm();
            }
        }
    );


    function openModal(modal) {

        modal.classList.remove("hidden");

        document.body.style.overflow =
            "hidden";
    }


    function closeModal(modal) {

        modal.classList.add("hidden");

        if (
            classModal.classList.contains("hidden") &&
            sectionModal.classList.contains("hidden")
        ) {

            document.body.style.overflow =
                "";
        }
    }


    /* =====================================================
       FORM STATE
       ===================================================== */

    function resetClassForm() {

        classForm.reset();

        clearFormMessage(
            classFormMessage
        );

        setClassSaving(false);
    }


    function resetSectionForm() {

        sectionForm.reset();

        clearFormMessage(
            sectionFormMessage
        );

        setSectionSaving(false);
    }


    function setClassSaving(saving) {

        saveClassButton.disabled =
            saving;


        if (saving) {

            saveClassText.textContent =
                "Saving...";

            saveClassSpinner
                .classList
                .remove("hidden");

        } else {

            saveClassText.textContent =
                "Save Class";

            saveClassSpinner
                .classList
                .add("hidden");
        }
    }


    function setSectionSaving(saving) {

        saveSectionButton.disabled =
            saving;


        if (saving) {

            saveSectionText.textContent =
                "Saving...";

            saveSectionSpinner
                .classList
                .remove("hidden");

        } else {

            saveSectionText.textContent =
                "Save Section";

            saveSectionSpinner
                .classList
                .add("hidden");
        }
    }


    /* =====================================================
       MESSAGES
       ===================================================== */

    function showPageMessage(message, type) {

        pageMessage.textContent =
            message;

        pageMessage.className =
            `page-message ${type}`;


        clearTimeout(
            showPageMessage.timeout
        );


        showPageMessage.timeout =
            setTimeout(() => {

                pageMessage.classList.add(
                    "hidden"
                );

            }, 4000);
    }


    function showFormMessage(
        element,
        message
    ) {

        element.textContent =
            message;

        element.className =
            "form-message error";
    }


    function clearFormMessage(element) {

        element.textContent =
            "";

        element.className =
            "form-message hidden";
    }


    /* =====================================================
       LOADING / ERROR
       ===================================================== */

    function showClassesLoading() {

        classesLoading.classList.remove(
            "hidden"
        );

        classesError.classList.add(
            "hidden"
        );

        classesEmpty.classList.add(
            "hidden"
        );

        classesTableContainer
            .classList
            .add("hidden");
    }


    function showSectionsLoading() {

        sectionsLoading.classList.remove(
            "hidden"
        );

        sectionsError.classList.add(
            "hidden"
        );

        sectionsEmpty.classList.add(
            "hidden"
        );

        sectionsTableContainer
            .classList
            .add("hidden");
    }


    function showClassesError() {

        classesLoading.classList.add(
            "hidden"
        );

        classesError.classList.remove(
            "hidden"
        );

        classesEmpty.classList.add(
            "hidden"
        );

        classesTableContainer
            .classList
            .add("hidden");
    }


    function showSectionsError() {

        sectionsLoading.classList.add(
            "hidden"
        );

        sectionsError.classList.remove(
            "hidden"
        );

        sectionsEmpty.classList.add(
            "hidden"
        );

        sectionsTableContainer
            .classList
            .add("hidden");
    }


    /* =====================================================
       API ERROR
       ===================================================== */

    function handleApiError(error) {

        if (error?.status === 401) {

            clearAuthentication();

            window.location.href =
                "../../index.html";

            return;
        }


        if (error?.status === 403) {

            showPageMessage(
                "You do not have permission to access this page.",
                "error"
            );

            return;
        }


        showPageMessage(
            getErrorMessage(error),
            "error"
        );
    }


    function getErrorMessage(error) {

        if (!error) {
            return "Something went wrong. Please try again.";
        }


        if (error.status === 409) {
            return "This record already exists.";
        }


        return (
            error.message ||
            "Something went wrong. Please try again."
        );
    }


    /* =====================================================
       HTML SAFETY
       ===================================================== */

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    logoutButton.addEventListener(
        "click",
        () => {

            clearAuthentication();

            window.location.href =
                "../../index.html";
        }
    );

});