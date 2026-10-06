/* =========================================
   POWER SCHOOL - LOGIN
========================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );

const usernameInput =
    document.getElementById(
        "username"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const usernameError =
    document.getElementById(
        "usernameError"
    );

const passwordError =
    document.getElementById(
        "passwordError"
    );

const loginError =
    document.getElementById(
        "loginError"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const loginButtonText =
    document.getElementById(
        "loginButtonText"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );


/* =========================================
   PASSWORD VISIBILITY
========================================= */

togglePassword.addEventListener(
    "click",
    () => {

        const isPassword =
            passwordInput.type ===
            "password";


        passwordInput.type =
            isPassword
                ? "text"
                : "password";


        togglePassword.textContent =
            isPassword
                ? "Hide"
                : "Show";


        togglePassword.setAttribute(
            "aria-label",

            isPassword
                ? "Hide password"
                : "Show password"
        );

    }
);


/* =========================================
   CLEAR ERRORS
========================================= */

function clearErrors() {

    usernameError.textContent =
        "";

    passwordError.textContent =
        "";

    loginError.textContent =
        "";

    loginError.classList.remove(
        "visible"
    );
}


/* =========================================
   FORM VALIDATION
========================================= */

function validateForm() {

    let valid = true;

    clearErrors();


    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;


    if (!username) {

        usernameError.textContent =
            "Username is required.";

        valid = false;
    }


    if (!password) {

        passwordError.textContent =
            "Password is required.";

        valid = false;
    }


    return valid;
}


/* =========================================
   LOADING STATE
========================================= */

function setLoading(
    isLoading
) {

    loginButton.disabled =
        isLoading;


    if (isLoading) {

        loginButton.classList.add(
            "loading"
        );

        loginButtonText.textContent =
            "Signing in...";

    } else {

        loginButton.classList.remove(
            "loading"
        );

        loginButtonText.textContent =
            "Sign In";
    }
}


/* =========================================
   LOGIN REQUEST
========================================= */

loginForm.addEventListener(
    "submit",

    async (event) => {

        event.preventDefault();


        /*
         * Prevent multiple submissions.
         */
        if (loginButton.disabled) {
            return;
        }


        if (!validateForm()) {
            return;
        }


        setLoading(true);


        try {

            const loginResponse =
                await apiRequest(
                    "/auth/login",

                    {
                        method: "POST",

                        body:
                            JSON.stringify({

                                username:
                                    usernameInput
                                        .value
                                        .trim(),

                                password:
                                    passwordInput
                                        .value

                            })
                    }
                );


            /*
             * Save JWT and user information.
             */
            saveAuthentication(
                loginResponse
            );


            /*
             * Determine dashboard.
             */
            const dashboard =
                getDashboardForRole(
                    loginResponse.role
                );


            if (!dashboard) {

                clearAuthentication();

                throw new Error(
                    "Your account does not have a valid role."
                );
            }


            /*
             * Redirect according to role.
             */
            window.location.href =
                dashboard;


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            /*
             * Never expose backend
             * implementation details.
             */
            if (
                error.status === 401 ||
                error.status === 403
            ) {

                loginError.textContent =
                    "Invalid username or password.";

            } else {

                loginError.textContent =
                    "Unable to sign in. Please check your credentials and try again.";
            }


            loginError.classList.add(
                "visible"
            );


        } finally {

            setLoading(false);
        }

    }
);


/* =========================================
   LIVE ERROR CLEARING
========================================= */

usernameInput.addEventListener(
    "input",
    () => {

        usernameError.textContent =
            "";

        loginError.classList.remove(
            "visible"
        );
    }
);


passwordInput.addEventListener(
    "input",
    () => {

        passwordError.textContent =
            "";

        loginError.classList.remove(
            "visible"
        );
    }
);