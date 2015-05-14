$( document ).ready(function(){
	'use strict';

	//***** GLOBAL VARIABLES *****//
	
	var panelMems = chosenFilms.panel;



	//***** INITIALIZE *****//

	runToughLoveApp();


	//***** NAVIGATIONAL FUNCTIONS *****//

	function runToughLoveApp(){
		renderHandlebarsTemplate('#select-btn-template', '#select-btn-container', chosenFilms.panel);
		renderHandlebarsTemplate('#panel-section-template', '#panel-section', chosenFilms.panel);
		renderHandlebarsTemplate('#films-section-template', '#films-section', chosenFilms.panel);
		connectIsotope();
		setupEventListeners();
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
			masonry: {
				isFitWidth: true
			}
		});

		addIsotopeFunctionToElems($container);
	}

	function addIsotopeFunctionToElems($container){
		// Adds isotop functionality to buttons
		$.each(panelMems, function(panelMem, contents){
			$('.' + panelMem).on('click', function(){
				$container.isotope({ filter: '.' + panelMem });
			});
		});

		// Adds isotop functionality to select menu
		$("#choose-panel-mem").change(function() {
			var selectedPanelMem = $(this).val();
			$container.isotope({ filter: '.' + selectedPanelMem });
		});
	}



	//***** EVENT LISTENERS *****//

	function setupEventListeners(){
		$('.film-container').on('click', function(){
			var index = $(this).attr('data-array-index');
			var panelMem = $(this).attr('data-panel-mem');
			renderHandlebarsTemplate('#modal-template', '#modal-container', chosenFilms.panel[panelMem].recommendedFilms[index]);
		});
	}

});


