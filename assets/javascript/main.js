// Initialize Firebase
var config = {
    apiKey: "API-KEY",
    authDomain: "janken-joust.firebaseapp.com",
    databaseURL: "https://janken-joust.firebaseio.com",
    projectId: "janken-joust",
    storageBucket: "janken-joust.appspot.com",
    messagingSenderId: "170983198405"
};

firebase.initializeApp(config);

"use strict";

// Object for enabling the snackbar in Material Design Lite
var UI = (function() {
    return {
        snackbar: function(data) {
            document.querySelector("#snackbar").MaterialSnackbar.showSnackbar(data);
        },
    }
}());

// Object for user login, registration and log out
var Session = (function() {
    //keeps track of the user logged in state
    var loggedIn = false;

    function authStateChangeListener(user) {
        //When invoked it will check if the user is logged in, if the user is logged in
        //the function will display the logout button and disable the login button
        //it will also enable the game object and chat object features.
        if (user) {

            loggedIn = true;
            closeLoginDialog();
            document.querySelector("#login-btn").style.display = "none";
            document.querySelector("#logout-btn").style.display = "block";
            document.querySelector("#login-message").innerHTML = "Hello, " + user.displayName + "!";
            Chat.onlogin();
            Game.onlogin();

        } else {
            if (loggedIn) {
                loggedIn = false;
                window.location.reload();
                [send, messageField].forEach(function(item) {
                    item.disabled = !enable;
                })
            }
        }
    }

    function signInWithEmailandPassword() {
        //Allows user to log in using an e-mail address and password
        //this uses firebase authentication API to register and maintain a user
        var email = document.querySelector("#email");
        var password = document.querySelector("#password");

        firebase.auth().signInWithEmailAndPassword(email.value, password.value).then(function(user) {
            console.log("Signed in with user: ", user);
        }, function(error) {
            console.log("Sign in error: ", error);
        })
    }

    function closeLoginDialog() {
        //Closes the login dialog box once the user is logged in
        var dialog = document.querySelector("#login-dialog");
        if (dialog.open) {
            dialog.close();
        }
    }
    
    function submitCreateAccount() {
        //Takes the form values of of the registration form and submits it to
        //firebase for registering a new user
        var displayName = document.querySelector("#entry-displayname");
        var email = document.querySelector("#entry-email");
        var password = document.querySelector("#entry-password");

        firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
        .then(function() {
            user = firebase.auth().currentUser;
            console.log('Create user and sign in Success', user);
            user.updateProfile({
                displayName: displayName.value,
            });
            createDialog.close();
            closeLoginDialog();
        }, function(error) {
            //In case the user does not register succesfully this will
            //send an error message to console log.
            console.error('Create user and sign in Error', error);
            createDialog.close();
            closeLoginDialog();
        });
    }

    return {
        //Returns object when invoked, init allows the following to be initialized when
        // the function is invoked. Setting off a series of required eventlisteners
        // and functions.
        init: function() {
            firebase.auth().onAuthStateChanged(authStateChangeListener);

            //Required by Material Design lite to support dialog boxes on platforms 
            // that are not Google Chrome
            var loginDialog = document.querySelector("#login-dialog");
            dialogPolyfill.registerDialog(loginDialog);

            //Adds event listener to the login button, opens the login dialog when clicked
            document.querySelector("#login-btn").addEventListener("click", function() {
                loginDialog.showModal();
            });

            //Event listener that invokes the sign in function when a user enters form data and clicks
            // on login
            document.querySelector("#sign-in").addEventListener("click", signInWithEmailandPassword);
            
            //Signouts a user from firebase when clicking on the logout button, returns a feedback 
            //message if the logout is successfull or unsuccessfull
            document.querySelector("#logout-btn").addEventListener("click", function() {
                firebase.auth().signOut().then(function() {
                    console.log('Signed Out');
                }, function(error) {
                    console.error('Sign Out Error', error);
                });
            });
            
            //Required by Material Design lite to support dialog boxes on platforms 
            // that are not Google Chrome
            createDialog = document.querySelector("#create-account-dialog");
            dialogPolyfill.registerDialog(createDialog);

            //Opens the registration dialog when create account button is clicked
            document.querySelector("#create-account").addEventListener("click", function() {
                createDialog.showModal();
            });

            //Submits the form data for registration when a user clicks submit
            document.querySelector("#entry-submit").addEventListener("click", submitCreateAccount);

        },
    }
}());

//Object for user chat functionality
var Chat = (function() {

    //Global variables needed to capture form data and state of a message being sent 
    //and current messages available.
    var send;
    var messageField;
    var messages;


    function enableChat(enable) {
        //When a user is either logged out or sent a message, the chat feature will
        //be disabled and will enable when this function is called
        console.log("enabling chat: ", enable);
        [send, messageField].forEach(function(item) {
            item.disabled = !enable;
        })
    }

    function sendChatMessage() {
        //Sends chat message to firebase database
        enableChat(false);
        //Disables the chat feature so the user cannot send another message/spam while 
        //current message is being appended to the firebase database.
        chatRef.push().set({
            //takes the current user display name from the firebase authentication api and
            // the message from the input field on the HTML and appends it as an object to
            // the firebase chat object in firebase.
            name: firebase.auth().currentUser.displayName,
            message: messageField.value
        }, function(error) {
            if(error) {
                //In case the message does not save in the database this will
                //post an error for troubleshooting.
                console.log("Error saving data", error);
                //uses the material design lite snackbar to give the user feedback
                UI.snackbar({message: "Error sending message"});
            } else {
                //When a message is sent succsefully this will empty the HTML input field
                messageField.value = "";
            }
            //Enables the chat for the user to be allowed to send a message again
            enableChat(true);
        })
    }

    function addChatMessage(name, message) {
        //Takes the displayname and message from the firebase database and appends it
        //to the HTML chat box
        var item = document.createElement("li");
        item.innerHTML = ("<strong>" + name + ":</strong> " + message );

        var messageList = messages.querySelector("ul");
        messageList.appendChild(item);
        //Sets the size of the chat box to be according to the message list for scrolling
        messages.scrollTop = messageList.scrollHeight;

    };

    return {
        init: function() {
            send = document.querySelector("#send-chat");
            messageField = document.querySelector("#chat-input");
            messages = document.querySelector("#chat-messages");
            
            //Grabs the chat object from the firebase database for reference
            //in later functions append/display
            chatRef = firebase.database().ref("/chat");

            //Event listener for when a user clicks the send chat message button
            send.addEventListener("click", sendChatMessage);
            
            chatRef.on("child_added", function(snapshot) {
                //Firebase event listener, when a item is added to the chat object on
                //firebase this will trigger the message being captured from the snapshot
                //and invoked with addChatMessage to display on HTML
                var message = snapshot.val();
                addChatMessage(message.name, message.message);
            });
        },

        onlogin: function() {
            //When a user is logged in this will enable their chat functionality
            enableChat(true);
        }
    }
})();

window.onload = function() {
    //Initializes all the class objects to setup for the proper functionality
    // of the full app features
    Session.init();
    Chat.init();
    Game.init();
};
