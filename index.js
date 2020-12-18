// https://stackoverflow.com/questions/20853142/trying-to-detect-browser-close-event
// $(document).ready(function(){
//   $(window).bind("beforeunload", function() {
//       return "Do you really want to close?";
//   });
// })
//
// $(document).hover(function(e){
//   console.log(e)
// })


var firebaseConfig = {
  apiKey: "AIzaSyAFkXUIBpvMXL8OWWbrlYgHwvsql-UG_4o",
  authDomain: "rps-firebase-c3762.firebaseapp.com",
  databaseURL: "https://rps-firebase-c3762-default-rtdb.firebaseio.com",
  projectId: "rps-firebase-c3762",
  storageBucket: "rps-firebase-c3762.appspot.com",
  messagingSenderId: "66561934367",
  appId: "1:66561934367:web:4581319ce288780ac7812a"
};
firebase.initializeApp(firebaseConfig);

firebaseUpdatesForGame();

function setGameData(){
  firebase.database().ref("gameStats").set({ties: 0, playerOne: {wins: 0, losses: 0, choice: "TBD", joined: false}, playerTwo: {wins: 0, losses: 0, choice: "TBD", joined: false}})
}

function updateHtmlOnPlayerJoined(player, playerJoined){
  if(playerJoined){
    defaultDisabledButton("#"+ player + "-join-game-button")
  } else {
    enableJoinButton("#"+ player + "-join-game-button")
  }
}

function bothPlayersJoined(){
  firebase.database().ref("gameStats").on("value", function(snapshot){
    var playerOneJoined = snapshot.val().playerOne.joined;
    var playerTwoJoined = snapshot.val().playerTwo.joined;

    if(playerOneJoined && playerTwoJoined){
      updateHtmlWhenBothPlayersHaveJoined();
    } else if (!playerOneJoined && !playerTwoJoined){
      gameReset();
    } else if (playerOneJoined && !playerTwoJoined){
      enableJoinButton("#player-two-join-game-button")
    }

  });
}

function updateHtmlOnPlayersJoining(){
  firebase.database().ref("gameStats").on("value", function(snapshot){
    var playerOneJoined = snapshot.val().playerOne.joined;
    updateHtmlOnPlayerJoined("player-one", playerOneJoined)

    var playerTwoJoined = snapshot.val().playerTwo.joined;
    updateHtmlOnPlayerJoined("player-two", playerTwoJoined)
  });
}

function gameReset(){
  var playerOneButtonHtml = "<div id='player-one-join-game-button-div'><button class='join-game-buttons' id='player-one-join-game-button' data-firebase-ref='playerOne' data-player='player-one'>Player One Join</button></div><div class='choices' id='player-one-choices'></div>";
  $(".player-one-game-div").html(playerOneButtonHtml)
  var playerTwoButtonHtml = "<button class='join-game-buttons' id='player-two-join-game-button' data-firebase-ref='playerTwo' data-player='player-two' disabled='disabled' style='cursor: default; box-shadow: none;'>Player Two Join</button><div class='choices' id='player-two-choices'></div>";
  $(".player-two-game-div").html(playerTwoButtonHtml)
  $(".game-stats").empty();
}

function updateHtmlWhenBothPlayersHaveJoined(){
  $(".choices > button").attr("disabled", false);
  $(".player-two-game-div > p").text("Player Two Has Joined");
}

function firebaseUpdatesForGame(){
  setGameData();
  setPlayerOneHtmlForPlayerTwoScreen();
  updateHtmlForBothPlayersStats();
  updateHtmlOnPlayersJoining();
  bothPlayersJoined();
}

$(document).on('click', '.join-game-buttons', function(){
  var firebaseRef = $(this).data("firebase-ref")
  var player = $(this).data("player")

  setPlayerJoinedInFirebase(firebaseRef)
  populateChoicesForPlayer("#"+player+"-choices", player, firebaseRef);
  bothPlayersJoined();
  appendStatsOnPlayersJoining(player)

  if(player == "player-one"){
    appendWaitingForPlayerTwoContent();
    setPlayerOneJoinedButton();
  }
});

var appendWaitingForPlayerTwoContent = () => {
  var p = $("<p>");
  p.text("Waiting on Player Two")
  p.css("margin-top", "100px")
  $(".player-two-game-div").empty()
  $(".player-two-game-div").append(p)
}

