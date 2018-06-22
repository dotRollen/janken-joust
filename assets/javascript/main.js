const app = {
    players: {
        playerOne: {
            name: '',
            choice: '',
            wins: '',
            loses: '',
        },
        playerTwo: {
            name: '',
            choice: '',
            wins: '',
            loses: '',
        },
    },
    turn: {},
    chat: {},
};

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCBUHs2G8hK3_U-GqYbk5LSTG_p33BmWfc",
    authDomain: "rock-paper-scissors-5cb1c.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-5cb1c.firebaseio.com",
    projectId: "rock-paper-scissors-5cb1c",
    storageBucket: "",
    messagingSenderId: "640511078897"
};

firebase.initializeApp(config);

//Reference to the database
var database = firebase.database();

//Reference to data storage location for player objects
var playersRef = database.ref("/players");

//Reference special location of client connection state
var connectedRef = database.ref(".info/connected");

//When the client's connection state changes
connectedRef.on("value", function(snapshot) {
    //If they are connected
    if (snapshot.val()) {
        //Add user to the connections list
        var con = playersRef.push(true);
        //Remove user from the connection list when they disconnect
        con.onDisconnect().remove()
    }
});

//Function for when user connects to app, displays total users in html
playersRef.on("value", function(snapshot) {
    $("body").append("<strong>" + snapshot.numChildren() + "</strong>");
})
