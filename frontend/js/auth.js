/* =========================================
   POWER SCHOOL - AUTHENTICATION
========================================= */

const AUTH_TOKEN_KEY =
    "ps_token";

const AUTH_USER_KEY =
    "ps_user";


/* =========================================
   SAVE LOGIN
========================================= */

function saveAuthentication(
    loginResponse
) {

    sessionStorage.setItem(
        AUTH_TOKEN_KEY,
        loginResponse.token
    );


    sessionStorage.setItem(
        AUTH_USER_KEY,

        JSON.stringify({

            userId:
                loginResponse.userId,

            username:
                loginResponse.username,

            fullName:
                loginResponse.fullName,

            email:
                loginResponse.email,

            role:
                loginResponse.role
        })
    );
}


/* =========================================
   GET TOKEN
========================================= */

function getToken() {

    return sessionStorage.getItem(
        AUTH_TOKEN_KEY
    );
}


/* =========================================
   GET CURRENT USER
========================================= */

function getCurrentUser() {

    const user =
        sessionStorage.getItem(
            AUTH_USER_KEY
        );


    if (!user) {
        return null;
    }


    try {

        return JSON.parse(user);

    } catch {

        clearAuthentication();

        return null;
    }
}


/* =========================================
   CLEAR AUTHENTICATION
========================================= */

function clearAuthentication() {

    sessionStorage.removeItem(
        AUTH_TOKEN_KEY
    );

    sessionStorage.removeItem(
        AUTH_USER_KEY
    );
}


/* =========================================
   AUTHENTICATION CHECK
========================================= */

function isAuthenticated() {

    return Boolean(
        getToken()
    );
}


/* =========================================
   ROLE → DASHBOARD
========================================= */

function getDashboardForRole(
    role
) {

    switch (role) {

        case "ADMIN":

            return "pages/admin/dashboard.html";


        case "TEACHER":

            return "pages/teacher/dashboard.html";


        case "STUDENT":

            return "pages/student/dashboard.html";


        default:

            return null;
    }
}