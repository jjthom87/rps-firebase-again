// https://stackoverflow.com/questions/20853142/trying-to-detect-browser-close-event

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
  firebase.database().ref("playersJoined").set({playerOneJoined: false, playerTwoJoined: false});

  firebase.database().ref("playerOneWins").set(0);
  firebase.database().ref("playerTwoWins").set(0);
  firebase.database().ref("playerOneLosses").set(0);
  firebase.database().ref("playerTwoLosses").set(0);
  firebase.database().ref("gameTies").set(0);

  firebase.database().ref("playersChoices").set({playerOneChoice: "TBD", playerTwoChoice: "TBD"});
}

function updateHtmlOnPlayerJoined(player, playerJoined){
  if(playerJoined){
    defaultDisabledButton("#"+ player + "-join-game-button")
  } else {
    enableJoinButton("#"+ player + "-join-game-button")
  }
}

function bothPlayersJoined(){
  firebase.database().ref("playersJoined").on("value", function(snapshot){
    var playerOneJoined = snapshot.val().playerOneJoined;
    var playerTwoJoined = snapshot.val().playerTwoJoined;

    if(playerOneJoined && playerTwoJoined){
      updateHtmlWhenBothPlayersHaveJoined();
    } else if (!playerOneJoined && !playerTwoJoined){
      defaultDisabledButton("#player-two-join-game-button")
    } else if (playerOneJoined && !playerTwoJoined){
      enableJoinButton("#player-two-join-game-button")
    }

  });
}

function updateHtmlOnPlayersJoining(){
  firebase.database().ref("playersJoined").on("value", function(snapshot){
    var playerOneJoined = snapshot.val().playerOneJoined;
    updateHtmlOnPlayerJoined("player-one", playerOneJoined)

    var playerTwoJoined = snapshot.val().playerTwoJoined;
    updateHtmlOnPlayerJoined("player-two", playerTwoJoined)
  });
}

function updateHtmlWhenBothPlayersHaveJoined(){
  $(".choices > button").attr("disabled", false);
  $(".player-two-game-div > p").text("Player Two Has Joined");
}

function firebaseUpdatesForGame(){
  setGameData();
  updateHtmlForBothPlayersStats();
  updateHtmlOnPlayersJoining();
  bothPlayersJoined();
}

