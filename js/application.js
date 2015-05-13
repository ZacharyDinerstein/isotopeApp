$( document ).ready(function(){
	'use strict';

	//***** GLOBAL VARIABLES *****//



	//***** INITIALIZE *****//

	runToughLoveApp();


	//***** NAVIGATIONAL FUNCTIONS *****//

	function runToughLoveApp(){
		renderHandlebarsTemplate('#panel-section-template', '#panel-section', chosenFilms.pannel);
	}


	//***** HELPER FUNCTIONS *****//

	function renderHandlebarsTemplate(templateID, elemID, JSON){
		var source = $(templateID).html();
		var template = Handlebars.compile(source);
		$(elemID).html(template(JSON));
	}
});


