
// Chat
function sendChatMessage() {
    ref = firebase.database().ref("/chat");
    messageField = $("#chat-message").val().trim();

    ref.push().set({
        name: firebase.auth().currentUser.displayName,
        message: messageField.value
    });
}

ref = firebase.database().ref("/chat");

ref.on("child_added", function(snapshot) {
    var message = snapshot.val();
    addChatMessage(message.name, message.message);
})
