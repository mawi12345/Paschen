var numtoggled = 0;

$(function() {
	$(document).bind('gameLoad', function(){
		Controller.showBackButton();
		// game states
		$('#game').bind('new', function(){
			$('#doDig').addClass('inactive');
			$('#doNext').addClass('inactive');
			$('#jar').removeClass('open');
			$('#doDig').removeClass('open');
			$('#doDice').removeClass('inactive');
		});
		
		$('#game').bind('postDice', function(){
			$('#doDice').addClass('inactive');
			$('#doDice').data('lock', true);
			$('#doDig').removeClass('inactive');
			$('#doNext').removeClass('inactive');
		});
		
		$('#game').bind('postNext', function(){
			$('#doDice').removeClass('inactive');
			$('#doDig').removeClass('inactive');
			$('#doNext').addClass('inactive');
		});
		
		$(document).bind('shake', function(){
			$('#doDice').trigger('click');
		});
		
		$('#doDice').bind('click', function() {
			// check if active
			if(!$(this).hasClass("inactive")){
				Controller.playSound('dice');
				var score1 = Controller.getDiceScore();
				var score2 = Controller.getDiceScore();
				
				// sort the scores
				if (score1 < score2) {
					var buff = score1;
					score1 = score2;
					score2 = buff;
				}
				$('#doDice').data('score', score1+''+score2);
				// remove all score classes
				$('.dice').removeClass('sf1 sf2 sf3 sf4 sf5 sf6');
				// add the score classes
				$('#dice1').addClass('sf'+score1);
				$('#dice2').addClass('sf'+score2);
				// raise the post dice event
				$('#game').trigger('postDice');
			}
		});
		
		// 
		$('#doDig').bind('click', function() {
			// check if active
			if(!$('#doDig').hasClass("inactive")){
				if($('#doDice').hasClass("inactive")){
					if($('#doDig').hasClass('open')) {
						$('#jar').removeClass('open');
						$('#doDig').removeClass('open');
						$('#doNext').removeClass('inactive');
					} else {
						$('#jar').addClass('open');
						$('#doDig').addClass('open');
						$('#doNext').addClass('inactive');
					}
				} else {
					// don't trust 
					//TODO: play the score sound
					Controller.playSound($('#doDice').data('score'));
					$('#jar').addClass('open');
					$('#doDig').addClass('inactive');
					$('#doDice').addClass('inactive');
					$('#doNext').removeClass('inactive');
				}
			}
		});
		
		// redirect jar click to doDig click event
		$('#jar').bind('click', function() {
			$('#doDig').trigger('click');
		});
		
		$('#doNext').bind('click', function() {
			// check if active
			if(!$('#doNext').hasClass("inactive")){
				// check if user open without dice
				if ($('#doDig').hasClass("inactive")) {
					// after don't trust
					$('#game').trigger('new');
				} else {
					$('#game').trigger('postNext');
				}
			}
		})
		
		// start the game with the new state
		$('#game').trigger('new');
	});
});