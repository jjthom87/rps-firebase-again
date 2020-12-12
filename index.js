// https://stackoverflow.com/questions/20853142/trying-to-detect-browser-close-event

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAFkXUIBpvMXL8OWWbrlYgHwvsql-UG_4o",
  authDomain: "rps-firebase-c3762.firebaseapp.com",
  databaseURL: "https://rps-firebase-c3762-default-rtdb.firebaseio.com",
  projectId: "rps-firebase-c3762",
  storageBucket: "rps-firebase-c3762.appspot.com",
  messagingSenderId: "66561934367",
  appId: "1:66561934367:web:4581319ce288780ac7812a"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function setGameData(){
  console.log("in here for some reason")
  // firebase.database().ref("playerOneJoined").on("value", function(snapshot){
  //
  //   playerOneJoined = snapshot.val();

    // if(!playerOneJoined){
      firebase.database().ref("playerOneJoined").set(false);
      firebase.database().ref("playerTwoJoined").set(false);

      firebase.database().ref("playerOneChoice").set(null);
      firebase.database().ref("playerTwoChoice").set(null);

      firebase.database().ref("playerOneWins").set(0);
      firebase.database().ref("playerTwoWins").set(0);

      firebase.database().ref("playerOneLosses").set(0);
      firebase.database().ref("playerTwoLosses").set(0);

      firebase.database().ref("gameTies").set(0);

      firebase.database().ref("whoLastClicked").set(null);

      firebase.database().ref("choicesForPlayerOne").set({playerOneChoice: "TBD", playerTwoChoice: "TBD"})
      firebase.database().ref("choicesForPlayerTwo").set({playerOneChoice: "TBD", playerTwoChoice: "TBD"})

    // }
  // })

}

setGameData();

firebase.database().ref("playerOneJoined").on("value", function(snapshot){
  if(snapshot.val()){
    defaultDisabledButton("#player-one-join-game-button")
  } else {
    enableJoinButton("#player-one-join-game-button")
  }
})

firebase.database().ref("playerTwoJoined").on("value", function(snapshot){
  if(snapshot.val()){
    defaultDisabledButton("#player-one-join-game-button")

    $(".player-two-game-div > p").text("Player Two Has Joined")
  } else {
    enableJoinButton("#player-two-join-game-button")
  }

});

firebase.database().ref("gameTies").on("value", function(snapshot){
  $("#ties").text(snapshot.val())
});

$("#player-one-join-game-button").click(function(){
  firebase.database().ref("playerOneJoined").set(true)
  populateChoicesForPlayer("#player-one-choices", "player-one");
  appendWaitingContent();

  bothPlayerStatuses();
});

$("#player-two-join-game-button").click(function(){
  firebase.database().ref("playerTwoJoined").set(true)
  populateChoicesForPlayer("#player-two-choices", "player-two");

  $(this).attr("disabled", true);
  $(this).css("cursor", "default");
  $(this).css("box-shadow", "none");

  bothPlayerStatuses();
});

bothPlayerStatuses();
// checkIfBothPlayersHaveChosen();
// bothPlayerChoices()

$(document).on("click", "#paper-choice-button-player-one", function(){
  var playerOneChoice = $(this).data("choice");

  firebase.database().ref("choicesForPlayerOne/playerOneChoice").set(playerOneChoice)
  firebase.database().ref("choicesForPlayerTwo/playerOneChoice").set(playerOneChoice)

  // firebase.database().ref("playerOneChoice").set(playerOneChoice);
  // firebase.database().ref("whoLastClicked").set("player-one");
  // $(".player-one-choice-buttons").attr("disabled", true)
  // bothPlayerChoices();
  console.log("player one clicked a choice")

  checkIfBothPlayersHaveChosenPlayerOne()
})

