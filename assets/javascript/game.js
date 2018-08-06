
"use strict";

var Game = (function() {

    //Global variables needed to pass information from one function to another
    var ref;
    var create;
    var creator = {};
    var joiner = {};
    var gameList;
    var arena;
    var refereeTimer;

    //Object to reference states of where the game session is currently
    var STATE = {OPEN: 1, JOINED: 2, CHOICE: 3, READY: 4};

    function enableCreateGame(enabled) {
        //Allows a user to create a game if enabled
        create.disabled = !enabled;
    }

    function addJoinGameButton(key, game) {
        //Creates a button for current user to allow other users to join the game
        var item = document.createElement("li");
        //Uses the key of the game object to allow the other user to join the correct game
        item.id = key;
        item.innerHTML = '<button ' +
            'class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button-accent">' +
            'Join ' + game.creator.displayName + '</button>';
        
        //Adds an eventlistener to the button and passes the key of the game object
        item.addEventListener("click", function() {
            joinGame(key);
        });

        //appends the button to the game list HTML
        gameList.appendChild(item);
    }

    function createGame() {
        //Creates a game for the current user

        //Disables the create game button
        enableCreateGame(false);

        //finds the current user to capture information to create the game
        var user = firebase.auth().currentUser;

        //Updates the creator object with the user information
        creator = {
            uid: user.uid,
            displayName: user.displayName,
            choice: null, 
        };

        //Creates an object wit the creator information and the current state of the game
        //being open
        var currentGame = {
            creator: creator,
            state: STATE.OPEN
        };

        //Captures the reference push into a key variable so the variable can be reference in other functions
        // for the reference object value key
        var key = ref.push();

        //Appends the currentGame object to the games object in the firebase database
        key.set(currentGame, function(error) {
            if(error) {
                UI.snackbar({message: "Error creating game"});
            } else {
                //Removes the object if the user disconnects 
                key.onDisconnect().remove();
                //hides the gamelist to prevent the user from joining other games while waiting
                gameList.style.display = "none";
                watchGame(key.key);
            }
        })
    };

    function joinGame(key) {
        //Function for a second user to join the game of another user
        //Takes the current user information into a user variable
        var user = firebase.auth().currentUser;

        //Updates the joiner object to the current user information
        joiner = {
            uid: user.uid,
            displayName: user.displayName,
            choice: null,
        };

        //Finds the game of the other user using the games object key value saved to the button
        ref.child(key).transaction(function(game) {
            //Checks if game does not already have a joiner in the game
            if (!game.joiner) {
                game.state = STATE.JOINED;
                game.joiner = joiner
            }
            //returns the game object found that matches
            return game;
        }, function(error, committed, snapshot) {
            if (committed) {
                if (snapshot.val().joiner.uid == user.uid) {
                    //checks if the current user is the joiner, if the current is the joiner
                    //then disable the gamelist feature for that current user
                    enableCreateGame(false);
                    //Starts a function that will check the phases of the game based on the 
                    //games object key value
                    watchGame(key);
                } else {
                    //If the game already has a joiner then the user will see a message
                    //in the snackbar for alerting them
                    UI.snackbar({message: "Game already joined. Please choose another."});
                }
            } else {
                //troubleshoot message in case the game fails to join
                UI.snackbar({message: "Error joining game"});
            }
        })
    };

    function joinedGame(gameRef, game) {
        //Alerts the creator that a user has joined thier game
        if (game.creator.uid == firebase.auth().currentUser.uid) {
            //Checks if the current user is the creator of the game object 
            // uses snackbar to alert the user that another user has joined their game
            UI.snackbar({message: game.joiner.displayName + " has joined your game."});
            //Set a time for user to wait, allows firebase to update the database before
            //the user moves on to the next phase
            window.setTimeout(function() {
                gameRef.update({state: STATE.CHOICE});
            }, 1000);
        }
    }

    function countDowntoChoice(gameRef, game) {
        //Function for allowing the user to pick a choice with a 10 second
        //countdown
        var data = {};

        if (game.creator.uid == firebase.auth().currentUser.uid) {
            //checks if the current user is a creator, if not then the user
            // is the joiner. The data object is updated to that user in the 
            // game
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
        //number variable for counting down
        var count = 10;
        //DOM elements for updating
        refereeTimer.innerHTML = count;
        results.style.display = "none";
        arena.style.display = "block";

        //Resets the game HTML and other elements
        resetArena(game);
        
        var countDown = function() {
            //Creates a 10 second countdown function, when countdown is over
            //the function will update the game object with the data object
            if (count >= 1 ) {
                count--;
                refereeTimer.innerHTML = count;
                setTimeout(countDown, 1000)
            } else {
                window.setTimeout(function() {
                    gameRef.update(data);
                }, 1000);
            }
        }
        //Invokes the countDown function
        countDown();
    };

    function resetArena(game) {
        //Resets the game choices for the player on the HTML, and sets elements by ID
        // into variables
        var player1 = document.querySelector("#player-1");
        var player2 = document.querySelector("#player-2");
        //Grabs an array of elements with the matching class choice
        var choices = document.getElementsByClassName("choice");

        //Enables the buttons with choice class regardless of whether they are disabled
        disableChoices(choices, false);
 
        Array.from(choices).forEach(function(element) {
            //runs through the array of buttons with the class choice to add an eventlistener
            element.addEventListener('click', function(event) {
                //gets the value of the data-choice attribute for the current element
                var choice = event.target.getAttribute("data-choice");
                //disables all choice buttons
                disableChoices(choices, true);
                if(game.creator.uid == firebase.auth().currentUser.uid){
                    //if the current user is the creator of the game object then add
                    //the element's choice to the creator otherwise added it to the
                    //joiner
                    creator.choice = choice;
                } else {
                    joiner.choice = choice;
                }
            });
        });

        if (game.creator.uid == firebase.auth().currentUser.uid) {
            //Indicates whether the player is player 1 or 2
            player2.innerHTML = "You are Player 1";
        } else {
            player1.innerHTML = "You are Player 2";
        }
    }

    function disableChoices(choices, enabled){
        //Takes an array of elements and disables or enables all those elements
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
        //Takes a game object and disables the arena div then enables the results div
        //this will match the creator and joiner's choice to decide who won
        arena.style.display = "none";
        results.style.display = "block";
        //Captures the two players based on the game object creator and joiner
        //then matches their choices for rock paper scissors
        var playerOne = game.creator;
        var playerTwo = game.joiner;

        if (playerOne.choice == playerTwo.choice ) {
            //if both players choose the same then the game ends with a tie
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
        //function that addes an event listener to the firebase game object
        // when ever a value in that game object is changed. It will trigger a function
        //that will set off a new phase of the game. This will run as soon as the first user
        //creates the game and will wait for another user to join the game.
        //The Key value is used to match the game object that was created with the game
        //reference taht will be tracked by this event listener.
        var gameRef = ref.child(key);

        gameRef.on("value", function(snapshot) {
            var game = snapshot.val();
            console.log("Game update:", game);

            if (!game) {
                //If the snapshot is no longer in the firebase database, then display an alert
                // that the game has ended. Game object is removed when either player disconnects
                UI.snackbar({message: "Game has finished. Please play again."});
                //reenables the create game feature
                enableCreateGame(true);
                return
            };

            //Invokes a function based on the state of the game, passes the game object information to that function
            //to allow changes and updates to the game object.
            if (game.state === STATE.JOINED) {
                console.log("state: joined");
                joinedGame(gameRef, game);
            };

            if (game.state === STATE.CHOICE ) {
                console.log("state: choice");
                countDowntoChoice(gameRef, game);
            };

            if (game.state === STATE.READY) {
                console.log("state: ready");
                displayChoice(game);
            };
        })
    }

    return {
        init: function() {
            //function for initializing the setup of the game
            create = document.querySelector("#create-game");
            create.addEventListener("click", createGame);
            arena = document.querySelector("#arena");
            gameList = document.querySelector("#games ul");
            refereeTimer = document.querySelector("#referee #timer");
            
            //creates a reference variable to the object games in the firebase database
            ref = firebase.database().ref("/games");

            //grabs all objects in games that have the a state value equal to the state.open object value
            //finds all games that are available to join.
            var openGames = ref.orderByChild("state").equalTo(STATE.OPEN);
           
            openGames.on("child_added", function(snapshot) {
                //firebase event listener that checks for when an object is added to the database.
                //captures that snapshot value into a variable for reference
                var data = snapshot.val();

                if (data.creator.uid != firebase.auth().currentUser.uid) {
                    //checks creator of the game is not the current user, this will create a button for a user
                    // to join the game. if the user is the creator the creator will not see this button ever.
                    addJoinGameButton(snapshot.key, data);
                }
            });

            openGames.on("child_removed", function(snapshot) {
                //adds an event listener for when an object is removed from the games object in the database,
                //the open gameslist will be updated with the removal of that game
                var item = document.querySelector("#" + snapshot.key);
                if (item) {
                    item.remove();
                }
            });
        },

        onlogin: function() {
            //when a user is logged in, the create a game button is enabled for them to use
            enableCreateGame(true);
        }
    }
})();
