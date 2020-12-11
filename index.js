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

firebase.database().ref("playerOneJoined").set(false);
firebase.database().ref("playerTwoJoined").set(false);

firebase.database().ref("playerOneChoice").set(null);
firebase.database().ref("playerTwoChoice").set(null);

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

})

$("#player-one-join-game-button").click(function(){
  firebase.database().ref("playerOneJoined").set(true)
  populateChoicesForPlayer("#player-one-choices", "player-one");
  appendWaitingContent();

  bothPlayerStatuses();
});

$("#player-two-join-game-button").click(function(){
  firebase.database().ref("playerTwoJoined").set(true)
  populateChoicesForPlayer("#player-two-choices", "player-two");

  bothPlayerStatuses();
});

bothPlayerStatuses();

$(document).on("click", ".player-one-choice-buttons", function(){
  var playerOneChoice = $(this).data("choice");

  firebase.database().ref("playerOneChoice").set(playerOneChoice)

  bothPlayerChoices()
})

$(document).on("click", ".player-two-choice-buttons", function(){
  var playerTwoChoice = $(this).data("choice");

  firebase.database().ref("playerTwoChoice").set(playerTwoChoice)

  bothPlayerChoices()
})

var populateChoicesForPlayer = (choicesDiv, player) => {
  var choices = ['rock', 'paper', 'scissor'];

  for(var i = 0; i < choices.length; i++){
    var p = $("<p>");
    var choiceButton = $("<button>");
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

    firebase.database().ref("playerTwoChoice").on("value", function(playerTwoShapshot){
      playerTwoChoice = playerTwoShapshot.val();

      if(playerOneChoice && playerTwoChoice){
        console.log("IN HERE BITCH")
      } else if (playerOneChoice && !playerTwoChoice){

      } else if (!playerOneChoice && playerTwoChoice){

      } else {

      }

    });
  });
}

function gameLogic(playerOneGuess, playerTwoGuess){
  if(playerOneGuess == "paper" && playerTwoGuess == "paper"){
    game.ties++;
    game.roundWinner = "Tie";
  } else if (playerOneGuess == "rock" && playerTwoGuess == "rock"){
    game.ties++;
    game.roundWinner = "Tie";
  } else if (playerOneGuess == "scissor" && playerTwoGuess == "scissor"){
    game.ties++;
    game.roundWinner = "Tie";
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
