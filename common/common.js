Chat = new Mongo.Collection("chat");

CurrentTurn = new Mongo.Collection("current_turn");

CURR_TURN = {
	COUNTER: 1,
	STATE: 2,
	COMBAT_LAST_ORDERS: 3
};

CurrentTurnOrders = new Mongo.Collection("current_turn_orders");

TURN = {
	DURATION: 5,
	STATE_MAP: 1,
	STATE_COMBAT: 2,
	STATE_FIGHT_SUMMARY: 3,
	STATE_GAME_LOST: 4
};

ORDERS = [
	'top',
	'left',
	'right',
	'bottom',
	'fire',
	'attack',
	'defense',
	'run'
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
	AGGRESIVE: 1,
	NORMAL: 2
};

OBJS_STATE = {
	NORMAL: 0,
	HITTED: 1
};

Obj = function(x, y, type){
	this.left = x;
	this.top = y;
	this.type = type;

	this.hp = {
		white: 5,
		black: 5
	};

	this.lastCommand = "top";

	this.currTurnState = OBJS_STATE.NORMAL;
}

Player = function(x, y){
	return new Obj(x, y, OBJS_TYPES.PLAYER);
}

Merchant = function(x, y, t){
	var obj = new Obj(x, y, OBJS_TYPES.MERCHANT);
	obj.behaviour = t;
	obj.hp = {
		white: 10,
		black: 0
	};
	return obj;
}