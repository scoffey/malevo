// Malevo - a fighting game engine in JavaScript 
// Copyright (C) 2011 by Santiago Coffey <scoffey@alu.itba.edu.ar>
var Malevo = {version: '0.1.0'};

// Application context setup
Malevo.setup = function () {
	Malevo.sprites = [
		new Malevo.Sprite(-6, 0, 0),
		new Malevo.Sprite(6, 0, 1),
	];
        Malevo.ui = new Malevo.UIController();
        Malevo.log = Malevo.ui.getLoggerCallback();
};

// Main script
if (MooTools.version == '1.3') {
        window.addEvent('domready', Malevo.setup);
} else {
        var s = MooTools ? 'MooTools libraries are missing' :
			'Incompatible MooTools version: ' + MooTools.version;
        alert('FATAL: Cannot initialize Malevo game: ' + s);
}

// TODO
// Energy
// Power attack and KO
// CPU player AI
// Avatar and name
// Background
// Art
// Sounds
// Splash screen
// Character select
// How to play and keys
// Canvas scaling and viewport
// Game over screen
// Share and virals
// Credits
// Rounds: Best of 3
// Unlocks
// Leaderboard
// Embeding
// Facebook connect
// Two player game?
// Web server game?
// Blood?

