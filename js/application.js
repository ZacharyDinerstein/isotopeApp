$( document ).ready(function(){
	'use strict';

	//***** GLOBAL VARIABLES *****//



	//***** INITIALIZE *****//

	runToughLoveApp();



	//***** NAVIGATIONAL FUNCTIONS *****//

	function runToughLoveApp(){

	}



	//***** HELPER FUNCTIONS *****//

	function renderHandlebarsTemplate(templateID, elemID, JSON){
		var source = $(templateID).html();
		var template = Handlebars.compile(source);
		$(elemID).html(template(JSON));
	}
});


