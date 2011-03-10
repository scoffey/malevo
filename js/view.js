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
			keys.push(sprite.avatar);
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
					if (++counter == frames.length)
						this.resize();
				}.bind(this),
				onError: function (counter, index, src) {
					Malevo.log('Failed to load ' + src);
				},
			});
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
                	var ctx = this.canvas.getContext('2d');
			this.drawBackground(ctx);
			this.drawStats(ctx, Malevo.sprites[0]);
			this.drawStats(ctx, Malevo.sprites[1]);
			this.drawSprite(ctx, Malevo.sprites[0]);
			this.drawSprite(ctx, Malevo.sprites[1]);
			return true;
		} catch (e) {
			Malevo.log(e);
			return false;
		}
        },

	// Draws background on canvas
	drawBackground: function (ctx) {
                ctx.save() // start
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, this.size.x, this.size.y);
                ctx.fillStyle = '#666';
                ctx.font = '8pt Helvetica';
		var t = 'Tip: Use arrow keys to move, Z to hit and X to jump';
		ctx.fillText(t, 20, this.size.y - 20);
		ctx.textAlign = 'end';
		var t = 'powered by malevo \u00A9 2011 scoffey';
		ctx.fillText(t, this.size.x - 20, this.size.y - 20);
                ctx.restore(); // finish
	},

	// Draws sprite stats (hp, energy, avatar, etc.) on canvas
	drawStats: function (ctx, sprite) {
		var margin = 20;
		var asize = 75;
		var wmax = this.size.x / 2 - 2 * margin - asize;
                ctx.save(); // start
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
		ctx.fillRect(margin + asize, margin,
				sprite.hp / 100 * wmax, 30);
                // energy
                ctx.fillStyle = '#00d';
                ctx.fillRect(75 + margin, margin + 30,
				sprite.energy / 100 * wmax, 10);
		// avatar
                var img = this.images[sprite.avatar];
		var size = img.width < img.height ? img.width : img.height;
		ctx.drawImage(img, (img.width - size) / 2,
			(img.height - size) / 2, size,
			size, margin, margin, asize, asize);
		ctx.strokeStyle = 'black';
		ctx.lineCap = 'round';
		ctx.lineWidth = 3;
		ctx.strokeRect(margin, margin, asize, asize);
                ctx.restore(); // reset
                ctx.save();
                ctx.fillStyle = '#000';
                ctx.font = '20pt Helvetica';
		ctx.textAlign = (sprite.z == 0 ? 'start' : 'end');
		var dx = margin + asize + 10;
		var x = (sprite.z == 0 ? dx : this.size.x - dx);
		ctx.fillText(sprite.name, x, margin + 70);
                ctx.restore(); // finish
	},

        // Draws a sprite on canvas, in current position and animation frame
        drawSprite: function (ctx, sprite) {
                var img = this.images[sprite.frame];
                var w = img.width;
                var h = img.height;
		if (!img || !w || !h) {
			throw 'No image found for frame: ' + sprite.frame;
		}
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
