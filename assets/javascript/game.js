
"use strict";

var Game = (function() {

    var ref;
    var create;
    var creator = {};
    var joiner = {};
    var gameList;
    var arena;
    var refereeTimer;

    var STATE = {OPEN: 1, JOINED: 2, CHOICE: 3, READY: 4, BATTLE: 5, COMPLETE: 6};
    var CHOICES = {
        ROCK: {label: "Rock"},
        PAPER: {label: "Paper"},
        SCISSORS: {label: "Scissors"}
    };

    function enableCreateGame(enabled) {
        create.disabled = !enabled;
    }

    function addJoinGameButton(key, game) {
        var item = document.createElement("li");
        item.id = key;
        item.innerHTML = '<button ' +
            'class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button-accent">' +
            'Join ' + game.creator.displayName + '</button>';
        item.addEventListener("click", function() {
            joinGame(key);
        });

        gameList.appendChild(item);
    }

    function createGame() {
        enableCreateGame(false);

        var user = firebase.auth().currentUser;
        creator = {
            uid: user.uid,
            displayName: user.displayName,
            choice: null,
        };
        var currentGame = {
            creator: creator,
            state: STATE.OPEN
        };

        var key = ref.push();
        key.set(currentGame, function(error) {
            if(error) {
                UI.snackbar({message: "Error creating game"});
            } else {
                key.onDisconnect().remove();
                gameList.style.display = "none";
                watchGame(key.key);
            }
        })
    };

    function joinGame(key) {
        console.log("Attempting to join game: ", key);
        var user = firebase.auth().currentUser;
        joiner = {
            uid: user.uid,
            displayName: user.displayName,
            choice: null,
        };

        ref.child(key).transaction(function(game) {
            if (!game.joiner) {
                game.state = STATE.JOINED;
                game.joiner = joiner
            }
            return game;
        }, function(error, committed, snapshot) {
            if (committed) {
                if (snapshot.val().joiner.uid == user.uid) {
                    enableCreateGame(false);
                    watchGame(key);
                } else {
                    UI.snackbar({message: "Game already joined. Please choose another."});
                }
            } else {
                console.log("Could not commit when trying to join game", error);
                UI.snackbar({message: "Error joining game"});
            }
        })
    };

    function joinedGame(gameRef, game) {
        if (game.creator.uid == firebase.auth().currentUser.uid) {
            UI.snackbar({message: game.joiner.displayName + " has joined your game."});
            //wait a little bit
            window.setTimeout(function() {
                gameRef.update({state: STATE.CHOICE});
            }, 1000);
        }
    }

    function countDowntoChoice(gameRef, game) {
        var data = {};
        if (game.creator.uid == firebase.auth().currentUser.uid) {
            data = {
                state: STATE.READY,
                creator: creator
            };
        } else {
            data = {
                state: STATE.READY,
                joiner: joiner
            };
        };
        var count = 10;
        refereeTimer.innerHTML = count;
        results.style.display = "none";
        arena.style.display = "block";

        resetArena(game);
        
        var countDown = function() {
            if (count >= 1 ) {
                count--;
                refereeTimer.innerHTML = count;
                setTimeout(countDown, 1000)
            } else {
                window.setTimeout(function() {
                    gameRef.update(data);
                }, 2000);
            }
        }
        setTimeout(countDown, 1000);
    };

    function resetArena(game) {
        var player1 = document.querySelector("#player-1");
        var player2 = document.querySelector("#player-2");
        var choices = document.getElementsByClassName("choice");
        disableChoices(choices, false);
 
        Array.from(choices).forEach(function(element) {
            element.addEventListener('click', function(event) {
                var choice = event.target.getAttribute("data-choice");
                disableChoices(choices, true);
                if(game.creator.uid == firebase.auth().currentUser.uid){
                    creator.choice = choice;
                } else {
                    joiner.choice = choice;
                }
            });
        });

        if (game.creator.uid == firebase.auth().currentUser.uid) {
            player2.innerHTML = "You are Player 1";
        } else {
            player1.innerHTML = "You are Player 2";
        }
    }

    function disableChoices(choices, enabled){
        if(enabled) {
            Array.from(choices).forEach(function(element) {
                element.disabled = enabled;
            })
        } else {
            Array.from(choices).forEach(function(element) {
                element.disabled = enabled;
            })
        }
    }

    function displayChoice(game){
        arena.style.display = "none";
        results.style.display = "block";
        var playerOne = game.creator;
        var playerTwo = game.joiner;

        if (playerOne.choice == playerTwo.choice ) {
            results.innerHTML = `
            <h4>Results</h4>
            <p>${ playerOne.displayName }: ${ playerOne.choice }</p>
            <p>${ playerTwo.displayName }: ${ playerTwo.choice }</p>
            <h1>TIE!</h1>
            `;
        }

        else if (playerOne.choice === "rock" && playerTwo.choice === "paper" ){ 
            results.innerHTML = `
            <h4>Results</h4>
            <p>${ playerOne.displayName }: ${ playerOne.choice }</p>
            <p>${ playerTwo.displayName }: ${ playerTwo.choice }</p>
            <h1>${ playerTwo.displayName } Wins!</h1>
            `;
        }

        else if (playerOne.choice === "paper" && playerTwo.choice === "scissor"){
            results.innerHTML = `
            <h4>Results</h4>
            <p>${ playerOne.displayName }: ${ playerOne.choice }</p>
            <p>${ playerTwo.displayName }: ${ playerTwo.choice }</p>
            <h1>${ playerTwo.displayName } Wins!</h1>
            `;
        }

        else if (playerOne.choice === "scissor" && playerTwo.choice === "rock"){
            results.innerHTML = `
            <h4>Results</h4>
            <p>${ playerOne.displayName }: ${ playerOne.choice }</p>
            <p>${ playerTwo.displayName }: ${ playerTwo.choice }</p>
            <h1>${ playerTwo.displayName } Wins!</h1>
            `;
        }
        
        else {
            results.innerHTML = `
            <h4>Results</h4>
            <p>${ playerOne.displayName }: ${ playerOne.choice }</p>
            <p>${ playerTwo.displayName }: ${ playerTwo.choice }</p>
            <h1>${ playerOne.displayName } Wins!</h1>
            `;
        }
    }

    function watchGame(key) {
        var gameRef = ref.child(key);
        gameRef.on("value", function(snapshot) {
            var game = snapshot.val();
            console.log("Game update:", game);

            //if we get a null value, because remove - ignore it.
            if (!game) {
                UI.snackbar({message: "Game has finished. Please play again."});
                enableCreateGame(true);
                return
            }

            switch (game.state) {
                case STATE.JOINED:
                    console.log("state: joined");
                    joinedGame(gameRef, game);
                    break;
                case STATE.CHOICE:
                    console.log("state: choice");
                    countDowntoChoice(gameRef, game);
                    break;
                case STATE.READY:
                    console.log("state: ready");
                    displayChoice(game);
                    break;
            }
        })
    }

    return {
        init: function() {
            create = document.querySelector("#create-game");
            create.addEventListener("click", createGame);
            arena = document.querySelector("#arena");
            gameList = document.querySelector("#games ul");
            refereeTimer = document.querySelector("#referee #timer");
            
            ref = firebase.database().ref("/games");

            var openGames = ref.orderByChild("state").equalTo(STATE.OPEN);
            openGames.on("child_added", function(snapshot) {
                var data = snapshot.val();
                console.log("Game Added:", data);

                if (data.creator.uid != firebase.auth().currentUser.uid) {
                    addJoinGameButton(snapshot.key, data);
                }
            });

            openGames.on("child_removed", function(snapshot) {
                var item = document.querySelector("#" + snapshot.key);
                if (item) {
                    item.remove();
                }
            });
        },

        onlogin: function() {
            enableCreateGame(true);
        }
    }
})();
