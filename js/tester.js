PlayState = {}
const LEVEL_COUNT = 1

PlayState.init = function (data) {
  this.game.renderer.renderSession.roundPixels = true
  this.keys = this.game.input.keyboard.addKeys({
    left: Phaser.KeyCode.LEFT,
    right: Phaser.KeyCode.RIGHT,
    up: Phaser.KeyCode.UP,
  })
  this.keys.up.onDown.add(function () {
    this.hero.jump();
    }, this)
  this.level = (data.level || 0) % LEVEL_COUNT
}

function Hero(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'hero')
  this.anchor.set(1, 1)
  this.game.physics.enable(this)
  this.body.collideWorldBounds = true
  // this.animations.add('stop', Phaser.Animation.generateFrameNames('bunny1_stand'))
  // this.animations.add('run', Phaser.Animation.generateFrameNames('bunny1_walk', 1, 2), 8, true)
  // this.animations.add('jump', Phaser.Animation.generateFrameNames('bunny1_jump'))
  // this.animations.add('fall', Phaser.Animation.generateFrameNames('bunny1_ready'))
  this.animations.add('stop', [0])
  this.animations.add('run', [1, 2], 8, true)
  this.animations.add('jump', [4])
  this.animations.add('fall', [3])
}

Hero.prototype = Object.create(Phaser.Sprite.prototype)
Hero.prototype.constructor = Hero

Hero.prototype.move = function (direction) {
  const SPEED = 200
  this.body.velocity.x = direction * SPEED
  if (this.body.velocity.x < 0) {
    this.scale.x = -1
  } else if ( this.body.velocity.x > 0) {
    this.scale.x = 1
  }
}
Hero.prototype.jump = function () {
  const JUMP_SPEED = 600
  let canJump = this.body.touching.down
  if (canJump) {
    this.body.velocity.y = -JUMP_SPEED
  }
  return canJump
}

Hero.prototype.bounce = function () {
  const BOUNCE_SPEED = 200
  this.body.velocity.y = -BOUNCE_SPEED
}

Hero.prototype._getAnimationName = function () {
  let name = 'stop'
  if (this.body.velocity.y < 0) {
    name = 'jump'
  } else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
    name = 'fall'
  } else if (this.body.velocity.x !== 0 && this.body.touching.down) {
    name = 'run'
  }
  return name
}

Hero.prototype.update = function () {
  let animationName = this._getAnimationName()
  if (this.animations.name !== animationName) {
    this.animations.play(animationName)
  }
}

PlayState.preload = function () {
  this.game.load.json('level:0', 'data/level00.json')

  // this.game.load.image('bg_layer4', 'assets/Background/bg_layer4.png')
  // this.game.load.image('bg_layer3', 'assets/Background/bg_layer3.png')
  // this.game.load.image('bg_layer2', 'assets/Background/bg_layer2.png')
  // this.game.load.image('bg_layer1', 'assets/Background/bg_layer1.png')
  this.game.load.image('background', 'assets/Background/background.png')
  this.game.load.image('ground', 'assets/Background/ground.png')
  this.game.load.image('grass:4x1', 'assets/Background/grass_4x1.png')
  // this.game.load.image('hero', 'assets/Players/bunny1_stand.png', 60, 101)
  // this.game.load.image('hero', 'assets/Players/bunny1_walk1.png', 60, 101)
  // this.game.load.image('hero', 'assets/Players/bunny1_walk2.png', 60, 101)
  // this.game.load.image('hero', 'assets/Players/bunny1_ready.png', 60, 101)
  // this.game.load.image('hero', 'assets/Players/bunny1_jump.png', 72, 101)
  // this.game.load.image('hero', 'assets/Players/bunny1_hurt.png', 72, 101)
  // this.game.load.atlas('hero', 'assets/Players/bunny1.png', 'assets/Players/bunny1.json')
  this.game.load.spritesheet('hero', 'assets/Unused/bunny1_sheet.png', 70, 101)
}

PlayState.create = function () {
  // this.game.physics.startSystem(Phaser.Physics.ARCADE)
  // this.game.add.image(0, 0, 'bg_layer1')
  // this.game.add.image(0, 0, 'bg_layer2')
  // this.game.add.image(0, 0, 'bg_layer3')
  // this.game.add.image(0, 0, 'bg_layer4')
  // this.bgLayer2 = this.game.add.tileSprite(0,
  //   this.game.height - this.game.cache.getImage('bg_layer2').height, this.game.width,
  //   this.game.cache.getImage('bg_layer2').height, 'bg_layer2')
  // this.bgLayer3 = this.game.add.tileSprite(0,
  //   this.game.height - this.game.cache.getImage('bg_layer3').height, this.game.width,
  //   this.game.cache.getImage('bg_layer3').height, 'bg_layer3')
  // this.bgLayer4 = this.game.add.tileSprite(0,
  //   this.game.height - this.game.cache.getImage('bg_layer4').height, this.game.width,
  //   this.game.cache.getImage('bg_layer4').height, 'bg_layer4')
  this.game.add.image(0, 0, 'background')
  this.game.add.image(0, 546, 'ground')
  this._loadLevel(this.game.cache.getJSON(`level:${this.level}`))
}

PlayState._loadLevel = function (data) {
  this.bgDecoration = this.game.add.group()
  this.platforms = this.game.add.group()
  data.platforms.forEach(this._spawnPlatform, this)
  this._spawnCharacters({hero: data.hero})
  const GRAVITY = 1200
  this.game.physics.arcade.gravity.y = GRAVITY
}

PlayState._spawnPlatform = function (platform) {
  let sprite = this.platforms.create(
    platform.x, platform.y, platform.image)
  this.game.physics.enable(sprite)
  sprite.body.allowGravity = false
  sprite.body.immovable = true
}

PlayState._spawnCharacters = function (data) {
  this.hero = new Hero(this.game, data.hero.x, data.hero.y)
  this.game.add.existing(this.hero)
}

PlayState.update = function () {
  // this.bgLayer1
  // this.bgLayer2.tilePosition.x -= 0.05;
  // this.bgLayer3.tilePosition.x -= 0.3;
  // this.bgLayer4.tilePosition.x -= 0.75;
  this._handleCollisions()
  this._handleInput()
}

PlayState._handleCollisions = function () {
  this.game.physics.arcade.collide(this.hero, this.platforms)
}

PlayState._handleInput = function () {

  if (this.keys.left.isDown) {
    this.hero.move(-1)
  }
  else if (this.keys.right.isDown) {
    this.hero.move(1)
  } else {
    this.hero.move(0)
  }
}


window.onload = function () {
  let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game')
  game.state.add('play', PlayState)
  game.state.start('play', true, false, {level: 0})
}
