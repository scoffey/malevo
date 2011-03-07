/**
 * Class: CanvasView
 * -----------------
 * Renders the current view (fighting sprites and stats) on a canvas element.
 */
Malevo.CanvasView = new Class({

        canvas: null, // canvas HTML element
        size: null, // {x, y} object storing canvas width and height
	scale: 1, // scaling factor
	images: null, // loaded images

        // CanvasView contructor
        initialize: function (canvas) {
                this.canvas = canvas;
                this.size = this.canvas.getSize();
		this.scale = 1;
                this.images = {};
		this.loadImages(); // returns null: mootools bug?
                // window resize event handling (delayed)
                var timer = null;
                window.addEvent('resize', function () {
                        clearTimeout(timer);
                        timer = this.resize.delay(500, this);
                }.bind(this));
        },

	// Finds all images used in game animations and triggers loading
	loadImages: function () {
		var keys = [];
		Malevo.sprites.each(function (sprite) {
			Object.each(sprite.animations, function (frames) {
				frames.each(function (frame) {
					if (frame) keys.push(frame);
				});
			});
		});
		var frames = keys.unique(); // remove duplicates
		var counter = 0;
		var images = [];
		frames.each(function (frame, i) {
			var src = this.getFrameImage(frame);
			images[i] = Asset.image(src, {
				onLoad: function () {
					this.images[frame] = images[i];
				}.bind(this),
				onError: function (counter, index, src) {
				Malevo.log('Failed to load image: ' + src);
				},
			});
			if (++counter == frames.length) this.resize();
		}.bind(this));
	},

	// Resolves a frame name into an image path or URL
	getFrameImage: function (frame) {
		return 'images/' + frame + '.png';
	},

        // Resizes canvas to fit in given size or parent size
        resize: function (width, height) {
                var size = $(document).getSize();
                this.size = {x: width || size.x, y: height || size.y};
		var xscale = this.size.x / 1280;
		var yscale = this.size.y / 720;
		this.scale = (xscale < yscale) ? xscale : yscale;
                this.canvas.setProperty('width', this.size.x.toString());
                this.canvas.setProperty('height', this.size.y.toString());
                return this.render();
        },

        // Renders the whole canvas
        render: function () {
		try {
			this.drawBackground();
			this.drawStats(Malevo.sprites[0]);
			this.drawStats(Malevo.sprites[1]);
			this.drawSprite(Malevo.sprites[0]);
			this.drawSprite(Malevo.sprites[1]);
			return true;
		} catch (e) {
			if (Malevo.log) Malevo.log(e); // FIXME
			return false;
		}
        },

	// Draws background on canvas
	drawBackground: function () {
                var ctx = this.canvas.getContext('2d');
                ctx.save() // start
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, this.size.x, this.size.y);
                ctx.fillStyle = '#999';
                ctx.font = '8pt Helvetica';
		ctx.textAlign = 'end';
		var t = 'powered by malevo \u00A9 2011 scoffey';
		ctx.fillText(t, this.size.x - 20, this.size.y - 20);
                ctx.restore(); // finish
	},

	// Draws sprite stats (hp, energy, avatar, etc.) on canvas
	drawStats: function (sprite) {
		var margin = 20;
                var ctx = this.canvas.getContext('2d');
		var wmax = this.size.x / 2 - 2 * margin;
                ctx.save() // start
		var lingrad = ctx.createLinearGradient(0, 0,
				wmax * (4 - sprite.hp / 25), 0);
		lingrad.addColorStop(0, '#c33');
		lingrad.addColorStop(0.3, '#fc0');
		lingrad.addColorStop(1, '#0c3');
		ctx.fillStyle = lingrad;
		if (sprite.z == 1) {
			ctx.translate(this.size.x, 0);
			ctx.scale(-1, 1);
		}
		ctx.fillRect(margin, margin, sprite.hp / 100 * wmax, 30);
                // energy
                ctx.fillStyle = '#00d';
                ctx.fillRect(margin, margin + 30,
				sprite.energy / 100 * wmax, 10);
                ctx.restore(); // finish
	},

        // Draws a sprite on canvas, in current position and animation frame
        drawSprite: function (sprite) {
                var img = this.images[sprite.frame];
		if (!img || !img.width) {
			throw 'No image found for frame: ' + sprite.frame;
		}
                var w = img.width;
                var h = img.height;
		var wmax = this.size.x / this.scale;
		var hmax = this.size.y / this.scale;
                var tx = (wmax - w) / 2 + sprite.x * wmax / 32;
                var ty = (hmax - h / 2) / 2 + sprite.y * hmax / 18;
                var ctx = this.canvas.getContext('2d');
                ctx.save(); // start
		if (sprite.orientation < 0) {
			ctx.scale(-this.scale, this.scale);
			tx = -w - tx;
		} else {
			ctx.scale(this.scale, this.scale);
		}
		ctx.drawImage(img, 0, 0, w, h, tx, ty, w, h);
                ctx.restore(); // finish
        }

});
