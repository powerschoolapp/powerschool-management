/* =========================================
   ADMIN DASHBOARD
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* -------------------------------------
       AUTHENTICATION CHECK
    -------------------------------------- */

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "../../index.html";
        return;
    }

    if (currentUser.role !== "ADMIN") {
        window.location.href = "../../index.html";
        return;
    }


    /* -------------------------------------
       USER INFORMATION
    -------------------------------------- */

    const fullName =
        currentUser.fullName ||
        currentUser.username ||
        "Administrator";


    const welcomeUserName =
        document.getElementById("welcomeUserName");

    const topbarUserName =
        document.getElementById("topbarUserName");

    const userAvatar =
        document.getElementById("userAvatar");


    if (welcomeUserName) {
        welcomeUserName.textContent = fullName;
    }


    if (topbarUserName) {
        topbarUserName.textContent = fullName;
    }


    if (userAvatar) {

        const firstLetter =
            fullName.trim().charAt(0).toUpperCase();

        userAvatar.textContent =
            firstLetter || "A";
    }


    /* -------------------------------------
       DATE
    -------------------------------------- */

    updateDate();


    /* -------------------------------------
       MOBILE SIDEBAR
    -------------------------------------- */

    const sidebar =
        document.getElementById("sidebar");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const sidebarClose =
        document.getElementById("sidebarClose");


    function openSidebar() {

        sidebar?.classList.add("sidebar-open");

        sidebarOverlay?.classList.add("active");
    }


    function closeSidebar() {

        sidebar?.classList.remove("sidebar-open");

        sidebarOverlay?.classList.remove("active");
    }


    mobileMenuButton?.addEventListener(
        "click",
        openSidebar
    );


    sidebarClose?.addEventListener(
        "click",
        closeSidebar
    );


    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );


    /* -------------------------------------
       NAVIGATION
    -------------------------------------- */

    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach((item) => {

        item.addEventListener("click", (event) => {

            const href =
                item.getAttribute("href");


            if (!href || href === "#") {

                event.preventDefault();

                navItems.forEach((navItem) => {
                    navItem.classList.remove("active");
                });

                item.classList.add("active");

                closeSidebar();
            }

        });

    });


    /* -------------------------------------
       LOGOUT
    -------------------------------------- */

    const logoutButton =
        document.getElementById("logoutButton");


    logoutButton?.addEventListener(
        "click",
        () => {

            logoutButton.disabled = true;

            logoutButton.innerHTML = `
                <span>...</span>
                <span>Logging out</span>
            `;


            clearAuthentication();

            window.location.href =
                "../../index.html";
        }
    );

});


/* =========================================
   DATE FUNCTION
========================================= */

function updateDate() {

    const now = new Date();


    const dayFormatter =
        new Intl.DateTimeFormat(
            "en-IN",
            {
                weekday: "long"
            }
        );


    const dateFormatter =
        new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    const day =
        dayFormatter.format(now);


    const date =
        dateFormatter.format(now);


    const currentDay =
        document.getElementById("currentDay");

    const currentDate =
        document.getElementById("currentDate");

    const welcomeDate =
        document.getElementById("welcomeDate");


    if (currentDay) {
        currentDay.textContent = day;
    }


    if (currentDate) {
        currentDate.textContent = date;
    }


    if (welcomeDate) {
        welcomeDate.textContent = date;
    }

}