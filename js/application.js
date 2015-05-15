$( document ).ready(function(){
	'use strict';


	//***** GLOBAL VARIABLES *****//

	var winWidth;
	var paraMoved;
	var modalOpen;

	//***** INITIALIZE *****//

	//runToughLoveApp();
	$.ajax({
		url: 'js/data.json'
	}).done(runToughLoveApp);


	//***** NAVIGATIONAL FUNCTIONS *****//

	function runToughLoveApp(panel){
		renderHandlebarsTemplate('#select-btn-template', '#select-btn-container', panel);
		renderHandlebarsTemplate('#panel-section-template', '#panel-section', panel);
		renderHandlebarsTemplate('#films-section-template', '#films-section', panel);
		connectIsotope(panel);
		setupEventListeners(panel);
		rearrangeModalElems();
	}


	//***** HELPER FUNCTIONS *****//

	function renderHandlebarsTemplate(templateID, elemID, JSON){
		var source = $(templateID).html();
		var template = Handlebars.compile(source);
		$(elemID).html(template(JSON));
	}

	function connectIsotope(panel){
		var $container = $('.film-container-container');
		// init
		$container.isotope({
			// options
			itemSelector: '.film-container',
			masonry: {
				isFitWidth: true
			}
		});

		addIsotopeFunctionToElems($container, panel);
	}

	function addIsotopeFunctionToElems($container, panelMems){
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

	function rearrangeModalElems(){
		winWidth = $(window).width();
		if (winWidth < (641) ){
			moveParaBelowRow();
		} else {
			moveParaIntoRow();
		}
	}


	function moveParaBelowRow(){
		var para = $(".blurb").detach();
		$('.above-divider').html(para);
		paraMoved = true;
	}
	
	function moveParaIntoRow(){
		if (paraMoved){
			var para = $(".blurb").detach();
			$('.blurb-container').html(para);
			paraMoved = false;
		}
	}



	//***** EVENT LISTENERS *****//

	function setupEventListeners(panel){
		$('.film-container').on('click', function(){
			var index = $(this).attr('data-array-index');
			var panelMem = $(this).attr('data-panel-mem');
			renderHandlebarsTemplate('#modal-template', '#modal-container', panel[panelMem].recommendedFilms[index]);
		});

		$(window).on("resize", function(){
			rearrangeModalElems();
		});

		$(document).on('open', '.remodal', function () {
			rearrangeModalElems();
		});
	}

});


