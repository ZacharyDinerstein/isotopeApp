$( document ).ready(function(){
	'use strict';

	//***** GLOBAL VARIABLES *****//
	
	var panelMems = chosenFilms.panel;



	//***** INITIALIZE *****//

	runToughLoveApp();


	//***** NAVIGATIONAL FUNCTIONS *****//

	function runToughLoveApp(){
		renderHandlebarsTemplate('#panel-section-template', '#panel-section', chosenFilms.panel);
		renderHandlebarsTemplate('#films-section-template', '#films-section', chosenFilms.panel);
		connectIsotope();
	}


	//***** HELPER FUNCTIONS *****//

	function renderHandlebarsTemplate(templateID, elemID, JSON){
		var source = $(templateID).html();
		var template = Handlebars.compile(source);
		$(elemID).html(template(JSON));
	}

	function connectIsotope(){
		var $container = $('.film-container-container');
		// init
		$container.isotope({
			// options
			itemSelector: '.film-container',
			layoutMode: 'fitRows'
		});

		addIsotopeFunctionToElems($container);
	}

	function addIsotopeFunctionToElems($container){
		$.each(panelMems, function(panelMem, contents){
			$('.' + panelMem).on('click', function(){
				$container.isotope({ filter: '.' + panelMem });
			});
		});
	}
});


