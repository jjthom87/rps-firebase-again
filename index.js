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
  } else {
    $("#player-one-join-game-button").attr("disabled", false);
    $(".choices").empty();
  }
})

firebase.database().ref("playerTwoJoined").on("value", function(snapshot){
  if(snapshot.val()){
    $("#player-two-join-game-button").attr("disabled", true)
  } else {
    $("#player-two-join-game-button").attr("disabled", false)
    $(".choices").empty();
  }
})

$("#player-one-join-game-button").click(function(){
  firebase.database().ref("playerOneJoined").set(true)
  populateChoicesForPlayer("#player-one-choices");
});

$("#player-two-join-game-button").click(function(){
  firebase.database().ref("playerTwoJoined").set(true)
  populateChoicesForPlayer("#player-two-choices");
});

var populateChoicesForPlayer = (choicesDiv) => {
  var choices = ['rock', 'paper', 'scissor'];

  for(var i = 0; i < choices.length; i++){
    var choiceButton = $("<button>");
    choiceButton.text(choices[i].charAt(0).toUpperCase() + choices[i].substring(1, choices[i].length))
    choiceButton.attr("data-choice", choices[i]);
    $(choicesDiv).append(choiceButton);
  }

}
