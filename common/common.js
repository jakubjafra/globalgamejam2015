Chat = new Mongo.Collection("chat");

CurrentTurn = new Mongo.Collection("current_turn");

CURR_TURN = {
	COUNTER: 1,
	STATE: 2
};

CurrentTurnOrders = new Mongo.Collection("current_turn_orders");

TURN = {
	DURATION: 2,
	STATE_MAP: 1,
	STATE_COMBAT: 2
};

ORDERS = [
	'top',
	'left',
	'right',
	'bottom',
	'fire'
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
	PLAYER: 1,
	MERCHANT: 2
};

MERCHANTS = {
	STUPID: 0,
	NORMAL: 1,
	AGGRESIVE: 2
};

OBJS_STATE = {
	NORMAL: 0,
	HITTED: 1
};

Obj = function(x, y, type){
	this.left = x;
	this.top = y;
	this.type = type;

	this.lastCommand = "top";

	this.currTurnState = OBJS_STATE.NORMAL;
}

Player = function(x, y){
	return new Obj(x, y, OBJS_TYPES.PLAYER);
}

Merchant = function(x, y, t){
	var obj = new Obj(x, y, OBJS_TYPES.MERCHANT);
	obj.behaviour = t;
	return obj;
}