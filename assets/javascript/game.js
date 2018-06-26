// Game

var STATE = {OPEN: 1, JOINED: 2, };

// {
//     "creator": {"displayName": "", "uid": ""},
//     "joiner": {"displayName": "", "uid": ""},
//     "state": 2,
// }

ref = firebase.database().ref("/games");

function createGame() {
    var user = firebase.auth().currentUser;
    var currentGame = {
        creator: {uid: user.uid, displayName: user.displayName},
        state: STATE.OPEN
    };

    ref.push().set(currentGame);
}

function joinGame(key) {
    var user = firebase.auth().currentUser;
    var gameRef = ref.child(key);
    gameRef.transaction(function(game) {
        if (!game.joiner) {
            game.state = STATE.JOINED;
            game.joiner = {uid: user.uid, displayName: user.displayName}
        }
        return game;
    })
}

ref = firebase.database().ref("/games");
var openGames = ref.orderByChild("state").equalTo(STATE.OPEN);
openGames.on("child_added", function(snapshot) {
    var data = snapshot.val();

    if (data.creator.uid != firebase.auth().currentUser.uid) {
        addJoinGameButton(snapshot.key, data);
    }
});

openGames.on("child_removed", function(snapshot) {
    var item = $("#" + snapshot.key);
    if (item) {
        item.remove();
    }
});

function watchGame(key) {
    var gameRef = ref.child(key);
    gameRef.on("value", function(snapshot) {
        var game = snapshot.val();
        switch (game.state) {
            case STATE.JOINED: joinedGame(gameRef, game); break;
            case STATE.TAKE_PICTURE: countDowntoTakePicture(gameRef, game); break;
            case STATE.UPLOADED_PICTURE: displayUploadedPicture(game);
                                         detectMyFace(gameRef, game); break;
            case STATE.FACE_DETECTED: displayDetectedEmotion(game);
                                      determineWinner(gameRef, game); break;
            case STATE.COMPLETE: showWinner(game); break;
        }
    })
}

function takePicture(gameRef, game) {
    var canvas = $("<canvas>");
    canvas.attr("width", "640");
    canvas.attr("height", "480");
    var context = canvas.getContext("2d");
    var cam = $("#cam");
    context.drawImage(cam, 0, 0, canvas.attr("width"), canvas.attr("height"));

    canvas.toBlob(function(blob) {

    });
}