// Userlist data array for filling in info box
var userListData = [];

// DOM Ready ==========================================================
$(document).ready(function(){

	// Populate the user table on initial page load
	populateTable();

	// Username link click
	$('#userList table tbody').on('click','td a.linkshowuser', showUserInfo);

	// Add User button click
	$('#btnHandleUser').on('click',addUser);

	// Delete user link click
	/*Note the syntax we're using: when working with jQuery's ‘on' method, in order to capture dynamically inserted links, 
	you need to reference a static element on the page first. 
	That's why our selector is the table's tbody element – which remains constant regardless of adding or removing users – 
	and then we're specifying the specific links we're trying to catch in the .on parameters.*/
	$('#userList table tbody').on('click','td a.linkdeleteuser', deleteUser);
});

// Functions ==========================================================

// Fill table with data
function populateTable(callback){

	// Empty content string
	var tableContent = '';

	console.log('populateTable - Populating table');

	// jQuery AJAX call for JSON
	$.getJSON('/users/userlist',function(data){

		// Stick our user data array into a userlist variable in the global object
    	userListData = data;
    	console.log('populateTable - trying to get data at ' + (new Date()).getTime());
    	console.log('populateTable - userlistData is ' + JSON.stringify(userListData));
    	

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

        if (callback != null){
			callback();
		}
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
	thisUserObject = getUserObject(thisUserName);
	populateUserInfo(thisUserObject);

	// Change Add mode to Modify mode
	$('#btnHandleUser').off('click',addUser);
	$('#btnHandleUser').on('click',modifyUser);
	$('#handleUser h2').text('Modify User Form');
	$('#btnHandleUser').text('Submit to Modify User');

	// Fill Modify User form
	$('#handleUser fieldset input#inputUserName').val(thisUserObject.username);
	$('#handleUser fieldset input#inputUserEmail').val(thisUserObject.email);
	$('#handleUser fieldset input#inputUserFullname').val(thisUserObject.fullname);
	$('#handleUser fieldset input#inputUserAge').val(thisUserObject.age);
	$('#handleUser fieldset input#inputUserLocation').val(thisUserObject.location);
	$('#handleUser fieldset input#inputUserGender').val(thisUserObject.gender);
	$('#handleUser fieldset button#btnHandleUser').attr('rel',thisUserObject._id);

};

function getUserObject(username){
	console.log('getUserObject - Populating User Info box for username "' + username + '"! Oh yeah!');

    console.log('getUserObject - trying to get data at ' + (new Date()).getTime());
    console.log('getUserObject - userlistData is ' + JSON.stringify(userListData));

	var arrayPosition = userListData.map(function (arrayItem){
		return arrayItem.username;
	}).indexOf(username);

	// Get our User Object
	return userListData[arrayPosition];
}

function populateUserInfo(thisUserObject){

	// Populate Info Box
	$('#userInfoName').text(thisUserObject.fullname);
	$('#userInfoAge').text(thisUserObject.age);
	$('#userInfoGender').text(thisUserObject.gender);
	$('#userInfoLocation').text(thisUserObject.location);

	console.log('populateUserInfo - updating User Info box with [fullname:'+thisUserObject.fullname+',age:'+thisUserObject.age+',gender:'+thisUserObject.gender+',location:'+thisUserObject.location+']');
}

function addUser(event){

	event.preventDefault();

	console.log('Adding user');

	// Super basic validation - increase errorCount variable if any fields are left blank
	var errorCount = 0;
	$('#handleUser input').each(function(index,val){
		if($(this).val() === '') {
			errorCount++;
		}
	});

	// Check and make sure errorCount's still at zero
	if (errorCount === 0){

		// If it is, compile all user info into one object
		var newUser = {
			'username' : $('#handleUser fieldset input#inputUserName').val(),
			'email': $('#handleUser fieldset input#inputUserEmail').val(),
			'fullname' : $('#handleUser fieldset input#inputUserFullname').val(),
			'age' : $('#handleUser fieldset input#inputUserAge').val(),
			'location': $('#handleUser fieldset input#inputUserLocation').val(),
			'gender' : $('#handleUser fieldset input#inputUserGender').val()
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
				$('#handleUser fieldset input').val('');

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

function modifyUser(event){

	event.preventDefault();

	console.log('Modifying user');

	// Super basic validation - increase errorCount variable if any fields are left blank
	var errorCount = 0;
	$('#handleUser input').each(function(index,val){
		if($(this).val() === '') {
			errorCount++;
		}
	});


	// Check and make sure errorCount's still at zero
	if (errorCount === 0){

		// If it is, compile all user info into one object
		var updatedUser = {
			'username' : $('#handleUser fieldset input#inputUserName').val(),
			'email': $('#handleUser fieldset input#inputUserEmail').val(),
			'fullname' : $('#handleUser fieldset input#inputUserFullname').val(),
			'age' : $('#handleUser fieldset input#inputUserAge').val(),
			'location': $('#handleUser fieldset input#inputUserLocation').val(),
			'gender' : $('#handleUser fieldset input#inputUserGender').val()
		}

		// Use AJAX to post the object to ur adduser service
		var ajaxQuery = $.ajax({
			type: 'PUT',
			data: updatedUser,
			url : '/users/updateuser/' + $(this).attr('rel'),
			dataType: 'JSON'
		});


		ajaxQuery.done(function(response){

			// Check for successful (blank) response
			if (response.msg === ''){

				var username = $('#handleUser fieldset input#inputUserName').val();

				// Update the table
				populateTable(function(){
					// Update User Info table
					thisUserObject = getUserObject(username);
					populateUserInfo(thisUserObject);
				});

				// Clear the form inputs
				$('#handleUser fieldset input').val('');
				// Clear the rel attribute in the button
				//$('#handleUser fieldset button#btnHandleUser').removeAttr('rel');

				// Modification done: Change Modify mode to Add mode
				$('#btnHandleUser').off('click',modifyUser);
				$('#btnHandleUser').on('click',addUser);
				$('#handleUser h2').text('Add User Form');
				$('#btnHandleUser').text('Submit to Add User');

			} else {

				// If something goes wrong, alert the error message that our service returned
				alert('Error: ' + response.msg);				
			}
		});

		ajaxQuery.fail(function(ajaxQuery,text,error){
			console.log('text : ' + text);
			console.log('error : ' + error);
		});

	} else {

		// If errorCount is more than 0, error out
		alert ('Please fill in all fields');
		return false;
	}

	
}