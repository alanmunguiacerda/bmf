const tileSize = 32;
const tilesWidth = 20;
const tilesHeight = 20;

const TILES = {
    GRASS: 0,
    MOUNTAIN: 1,
    RAVINE: 2,
    WATER: 3,
    WALL: 4,
    PIROLO: 5,
    BOMBO: 6,
    LUCAS: 7,
    HOUSE: 8
}

var OBJECTS = {
    PIROLO: null,
    BOMBO: null,
    LUCAS: null,
    HOUSE: null
}

var game = new Phaser.Game(640, 640, Phaser.CANVAS, 'gameDiv', { preload: preload, create: create, update: update, render: render });
// var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('tileset', '../img/tileset_32.png');
    game.load.image('objects', '../img/objects_32.png');

}

var map;
var layer1;
var layer2;

var marker;
var currentTile = 0;
var currentLayer;

var cursors;
var showLayersKey;
var layer1Key;
var layer2Key;

function create() {
    map = game.add.tilemap();
    map.addTilesetImage('tileset');
    resetMap();
    setKeys();
}

function resetMap(){
    layer1 = map.create('level1', tilesWidth, tilesHeight, tileSize, tileSize);
    layer1.resizeWorld();
    layer2 = map.createBlankLayer('level2', tilesWidth, tilesHeight, tileSize, tileSize);
    currentLayer = layer1;
    map.fill(TILES.GRASS, 0, 0, tilesWidth, tilesHeight, layer1);
    createTileSelector();
}

function setKeys() {
    game.input.addMoveCallback(updateMarker, this);

    cursors = game.input.keyboard.createCursorKeys();

    showLayersKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    layer1Key = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    layer2Key = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
    layer3Key = game.input.keyboard.addKey(Phaser.Keyboard.THREE);

    showLayersKey.onDown.add(changeLayer, this);
    layer1Key.onDown.add(changeLayer, this);
    layer2Key.onDown.add(changeLayer, this);
    layer3Key.onDown.add(changeLayer, this);
}

function changeLayer(key) {

    switch (key.keyCode)
    {
        case Phaser.Keyboard.SPACEBAR:
            layer1.alpha = 1;
            layer2.alpha = 1;
            break;

        case Phaser.Keyboard.ONE:
            currentLayer = layer1;
            layer1.alpha = 1;
            layer2.alpha = 0;
            break;

        case Phaser.Keyboard.TWO:
            currentLayer = layer2;
            layer1.alpha = 0.9;
            layer2.alpha = 1;
            break;
    }

}

function pickTile(sprite, pointer) {

    currentTile = game.math.snapToFloor(pointer.x, tileSize) / tileSize;

}

function switchLayer() {
    if(currentTile == TILES.PIROLO || currentTile == TILES.BOMBO || currentTile == TILES.LUCAS || currentTile == TILES.HOUSE ){
        currentLayer = layer2;
    }else{
        currentLayer = layer1;
    }
}

function checkObjects() {
    switch (currentTile) {
        case TILES.PIROLO:
            if (OBJECTS.PIROLO){
                map.removeTile(OBJECTS.PIROLO.x, OBJECTS.PIROLO.y, layer2);
            }
            OBJECTS.PIROLO = {
                'x': layer2.getTileX(marker.x),
                'y': layer2.getTileY(marker.y),
            }
            break;
        case TILES.BOMBO:
            if (OBJECTS.BOMBO){
                map.removeTile(OBJECTS.BOMBO.x, OBJECTS.BOMBO.y, layer2);
            }
            OBJECTS.BOMBO = {
                'x': layer2.getTileX(marker.x),
                'y': layer2.getTileY(marker.y),
            }
            break;
        case TILES.LUCAS:
            if (OBJECTS.LUCAS){
                map.removeTile(OBJECTS.LUCAS.x, OBJECTS.LUCAS.y, layer2);
            }
            OBJECTS.LUCAS = {
                'x': layer2.getTileX(marker.x),
                'y': layer2.getTileY(marker.y),
            }
            break;
        case TILES.HOUSE:
            if (OBJECTS.HOUSE){
                map.removeTile(OBJECTS.HOUSE.x, OBJECTS.HOUSE.y, layer2);
            }
            OBJECTS.HOUSE = {
                'x': layer2.getTileX(marker.x),
                'y': layer2.getTileY(marker.y),
            }
            break;
        default:

    }
}

function updateMarker() {

    marker.x = currentLayer.getTileX(game.input.activePointer.worldX) * tileSize;
    marker.y = currentLayer.getTileY(game.input.activePointer.worldY) * tileSize;

    if(currentLayer.getTileY(marker.y) == 0){
        return;
    }

    if (game.input.mousePointer.isDown)
    {
        switchLayer();
        checkObjects();
        map.putTile(currentTile, currentLayer.getTileX(marker.x), currentLayer.getTileY(marker.y), currentLayer);
    }

}

function update() {

    if (cursors.left.isDown)
    {
        game.camera.x -= 4;
    }
    else if (cursors.right.isDown)
    {
        game.camera.x += 4;
    }

    if (cursors.up.isDown)
    {
        game.camera.y -= 4;
    }
    else if (cursors.down.isDown)
    {
        game.camera.y += 4;
    }

}

function render() {

    game.debug.text('Current Layer: ' + currentLayer.name, 16, 630);

}

function createTileSelector() {

    //  Our tile selection window
    var tileSelector = game.add.group();

    var tileSelectorBackground = game.make.graphics();
    tileSelectorBackground.beginFill(0x000000, 0.5);
    tileSelectorBackground.drawRect(0, 0, 160, tileSize);
    tileSelectorBackground.endFill();

    tileSelector.add(tileSelectorBackground);

    var tileStrip = tileSelector.create(1, 1, 'tileset');
    tileStrip.inputEnabled = true;
    tileStrip.events.onInputDown.add(pickTile, this);

    tileSelector.fixedToCamera = true;

    //  Our painting marker
    marker = game.add.graphics();
    marker.lineStyle(2, 0x000000, 1);
    marker.drawRect(0, 0, tileSize, tileSize);

}

function mapToGraph(){
    var graph = {}
    for (var y=1; y<tilesHeight; y++){
        for (var x=0; x<tilesWidth; x++){
            graph[y+','+x] = {
                'type': map.getTile(x, y, layer1).index,
                'weights': {}
            };
        }
    }

    graph['PIROLO'] = OBJECTS.PIROLO;
    graph['BOMBO'] = OBJECTS.BOMBO;
    graph['LUCAS'] = OBJECTS.LUCAS;
    graph['HOUSE'] = OBJECTS.HOUSE;
    return graph;
}

function deleteAgent(agent){
    map.removeTile(OBJECTS[agent].x, OBJECTS[agent].y, layer2);
}

function moveAgent(newX, newY, agent){
    map.removeTile(OBJECTS[agent].x, OBJECTS[agent].y, layer2);
    OBJECTS[agent].x = newX;
    OBJECTS[agent].y = newY;
    map.putTile(TILES[agent], newX, newY, layer2);
}