$(document).on("click", "#paper-choice-button-player-two", function(){
  var playerTwoChoice = $(this).data("choice");

  firebase.database().ref("choicesForPlayerTwo/playerTwoChoice").set(playerTwoChoice)
  firebase.database().ref("choicesForPlayerOne/playerTwoChoice").set(playerTwoChoice)
  // firebase.database().ref("playerTwoChoice").set(playerTwoChoice)
  // $(".player-two-choice-buttons").attr("disabled", true)
  // bothPlayerChoices()
  console.log("player two clicked a choice")
  // firebase.database().ref("whoLastClicked").set("player-two");

  checkIfBothPlayersHaveChosenPlayerTwo()
})

var populateChoicesForPlayer = (choicesDiv, player) => {
  var choices = ['rock', 'paper', 'scissor'];

  for(var i = 0; i < choices.length; i++){
    var p = $("<p>");
    var choiceButton = $("<button>");
    choiceButton.attr("id", choices[i] + "-choice-button-" + player)
    choiceButton.addClass("choice-buttons " + player + "-choice-buttons")
    choiceButton.attr("disabled", true)
    choiceButton.text(choices[i].charAt(0).toUpperCase() + choices[i].substring(1, choices[i].length))
    choiceButton.attr("data-choice", choices[i]);
    $(choicesDiv).append(p).append(choiceButton);
  }

}

var appendWaitingContent = () => {
  var p = $("<p>");
  p.text("Waiting on Player Two")
  p.css("margin-top", "100px")
  $(".player-two-game-div").empty()
  $(".player-two-game-div").append(p)
}

var appendJoinedContent = () => {
  var p = $("<p>");
  p.text("Player One has joined")
  p.css("margin-top", "100px")
  $(".player-one-game-div").empty()
  $(".player-one-game-div").append(p)
}

function bothPlayerStatuses(){
  var playerOneJoined = false;
  var playerTwoJoined = false;

  firebase.database().ref("playerOneJoined").on("value", function(playerOneShapshot){
    playerOneJoined = playerOneShapshot.val();

    firebase.database().ref("playerTwoJoined").on("value", function(playerTwoShapshot){
      playerTwoJoined = playerTwoShapshot.val();

      if(playerOneJoined && playerTwoJoined){
        $(".choices > button").attr("disabled", false);
      } else if (!playerOneJoined && !playerTwoJoined){
        $("#player-two-join-game-button").attr("disabled", true)
      } else if (playerOneJoined && !playerTwoJoined){
        $("#player-two-join-game-button").attr("disabled", false)
      }

    })
  })

}

function defaultDisabledButton(playerButton){
  $(playerButton).attr("disabled", true);
  $(playerButton).css("cursor", "default");
  $(playerButton).css("box-shadow", "none");
}

function enableJoinButton(playerButton){
  $(playerButton).attr("disabled", false)
  $(".choices").empty();
}

function bothPlayerChoices(){
  var playerOneChoice = null;
  var playerTwoChoice = null;

  firebase.database().ref("playerOneChoice").on("value", function(playerOneShapshot){
    playerOneChoice = playerOneShapshot.val();
  });

  firebase.database().ref("playerTwoChoice").on("value", function(playerTwoShapshot){
    playerTwoChoice = playerTwoShapshot.val();

    // if(playerOneChoice && playerTwoChoice){
    //   gameLogic(playerOneChoice, playerTwoChoice)
    // } else if (playerOneChoice && !playerTwoChoice){
    //
    // } else if (!playerOneChoice && playerTwoChoice){
    //
    // } else {
    //
    // }

  });

  if(playerOneChoice && playerTwoChoice){
    gameLogic(playerOneChoice, playerTwoChoice)
  } else if (playerOneChoice && !playerTwoChoice){

  } else if (!playerOneChoice && playerTwoChoice){

  } else {

  }
}

