$(function() {
	$(document).bind('settingsLoad', function(){
		Controller.showBackButton();
		
		// save settings -> menu load
		
		if(Controller.settings.sound){
			$('#sound').text('EIN');
		} else {
			$('#sound').text('AUS');
		}
		if(Controller.settings.accelerometer){
			$('#shake').text('EIN');
		} else {
			$('#shake').text('AUS');
		}
		
		
		$('#sound').bind('click', function() {
			if(Controller.settings.sound){
				$('#sound').text('AUS');
				Controller.settings.sound = false;
			} else {
				$('#sound').text('EIN');
				Controller.settings.sound = true;
			}
		});
		
		$('#shake').bind('click', function() {
			if(Controller.settings.accelerometer){
				$('#shake').text('AUS');
				Controller.settings.accelerometer = false;
			} else {
				$('#shake').text('EIN');
				Controller.settings.accelerometer = true;
			}
		});
	});
});