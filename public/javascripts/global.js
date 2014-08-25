// Userlist data array for filling in info box
var userListData = [];

// DOM Ready ==========================================================
$(document).ready(function(){

	// Populate the user table on initial page load
	populateTable();

	// Username link click
	$('#userList table tbody').on('click','td a.linkshowuser', showUserInfo);

	// Add User button click
	$('#btnAddUser').on('click',addUser);

	// Delete user link click
	/*Note the syntax we're using: when working with jQuery's ‘on' method, in order to capture dynamically inserted links, 
	you need to reference a static element on the page first. 
	That's why our selector is the table's tbody element – which remains constant regardless of adding or removing users – 
	and then we're specifying the specific links we're trying to catch in the .on parameters.*/
	$('#userList table tbody').on('click','td a.linkdeleteuser', deleteUser);
});

// Functions ==========================================================

// Fill table with data
function populateTable(){

	// Empty content string
	var tableContent = '';

	console.debug('Populating table');

	// jQuery AJAX call for JSON
	$.getJSON('/users/userlist',function(data){

		// Stick our user data array into a userlist variable in the global object
    	userListData = data;
    	console.debug('trying to get data');
    	console.debug('data is ' + JSON.stringify(data));

		// For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' + this.username + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
	});
};

function showUserInfo(event){

	// Prevent Link from Firing
	event.preventDefault();

	// Retrieve username from link rel attribute
	var thisUserName = $(this).attr('rel');

	// Get Index of object based on id value
	/* Comment from CWB: first we're using .map to apply a function to each object in our userListData array. 
	This will spit out a brand new array containing only whatever the function returns. 
	That function (the anonymous callback function using the userObj parameter) strictly returns the username. 
	So, basically, if our original data array contained two complete user objects, 
	then the array returned by our use of .map here would only contain usernames, and look like this: ['Bob', 'Sue'].
	So once we have THAT array, provided by .map, we're chaining indexOf, in combination with the username of our choice, 
	to get the array index of that username.
	So Bob would be zero, and Sue would be one. We can then use that number, stored as arrayPosition, 
	to go back to our original user data array and start pulling data, in the following code.*/
	var arrayPosition = userListData.map(function (arrayItem){
		return arrayItem.username;
	}).indexOf(thisUserName);

	// Get our User Object
	var thisUserObject = userListData[arrayPosition];

	// Populate Info Box
	$('#userInfoName').text(thisUserObject.fullname);
	$('#userInfoAge').text(thisUserObject.age);
	$('#userInfoGender').text(thisUserObject.gender);
	$('#userInfoLocation').text(thisUserObject.location);

};

function addUser(event){

	event.preventDefault();

	// Super basic validation - increase errorCount variable if any fields are left blank
	var errorCount = 0;
	$('#addUser input').each(function(index,val){
		if($(this).val() === '') {
			errorCount++;
		}
	});

	// Check and make sure errorCount's still at zero
	if (errorCount === 0){

		// If it is, compile all user info into one object
		var newUser = {
			'username' : $('#addUser fieldset input#inputUserName').val(),
			'email': $('#addUser fieldset input#inputUserEmail').val(),
			'fullname' : $('#addUser fieldset input#inputUserFullname').val(),
			'age' : $('#addUser fieldset input#inputUserAge').val(),
			'location': $('#addUser fieldset input#inputUserLocation').val(),
			'gender' : $('#addUser fieldset input#inputUserGender').val()
		}

		// Use AJAX to post the object to ur adduser service
		$.ajax({
			type: 'POST',
			data: newUser,
			url : '/users/adduser',
			dataType: 'JSON'
		}).done(function(response){

			// Check for successful (blank) response
			if (response.msg === ''){
				// Clear the form inputs
				$('#addUser fieldset input').val('');

				// Update the table
				populateTable();
			} else {

				// If something goes wrong, alert the error message that our service returned
				alert('Error: ' + response.msg);
			}
		});
	} else {

		// If errorCount is more than 0, error out
		alert ('Please fill in all fields');
		return false;
	}

}

// Delete User
function deleteUser(event){
	event.preventDefault();

	// Pop up a confirmation dialog
	var confirmation = confirm('Are you sure you want to delete this user?');

	// Check and make sure the user confirmed
	if (confirmation === true) {
		// If they did, do our delete
		$.ajax({
			type: 'DELETE',
			url: '/users/deleteuser/' + $(this).attr('rel')
		}).done(function(response){

			// Check for a successfull (blank) response
			if (response.msg === ''){

			} else {
				alert ('Error: ' + response.msg);
			}

			// Update the table
			populateTable();
		});
	} else{
		// If they said no to the confirm, do nothing
		return false;
	}

};