Chat = new Mongo.Collection("chat");

CurrentTurn = new Mongo.Collection("current_turn");

CURR_TURN = {
	COUNTER: 1
};

CurrentTurnOrders = new Mongo.Collection("current_turn_orders");

TURN = {
	DURATION: 1
};

ORDERS = [
	'top',
	'left',
	'right',
	'bottom'
];

MapTiles = new Mongo.Collection("map_tiles");

Tile = function(x, y, t){
	this.left = x;
	this.top = y;
	this.type = t;
}

MapObjects = new Mongo.Collection("map_objs");

OBJS_TYPES = {
	INVALID_ID: 0,
	PLAYER: 1
};

Obj = function(x, y, type){
	this.left = x;
	this.top = y;
	this.type = type;

	this.lastCommand = "top";
}

Player = function(x, y){
	return new Obj(x, y, OBJS_TYPES.PLAYER);
}