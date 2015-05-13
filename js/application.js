$( document ).ready(function(){
	'use strict';

	//***** GLOBAL VARIABLES *****//

	// This will become a list of all of the fields we want to include in the JSON object we're going to build.
	var allFields = [];
	var states = {};
	var selectedState = "AL";
	var userLocation = {};
	var checkboxMoved = false;
	var organizationsWithMatchingTags = [];
	var winWidth;
	var geoLocationAllowed = null;
	var locationFound;


	//***** HELPER FUNCTIONS *****//

	function buildAllFieldsArray(rawStatesData){
		$.each(rawStatesData[0], function(key){

			// Take the first row of our attached Google Spreadsheet and grab all of its keys that start with the letters "gsx". In other words, grab all of the relevent column titles from that Spreadsheet and place them in an array.
			if (/gsx*/.test(key)) {
				var shortenedTitle = key.substring(4);
				allFields.push(shortenedTitle);
			}
		});
	}

	function addFieldToOrganization(fieldValue, organizations, organizationNumber, field, sliceAmount){
		organizations['organization' + organizationNumber][field.slice(0, sliceAmount)] = fieldValue;
	}

	function convertAddressToHref(address){
		address = address.replace(/\s+/g, "+");
		return address;
	}

	function findNumOfOrgs(state){
		var stateOrgArray = [];
		$.each(state, function(key){
			if (/gsx\$org*/.test(key)){
				stateOrgArray.push(key);
			}
		});
		return stateOrgArray.length;
	}

	function splitCellContents(fieldValue){
		var rawArray = fieldValue.split(',');
		var trimmedArray = [];

		rawArray.forEach(function(value){
			trimmedArray.push(value.trim());
		});

		return trimmedArray;
	}

	function buildStatesObject(rawStatesData){
		var numOfOrgs = findNumOfOrgs(rawStatesData[0]);

		// Builds object containing all of the fields from our spreadsheet.
		rawStatesData.forEach(function (rawStateData){
			var data = {};
			var organizations = {};

			erasePreviousStateOrgs(numOfOrgs, organizations);

			// For each string value in our 'allFields' array...
			allFields.forEach(function (field){
				var fieldValue = rawStateData['gsx$' + field].$t;
				var orgNumArray = field.match(/\d+$/);
				if (orgNumArray !== null){
					var organizationNumber = orgNumArray[0];
				}

				// ...if the field is a tag, split the spreadsheet cells contents by comma, push each value into an array, and add that array to 'organizations.organization#.tags' as an array...
				if (/tagsorganization*/.test(field)){
					addFieldToOrganization(
						splitCellContents(fieldValue), //trimmedArray
						organizations,
						organizationNumber,
						field,
						4 //sliceAmount
					);

				// ...if the field is a contact, split the spreadsheet cells contents by comma, push each value into an array, and add that array to 'organizations.organization#.contacts' as an array...
				} else if (/contacts*/.test(field)){
					addFieldToOrganization(
						splitCellContents(fieldValue), //trimmedArray
						organizations,
						organizationNumber,
						field,
						8 //sliceAmount
					);

				} else if (/address*/.test(field)){
					if (fieldValue !== ""){
						fieldValue = convertAddressToHref(fieldValue);
						addFieldToOrganization(
							fieldValue,
							organizations,
							organizationNumber,
							field,
							7 // length of the word 'address'
						);
					}

				// ...if the field is org, description, or link add it to the 'organizations' object...
				} else if (/org*|description*|link*|geolocation*/.test(field)){
					var fieldSansNumbers = field.replace(/[0-9]/g, '');
					organizations['organization' + organizationNumber][fieldSansNumbers] = fieldValue;

				// ... if field is 'allTags', build the metadatasection...
				} else if (/alltags/.test(field)) {

					// If metadatasection already exhists, skip this step.
					if (!states.hasOwnProperty('metadata')){
						states.metadata = {};
						states.metadata.allTags = splitCellContents(fieldValue);
					}

				// ...otherwise, add a new key/value pair to our data object. The key will be a string from out 'allFields' array, and the value will be the content from it's corresponding cell in the google spreadsheet.
				} else {
					data[field] = fieldValue;
				}
			});

			// Grab the 'states' object and give it a key/value pair. The key should be the states initials from our spreadsheet. It's value should be the entire data object that we just made, which containing all the data from a row of our spreadsheet pertaining to that state.
			states[data.stateinitials] = data;
			states[data.stateinitials].organizations = organizations;
		});
	}

	function erasePreviousStateOrgs(numOfOrgs, organizations){
		for (var i = 0; i < numOfOrgs; i++){
			organizations['organization' + i] = {};
		}
	}

	function renderHandlebarsTemplate(templateID, elemID, JSON){
		var source = $(templateID).html();
		var template = Handlebars.compile(source);
		$(elemID).html(template(JSON));
	}

	function buildStateDropdownNavigation(){
		renderHandlebarsTemplate("#select-btn-template", "#select-btn-container", states);
	}

	function changeStateName(){
		$('#state').html(states[selectedState].state);
	}

	function hideElem(elem){
		elem.addClass('invisible');
	}

	function resetState(){
		hideElem($('.org-container-container'));
	}

	function grabCheckboxValues(){
		var checkedTags = $(".tag-search-container .checkbox-inline input:checkbox:checked").map(function(){
			return $(this).val();
		}).get();
		return checkedTags;
	}

	function convertAllTags(){
		return ['drugTreatment', 'housing', 'domesticViolence', 'immigration', 'legalServices', 'courtInformation', 'support Group', 'parentingClasses', 'childCare'];
	}

	function firstToLowerCase( str ) {
		return str.substr(0, 1).toLowerCase() + str.substr(1);
	}

	function convertToCamelCase(stringArray){
		var camelcaseArray = [];
		stringArray.forEach(function(string){
			string = firstToLowerCase(string);
			string = string.replace(/\s+/g, '');
			camelcaseArray.push(string);
		});
		return camelcaseArray;
	}

	function checkForDuplicate(masterArray, valueToCheckAgainst){
		var truthArray = [];
		masterArray.forEach(function(value){
			if (value === valueToCheckAgainst){
				truthArray.push('true');
			}
		});

		if (truthArray.length > 0){
			return true;
		}
	}

	function findOrganizationsWithMarchingTags(checkedTagsArray, organizationsWithMatchingTags){
		var selectedStateOrganizations = states[selectedState].organizations;

		// If user searched for 'all', create an array containing each possible category.
		checkedTagsArray.forEach(function(checkedTag){
			if (checkedTag === 'all'){
				checkedTagsArray = convertAllTags();
			}
		});

		// Loop through the tags the user selected...
		checkedTagsArray.forEach(function(checkedTag){
			// ... then loop through each organization associated with the current state...
			$.each(selectedStateOrganizations, function(key, selectedstateOrganization){
				var selectedstateOrganizationTags = selectedstateOrganization.tags;
				selectedstateOrganizationTags = convertToCamelCase(selectedstateOrganizationTags);
				//... then loop through each tag that's attached to that organization...
				selectedstateOrganizationTags.forEach(function(selectedstateOrganizationTag){
					// ...if one of the selected tags matches one of the tags attached to the organization we're currently looping over...
					if (checkedTag === selectedstateOrganizationTag){
						// If 'organizationsWithMatchingTags' is empty, push selectedstateOrganization object into it.
						if (organizationsWithMatchingTags.length === 0){
							organizationsWithMatchingTags.push(selectedstateOrganization);
						}
						// ... check if the current object we're looping over is a duplicate of any object already in the array...
						var duplicate = checkForDuplicate(organizationsWithMatchingTags, selectedstateOrganization);
						// ...if the current object is not a duplicate, push it into the array.
						if (!duplicate){
							organizationsWithMatchingTags.push(selectedstateOrganization);
						}
					}
				});
			});
		});
	}

	function sortOrganizationsByLocation(organizationsWithMatchingTags){
		var sortingArray = [];
		var sortedOrgArray = [];

		organizationsWithMatchingTags.forEach(function(organization){
			sortingArray.push([organization, organization.distanceFromUser]);
		});

		sortingArray.sort(function(a, b) {
			return  a[1] - b[1];
		});

		sortingArray.forEach(function(organization){
			sortedOrgArray.push(organization[0]);
		});

		return sortedOrgArray;
	}

	function convertGeoToLatLong(org){
		var orgLatLong = [];
		var orgGeolocationsRaw = org.geolocation.split(',');

		orgGeolocationsRaw.forEach(function(location){
			orgLatLong.push(location.trim());
		});
		return orgLatLong;
	}

	function revealHiddenText(clickedButton){
		clickedButton.closest('.text-btn-container')
			.siblings('.contacts-container')
			.slideToggle('fast');
	}

	function checkCheckbox(box){
		box.prop('checked', true);
	}

	function uncheckAllCheckbox(){
		var allCheckbox = $('.tag-search-container .checkbox-inline input[value=all]');
		allCheckbox.prop('checked', false);
	}

	function uncheckOtherCheckboxes(){
		var otherCheckboxes = $('.tag-search-container .checkbox-inline input[value!=all]');
		otherCheckboxes.prop('checked', false);
	}

	function manageCheckboxes(clickedBox){

		// If user clicks on any checkbox other than the 'all' checkbox, deselect the all checkbox.
		if (clickedBox.val() !== 'all'){
			uncheckAllCheckbox();
		}

		// If 'all' button is already select, don't allow user to deselect it.
		if ( (clickedBox.val() === 'all') && (clickedBox.is(':not(:checked)')) ){
			clickedBox.prop('checked', true);
		}

		// If 'all' checkbox is selected, deselct all other checkboxes.
		var allCheckBox = $('.tag-search-container .checkbox-inline input[value=all]');
		if (allCheckBox.is(':checked')){
			uncheckOtherCheckboxes();
		}

		// If every checkbox asside from 'all' is selected, select the 'all' checkbox and deselect all other checkboxes.
		if ($('.tag-search-container .checkbox-inline input[value!=all]:checked').size() === $('.tag-search-container .checkbox-inline input[value!=all]').size() ){
			checkCheckbox(allCheckBox);
			uncheckOtherCheckboxes();
		}
	}

	function getLocation(success, error) {
		// ... and if the browser has the navigator feature...
		if (navigator.geolocation){
			navigator.geolocation.getCurrentPosition(success, error);
		}
	}

	function convertLatLongToDistance(lat1, lon1, lat2, lon2, unit) {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit==="K") { dist = dist * 1.609344; }
		if (unit==="N") { dist = dist * 0.8684; }
		dist = Math.round(dist);
		return dist;
	}

	function addDistanceFromUserToJSONObject(){
		$.each(states, function(key, state){
			if (!state.allTags){
				var organizations = state.organizations;
				$.each(organizations, function(key, org){
					var orgLatLong = convertGeoToLatLong(org);
					var orgLat = orgLatLong[0];
					var orgLong = orgLatLong[1];
					var orgDist = convertLatLongToDistance(userLocation.latitude, userLocation.longitude, orgLat, orgLong);
					org.distanceFromUser = ((isNaN(orgDist)) ? 0 : orgDist);
				});
			}
		});
	}

	function setDropdownMenuLocation(state){
		$('#choose-state').val(state);
		selectedState = state;
	}

	function findUsersCurrentState(latitude, longitude){
		$.ajax({ url:'http://maps.googleapis.com/maps/api/geocode/json?latlng='+ latitude + ',' + longitude +'&sensor=true',
			success: function(data){
				userLocation = data.results[0].address_components[5].short_name;
				setDropdownMenuLocation(userLocation);
			}
		});
	}

	function addOrganizationFunctionality(){
		$('.org-name').on('click', function(){
			revealHiddenText($(this));
			$(this).toggleClass('active');
		});
	}

	function adjustMilesText(){
		var milesElems = $('.miles');
		$.each(milesElems, function(index, milesElem){
			if ( $(milesElem).text() === "(0 MILES)" || $(milesElem).text() === "( MILES)" ){
				$(milesElem).text("");
			} else if ($(milesElem).text() === "(1 MILES)") {
				$(milesElem).text("(1 MILE)");
			}
		});
	}

	function addFindFunctionality(){
		// Reveal organizations section when 'Find' button is clicked.
		$('.find-btn-container button').click(function(){
			var checkedTags = grabCheckboxValues();
			organizationsWithMatchingTags = [];
			findOrganizationsWithMarchingTags(checkedTags, organizationsWithMatchingTags);

			if (geoLocationAllowed == null){
				geoLocationAllowed = confirm("We'd like to use your location to organize your search results by distance. Allow?");
			}
			if (geoLocationAllowed){
				if (!locationFound) {
					getLocation(addGeoLocationFeatures, runAppWithoutGeoLocation);
					hideFindBtn();
				} else {
					runAppWithoutGeoLocation();
				}					
			} else {
				runAppWithoutGeoLocation();
			}
		})
	}

	function renderOrgsSection(){
		// If the tag search returned no organizations with matching tags...
		if (organizationsWithMatchingTags.length === 0) {
			$('#organizations-section').html("<div class='no-results-message-container'><p class='no-results-headline'>No results found.</p><p>Can't find what you're looking for? Please click \"all\" to see what other services exist in your state.</p></div>");

		// ...otherwise...
		} else {
			changeStateName();
			organizationsWithMatchingTags = sortOrganizationsByLocation(organizationsWithMatchingTags);
			renderHandlebarsTemplate("#organizations-section-template", "#organizations-section", organizationsWithMatchingTags);
			adjustMilesText();
		}
		$('.organizations-section').removeClass('invisible');
		$.scrollTo($('#state'), 800);
	}

	function addGeoLocationFeatures(position) {
		userLocation.latitude = position.coords.latitude;
		userLocation.longitude = position.coords.longitude;
		addDistanceFromUserToJSONObject();
		locationFound = true;
		showFindBtn();
		renderOrgsSection();
	}

	function runAppWithoutGeoLocation(){
		// addFindFunctionality();
		showFindBtn();
		renderOrgsSection();
		adjustMilesText();
	}

	function showFindBtn(){
		$('.loading').addClass('invisible');
		$('.find-btn-container').removeClass('invisible');
	}

	function hideFindBtn(){
		$('.find-btn-container').addClass('invisible');
		$('.loading').removeClass('invisible');
	}

	function jumpCheckboxToLeftColumn(){
		var checkbox = $("#inlineCheckbox10").parent('.checkbox-inline').detach();
		$('.checkbox-container .checkbox-container-col-xs:first-of-type .col-md-3:last-of-type').append(checkbox);
		checkboxMoved = true;
	}

	function jumpCheckboxToRightColumn(){
		if (checkboxMoved){
			var checkbox = $("#inlineCheckbox10").parent('.checkbox-inline').detach();
			$('.checkbox-container-col-xs:last-of-type .col-md-3:last-of-type').append(checkbox);
			checkboxMoved = false;
		}
	}

	function rearrangeCheckboxes(){
		winWidth = $(window).width();
		if (winWidth < (768 - 15) ){
			jumpCheckboxToLeftColumn();
		} else {
			jumpCheckboxToRightColumn();
		}
	}



	//***** EVENT LISTENERS *****//

	function setupEventListeners(){

		// Allow data on screen to change when user selects a different state from the select button.
		$("#choose-state").change(function() {
			resetState();
			selectedState = $(this).val();
			// renderStateData(selectedState);
			changeStateName();
			hideElem($('.organizations-section'));
		});

		// Manage checkbox functionality when a checkbox is clicked.
		$('.tag-search-container .checkbox-inline input').click(function(){
			manageCheckboxes($(this));
		});

		// Rearrange checkboxes on mobile devices
		$(window).on("resize", function(){
			rearrangeCheckboxes();
		});

		// Scroll to about section whrn about tab is clicked
		$('.about').click(function(){
			$.scrollTo($('#about'), 800);
		})
	}



	//***** NAVIGATIONAL FUNCTIONS *****//

	function buildAppFunctionality(rawStatesData){
		buildAllFieldsArray(rawStatesData);
		buildStatesObject(rawStatesData);
		buildStateDropdownNavigation();
		setupEventListeners();
		addFindFunctionality();

		console.log("States JSON Object");
		console.log(states);
	}

	function makeJSONRequest(url){
		$.getJSON(url, function(data){
			// 'rawStatesData' contains the raw data from each row of our spreadsheet
			var rawStatesData = data.feed.entry;
			buildAppFunctionality(rawStatesData);
		});
	}

	function runToughLoveApp(){
		makeJSONRequest('https://spreadsheets.google.com/feeds/list/1Pc3JAUBpr-eRjE_Gcr0AplsM__4iXV6GmKjfETvhH1k/od6/public/values?alt=json');
		rearrangeCheckboxes();
	}



	//***** INITIALIZE *****//

	runToughLoveApp();
});
