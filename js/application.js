$( document ).ready(function(){
	'use strict';

	//***** GLOBAL VARIABLES *****//



	//***** INITIALIZE *****//

	runToughLoveApp();


	//***** NAVIGATIONAL FUNCTIONS *****//

	function runToughLoveApp(){
		renderHandlebarsTemplate('#panel-section-template', '#panel-section', chosenFilms.pannel);
		renderHandlebarsTemplate('#films-section-template', '#films-section', chosenFilms.pannel);
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
		layoutMode: 'fitRows'
		});

		$('.lixinFan').on('click', function(){
			var filterClass = $(this).attr('data-panel-name');
			$container.isotope({ filter: '.' + filterClass });
		});

		$('.laFrancesHui').on('click', function(){
			var filterClass = $(this).attr('data-panel-name');
			$container.isotope({ filter: '.' + filterClass });
		});

		$('.chihuiYang').on('click', function(){
			var filterClass = $(this).attr('data-panel-name');
			$container.isotope({ filter: '.' + filterClass });
		});
	}



	//***** Event Listeners *****//

	function setupEventListeners(){

	}



});