function setPlayerOneJoinedButton(){
  var joinedButtonState = "<button class='join-game-buttons' id='player-one-join-game-button' disabled='disabled' style='box-shadow: none; cursor: default;'>Player One Join</button>"
  $("#player-one-join-game-button-div").html(joinedButtonState);
}

function setPlayerJoinedInFirebase(player){
  firebase.database().ref("gameStats/"+player+"/joined").set(true)
}

function setPlayerOneHtmlForPlayerTwoScreen(){
  firebase.database().ref("gameStats").on("value", function(snapshot){
    if(snapshot.val().playerOne.joined && !snapshot.val().playerTwo.joined){
      var span = $("<div>");
      span.css("margin-top", "110px");
      span.text("Player One has Joined");
      $("#player-one-join-game-button-div").empty();
      $("#player-one-join-game-button-div").append(span);
    }
  })
}

$(document).on("click", ".choice-buttons", function(){
  var player = $(this).data("player");
  var playerChoice = $(this).data("choice");

  setChoiceForPlayer(player, playerChoice);

  playerClickedTheirChoice();
  checkIfBothPlayersHaveChosen();
})

var populateChoicesForPlayer = (choicesDiv, player, firebaseRef) => {
  var choices = ['rock', 'paper', 'scissor'];

  for(var i = 0; i < choices.length; i++){
    var p = $("<p>");
    var choiceButton = $("<button>");
    choiceButton.attr("id", choices[i] + "-choice-button-" + player)
    choiceButton.addClass("choice-buttons " + player + "-choice-buttons")
    choiceButton.attr("disabled", true)
    choiceButton.text(choices[i].charAt(0).toUpperCase() + choices[i].substring(1, choices[i].length))
    choiceButton.attr("data-choice", choices[i]);
    choiceButton.attr("data-player", firebaseRef)
    $(choicesDiv).append(p).append(choiceButton);
  }
}

function setChoiceForPlayer(player, choice){
  firebase.database().ref("gameStats/"+player+"/choice").set(choice)
}

function defaultDisabledButton(playerButton){
  $(playerButton).attr("disabled", true);
  $(playerButton).css("cursor", "default");
  $(playerButton).css("box-shadow", "none");
}

function enableJoinButton(playerButton){
  $(playerButton).attr("disabled", false);
  $(playerButton).addClass("join-game-buttons");
}

$(document).on("mouseover", ".join-game-buttons", function(){
  boxShadowButtonOnHover(this);
});

$(document).on("mouseleave", ".join-game-buttons", function(){
  noBoxShadowButtonOnMouseLeave(this);
});

function boxShadowButtonOnHover(element){
  if($(element).attr("disabled") != "disabled"){
    $(element).css("box-shadow", "2px 2px 5px rgba(1, 1, 0, .7)")
    $(element).css("cursor", "pointer");
  }
}

function noBoxShadowButtonOnMouseLeave(element){
  if($(element).attr("disabled") != "disabled"){
    $(element).css("box-shadow", "none")
  }
}

function playerClickedTheirChoice(){
  var playerOneChoice = null;
  var playerTwoChoice = null;

  firebase.database().ref("gameStats").on("value", function(snapshot){
    var didPlayerOneChoose = snapshot.val().playerOne.choice != "TBD"
    var didPlayerTwoChoose = snapshot.val().playerTwo.choice != "TBD"
    var playerOneChoice = snapshot.val().playerOne.choice;
    var playerTwoChoice = snapshot.val().playerTwo.choice;

    if(didPlayerOneChoose && didPlayerTwoChoose){
      gameLogic(playerOneChoice, playerTwoChoice)
    } else if (didPlayerOneChoose && !didPlayerTwoChoose){

    } else if (!didPlayerOneChoose && !didPlayerTwoChoose){

    }
  });
}

