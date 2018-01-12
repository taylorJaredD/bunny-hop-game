PlayState = {}
const LEVEL_COUNT = 2

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
  this.coinPickupCount = 0
  this.hasKey = false
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
  this.game.load.json('level:1', 'data/level01.json')

  this.game.load.image('font:numbers', 'images/numbers.png')
  this.game.load.image('background', 'assets/Background/background.png')
  this.game.load.image('ground', 'assets/Background/ground.png')
  this.game.load.image('grass:4x1', 'assets/Background/grass_4x1.png')
  this.game.load.image('grass:8x1', 'images/grass_8x1.png')
  this.game.load.image('grass:6x1', 'images/grass_6x1.png')
  this.game.load.image('grass:2x1', 'images/grass_2x1.png')
  this.game.load.image('grass:1x1', 'images/grass_1x1.png')
  // this.game.load.image('decoration', 'images/decor.png')
  // this.game.load.image('hero', 'assets/Players/bunny1_stand.png', 60, 101)
  // this.game.load.image('hero', 'assets/Players/bunny1_walk1.png', 60, 101)
  // this.game.load.image('hero', 'assets/Players/bunny1_walk2.png', 60, 101)
  // this.game.load.image('hero', 'assets/Players/bunny1_ready.png', 60, 101)
  // this.game.load.image('hero', 'assets/Players/bunny1_jump.png', 72, 101)
  // this.game.load.image('hero', 'assets/Players/bunny1_hurt.png', 72, 101)
  // this.game.load.atlas('hero', 'assets/Players/bunny1.png', 'assets/Players/bunny1.json')
  this.game.load.spritesheet('hero', 'assets/Unused/bunny1_sheet.png', 70, 101)

  this.game.load.image('icon:coin', 'images/coin_icon.png')
  this.game.load.image('key', 'images/key.png')
  this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22)
  this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30)
  this.game.load.spritesheet('door', 'images/door.png', 42, 66)
}

PlayState.create = function () {
  // this.game.physics.startSystem(Phaser.Physics.ARCADE)

  this.game.add.image(0, 0, 'background')
  // this.game.add.image(0, 546, 'ground')
  this._loadLevel(this.game.cache.getJSON(`level:${this.level}`))
  this._createHUD()

}

PlayState._loadLevel = function (data) {
  this.bgDecoration = this.game.add.group()
  this.platforms = this.game.add.group()
  // data.decoration.forEach(function (deco) {
  //       this.bgDecoration.add(
  //           this.game.add.image(deco.x, deco.y, 'decoration', deco.frame))
  //   }, this)
  data.platforms.forEach(this._spawnPlatform, this)
  this._spawnCharacters({hero: data.hero})
  this.coins = this.game.add.group()
  data.coins.forEach(this._spawnCoin, this)
  this._spawnKey(data.key.x, data.key.y)
  this._spawnDoor(data.door.x, data.door.y)
  const GRAVITY = 1200
  this.game.physics.arcade.gravity.y = GRAVITY
}

PlayState._spawnDoor = function (x, y) {
  this.door = this.bgDecoration.create(x, y, 'door')
  this.door.anchor.setTo(0.5, 1)
  this.game.physics.enable(this.door)
  this.door.body.allowGravity = false
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

PlayState._spawnKey = function (x, y) {
  this.key = this.bgDecoration.create(x, y, 'key')
  this.key.anchor.set(0.5, 0.5)
  this.game.physics.enable(this.key)
  this.key.body.allowGravity = false
  this.key.y -= 3
  this.game.add.tween(this.key)
    .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
    .yoyo(true)
    .loop()
    .start()
}

PlayState._spawnCoin = function (coin) {
  let sprite = this.coins.create(coin.x, coin.y, 'coin')
  sprite.anchor.set(0.5, 0.5)
  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true)
  sprite.animations.play('rotate')
  this.game.physics.enable(sprite)
  sprite.body.allowGravity = false
}

PlayState._createHUD = function () {
  const NUMBERS_STR = '0123456789X '
  this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
    NUMBERS_STR)
  this.keyIcon = this.game.make.image(0, 19, 'icon:key')
  this.keyIcon.anchor.set(0, 0.5)
  let coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin')
  let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
    coinIcon.height / 2, this.coinFont)
  coinScoreImg.anchor.set(0, 0.5)
  this.hud = this.game.add.group()
  this.hud.add(this.keyIcon)
  this.hud.add(coinIcon)
  this.hud.add(coinScoreImg)
  this.hud.position.set(10, 10)
}


PlayState._onHeroVsCoin = function (hero, coin) {
  coin.kill()
  this.coinPickupCount++
}

PlayState._onHeroVsKey = function (hero, key) {
  key.kill()
  this.hasKey = true
}

PlayState._onHeroVsDoor = function (hero, door) {
  // advance to the next game level
  this.game.state.restart(true, false, {level: this.level + 1})
}

PlayState.update = function () {
  this._handleCollisions()
  this._handleInput()
  this.coinFont.text = `x${this.coinPickupCount}`
  this.keyIcon.frame = this.hasKey ? 1 : 0
}

PlayState._handleCollisions = function () {
  this.game.physics.arcade.collide(this.hero, this.platforms)
  this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin, null, this)
  this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey, null, this)
  this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
    function (hero, door) {
      return this.hasKey && hero.body.touching.down
    }, this)
  this.game.physics.arcade.checkCollision.top = false
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

function reset() {
  location.reload()
}
