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

var playerOneJoined;
var playerTwoJoined;

firebase.database().ref("playerOneJoined").set(false);
firebase.database().ref("playerTwoJoined").set(false);
firebase.database().ref("amountOfPlayers").set(0);
firebase.database().ref("gameStarted").set(false);

firebase.database().ref("playerOneJoined").on("value", function(snapshot){
  if(snapshot.val()){
    $("#player-one-join-game-button").attr("disabled", true);
    $("#player-one-join-game-button").css("cursor", "default");
    $("#player-one-join-game-button").css("box-shadow", "none");
  } else {
    $("#player-one-join-game-button").attr("disabled", false);
    $(".choices").empty();
  }
})

firebase.database().ref("playerTwoJoined").on("value", function(snapshot){
  if(snapshot.val()){
    $("#player-two-join-game-button").attr("disabled", true)
    $("#player-two-join-game-button").css("cursor", "default");
    $("#player-two-join-game-button").css("box-shadow", "none");

    $(".player-two-game-div > p").text("Player Two Has Joined")
  } else {
    $("#player-two-join-game-button").attr("disabled", false)
    $(".choices").empty();
  }

})

$("#player-one-join-game-button").click(function(){
  firebase.database().ref("playerOneJoined").set(true)
  populateChoicesForPlayer("#player-one-choices");
  appendWaitingContent();

  ifBothPlayersJoined();
});

$("#player-two-join-game-button").click(function(){
  firebase.database().ref("playerTwoJoined").set(true)
  populateChoicesForPlayer("#player-two-choices");

  ifBothPlayersJoined();
});

ifBothPlayersJoined();

var populateChoicesForPlayer = (choicesDiv) => {
  var choices = ['rock', 'paper', 'scissor'];

  for(var i = 0; i < choices.length; i++){
    var p = $("<p>");
    var choiceButton = $("<button>");
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

function ifBothPlayersJoined(){
  var playerOneJoined = false;
  var playerTwoJoined = false;

  firebase.database().ref("playerOneJoined").on("value", function(playerOneShapshot){
    console.log(playerOneShapshot.val());
    playerOneJoined = playerOneShapshot.val();
    firebase.database().ref("playerTwoJoined").on("value", function(playerTwoShapshot){
      console.log(playerTwoShapshot.val());
      playerTwoJoined = playerTwoShapshot.val();
      if(playerOneJoined && playerTwoJoined){
        $(".choices > button").attr("disabled", false);
      }

    })
  })

}
