
function Level(levelIndex) {
    powerupjs.GameObjectList.call(this);

    var levelData = window.LEVELS[levelIndex];

    this.animals = [];
    this.levelIndex = levelIndex;
    this.firstMoveMade = false;

    this.add(new powerupjs.SpriteGameObject(sprites.background_level, ID.layer_background));

    var width = levelData.tiles[0].length;
    var height = levelData.tiles.length;

    var playingField = new powerupjs.GameObjectList(ID.layer_objects);
    playingField.position = new powerupjs.Vector2((powerupjs.Game.size.x - width * 73) / 2, 100);
    this.add(playingField);

    var tileField = new TileField(height, width, ID.layer_objects, ID.tiles);
    tileField.cellHeight = 72;
    tileField.cellWidth = 73;
    for (var row = 0; row < height; row++) {
        for (var col = 0; col < width; col++) {
            var t = null;

            switch (levelData.tiles[row][col]) {
                case '.' :
                    t = new Tile(sprites.field, ID.layer_objects);
                    t.sheetIndex = row + col % 2;
                    tileField.addAt(t, col, row);
                    break;
                case ' ':
                    t = new Tile(sprites.wall, ID.layer_objects);
                    t.type = TileType.background;
                    tileField.addAt(t, col, row);
                    break;
                case 'r':
                case 'b':
                case 'g':
                case 'o':
                case 'p':
                case 'y':
                case 'm':
                case 'x':
                case 'R':
                case 'B':
                case 'G':
                case 'O':
                case 'P':
                case 'Y':
                case 'M':
                case 'X':
                    t = new Tile(sprites.field, ID.layer_objects);
                    t.sheetIndex = row + col % 2;
                    tileField.addAt(t, col, row);
                    var animalSprite = sprites.penguin;
                    if (levelData.tiles[row][col] === levelData.tiles[row][col].toUpperCase())
                        animalSprite = sprites.penguin_boxed;
                    var p = new Animal(levelData.tiles[row][col], animalSprite, ID.layer_objects_1);
                    p.position = t.position.copy();
                    p.initialPosition = t.position.copy();
                    playingField.add(p);
                    this.animals.push(p);
                    break;
                case '@':
                    t = new Tile(sprites.field);
                    t.sheetIndex = row + col % 2;
                    tileField.addAt(t, col, row);
                    var s = new powerupjs.SpriteGameObject(sprites.shark, ID.layer_objects_1);
                    s.position = t.position.copy();
                    playingField.add(s);
                    this.sharks.push(s);
                    break;
                default  :
                    t = new Tile(sprites.wall, ID.layer_objects);
                    tileField.addAt(t, col, row);
                    t.type = TileType.wall;
                    break;
            }
        }
    }
    playingField.add(tileField);

    playingField.add(new AnimalSelector(ID.layer_objects_2, ID.animalSelector));

}

Level.prototype = Object.create(powerupjs.GameObjectList.prototype);
