// Initialize Firebase
var config = {
    apiKey: "AIzaSyAAP4q4Ot6jtVGW8obXh64XHO4AAsdsZFQ",
    authDomain: "janken-joust.firebaseapp.com",
    databaseURL: "https://janken-joust.firebaseio.com",
    projectId: "janken-joust",
    storageBucket: "janken-joust.appspot.com",
    messagingSenderId: "170983198405"
};

firebase.initializeApp(config);

"use strict";

var UI = (function() {

    return {
        snackbar: function(data) {
            document.querySelector("#snackbar").MaterialSnackbar.showSnackbar(data);
        },
    }
}());

var Session = (function() {
    var loggedIn = false;

    function authStateChangeListener(user) {
        console.log("Auth state change: ", user);
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
        var email = document.querySelector("#email");
        var password = document.querySelector("#password");

        firebase.auth().signInWithEmailAndPassword(email.value, password.value).then(function(user) {
            console.log("Signed in with user: ", user);
        }, function(error) {
            console.log("Sign in error: ", error);
        })
    }

    function closeLoginDialog() {
        var dialog = document.querySelector("#login-dialog");
        if (dialog.open) {
            dialog.close();
        }
    }
    
    // function userAvatar(email) {

    // }

    function submitCreateAccount() {
        //fields
        var displayName = document.querySelector("#entry-displayname");
        var email = document.querySelector("#entry-email");
        var password = document.querySelector("#entry-password");

        firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
        .then(function() {
            user = firebase.auth().currentUser;
            console.log('Create user and sign in Success', user);
            //add the displayName
            user.updateProfile({
                displayName: displayName.value,
                // photoURL: userAvatar(email);
            });
            createDialog.close();
            closeLoginDialog();
        }, function(error) {
            console.error('Create user and sign in Error', error);
            createDialog.close();
            closeLoginDialog();
        });
    }

    return {
        init: function() {
            firebase.auth().onAuthStateChanged(authStateChangeListener);

            //login
            var loginDialog = document.querySelector("#login-dialog");
            dialogPolyfill.registerDialog(loginDialog);
            document.querySelector("#login-btn").addEventListener("click", function() {
                loginDialog.showModal();
            });
            document.querySelector("#sign-in").addEventListener("click", signInWithEmailandPassword);
            
            //logout
            document.querySelector("#logout-btn").addEventListener("click", function() {
                firebase.auth().signOut().then(function() {
                    console.log('Signed Out');
                }, function(error) {
                    console.error('Sign Out Error', error);
                });
            });
            
            //create accounts
            createDialog = document.querySelector("#create-account-dialog");
            dialogPolyfill.registerDialog(createDialog);
            document.querySelector("#create-account").addEventListener("click", function() {
                createDialog.showModal();
            });
            document.querySelector("#entry-submit").addEventListener("click", submitCreateAccount);

        },
    }
}());

var Chat = (function() {
    var send;
    var messageField;
    var messages;

    function enableChat(enable) {
        console.log("enabling chat: ", enable);
        [send, messageField].forEach(function(item) {
            item.disabled = !enable;
        })
    }
    function sendChatMessage() {
        enableChat(false);
        chatRef.push().set({
            name: firebase.auth().currentUser.displayName,
            message: messageField.value
        }, function(error) {
            if(error) {
                console.log("Error saving data", error);
                UI.snackbar({message: "Error sending message"});
            } else {
                messageField.value = "";
                messageField.parentElement.classList.remove("is-dirty");
            }

            enableChat(true);
        })
    }

    function addChatMessage(name, message) {
        var item = document.createElement("li");
        item.innerHTML = ("<strong>" + name + ":</strong> " + message );

        var messageList = messages.querySelector("ul");
        messageList.appendChild(item);
        messages.scrollTop = messageList.scrollHeight;

    };

    return {
        init: function() {
            send = document.querySelector("#send-chat");
            messageField = document.querySelector("#chat-input");
            messages = document.querySelector("#chat-messages");
            
            chatRef = firebase.database().ref("/chat");

            send.addEventListener("click", sendChatMessage);
            
            chatRef.on("child_added", function(snapshot) {
                var message = snapshot.val();
                addChatMessage(message.name, message.message);
            });
        },

        onlogin: function() {
            enableChat(true);
        }
    }
})();

window.onload = function() {
    Session.init();
    Chat.init();
    Game.init();
};