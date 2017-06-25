// ***************************
// * FREE FUNCTIONS 
// ***************************
var collidesWith = function(rect1, rect2) {
	return ( rect1.x < rect2.x + rect2.width
		&& rect1.x + rect1.width > rect2.x
		&& rect1.y < rect2.y + rect2.height
		&& rect1.y + rect1.height > rect2.y);
};

var transform = function(x, y, camera) {
    return [x - camera.x, y - camera.y];
};

// ***************************
// * GAME CAMERA 
// ***************************
var GameCamera = function(x, y, width, height, margin_x, margin_y){
    this.set_margin = function(margin_x, margin_y) {
        this.margin_x = margin_x || this.width / 3;
        this.margin_y = margin_y || this.height / 3;
    };
    
    this.set_world_bounds = function(max_world_x, max_world_y) {
        this.max_world_x = max_world_x || this.x + this.width;
        this.max_world_y = max_world_y || this.y + this.height;
    };
    
    this.set_focus_sprite = function(focus_sprite) {
        this.focus_sprite = focus_sprite || RectSprite(x, y, width, height);
        return this.focus_sprite;
    };
    
    this.update = function(){
        coords = this.focus_sprite.get_center_coords();
        center_x = coords[0];
        center_y = coords[1];
        if (center_x < this.x + this.margin){
            this.x = Math.max(0, center_x - this.margin);
        } else if (center_x > this.x + this.width - this.margin) {
            this.x = Math.min(this.max_world_x - this.width, center_x + this.margin_x - this.width );
        }
    };
    
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    this.set_margin(margin_x, margin_y);
    this.set_world_bounds();
    this.set_focus_sprite();
};

// ***************************
// * GAME 
// ***************************
/**
 *  @param {string} the name of the game
 *  @param {int} width
 *      the width of the viewport
 *  @parem {int} height
 *      the height of the viewport
 */
var Game = function(title, width, height, canvas_id="Gameplan.GameCanvas"){
    this.title = title;
    this.scene_stack = [];
    this.current_scene = null;

    this.camera = GameCamera(0, 0, width, height);
    
    // try to locate the canvas by id
    this.canvas = document.getElementById(canvas_id);
    // if the canvas does not yet exist, create it and add to html body
    if (!this.canvas) {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
    }
    this.canvas.width = width;
    this.canvas.height = height;
    this.graphics2d = this.canvas.getContext("2d");
    
    this.update = function(delta) {
        this.current_scene.update(delta);
    };
    
    this.draw = function(graphics2d, camera) {
        this.current_scene.draw(graphics2d, camera)
    };
    
    this.gameloop = function(){
        var delta = 1; // TODO fix
        this.update(delta); // TOOD update as often as possible
        this.camera.update(); // TODO how to inject focus sprite
        this.draw(this.graphics2d, this.camera); // TODO attempt to maintain FPS
        // TODO cross browser request animation frame
        window.requestAnimationFrame(gameloop);
    }
    
};
Game.prototype.start = function(){
    this.init();
    this.current_scene = this.scene_stack.pop();
    this.gameloop()
};
Game.prototype.init = function(){
    // empty, expected to be overridden
};
    

// ***************************
// * SPRITES - RectSprite
// ***************************
var RectSprite = function(x, y, width, height, color="blue"){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.visible = true;
};
RectSprite.prototype.get_center_coords = function(){
    return [this.x + this.width / 2, this.y + this.height / 2];
};
RectSprite.prototype.draw = function(graphics2d, camera){
    if (this.visible) {
        var coords = transform(this.x, this.y, camera);
        graphics2d.fillStyle = this.color;
        graphics2d.fillRect(coords[0], coord[1], this.width, this.height);
    }
};
RectSprite.prototype.update = function(delta) {
    this.x += this.velocity_x * delta; // TODO how to account for behavior?
    // check collisions
    this.y += this.velocity_y * delta;
    // check collisions
};


// ***************************
// * SPRITES - ImageSprite
// ***************************
var ImageSprite = function(image, x, y){
    this.image = loadImage(image);
    RectSprite.call(x, y, this.image.width, this.image.height)
	
};
ImageSprite.prototype = Object.create(RectSprite.prototype);
ImageSprite.prototype.constructor = ImageSprite;
ImageSprite.prototype.draw = function(graphics2d, camera){
    if (this.visible) {
        var coords = transform(this.x, this.y, camera);
        graphics2d.drawImage(this.image, coords[0], coord[1]);
    }
};    
