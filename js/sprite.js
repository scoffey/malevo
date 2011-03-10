/**
 * Class: Sprite
 * -------------
 * Represents a sprite, in its current position, fighting state and animation
 * frame among other properties. Provides methods for state transitions.
 */
Malevo.Sprite = new Class({

	x: 0, // x position
	y: 0, // y position
	z: 0, // sprite index: 0 is left player and 1 is right player
	dx: 0, // x speed (> 0 if moving right, < 0 if moving left)
	dy: 0, // y speed (< 0 if jumping up, > 0 if when falling down)
	name: 'sprite', // sprite name
	hp: 100, // hit points [0, 100]
	energy: 100, // energy [0, 100]
	orientation: 1, // 1 if looking right, -1 if looking left
	hifight: 1, // 0 if arms are down, 1 if arms are up
	frame: null, // current frame name
	state: 'hifight', // current animation state 
	t: 0, // time (current animation frame index)
	avatar: 'lofight1',
	animations: {
		hifight: ['hifight0', 'hifight1', 'hifight1',
				'hifight2', 'hifight1', 'hifight1'],
		lofight: ['lofight0', 'lofight1', 'lofight1',
				'lofight2', 'lofight1', 'lofight1'],
		hihit: ['hihit', 'hihit', 'hihit', null],
		lohit: ['lohit', 'lohit', 'lohit', null],
		hidamage: ['hidamage', 'hidamage', 'hidamage', null],
		lodamage: ['lodamage', 'lodamage', 'lodamage', null],
		hiblock: ['hiblock', 'hiblock', 'hiblock', null],
		loblock: ['loblock', 'loblock', 'loblock', null],
		goleft: ['walk0', 'walk1', 'walk2', 'walk1'],
		goright: ['walk0', 'walk1', 'walk2', 'walk1'],
		jump: ['jump'],
		power: ['power', 'power', 'power', null],
		ko: ['ko'],
	}, // animation templates

	// Sprite contructor
	initialize: function (x, y, z, animations) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.orientation = (z ? -1 : 1);
		if (animations) this.animations = animations;
		this.update();
	},

	// updates movement in y with gravity
	ymove: function () {
		if (this.y <= 0) {
			var opponent = Malevo.sprites[1 - this.z];
			this.dy += 0.5;
			var y = this.y + this.dy;
			var backOnFeet = (this.y < 0 && y >= 0);
			this.y = (y > 0 ? 0 : y);
			if (backOnFeet) this.restore();
			else if (this.y < 0) this._checkhit();
		} else {
			this.y = 0;
			this.dy = 0;
		}
	},

	// updates movement in x
	xmove: function () {
		var opponent = Malevo.sprites[1 - this.z];
		var d = Math.abs(this.x - opponent.x);
		if (this.z == 1) {
			this.dx = (d > 3 && Math.random() < d / 64) ? this.orientation : 0; // cpu cheating
			// TODO: animate goleft and goright for cpu
			// TODO: go backwards
		}
		var x = this.x + this.dx;
		var newd = Math.abs(x - opponent.x);
		var pass = newd > 1 || this.y < -1 || newd > d;
		if (x > -16 && x < 16 && pass) {
			this.x = x;
			this.orientation = (this.x < opponent.x) ? 1 : -1;
			opponent.orientation = -this.orientation;
		}
	},

	// moves and animates sprite (making a time step)
	play: function () {
		this.t++; // time step
		this.energize(1);
		this.xmove();
		this.ymove();
		return this.update();
	},

	// updates sprite (current animation frame according to latest state)
	update: function () {
		var frames = this.animations[this.state];
		if (this.t >= frames.length) {
			this.t = 0;
		}
		this.frame = frames[this.t];
		if (!this.frame) {
			this.restore();
			this.frame = this.animations[this.state][0];
		}
		return this.frame;
	},

	// makes the sprite go left, go right or stop
	move: function (dx) {
		this.dx = dx;
		var opponent = Malevo.sprites[1 - this.z];
		if (!dx) {
			this.restore();
		} else if (this.y == 0) {
			this.state = (this.dx < 0 ?  'goleft' : 'goright');
		}
		return (dx ? true : false);
	},

	// gives energy
	energize: function (offset) {
		var energy = this.energy + offset;
		if (energy < 0) energy = 0;
		if (energy > 100) energy = 100;
		if (energy != this.energy) {
			this.energy = energy;
			return true;
		}
		return false;
	},

	// makes the sprite jump
	jump: function () {
		if (this.y == 0) {
			this.state = 'jump';
			this.energize(-15);
			this.dy = -3;
			return true;
		}
		return false;
	},

	// makes the sprite move its arms up or down
	fence: function (fence) {
		this.hifight = (fence ? 1 : 0);
		var opponent = Malevo.sprites[1 - this.z];
		var d = Math.abs(this.x - opponent.x);
		if (d < 4 && opponent.z == 1) opponent.hit.delay(500, opponent); // cpu cheating
		return this.restore();
	},

	// restores sprite to a default state
	restore: function () {
		state = (this.y < 0 ? 'jump'
				: (this.hifight ? 'hifight' : 'lofight'));
		if (state == this.state) return false;
		this.state = state;
		return true;
	},

	// makes the sprite hit
	hit: function () {
		if (this.y < 0) return false;
		if (this.energy < 100) {
			this.state = (this.hifight ? 'hihit' : 'lohit');
		} else {
			this.state = 'power';
		}
		this.energize(-5);
		return this._checkhit();
	},

	// checks for collisions on a hit event, to cause damage
	_checkhit: function () {
		var opponent = Malevo.sprites[1 - this.z];
		var d = Math.abs(this.x - opponent.x);
		if (!(d > 0 && d < 4 && opponent.y == 0)) return true; // too far
		var groundhit = (this.y == 0);
		var jumphit = (this.y < 0 && this.y > -3 && this.dy > 0);
		var hifight = (jumphit ? 1 : this.hifight);
		if (opponent.z == 1 && Math.random() < 0.5) {
			opponent.hifight = hifight; // cpu cheating
		}
		if (opponent.hifight == hifight) {
			opponent.state = (hifight ? 'hiblock' : 'loblock');
			return true; // no damage
		}
		opponent.state = (hifight ? 'hidamage' : 'lodamage');
		opponent.hp -= 5;
		if (opponent.hp == 0) {
			Malevo.log(this.z == 0 ? 'You win!' : 'You lose!');
			opponent.hp = 100;
		}
		return true;
	},

	// makes the sprite do a power move (special attack)
	power: function () {
		if (this.y < 0) return false;
		this.state = 'power'; // TODO
		return true;
	},

});

