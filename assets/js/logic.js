$(document).ready(function(){
	// 1. Link to Firebase
	  // Initialize Firebase
    var config = {
    apiKey: "AIzaSyBzbfPuwkU6nXnKRJXQI8BAKYbnpACiJbs",
    authDomain: "train-scheduler-79663.firebaseapp.com",
    databaseURL: "https://train-scheduler-79663.firebaseio.com",
    projectId: "train-scheduler-79663",
    storageBucket: "train-scheduler-79663.appspot.com",
    messagingSenderId: "985905902252"
    };
    firebase.initializeApp(config);

    var database = firebase.database();

	// 2. Button for adding Trains
	$("#submitTrain").on("click", function(event) {

        // Prevents page from refreshing
        event.preventDefault();

		// Grabs user input and assign to variables
		var trainName = $("#trainNameInput").val().trim();
		var destination = $("#destinationInput").val().trim();
		var trainTimeInput = moment($("#trainTimeInput").val().trim(), "HH:mm").subtract(10, "years").format("X");;
		var frequencyInput = $("#frequencyInput").val().trim();

		// Test for variables entered
		console.log(trainName);
		console.log(destination);
		console.log(trainTimeInput);
		console.log(frequencyInput);

		// Creates local "temporary" object for holding train data
		// Will push this to firebase
		database.ref().push({
			name:  trainName,
			destination: destination,
			trainTime: trainTimeInput,
            frequency: frequencyInput,
		});

	

		// clear text-boxes
		$("#trainNameInput").val("");
		$("#destinationInput").val("");
		$("#trainTimeInput").val("");
		$("#frequencyInput").val("");

		
	});

	database.ref().on("child_added", function(childSnapshot, prevChildKey){

        console.log(childSnapshot.val());
        console.log(childSnapshot.key);
        
        console.log(prevChildKey)

        database.ref().child(childSnapshot.key).update( {
            id: childSnapshot.key
        })

		// assign firebase variables to snapshots.
		var firebaseName = childSnapshot.val().name;
		var firebaseDestination = childSnapshot.val().destination;
		var firebaseTrainTimeInput = childSnapshot.val().trainTime;
		var firebaseFrequency = childSnapshot.val().frequency;
		
		var diffTime = moment().diff(moment.unix(firebaseTrainTimeInput), "minutes");
		var timeRemainder = moment().diff(moment.unix(firebaseTrainTimeInput), "minutes") % firebaseFrequency ;
		var minutes = firebaseFrequency - timeRemainder;

		var nextTrainArrival = moment().add(minutes, "m").format("hh:mm A"); 
		
		// Test for correct times and info
		console.log(minutes);
		console.log(nextTrainArrival);
		console.log(moment().format("hh:mm A"));
		console.log(nextTrainArrival);
		console.log(moment().format("X"));

        var key = childSnapshot.key
		// Append train info to table on page
		$("#trainTable > tbody").append(
            "<tr data-id = " + key + "><td class='name-"+key+"'>" + firebaseName + 
                "</td><td class='destination-"+key+"'>" + firebaseDestination + 
                    "</td><td class='frequency-"+key+"'>" + firebaseFrequency + " mins" + 
                        "</td><td class='next-arrival-"+key+"'>" + nextTrainArrival + 
                            "</td><td class='minutes-away-"+key+"'>" + minutes + 
                                "</td><td>" + "<button id='update'>X</button>" +
                                    "</td><td>" + "<button id='remove'>X</button>" +
                                        "</td></tr>");
        

    });
    

    var ref = firebase.database().ref();
    /* DELETE ROW */
    $("tbody").on('click','#remove', function(e) {

        var deleteRow = $(this).closest('tr');
        console.log(deleteRow);
        var rowId = deleteRow.data('id');
        //it should remove the firebase object in here
        console.log(rowId);
        ref.child(rowId).remove()

        .then(function() {
            //after firebase confirmation, remove table row
            deleteRow.remove();
        })
        .catch(function(error) {
            console.log('Synchronization failed');
        });  

    });

    var ref = firebase.database().ref();
    /* DELETE ROW */
    $("tbody").on('click','#update', function(e) {

        var updateRow = $(this).closest('tr');
        var rowId = updateRow.data('id');
        // var nextTrainArrival = "Next Train Arrival";
        // var minutes = "minutes";

        var name = $(".name-"+rowId+"").text();
        console.log(name);
        var destination = $(".destination-"+rowId+"").text();
        console.log(destination);
        var frequency = $(".frequency-"+rowId+"").text();
        console.log(frequency);
        var nextTrainArrival = $(".next-arrival-"+rowId+"").text();
        console.log(nextTrainArrival);
        var minutes = $(".minutes-away-"+rowId+"").text();
        console.log(minutes);

        $(updateRow).html("<td><input type='text' class='form-control' placeholder='"+name+"' id='name'></td>" + 
                            "<td><input type='text' class='form-control' placeholder='"+destination+"' id='destination'></td>" + 
                                "<td><input type='text' class='form-control' placeholder='"+frequency+"' id='frequency'></td>" +
                                    "<td><input type='text' class='form-control' placeholder='first train (military time)' id='firstTrain'></td>" +
                                        "<td>" +minutes+ "</td>" +
                                            "<td><button class='complete-update'>X</button></td>" +
                                                "<td><button id='remove'>X</button></td>");
            
                
    });

    $("tbody").on('click','.complete-update', function(e) {   
        
        var finalUpdateRow = $(this).closest('tr');
        var rowId = finalUpdateRow.data('id');

        var trainName = $("#name").val().trim();
        console.log(trainName);
        var destination = $("#destination").val().trim();
        console.log(destination);
		var trainTimeInput = moment($("#firstTrain").val().trim(), "HH:mm").subtract(10, "years").format("X");;
        console.log(trainTimeInput);
        var frequencyInput = $("#frequency").val().trim();
        console.log(frequencyInput);

        database.ref().child(rowId).update({
			name:  trainName,
			destination: destination,
			trainTime: trainTimeInput,
            frequency: frequencyInput,
        });
        
        var firebaseName = trainName;
		var firebaseDestination = destination;
		var firebaseTrainTimeInput = trainTimeInput;
		var firebaseFrequency = frequencyInput;
		
		var diffTime = moment().diff(moment.unix(firebaseTrainTimeInput), "minutes");
		var timeRemainder = moment().diff(moment.unix(firebaseTrainTimeInput), "minutes") % firebaseFrequency ;
		var minutes = firebaseFrequency - timeRemainder;

        var nextTrainArrival = moment().add(minutes, "m").format("hh:mm A");
        
        var key = rowId;
		// Append train info to table on page
		$(finalUpdateRow).html(
            "<td class='name-"+key+"'>" + firebaseName + 
                "</td><td class='destination-"+key+"'>" + firebaseDestination + 
                    "</td><td class='frequency-"+key+"'>" + firebaseFrequency + " mins" + 
                        "</td><td class='next-arrival-"+key+"'>" + nextTrainArrival + 
                            "</td><td class='minutes-away-"+key+"'>" + minutes + 
                                "</td><td>" + "<button id='update'>X</button>" +
                                    "</td><td>" + "<button id='remove'>X</button>" +
                                        "</td>");
    });


    // database.ref().on("child_changed", function(childSnapshot, prevChildKey){

    //     // console.log(childSnapshot.val());
    //     // console.log(childSnapshot.key);
        
    //     // console.log(prevChildKey)

    //     // database.ref().child(childSnapshot.key).update( {
    //     //     id: childSnapshot.key
    //     // })

	// 	// assign firebase variables to snapshots.
	// 	var firebaseName = childSnapshot.val().name;
	// 	var firebaseDestination = childSnapshot.val().destination;
	// 	var firebaseTrainTimeInput = childSnapshot.val().trainTime;
	// 	var firebaseFrequency = childSnapshot.val().frequency;
		
	// 	var diffTime = moment().diff(moment.unix(firebaseTrainTimeInput), "minutes");
	// 	var timeRemainder = moment().diff(moment.unix(firebaseTrainTimeInput), "minutes") % firebaseFrequency ;
	// 	var minutes = firebaseFrequency - timeRemainder;

	// 	var nextTrainArrival = moment().add(minutes, "m").format("hh:mm A"); 
		
	// 	// Test for correct times and info
	// 	console.log(minutes);
	// 	console.log(nextTrainArrival);
	// 	console.log(moment().format("hh:mm A"));
	// 	console.log(nextTrainArrival);
	// 	console.log(moment().format("X"));

    //     var key = childSnapshot.key
	// 	// Append train info to table on page
	// 	$("#trainTable > tbody").append(
    //         "<tr data-id = " + key + "><td class='name-"+key+"'>" + firebaseName + 
    //             "</td><td class='destination-"+key+"'>" + firebaseDestination + 
    //                 "</td><td class='frequency-"+key+"'>" + firebaseFrequency + " mins" + 
    //                     "</td><td class='next-arrival-"+key+"'>" + nextTrainArrival + 
    //                         "</td><td class='minutes-away-"+key+"'>" + minutes + 
    //                             "</td><td>" + "<button id='update'>X</button>" +
    //                                 "</td><td>" + "<button id='remove'>X</button>" +
    //                                     "</td></tr>");
        

    // });


});