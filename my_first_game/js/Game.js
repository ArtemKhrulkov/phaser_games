var SpaceHipster = SpaceHipster || {};

//title screen

SpaceHipster.Game = function(){};

SpaceHipster.Game.prototype = {

    create: function() {
        // set world dimension
        this.game.world.setBounds (0,0, 1920,1920);

        //set tile sprite
        this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');

        //create player
        this.player = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'playership');

        //make it bigger
        this.player.scale.setTo(2);

        this.player.animations.add('fly',[0,1,2,3,4], 5, true);
        this.player.animations.play('fly');

        this.game.camera.follow(this.player);

        //player initial score zero
        this.playerScore = 0;

        //enable player physics
        this.game.physics.arcade.enable(this.player);
        this.player.anchor.set(0.5);
        this.playerSpeed = 120;
        this.player.body.collideWorldBounds = true;

        this.generateCollectables();
        this.generateAsteroids();

        //sounds
        this.explosionSound = this.game.add.audio('explosion');
        this.collectSound = this.game.add.audio('collect');

        //show score
        this.showLabels();
        
    },

    collect: function(player, collectable) {
        //play collect sound
        var text_score = "Score: ";
        this.collectSound.play();

        //update scores
        this.playerScore++;
        this.scoreLabel.text = text_score + this.playerScore;

        //remove sprite
        collectable.destroy();
    },

    generateAsteroids: function() {
        this.asteroids = this.game.add.group();

        //enable physics in item
        this.asteroids.enableBody = true;
        this.asteroids.physicsBodyType = Phaser.Physics.ARCADE;

        //phaser rrandom number generator
        var numAsteroids = this.game.rnd.integerInRange(150, 200);
        var asteroid;

        for (var i = 0; i < numAsteroids; i++){
            //add sprite
            asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
            asteroid.scale.setTo(this.game.rnd.integerInRange(10, 40)/10);

            //physics properties
            asteroid.body.velocity.x = this.game.rnd.integerInRange(-20, 20);
            asteroid.body.velocity.y = this.game.rnd.integerInRange(-20, 20);
            asteroid.body.immovable = true;
            asteroid.body.collideWorldBounds = true;
        }
    },

    generateCollectables: function() {
        this.collectables = this.game.add.group();

        //enable physics
        this.collectables.enableBody = true;
        this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

        //random number
        var numCollectables = this.game.rnd.integerInRange(100,150);
        var collectable;

        for (var i = 0; i < numCollectables; i++) {
            //add sprite
            collectable = this.collectables.create(this.game.world.randomX, this.game.world.randomY, 'power');
            collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
            collectable.animations.play('fly');
        };
    },

    hitAsteroid: function(palyer, asteroid) {
        //play explosion sound
        this.explosionSound.play();

        //player explosion
        var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
        emitter.makeParticles('playerParticle');
        emitter.minParticleSpeed.setTo(-200,-200);
        emitter.maxParticleSpeed.setTo(200,200);
        emitter.gravity = 0;
        emitter.start(true, 1000, null, 100);
        this.player.destroy();

        this.game.time.events.add(800, this.gameOver, this);
    },

    gameOver: function() {
        console.log("Game Over");
        //pass it the score as a parameter
        this.game.state.start('MainMenu', true, false, this.playerScore)
    },

    showLabels: function() {
        var text_score = "Score: ";
        var text = "0";
        var style = {font: "20px Arial", fill: "#fff", align: "left"};
        this.scoreLabel = this.game.add.text(this.game.width-1000, this.game.height-700, text_score + text, style);
        this.scoreLabel.fixedToCamera = true;
    },

    update: function() {
        if (this.game.input.activePointer.justPressed()){
            //move on the direction of the input
            this.game.physics.arcade.moveToPointer(this.player, this.playerSpeed);
        }
        //collision between player and asteroids
        this.game.physics.arcade.collide(this.player, this.asteroids, this.hitAsteroid, null, this);
        //overlapping between player and collectables
        this.game.physics.arcade.overlap (this.player, this.collectables, this.collect, null, this)
    },
};