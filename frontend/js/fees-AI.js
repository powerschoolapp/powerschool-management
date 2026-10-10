/* =========================================================
   POWER SCHOOL — ADMIN FEES MANAGEMENT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof isAuthenticated !== "function" || !isAuthenticated()) {
        window.location.href = "../../index.html";
        return;
    }

    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== "ADMIN") {
        window.location.href = "../../index.html";
        return;
    }

    const $ = (id) => document.getElementById(id);

    const state = {
        records: [],
        filtered: [],
        page: 1,
        pageSize: 10,
        loading: false,
        saving: false
    };

    const els = {
        sidebarDay: $("sidebarDay"),
        sidebarDate: $("sidebarDate"),
        adminName: $("adminName"),
        logoutButton: $("logoutButton"),
        pageMessage: $("pageMessage"),

        totalFees: $("totalFees"),
        collectedFees: $("collectedFees"),
        pendingFees: $("pendingFees"),
        overdueFees: $("overdueFees"),

        searchInput: $("searchInput"),
        classFilter: $("classFilter"),
        statusFilter: $("statusFilter"),
        resetFiltersButton: $("resetFiltersButton"),

        tableLoading: $("tableLoading"),
        tableError: $("tableError"),
        tableEmpty: $("tableEmpty"),
        tableContainer: $("tableContainer"),
        tableBody: $("feesTableBody"),
        recordCount: $("recordCount"),
        paginationInfo: $("paginationInfo"),
        pageNumber: $("pageNumber"),
        previousPage: $("previousPage"),
        nextPage: $("nextPage"),
        retryButton: $("retryButton"),

        exportButton: $("exportButton"),
        reportExportButton: $("reportExportButton"),

        recordPaymentButton: $("recordPaymentButton"),
        paymentModal: $("paymentModal"),
        closePaymentModal: $("closePaymentModal"),
        cancelPaymentButton: $("cancelPaymentButton"),
        paymentForm: $("paymentForm"),
        paymentStudent: $("paymentStudent"),
        paymentAmount: $("paymentAmount"),
        paymentDate: $("paymentDate"),
        paymentMethod: $("paymentMethod"),
        paymentReference: $("paymentReference"),
        paymentFormMessage: $("paymentFormMessage"),
        savePaymentButton: $("savePaymentButton")
    };

    const API_ENDPOINTS = {
        records: "/admin/fees",
        summary: "/admin/fees/summary",
        payments: "/admin/fees/payments"
    };

    init();

    function init() {
        updateDate();

        if (currentUser.fullName || currentUser.full_name) {
            els.adminName.textContent =
                currentUser.fullName || currentUser.full_name;
        }

        els.paymentDate.value = localDateInputValue();

        bindEvents();
        loadFeeData();
    }

    function bindEvents() {
        els.logoutButton.addEventListener("click", () => {
            if (typeof clearAuthentication === "function") {
                clearAuthentication();
            } else {
                sessionStorage.removeItem("ps_token");
                sessionStorage.removeItem("ps_user");
            }

            window.location.href = "../../index.html";
        });

        els.searchInput.addEventListener("input", applyFilters);
        els.classFilter.addEventListener("change", applyFilters);
        els.statusFilter.addEventListener("change", applyFilters);

        els.resetFiltersButton.addEventListener("click", () => {
            els.searchInput.value = "";
            els.classFilter.value = "";
            els.statusFilter.value = "";
            state.page = 1;
            applyFilters();
        });

        els.retryButton.addEventListener("click", loadFeeData);

        els.previousPage.addEventListener("click", () => {
            if (state.page > 1) {
                state.page--;
                renderTable();
            }
        });

        els.nextPage.addEventListener("click", () => {
            const pageCount = Math.ceil(
                state.filtered.length / state.pageSize
            );

            if (state.page < pageCount) {
                state.page++;
                renderTable();
            }
        });

        els.exportButton.addEventListener("click", exportCsv);
        els.reportExportButton.addEventListener("click", exportCsv);

        els.recordPaymentButton.addEventListener("click", openPaymentModal);
        els.closePaymentModal.addEventListener("click", closePaymentModal);
        els.cancelPaymentButton.addEventListener("click", closePaymentModal);

        els.paymentModal.addEventListener("click", (event) => {
            if (event.target === els.paymentModal) {
                closePaymentModal();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                !els.paymentModal.classList.contains("hidden")
            ) {
                closePaymentModal();
            }
        });

        els.paymentForm.addEventListener("submit", submitPayment);
    }

    /* ------------------------- API ------------------------- */

    async function apiGet(endpoint) {
        if (typeof apiRequest !== "function") {
            throw new Error("The shared API helper (api.js) did not load.");
        }

        return apiRequest(endpoint, { method: "GET" });
    }

    async function apiPost(endpoint, body) {
        if (typeof apiRequest !== "function") {
            throw new Error("The shared API helper (api.js) did not load.");
        }

        return apiRequest(endpoint, {
            method: "POST",
            body: JSON.stringify(body)
        });
    }

    async function loadFeeData() {
        if (state.loading) return;

        state.loading = true;
        showTableState("loading");
        clearPageMessage();

        try {
            const [recordsResponse, summaryResponse] = await Promise.all([
                apiGet(API_ENDPOINTS.records),
                apiGet(API_ENDPOINTS.summary)
            ]);

            state.records = unwrapArray(recordsResponse);
            updateSummary(summaryResponse);
            populateClassFilter();
            populatePaymentStudentSelect();

            state.page = 1;
            applyFilters();
        } catch (error) {
            showTableState("error");
            handleApiError(error);
        } finally {
            state.loading = false;
        }
    }

    function unwrapArray(response) {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.content)) return response.content;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.records)) return response.records;
        return [];
    }

    function updateSummary(summary) {
        const total = numberValue(summary?.totalFees);
        const collected = numberValue(summary?.collectedFees);
        const pending = numberValue(summary?.pendingFees);
        const overdue = numberValue(summary?.overdueFees);

        els.totalFees.textContent = formatCurrency(total);
        els.collectedFees.textContent = formatCurrency(collected);
        els.pendingFees.textContent = formatCurrency(pending);
        els.overdueFees.textContent = formatCurrency(overdue);
    }

    /* ---------------------- Filtering ---------------------- */

    function applyFilters() {
        const query = els.searchInput.value.trim().toLowerCase();
        const selectedClass = els.classFilter.value;
        const selectedStatus = els.statusFilter.value;

        state.filtered = state.records.filter((record) => {
            const studentName = String(
                record.studentName ?? record.fullName ?? ""
            ).toLowerCase();

            const admissionNumber = String(
                record.admissionNumber ?? ""
            ).toLowerCase();

            const className = String(
                record.className ?? ""
            );

            const sectionName = String(
                record.sectionName ?? ""
            );

            const matchesQuery =
                !query ||
                studentName.includes(query) ||
                admissionNumber.includes(query);

            const matchesClass =
                !selectedClass || className === selectedClass;

            const status = getStatus(record);
            const matchesStatus =
                !selectedStatus || status === selectedStatus;

            return matchesQuery && matchesClass && matchesStatus;
        });

        state.page = 1;
        renderTable();
    }

    function populateClassFilter() {
        const existing = els.classFilter.value;

        const classNames = [
            ...new Set(
                state.records
                    .map((record) => record.className)
                    .filter(Boolean)
            )
        ].sort((a, b) => String(a).localeCompare(String(b)));

        els.classFilter.replaceChildren(new Option("All classes", ""));

        classNames.forEach((name) => {
            els.classFilter.add(new Option(name, name));
        });

        if (classNames.includes(existing)) {
            els.classFilter.value = existing;
        }
    }

    function populatePaymentStudentSelect() {
        const previousValue = els.paymentStudent.value;

        els.paymentStudent.replaceChildren(
            new Option("Select a student", "")
        );

        state.records.forEach((record) => {
            const id = getRecordId(record);
            if (id === null) return;

            const name = record.studentName ?? record.fullName ?? "Student";
            const admission = record.admissionNumber
                ? ` (${record.admissionNumber})`
                : "";

            const balance = getBalance(record);

            const option = new Option(
                `${name}${admission} — Balance ${formatCurrency(balance)}`,
                String(id)
            );

            option.dataset.balance = String(balance);
            els.paymentStudent.add(option);
        });

        if (
            [...els.paymentStudent.options].some(
                (option) => option.value === previousValue
            )
        ) {
            els.paymentStudent.value = previousValue;
        }
    }

    /* ----------------------- Table -------------------------- */

    function renderTable() {
        els.tableBody.replaceChildren();

        const total = state.filtered.length;
        const pageCount = Math.max(1, Math.ceil(total / state.pageSize));

        state.page = Math.min(state.page, pageCount);

        const startIndex = (state.page - 1) * state.pageSize;
        const pageRows = state.filtered.slice(
            startIndex,
            startIndex + state.pageSize
        );

        els.recordCount.textContent =
            `${total} ${total === 1 ? "record" : "records"}`;

        els.paginationInfo.textContent = total
            ? `Showing ${startIndex + 1}–${Math.min(
                startIndex + pageRows.length,
                total
            )} of ${total} records`
            : "Showing 0 records";

        els.pageNumber.textContent = `${state.page} / ${pageCount}`;
        els.previousPage.disabled = state.page <= 1;
        els.nextPage.disabled = state.page >= pageCount;

        if (total === 0) {
            showTableState("empty");
            return;
        }

        showTableState("table");

        pageRows.forEach((record) => {
            const row = document.createElement("tr");

            const studentCell = document.createElement("td");
            const studentName = document.createElement("span");
            studentName.className = "student-name";
            studentName.textContent =
                record.studentName ?? record.fullName ?? "—";

            const admission = document.createElement("span");
            admission.className = "student-admission";
            admission.textContent = record.admissionNumber ?? "—";

            studentCell.append(studentName, admission);

            const classCell = textCell(
                `${record.className ?? "—"}${
                    record.sectionName ? " / " + record.sectionName : ""
                }`
            );

            const totalCell = amountCell(getTotal(record));
            const paidCell = amountCell(getPaid(record));

            const balance = getBalance(record);
            const balanceCell = amountCell(balance);
            balanceCell.classList.add("balance");

            const dueCell = textCell(formatDate(record.dueDate));

            const statusCell = document.createElement("td");
            const statusBadge = document.createElement("span");
            const status = getStatus(record);
            statusBadge.className = `status status-${status.toLowerCase()}`;
            statusBadge.textContent = statusLabel(status);
            statusCell.append(statusBadge);

            const actionCell = document.createElement("td");
            const actionButton = document.createElement("button");
            actionButton.type = "button";
            actionButton.className = "table-action";
            actionButton.textContent = balance > 0 ? "Record payment" : "Paid";
            actionButton.disabled = balance <= 0;
            actionButton.addEventListener("click", () => {
                openPaymentModal(record);
            });
            actionCell.append(actionButton);

            row.append(
                studentCell,
                classCell,
                totalCell,
                paidCell,
                balanceCell,
                dueCell,
                statusCell,
                actionCell
            );

            els.tableBody.append(row);
        });
    }

    function textCell(value) {
        const cell = document.createElement("td");
        cell.textContent = value ?? "—";
        return cell;
    }

    function amountCell(value) {
        const cell = document.createElement("td");
        cell.className = "amount";
        cell.textContent = formatCurrency(value);
        return cell;
    }

    function showTableState(mode) {
        els.tableLoading.classList.toggle("hidden", mode !== "loading");
        els.tableError.classList.toggle("hidden", mode !== "error");
        els.tableEmpty.classList.toggle("hidden", mode !== "empty");
        els.tableContainer.classList.toggle("hidden", mode !== "table");
    }

    /* --------------------- Record payment ------------------ */

    function openPaymentModal(record = null) {
        clearPaymentMessage();
        els.paymentForm.reset();
        els.paymentDate.value = localDateInputValue();

        if (record) {
            const id = getRecordId(record);
            els.paymentStudent.value = id === null ? "" : String(id);
        }

        els.paymentModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";

        els.paymentStudent.focus();
    }

    function closePaymentModal() {
        if (state.saving) return;

        els.paymentModal.classList.add("hidden");
        document.body.style.overflow = "";
        clearPaymentMessage();
    }

    async function submitPayment(event) {
        event.preventDefault();

        if (state.saving) return;

        const selectedOption =
            els.paymentStudent.options[els.paymentStudent.selectedIndex];

        const feeRecordId = els.paymentStudent.value;
        const amount = Number(els.paymentAmount.value);
        const dueBalance = Number(selectedOption?.dataset.balance);

        if (!feeRecordId) {
            return showPaymentMessage("Please select a student fee record.");
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return showPaymentMessage("Enter a valid payment amount.");
        }

        if (Number.isFinite(dueBalance) && amount > dueBalance) {
            return showPaymentMessage(
                "The payment cannot exceed the outstanding balance."
            );
        }

        const payload = {
            feeRecordId: Number(feeRecordId),
            amount,
            paymentDate: els.paymentDate.value,
            paymentMethod: els.paymentMethod.value,
            referenceNumber: els.paymentReference.value.trim() || null
        };

        if (!payload.paymentDate || !payload.paymentMethod) {
            return showPaymentMessage(
                "Complete the payment date and payment method."
            );
        }

        setSaving(true);
        clearPaymentMessage();

        try {
            await apiPost(API_ENDPOINTS.payments, payload);

            closePaymentModal();
            showPageMessage(
                "Payment recorded successfully.",
                "success"
            );

            await loadFeeData();
        } catch (error) {
            showPaymentMessage(
                error?.message || "The payment could not be saved."
            );
            handleApiError(error);
        } finally {
            setSaving(false);
        }
    }

    function setSaving(saving) {
        state.saving = saving;
        els.savePaymentButton.disabled = saving;
        els.savePaymentButton.textContent =
            saving ? "Saving..." : "Save Payment";
    }

    function showPaymentMessage(message) {
        els.paymentFormMessage.textContent = message;
        els.paymentFormMessage.classList.remove("hidden");
    }

    function clearPaymentMessage() {
        els.paymentFormMessage.textContent = "";
        els.paymentFormMessage.classList.add("hidden");
    }

    /* ------------------------- CSV ------------------------- */

    function exportCsv() {
        if (!state.filtered.length) {
            showPageMessage(
                "There are no fee records to export.",
                "error"
            );
            return;
        }

        const headers = [
            "Admission Number",
            "Student",
            "Class",
            "Section",
            "Total Fee",
            "Paid",
            "Balance",
            "Due Date",
            "Status"
        ];

        const rows = state.filtered.map((record) => [
            record.admissionNumber ?? "",
            record.studentName ?? record.fullName ?? "",
            record.className ?? "",
            record.sectionName ?? "",
            getTotal(record),
            getPaid(record),
            getBalance(record),
            record.dueDate ?? "",
            getStatus(record)
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map(csvEscape).join(","))
            .join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "power-school-fee-report.csv";
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function csvEscape(value) {
        const text = String(value ?? "");
        return `"${text.replace(/"/g, '""')}"`;
    }

    /* ------------------------- Helpers --------------------- */

    function getRecordId(record) {
        const value = record.feeRecordId ?? record.id;
        return value === undefined || value === null ? null : value;
    }

    function getTotal(record) {
        return numberValue(record.totalFee ?? record.totalAmount);
    }

    function getPaid(record) {
        return numberValue(record.paidAmount ?? record.amountPaid);
    }

    function getBalance(record) {
        if (record.balance !== undefined && record.balance !== null) {
            return numberValue(record.balance);
        }

        return Math.max(0, getTotal(record) - getPaid(record));
    }

    function getStatus(record) {
        const rawStatus = String(record.status ?? "").toUpperCase();

        if (["PAID", "PARTIAL", "PENDING", "OVERDUE"].includes(rawStatus)) {
            return rawStatus;
        }

        if (getBalance(record) <= 0) return "PAID";

        if (
            record.dueDate &&
            record.dueDate < localDateInputValue()
        ) {
            return "OVERDUE";
        }

        if (getPaid(record) > 0) return "PARTIAL";
        return "PENDING";
    }

    function statusLabel(status) {
        return ({
            PAID: "Paid",
            PARTIAL: "Partially paid",
            PENDING: "Pending",
            OVERDUE: "Overdue"
        })[status] || status;
    }

    function numberValue(value) {
        const number = Number(value ?? 0);
        return Number.isFinite(number) ? number : 0;
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(numberValue(value));
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(`${value}`.slice(0, 10) + "T00:00:00");

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function localDateInputValue() {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset)
            .toISOString()
            .slice(0, 10);
    }

    function updateDate() {
        const now = new Date();

        els.sidebarDay.textContent = now.toLocaleDateString("en-IN", {
            weekday: "long"
        });

        els.sidebarDate.textContent = now.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function showPageMessage(message, type = "error") {
        els.pageMessage.textContent = message;
        els.pageMessage.className = `page-message ${type}`;
    }

    function clearPageMessage() {
        els.pageMessage.textContent = "";
        els.pageMessage.className = "page-message hidden";
    }

    function handleApiError(error) {
        if (error?.status === 401) {
            if (typeof clearAuthentication === "function") {
                clearAuthentication();
            }
            window.location.href = "../../index.html";
            return;
        }

        if (error?.status === 403) {
            showPageMessage(
                "Your account does not have permission to manage fees.",
                "error"
            );
            return;
        }

        showPageMessage(
            error?.message || "Unable to complete the request.",
            "error"
        );
    }
});