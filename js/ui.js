/**
 * Class: UIController
 * -------------------
 * Register event handlers on user interface to trigger corresponding
 * function calls on Malevo components such as client and view.
 * Provides I/O facilities to display alert, confirm and prompt dialogs.
 * Responsible for managing HTML elements.
 */
Malevo.UIController = new Class({

        keyboard: null, // Keyboard (mootools)
        view: null, // Malevo.CanvasView
	interval: null, // main game loop interval object

        // UIController contructor
        initialize: function () {
                var events = {
                        'left': this.move.bind(this, [-1]),
                        'right': this.move.bind(this, [1]),
                        'keyup:left': this.move.bind(this, [0]),
                        'keyup:right': this.move.bind(this, [0]),
                        'up': this.fence.bind(this, [1]),
                        'down': this.fence.bind(this, [0]),
                        ',': this.jump.bind(this),
                        'keypress:,': this.jump.bind(this),
                        '.': this.hit.bind(this),
                        'enter': this.pause.bind(this),
                        'esc': this.toggleConsole.bind(this),
                };
                this.keyboard = new Keyboard({events: events});
                this.view = new Malevo.CanvasView($('canvas'));
		this.interval = null; // set game as paused
		this.pause(); // un-pause main loop
        },

        // Returns a callback function that can be called globally to
        // see logged messages in the GUI "console".
        // Returned callback accepts the log message string.
        getLoggerCallback: function () {
                var console = $('console');
                var scroll = new Fx.Scroll(console);
                return function (message) {
                        if ($type(message) != 'string') {
                                message = JSON.encode(message);
                        }
                        var now = new Date().format('%H:%M:%S');
                        var value = console.getProperty('value');
			var parts = value.split('\n');
			if (parts.length > 100) {
				// prevents log from growing infinitely
				value = parts.slice(500).join('\n');
			}
                        value += now + ' ' + message + '\n';
                        console.setProperty('value', value);
                        scroll.toBottom();
                };
        },

	// toggles debug console visibility on/off
	toggleConsole: function () {
                var console = $('console');
		var display = (console.getStyle('display') == 'none'
				? 'block' : 'none');
		console.setStyle('display', display);
		if (display != 'none') Malevo.log('Debug console on');
	},

	// pauses game (to interrupt main loop and ignore sprite key events)
	pause: function () {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		} else {
			// run main loop every 0.1 seconds
			this.interval = this.loop.periodical(100, this);
		}
	},

	// main game loop: makes sprites play and renders view
	loop: function () {
		try {
                	Malevo.sprites[0].play();
                	Malevo.sprites[1].play();
			this.view.render();
		} catch (e) {
			Malevo.log(e);
		}
	},

	// updates the state of sprites and renders view without a time step
	update: function () {
		try {
                	Malevo.sprites[0].update();
                	Malevo.sprites[1].update();
			this.view.render();
		} catch (e) {
			Malevo.log(e);
		}
	},

        // key event handler for horizontal moves
        move: function (dx) {
		if (!this.interval) return;
		if (Malevo.sprites[0].move(dx)) {
			this.update();
		}
        },

        // key event handler for moving arms up or down
        fence: function (fence) {
		if (!this.interval) return;
		if (Malevo.sprites[0].fence(fence)) {
			this.update();
		}
        },

        // key event handler for jump actions
        jump: function () {
		if (!this.interval) return;
		if (Malevo.sprites[0].jump()) {
			this.update();
		}
        },

        // key event handler for hit actions
        hit: function () {
		if (!this.interval) return;
		if (Malevo.sprites[0].hit()) {
			this.update();
		}
        },

        // Displays an alert dialog
        alert: function (message) {
                // TODO: implement via HTML, not JS alert dialog
                alert(message);
        },

        // Displays an confirm dialog and returns resulting boolean
        confirm: function (message) {
                // TODO: implement via HTML, not JS confirm dialog
                return confirm(message);
        },

        // Displays a prompt dialog and returns the string entered by
        // user (or null on cancel), set by default as the value arg.
        prompt: function (message, value) {
                // TODO: implement via HTML, not JS prompt dialog
                return prompt(message || '', value || '');
        }
});
