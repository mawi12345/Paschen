$(function() {
	$(document).bind('menuLoad', function(){
		Controller.hideBackButton();
		Controller.saveSettings();
		$('#tutorialClickArea').bind('click', function() {
			Controller.playSound('spring');
		});
		
		$('#settingsClickArea').bind('click', function() {
			Controller.showView('settings');
		});
		
		$('#newClickArea').bind('click', function() {
			Controller.showView('game');
		});
		
	});
	
});