$(".join-game-buttons").click(function(){
  var firebaseRef = $(this).data("firebase-ref")
  var player = $(this).data("player")

  setPlayerJoinedInFirebase(firebaseRef)
  populateChoicesForPlayer("#"+player+"-choices", player, firebaseRef);
  bothPlayersJoined();
  appendStatsOnPlayersJoining(player)

  if(player == "player-one"){
    appendWaitingForPlayerTwoContent();
    setPlayerOneJoinedButton()
  } else {
    setPlayerOneHtmlForPlayerTwoScreen();
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
  firebase.database().ref("playersJoined/"+player+"Joined").set(true)
}

function setPlayerOneHtmlForPlayerTwoScreen(){
  firebase.database().ref("playersJoined").on("value", function(snapshot){
    if(snapshot.val().playerOneJoined){
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
  firebase.database().ref("playersChoices/"+player+"Choice").set(choice)
}

function defaultDisabledButton(playerButton){
  $(playerButton).attr("disabled", true);
  $(playerButton).css("cursor", "default");
  $(playerButton).css("box-shadow", "none");
}

function enableJoinButton(playerButton){
  $(playerButton).attr("disabled", false)
  $(playerButton).css("box-shadow", "2px 2px 5px rgba(1, 1, 0, .7)")
  $(playerButton).css("cursor", "pointer");
}

function playerClickedTheirChoice(){
  var playerOneChoice = null;
  var playerTwoChoice = null;

  firebase.database().ref("playersChoices").on("value", function(snapshot){
    var didPlayerOneChoose = snapshot.val().playerOneChoice != "TBD"
    var didPlayerTwoChoose = snapshot.val().playerTwoChoice != "TBD"
    var playerOneChoice = snapshot.val().playerOneChoice;
    var playerTwoChoice = snapshot.val().playerTwoChoice;

    if(didPlayerOneChoose && didPlayerTwoChoose){
      gameLogic(playerOneChoice, playerTwoChoice)
    }
  });
}

function gameLogic(playerOneGuess, playerTwoGuess){
  if(playerOneGuess == "paper" && playerTwoGuess == "paper"){
    updateGameTies();
  } else if (playerOneGuess == "rock" && playerTwoGuess == "rock"){
    updateGameTies();
  } else if (playerOneGuess == "scissor" && playerTwoGuess == "scissor"){
    updateGameTies();
  } else if (playerOneGuess == "paper" && playerTwoGuess == "rock"){
    updatePlayerOneWins();
    updatePlayerTwoLosses();
  } else if (playerOneGuess == "rock" && playerTwoGuess == "scissor"){
    updatePlayerOneWins();
    updatePlayerTwoLosses();
  } else if (playerOneGuess == "scissor" && playerTwoGuess == "paper"){
    updatePlayerOneWins();
    updatePlayerTwoLosses();
  } else if (playerOneGuess == "rock" && playerTwoGuess == "paper"){
    updatePlayerOneLosses();
    updatePlayerTwoWins();
  } else if (playerOneGuess == "paper" && playerTwoGuess == "scissor"){
    updatePlayerOneLosses();
    updatePlayerTwoWins();
  } else if (playerOneGuess == "scissor" && playerTwoGuess == "rock"){
    updatePlayerOneLosses();
    updatePlayerTwoWins();
  }
}

function getGameTies(){
  return firebase.database().ref("gameTies").once("value").then(function(snapshot){
    return snapshot.val();
  })
}

function updateGameTiesFirebase(){
  getGameTies().then(function(val){
    var updatedGameTies = val + 1
    firebase.database().ref("gameTies").set(updatedGameTies);
  });
}

function updateGameTiesHtml(){
  firebase.database().ref("gameTies").on("value", function(snapshot){
    $("#player-one-ties").text(snapshot.val());
    $("#player-two-ties").text(snapshot.val());
  });
}

function updateGameTies(){
  updateGameTiesFirebase();
  updateGameTiesHtml();
}

function getPlayerOneLosses(){
  return firebase.database().ref("playerOneLosses").once("value").then(function(snapshot){
    return snapshot.val();
  })
}

function updatePlayerOneLossesFirebase(){
  getPlayerOneLosses().then(function(val){
    var updatedPlayerOneLosses = val + 1
    firebase.database().ref("playerOneLosses").set(updatedPlayerOneLosses);
  });
}

function updatePlayerOneLossesHtml(){
  firebase.database().ref("playerOneLosses").on("value", function(snapshot){
    $("#player-one-losses").text(snapshot.val());
  });
}

function updatePlayerOneLosses(){
  updatePlayerOneLossesFirebase();
  updatePlayerOneLossesHtml();
}

function getPlayerOneWins(){
  return firebase.database().ref("playerOneWins").once("value").then(function(snapshot){
    return snapshot.val();
  })
}

function updatePlayerOneWinsFirebase(){
  getPlayerOneWins().then(function(val){
    var updatedPlayerOneWins = val + 1
    firebase.database().ref("playerOneWins").set(updatedPlayerOneWins);
  });
}

function updatePlayerOneWinsHtml(){
  firebase.database().ref("playerOneWins").on("value", function(snapshot){
    $("#player-one-wins").text(snapshot.val());
  });
}

function updatePlayerOneWins(){
  updatePlayerOneWinsFirebase();
  updatePlayerOneWinsHtml();
}

function getPlayerTwoLosses(){
  return firebase.database().ref("playerTwoLosses").once("value").then(function(snapshot){
    return snapshot.val();
  })
}

function updatePlayerTwoLossesFirebase(){
  getPlayerTwoLosses().then(function(val){
    var updatedPlayerTwoLosses = val + 1
    firebase.database().ref("playerTwoLosses").set(updatedPlayerTwoLosses);
  });
}

function updatePlayerTwoLossesHtml(){
  firebase.database().ref("playerTwoLosses").on("value", function(snapshot){
    $("#player-two-losses").text(snapshot.val());
  });
}

function updatePlayerTwoLosses(){
  updatePlayerTwoLossesFirebase();
  updatePlayerTwoLossesHtml();
}

function getPlayerTwoWins(){
  return firebase.database().ref("playerTwoWins").once("value").then(function(snapshot){
    return snapshot.val();
  })
}

function updatePlayerTwoWinsFirebase(){
  getPlayerTwoWins().then(function(val){
    var updatedPlayerTwoWins = val + 1
    firebase.database().ref("playerTwoWins").set(updatedPlayerTwoWins);
  });
}

function updatePlayerTwoWinsHtml(){
  firebase.database().ref("playerTwoWins").on("value", function(snapshot){
    $("#player-two-wins").text(snapshot.val());
  });
}

function updatePlayerTwoWins(){
  updatePlayerTwoWinsFirebase();
  updatePlayerTwoWinsHtml();
}

function appendStatsOnPlayersJoining(player){
  var tiesHtml = "<h3>Ties: <span id='"+player+"-ties'>0</span></h3>"
  var winsHtml = "<h3>Wins: <span id='"+player+"-wins'>0</span></h3>"
  var lossesHtml = "<h3>Losses: <span id='"+player+"-losses'>0</span></h3>"
  $(".game-stats").html(tiesHtml + winsHtml + lossesHtml)
}

function updateHtmlForBothPlayersStats(){
  updatePlayerTwoWinsHtml();
  updatePlayerTwoLossesHtml();
  updatePlayerOneWinsHtml();
  updatePlayerOneLossesHtml();
  updateGameTiesHtml()
}

function resetGameChoices(){
  firebase.database().ref("playersChoices/playerOneChoice").set("TBD");
  firebase.database().ref("playersChoices/playerTwoChoice").set("TBD");
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

  firebase.database().ref("playersChoices").on("value", function(snapshot){
    var playerOneChoice = snapshot.val().playerOneChoice != "TBD"
    var playerTwoChoice = snapshot.val().playerTwoChoice != "TBD"
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