function gameLogic(playerOneGuess, playerTwoGuess){
  if(playerOneGuess == "paper" && playerTwoGuess == "paper"){
    setGameTied();
  } else if (playerOneGuess == "rock" && playerTwoGuess == "rock"){
    setGameTied();
  } else if (playerOneGuess == "scissor" && playerTwoGuess == "scissor"){
    setGameTied();
  } else if (playerOneGuess == "paper" && playerTwoGuess == "rock"){
    player.wins++;
    game.roundWinner = "Player";
  } else if (playerOneGuess == "rock" && playerTwoGuess == "scissor"){
    player.wins++;
    game.roundWinner = "Player";
  } else if (playerOneGuess == "scissor" && playerTwoGuess == "paper"){
    player.wins++;
    game.roundWinner = "Player";
  } else if (playerOneGuess == "rock" && playerTwoGuess == "paper"){
    game.roundWinner = "Computer";
  } else if (playerOneGuess == "paper" && playerTwoGuess == "scissor"){
    game.roundWinner = "Computer";
  } else if (playerOneGuess == "scissor" && playerTwoGuess == "rock"){
    game.roundWinner = "Computer";
  }
}

function setGameTied(){
  var num;
  firebase.database().ref("gameTies").on("value", function(snapshot){
    num = snapshot.val();
  });
  num++
  firebase.database().ref("gameTies").set(num)

  resetGameChoices();
  enableChoiceButtons();
}

function resetGameChoices(){
  console.log("resetting Game Choices")
  firebase.database().ref("choicesForPlayerOne/playerOneChoice").set("TBD");
  firebase.database().ref("choicesForPlayerOne/playerTwoChoice").set("TBD");
  firebase.database().ref("choicesForPlayerTwo/playerOneChoice").set("TBD");
  firebase.database().ref("choicesForPlayerTwo/playerTwoChoice").set("TBD");
}

function disableChoiceButtons(){
  $(".player-one-choice-buttons").attr("disabled", true)
  $(".player-two-choice-buttons").attr("disabled", true)
}

function enableChoiceButtons(){
  $(".player-one-choice-buttons").attr("disabled", false)
  $(".player-two-choice-buttons").attr("disabled", false)
}

function checkIfBothPlayersHaveChosenPlayerOne(){
  console.log("ran this one")
  var i = 0;
  var playerOneChoice;
  var playerTwoChoice;

  firebase.database().ref("choicesForPlayerOne").on("value", function(snapshot){
    console.log("got there")
    console.log(snapshot.val())
    var playerOneChoice = snapshot.val().playerOneChoice != "TBD"
    var playerTwoChoice = snapshot.val().playerTwoChoice != "TBD"
    if(playerOneChoice && playerTwoChoice){
      enableChoiceButtons();
      resetGameChoices();
    } else if (playerOneChoice && !playerTwoChoice){
      console.log("line 294")
      $(".player-one-choice-buttons").attr("disabled", true)
    } else if (!playerOneChoice && playerTwoChoice){
      console.log("line 297")
      $(".player-two-choice-buttons").attr("disabled", true)
    } else if (!playerOneChoice && !playerTwoChoice) {
      console.log("line 300")
      resetGameChoices();
      enableChoiceButtons();
    }
  });
}

function checkIfBothPlayersHaveChosenPlayerTwo(){
  var playerOneChoice;
  var playerTwoChoice;
  firebase.database().ref("choicesForPlayerTwo").on("value", function(snapshot){
    console.log("got here")
    console.log(snapshot.val())
    var playerOneChoice = snapshot.val().playerOneChoice != "TBD"
    var playerTwoChoice = snapshot.val().playerTwoChoice != "TBD"
    if(playerOneChoice && playerTwoChoice){
      enableChoiceButtons();
      resetGameChoices();
    } else if (playerOneChoice && !playerTwoChoice){
      console.log("line 318")
      $(".player-one-choice-buttons").attr("disabled", true)
    } else if (!playerOneChoice && playerTwoChoice){
      console.log("line 321")
      $(".player-two-choice-buttons").attr("disabled", true)
    } else if (!playerOneChoice && !playerTwoChoice) {
      console.log("line 324")
      enableChoiceButtons();
    }
  });
}

function checkWithObject(){

}
