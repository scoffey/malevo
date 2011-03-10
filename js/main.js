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

// TODO: Engine tasks
// Power attack and KO -- review fighting state machine
// Energy -- make hits dependent on energy
// CPU player AI
// Game over event
// Sound support
// Background image support
// Key mapping support

// TODO: Game tasks
// Background
// Art
// Sounds
// Splash screen
// Game over screen
// Character select
// How to play and keys
// Credits

// TODO: Social features
// Share and virals
// Facebook connect
// Embeding
// Unlocks
// Leaderboard

// TODO: Future
// Rounds: Best of 3
// Two player game?
// Web server game?
// Blood?

