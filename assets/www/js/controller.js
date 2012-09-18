/*
 * Copyright 2011 by arvendo media
 * 
 * Filename: Controller.js
 * Project: Paschen
 * Author: Martin Wind
 * 
 */


/*
 * Paschen Controller
 */
var Controller = {
		// ordering is important! 
		// from largest to the smallest
		availableResolutions: {
			med: {w:480, h:800},
			small: {w:320, h:480}
		},
		fakeMode: false,
		loadingScreenTimeout: 1000,
		startupFinished: false,
		loadingScreenTimeoutFinished: false,
		resolutionName: '',
		selectedResolution: {w: 320, h: 480},
		resolution: {w: 320, h: 480},
		history: ['lodingscreen'],
		historyBackConfirm: {
			game: {
				title: 'Sicher?',
				msg: 'Möchtest du das Spiel beenden?',
				labelOk: 'ja',
				labelCancel: 'nein'
			}
		},
		accelerometer: {
			id: 0,
			threshold: 25,
			last: -1000,
			lastTime: 0,
			minTimeBetween: 1000
		},
		db: null,
		settings: {
			sound: true,
			accelerometer: true,
		}
			
};

Controller.startup = function() {
	setTimeout("Controller.afterLoadingScreenTimeout()", this.loadingScreenTimeout);
	this.rLog("startup");
	if (!this.selectResolution()) {
		this.showError('No screen resolution found');
	}
	this.rLog(this.resolutionName+', r.h: '+this.resolution.h+', r.w: '+this.resolution.w);
	this.loadSettings();
	if (!this.fakeMode)
		this.setUpBackButton();
	this.prepareLodingscreen();
	this.startupFinished = true;
	this.checkIfExitLoadingScreen();
}

Controller.enableFake = function() {
	this.fakeMode = true;
	this.addBackButton();
	alert("Debugmode is enabled");
}

Controller.showBackButton = function() {
	$('#backbutton').removeClass('hidden');
}

Controller.hideBackButton = function() {
	$('#backbutton').addClass('hidden');
}

Controller.addBackButton = function() {
	var backbutton = $('<div id="backbutton" class="hidden"></div>');
	backbutton.bind('click', function(){
		Controller.goBack();
	});
	$('body').append(backbutton);
}

Controller.afterLoadingScreen = function() {
	this.showView('menu');
	if (!this.fakeMode)
		this.watchForShake();
}

Controller.afterLoadingScreenTimeout = function() {
	this.loadingScreenTimeoutFinished = true;
	this.checkIfExitLoadingScreen();
}

Controller.checkIfExitLoadingScreen = function() {
	if (this.loadingScreenTimeoutFinished && this.startupFinished) {
		this.afterLoadingScreen();
	}
}


Controller.showView = function(name) {
	Controller.getView(name, function(view){
		Controller.addView(view);
		Controller.fireEvent(name+'Load');
		view.waitForImages(function() {
			Controller.destroyView(Controller.getLastHistory());
			Controller.addHistory(name);
		});
	});
}

Controller.goBack = function() {
	if (Controller.history.length > 2) {
		var old = Controller.history[Controller.history.length-1];
		if (Controller.historyBackConfirm[old] && !Controller.fakeMode) {
			var confirm = Controller.historyBackConfirm[old];
			
	        navigator.notification.confirm(
	        		confirm.msg,  										// message
	                function(label) {
	        			if (label == 1) {
	        				Controller.goBackConfirmed();
	        			}
	        		},
	                confirm.title,           							 // title
	                confirm.labelOk + ',' +  confirm.labelCancel         // buttonLabels
	            );
		} else {
			Controller.goBackConfirmed();
		}
	}
}

Controller.goBackConfirmed = function() {
	var old = Controller.history[Controller.history.length-1];
	var name = Controller.history[Controller.history.length-2];
	this.getView(name, function(view){
		Controller.addView(view);
		Controller.fireEvent(name+'Load');
		view.waitForImages(function() {
			Controller.destroyView(old);
			Controller.history.pop();
		});
	});
}

Controller.getView = function(view, callback) {
	$.ajax({
		url: "views/"+view+'.html',
		type: "GET",
		dataType: "html",
		success: function(html){
			if ($.isFunction(callback)) {
				callback(Controller.getViewContainer(view, html));
			}
		},
		error: function(){
			Controller.rLog('Could not load view '+name);
		}
	});
}

Controller.getViewContainer = function(name, html) {
	var container = $('<div id="'+name+'" class="'+this.resolutionName+'"></div>');
	container.css('width', this.resolution.w+'px');
	container.css('height', this.resolution.h+'px');
	container.html(html);
	return container;
}

Controller.fireEvent = function(name) {
	$(document).trigger(name);
}

Controller.destroyView = function(name) {
	$('#'+name).detach();
}

Controller.getLastHistory = function() {
	return Controller.history[Controller.history.length-1];
}

Controller.addHistory = function(name) {
	var name = Controller.history.push(name);
}

Controller.addView = function(view) {
	$('body').append(view);
}

Controller.prepareLodingscreen = function() {
	$('#lodingscreen').css('width', this.resolution.w+'px');
	$('#lodingscreen').css('height', this.resolution.h+'px');
}


