/**
 * Class: CanvasView
 * -----------------
 * Renders the current view (fighting sprites and stats) on a canvas element.
 */
Malevo.CanvasView = new Class({

        canvas: null, // canvas HTML element
        size: null, // {x, y} object storing canvas width and height

        // CanvasView contructor
        initialize: function (canvas) {
                this.canvas = canvas;
                this.size = this.canvas.getSize();
                this.loadImages(); // TODO: why does this return null?
                // window resize event handling (delayed)
                var timer = null;
                window.addEvent('resize', function () {
                        clearTimeout(timer);
                        timer = this.resize.delay(500, this);
                }.bind(this));
        },

	// Finds all images used in game animations and triggers loading
	loadImages: function () {
		var sources = [];
		Malevo.sprites.each(function (sprite) {
			Object.each(sprite.animations, function (frames) {
				frames.each(function (frame) {
					if (frame) {
					var src = this.getFrameImage(frame);
					sources.push(src);
					}
				}.bind(this));
			}.bind(this));
		}.bind(this));
		return Asset.images(sources.unique(), {
                        onComplete: this.resize.bind(this),
                });
	},

	// Resolves a frame name into an image path or URL
	getFrameImage: function (frame) {
		return 'images/' + frame + '.png';
	},

        // Resizes canvas to fit in given size or parent size
        resize: function (width, height) {
                var size = $(document).getSize();
                this.size = {x: width || size.x, y: height || size.y};
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
			Malevo.log(e);
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
                ctx.restore(); // finish
	},

        // Draws a sprite on canvas, in current position and animation frame
        drawSprite: function (sprite) {
		var src = this.getFrameImage(sprite.frame);
                var img = Asset.image(src); // TODO
		if (!img.width) {
			throw new Exception('No image found for frame: '
					+ sprite.frame);
		}
                var w = img.width;
                var h = img.height;
                var tx = (this.size.x - w) / 2
				+ sprite.x * this.size.x / 32;
                var ty = (this.size.y - h / 2) / 2
				+ sprite.y * this.size.y / 18;
                var size = img.getDimensions();
                var ctx = this.canvas.getContext('2d');
                ctx.save(); // start
		if (sprite.orientation < 0) {
			ctx.scale(-1, 1);
			tx = -w - tx;
		}
		ctx.drawImage(img, 0, 0, w, h, tx, ty, w, h);
                ctx.restore(); // finish
        }

});
