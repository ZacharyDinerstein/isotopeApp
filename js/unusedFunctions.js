	//***** DATA SECTION FUNCTIONS *****//

	// These functions correspond to the app's data section, which has been removed from the MVP. We may add this section back into the app.



	//	function revealOrganizationElement(currentOrganizationElem){
	//		currentOrganizationElem.closest('.org-container-container').removeClass('hidden');
	//	}

	// function hideTextBtnContainers(){
	//	$('.text-btn-container').addClass('hidden');
	// }

	// function revealLearnMoreBtns(selectedState, organizations, lengthRequirement){
	//	organizations.each(function(index){
	//		/*
	//		Reveal "learn more" buttons if text is longer than the length requirement
	//		*/
	//		if ($(this).text().length > lengthRequirement){
	//			// ...then show the learn more button.
	//			var learnMoreBtn = $(this).closest('div').next('div').find('.learn-more');
	//			learnMoreBtn.removeClass('invisible');
	//		}
	//	});
	// }

	// function hideLearnMoreButtons(){
	//	$('.learn-more').addClass('invisible');
	// }

	// function hideRevealedText(){
	//	$('.hidden-text').removeAttr('style');
	// }


	// function makeDataJSONRequest(url){
	//	$.getJSON(url, function(data){
	//		// 'entries' contains the raw data from each row of our spreadsheet
	//		var entries = data.feed.entry;
	//		buildAppFunctionality(entries);
	//	});
	// }

	// function renderStateData(selectedState){
		// buildDataSection(selectedState);
		// var optionalText = $('.optional-text');
		// revealLearnMoreBtns(selectedState, optionalText, 3);
		// setupEventListeners();
	// }

	// function buildDataSection(){
	//	// For each field in our field array...
	//	allFields.forEach(function (field){
	//	var organizationNumber = field.slice(-1);
	//	var target = $('#' + field);

	//	// ...find the element with an id that matches the field name. Then insert into that element the appropriate JSON value.
	//		target.html(states[selectedState][field]);
	//	});
	// }