function gameLogic(playerOneGuess, playerTwoGuess){
  if(playerOneGuess == playerTwoGuess){
    updateGameTies();
  } else if (playerOneGuess == "paper" && playerTwoGuess == "rock"){
    updatePlayerStat("playerOne", "wins");
    updatePlayerStat("playerTwo", "losses");
  } else if (playerOneGuess == "rock" && playerTwoGuess == "scissor"){
    updatePlayerStat("playerOne", "wins");
    updatePlayerStat("playerTwo", "losses");
  } else if (playerOneGuess == "scissor" && playerTwoGuess == "paper"){
    updatePlayerStat("playerOne", "wins");
    updatePlayerStat("playerTwo", "losses");
  } else if (playerOneGuess == "rock" && playerTwoGuess == "paper"){
    updatePlayerStat("playerOne", "losses");
    updatePlayerStat("playerTwo", "wins");
  } else if (playerOneGuess == "paper" && playerTwoGuess == "scissor"){
    updatePlayerStat("playerOne", "losses");
    updatePlayerStat("playerTwo", "wins");
  } else if (playerOneGuess == "scissor" && playerTwoGuess == "rock"){
    updatePlayerStat("playerOne", "losses");
    updatePlayerStat("playerTwo", "wins");
  }
}

function getGameTies(){
  return firebase.database().ref("gameStats/ties").once("value").then(function(snapshot){
    return snapshot.val();
  })
}

function updateGameTiesFirebase(){
  getGameTies().then(function(val){
    var updatedGameTies = val + 1
    firebase.database().ref("gameStats/ties").set(updatedGameTies);
  });
}

function updateGameTiesHtml(){
  firebase.database().ref("gameStats/ties").on("value", function(snapshot){
    $("#player-one-ties").text(snapshot.val());
    $("#player-two-ties").text(snapshot.val());
  });
}

function updateGameTies(){
  updateGameTiesFirebase();
  updateGameTiesHtml();
}

function getPlayerStat(player, stat){
  return firebase.database().ref("gameStats/"+player+"/"+stat+"").once("value").then(function(snapshot){
    return snapshot.val();
  })
}

function updatePlayerStatFirebase(player, stat){
  getPlayerStat(player, stat).then(function(val){
    var updatedPlayerStats = val + 1
    firebase.database().ref("gameStats/"+player+"/"+stat+"").set(updatedPlayerStats);
  });
}

function updatePlayerStatHtml(player, stat){
  var htmlRef = player == "playerOne" ? "player-one" : "player-two";
  firebase.database().ref("gameStats/"+player+"/"+stat+"").on("value", function(snapshot){
    $("#"+htmlRef+"-"+stat+"").text(snapshot.val());
  });
}

function updatePlayerStat(player, stat){
  updatePlayerStatFirebase(player, stat);
  updatePlayerStatHtml(player, stat);
}

function appendStatsOnPlayersJoining(player){
  var tiesHtml = "<h3>Ties: <span id='"+player+"-ties'>0</span></h3>"
  var winsHtml = "<h3>Wins: <span id='"+player+"-wins'>0</span></h3>"
  var lossesHtml = "<h3>Losses: <span id='"+player+"-losses'>0</span></h3>"
  $(".game-stats").html(tiesHtml + winsHtml + lossesHtml)
}

function updateHtmlForBothPlayersStats(){
  updatePlayerStatHtml("playerOne", "wins");
  updatePlayerStatHtml("playerOne", "losses");
  updatePlayerStatHtml("playerTwo", "wins");
  updatePlayerStatHtml("playerTwo", "losses");
  updateGameTiesHtml();
}

function resetGameChoices(){
  firebase.database().ref("gameStats/playerOne/choice").set("TBD");
  firebase.database().ref("gameStats/playerTwo/choice").set("TBD");
}

function disableChoiceButtons(){
  $(".player-one-choice-buttons").attr("disabled", true)
  $(".player-two-choice-buttons").attr("disabled", true)
}

function enableChoiceButtons(){
  $(".player-one-choice-buttons").attr("disabled", false)
  $(".player-two-choice-buttons").attr("disabled", false)
}

function checkIfBothPlayersHaveChosen(){
  var playerOneChoice;
  var playerTwoChoice;

  firebase.database().ref("gameStats").on("value", function(snapshot){
    var playerOneChoice = snapshot.val().playerOne.choice != "TBD"
    var playerTwoChoice = snapshot.val().playerTwo.choice != "TBD"
    if(playerOneChoice && playerTwoChoice){
      enableChoiceButtons();
      resetGameChoices();
    } else if (playerOneChoice && !playerTwoChoice){
      $(".player-one-choice-buttons").attr("disabled", true)
    } else if (!playerOneChoice && playerTwoChoice){
      $(".player-two-choice-buttons").attr("disabled", true)
    } else if (!playerOneChoice && !playerTwoChoice) {
      resetGameChoices();
      enableChoiceButtons();
    }
  });
}