Controller.selectResolution = function() {
	
    if (this.isIphone()) {
        this.resolutionName = 'iphr';
        this.selectedResolution = {w: 479, h: 688};
        this.resolution = {w: 479, h: 688};
        Controller.rLog(window.innerWidth+' '+window.innerHeight);
        return true;
    }
	
	var screenWidth = window.innerWidth;
	//var screenWidth = window.screen.availWidth;
	var screenHeight = window.innerHeight;
	//var screenHeight = window.screen.availHeight;
	
	for(var key in this.availableResolutions) {
		var r = this.availableResolutions[key];
		if (r.w <= screenWidth && r.h <= screenHeight) {
			this.resolutionName = key;
			this.selectedResolution = r;
			this.resolution = {w: screenWidth, h: screenHeight};
			return true;
		}
	}
	return false;
}

Controller.isIphone = function() {
    return (device.platform == 'iPhone Simulator');
}

Controller.showError = function(message) {
	if (Controller.fakeMode) {
		alert(message);
		return;
	}
	navigator.notification.alert(message, null, 'Error');
}

Controller.log = function(msg) {
	console.log(msg);
}

Controller.rLog = function(message) {
	if (Controller.fakeMode) {
		console.log(message);
		return;
	}
	
	$.ajax({
		url: "http://www.arvendo-media.com/paschen/log.php",
		type: "POST",
		data: {
			name: device.name,
			phonegap: device.phonegap,
			platform: device.platform,
			uuid: device.uuid,
			version: device.version,
			msg: message
		},
		dataType: "text",
		success: function(text){
			//Controller.showError(text);
		},
		error: function(){
			Controller.showError('remote logging returned an error');
		}
	});

}

Controller.playSound = function(name) {
	if (Controller.fakeMode || !Controller.settings.sound) return;
	var media = new Media('/android_asset/sounds/'+name+'.ogg', function(){
		// on success
	}, function(error){
		Controller.rLog('Audio Error code: ' + error.code);
	});
	media.play();
}

Controller.setUpBackButton = function() {
	document.addEventListener("backbutton", function(){
		Controller.goBack();
		return true;
	}, false);
}

Controller.getDiceScore = function() {
	return (Math.floor((Math.random() * 100)) % 6) + 1;
}

Controller.watchForShake = function() {
	this.accelerometer.id = navigator.accelerometer.watchAcceleration(
		function (acceleration) {
			/*
			if (true === acceleration.is_updating){
				return;
			}*/
			if (!Controller.settings.accelerometer) return;
			
			if (Controller.accelerometer.last > -1000) {
				var diff = Math.abs(acceleration.y - Controller.accelerometer.last);
				if (diff >= Controller.accelerometer.threshold && acceleration.timestamp > (Controller.accelerometer.minTimeBetween + Controller.accelerometer.lastTime) ) {
					Controller.accelerometer.lastTime = acceleration.timestamp;
					Controller.fireEvent('shake');
				}
			}
			Controller.accelerometer.last = acceleration.y;
			
			/*
		    Controller.rLog('Acceleration X: ' + acceleration.x + '\n' +
		            'Acceleration Y: ' + acceleration.y + '\n' +
		            'Acceleration Z: ' + acceleration.z + '\n' +
		            'Timestamp: '      + acceleration.timestamp + '\n');
		    */

		},
	    function(){},
	    {frequency : 200}
	);
}

Controller.loadSettings = function() {
	Controller.db = window.openDatabase("Paschen", "1.0", "Paschen Settings", 200000);
	Controller.db.transaction(function(tx){
		// query
        tx.executeSql('CREATE TABLE IF NOT EXISTS settings (id unique, value)');
        tx.executeSql('SELECT COUNT(*) as size FROM settings', [], function(tx, results){
        	// query success
        	var settingsCount = results.rows.item(0).size;
        	//Controller.rLog("settingsCount: "+settingsCount);
        	// load defaults
        	if (settingsCount == 0) {
                tx.executeSql('INSERT INTO settings (id, value) VALUES ("sound", 1)');
                tx.executeSql('INSERT INTO settings (id, value) VALUES ("accelerometer", 1)');
        	}
        	
        }, function(){
        	// query error
        	Controller.rLog("db load error 2");
        });
        
        tx.executeSql('SELECT * FROM settings', [], function(tx, results){
        	// query success
        	var len = results.rows.length;
        	for (var i=0; i<len; i++){
        		if (results.rows.item(i).id == 'sound') {
        			Controller.settings.sound = !!results.rows.item(i).value;
        			Controller.rLog("settings.sound: "+Controller.settings.sound);
        		}
        		if (results.rows.item(i).id == 'accelerometer') {
        			Controller.settings.accelerometer = !!results.rows.item(i).value;
        			Controller.rLog("settings.accelerometer: "+Controller.settings.accelerometer);
        		}
        	}
        	
        }, function(){
        	// query error
        	Controller.rLog("db laod error 3");
        });
        
	}, function(){
		// error
		Controller.rLog("db load error 1");
	}, function(){
	});
}

Controller.saveSettings = function() {
	Controller.db = window.openDatabase("Paschen", "1.0", "Paschen Settings", 200000);
	Controller.db.transaction(function(tx){
		// query
		if (Controller.settings.sound) {
			tx.executeSql('UPDATE settings SET value=1 WHERE id="sound"');
		} else {
			tx.executeSql('UPDATE settings SET value=0 WHERE id="sound"');
		}
		if (Controller.settings.accelerometer) {
			tx.executeSql('UPDATE settings SET value=1 WHERE id="accelerometer"');
		} else {
			tx.executeSql('UPDATE settings SET value=0 WHERE id="accelerometer"');
		}
	}, function(){
		// error
		Controller.rLog("db save error 1");
	}, function(){
	});
}
