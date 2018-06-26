const session = {
    loginHTML: function () {
        var form = $("<form>"),
            formGroup1 = $("<div>").addClass("form-group"),
            emailLabel = $("<label>").attr("for", "email-input").html(`
                    <i class="far fa-envelope"></i> Email address
                `),
            emailInput = $("<input>").attr({
                    "type": "email",
                    "class": "form-control",
                    "id": "email-input",
                    "aria-describedby": "emailHelp",
                    "placeholder": "Enter email",
                    "required": "",
                }),
            formGroup2 = $("<div>").addClass("form-group"),
            passwordLabel = $("<label>").attr("for", "password-input").html(`
                    <i class="fas fa-key"></i> Password
                `),
            passwordInput = $("<input>").attr({
                "type": "password",
                "class": "form-control",
                "id": "password-input",
                "placeholder": "Password",
                "required": "",
            }),
            submitBtn = $("<button>").attr({
                    "type": "submit",
                    "class": "btn btn-primary"
                }).text("Sign In"),
            registerBtn = $("<button>").attr({
                "type": "button",
                "class": "btn btn-secondary",
                "id": "register",
            }).text("Register");
            
            
            formGroup1.append(emailLabel).append(emailInput);
            formGroup2.append(passwordLabel).append(passwordInput);
            form.append(formGroup1).append(formGroup2).append(submitBtn).append(" ")
                .append(registerBtn);

            return form;
    },
    registerHTML: function () {
        var form = $("<form>"),
            formGroup1 = $("<div>").addClass("form-group"),
            displayLabel = $("<label>").attr("for", "new-display").html(`
                    <i class="far fa-id-badge"></i> Display Name
                `),
            displayInput = $("<input>").attr({
                    "type": "text",
                    "class": "form-control",
                    "id": "new-display",
                    "placeholder": "Enter public display name",
                    "required": "",
                }),
            formGroup2 = $("<div>").addClass("form-group"),
            emailLabel = $("<label>").attr("for", "new-email").html(`
                    <i class="far fa-envelope"></i> Email address
                `),
            emailInput = $("<input>").attr({
                    "type": "email",
                    "class": "form-control",
                    "id": "new-email",
                    "placeholder": "Enter email",
                    "required": "",
                }),
            formGroup3 = $("<div>").addClass("form-group"),
            passwordLabel = $("<label>").attr("for", "new-password").html(`
                    <i class="fas fa-key"></i> Password
                `),
            passwordInput = $("<input>").attr({
                "type": "password",
                "class": "form-control",
                "id": "new-password",
                "placeholder": "Password",
                "required": "",
            }),
            submitBtn = $("<button>").attr({
                    "type": "submit",
                    "class": "btn btn-primary",
                    "id": "sign-up",
                }).text("Sign Up");

            formGroup1.append(displayLabel).append(displayInput);
            formGroup2.append(emailLabel).append(emailInput);
            formGroup3.append(passwordLabel).append(passwordInput);
            form.append(formGroup1).append(formGroup2).append(formGroup3)
                .append(submitBtn);

            return form;
    }
}

function submitCreateAccount() {
    var displayName = $("#new-displayname");
    var email = $("#new-email");
    var password = $("#new-password");

    firebase.auth().createUserWithEmailAndPassword(email.val().trim(), password.val().trim())
        .then(function (user) {
            //add the displayName
            user.updateProfile({
                displayName: displayName
            });

        })
};

function signInWithEmailandPassword() {
    var email = $("#email-input").val().trim();
    var password = $("#password-input").val().trim();

    firebase.auth().signInWithEmailandPassword(email, password);
}

//Authentication listener if user is logged in or not
firebase.auth().onAuthStateChanged( function(user) {
    if (user) {
        var displayName = user.displayName;
        $("#btn-login").html(`
        <button type="button" class="btn form-inline" id="sign-out">
        <i class="fas fa-sign-out-alt"></i> Sign Out
        </button></span>
        `)
    } else {
        $(".modal-body").append(session.loginHTML());
    }
});

$("body").on("click", "#register", function () {
    $(".modal-body").html(session.registerHTML().html());
});


$("body").on("click", "#sign-in", function() {
    submitCreateAccount()
});

$("body").on("click", "#sign-out", function() {
    firebase.auth().signOut();
});