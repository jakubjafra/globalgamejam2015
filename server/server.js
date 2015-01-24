/*
i - island
s - stone
*/

var mapDesc = [
	"....................",
	"....................",
	".....1.........i....",
	".............3......",
	"..2...............1.",
	"........s...........",
	"....................",
	"...i.........1......",
	"........i...........",
	"....................",
];

var objsDesc = [
	new Merchant(3, 3),
	new Player(5, 5),
	new Merchant(8, 8)
];

function isOrder(what){
	for(var i = 0; i < ORDERS.length; i++)
		if(what === ORDERS[i])
			return true;

	return false;
}

var directions = ["top", "left", "bottom", "right"];

function doOrder(objectId, what){
	switch(what){
		case "top":
		case "left":
		case "bottom":
		case "right":
			moveObject(objectId, what);
			break;

		case "fire":
			console.log("PUF!");
			break;

		default:
			break;
	}
}

function moveObject(objectId, what){
	var change = {};
	var playerState = MapObjects.findOne({_id: objectId});

	switch(what){
		case "top":
			change = {$inc: {top: -1}};
			playerState.top -= 1;
			break;

		case "bottom":
			change = {$inc: {top: 1}};
			playerState.top += 1;
			break;

		case "left":
			change = {$inc: {left: -1}};
			playerState.left -= 1;
			break;

		case "right":
			change = {$inc: {left: 1}};
			playerState.left += 1;
			break;

		default:
			return;
	}

	var tile = MapTiles.findOne({top: playerState.top, left: playerState.left});
	if(tile == undefined || tile.type !== ".")
		return;

	change.$set = {lastCommand: what};

	MapObjects.update({_id: objectId}, change);
}

function movePlayer(what){
	doOrder(MapObjects.findOne({type: OBJS_TYPES.PLAYER})._id, what);
}

function updateAgents(){
	MapObjects.find({type: {$ne: OBJS_TYPES.PLAYER}}).fetch().forEach(function(obj){
		var dirId = Math.floor(Math.random() * directions.length * 2);
		if(dirId >= 4)
			return;

		moveObject(obj._id, directions[dirId]);
	});
}

Meteor.startup(function(){
	(function makeMap(map, objs){
		MapTiles.remove({});
		MapObjects.remove({});
		CurrentTurn.remove({});

		map.forEach(function(elem, indexY){
			for(var indexX = 0; indexX < elem.length; indexX++){
				MapTiles.insert(new Tile(indexX, indexY, elem[indexX]));
			}
		});

		objs.forEach(function(elem){
			MapObjects.insert(elem);
		});

		CurrentTurn.insert({t: CURR_TURN.COUNTER, timeleft: TURN.DURATION});
	})(mapDesc, objsDesc);

	Meteor.setInterval(function(){
		var turn = CurrentTurn.findOne({t: CURR_TURN.COUNTER});

		if(turn.timeleft > 0){
			CurrentTurn.update({t: CURR_TURN.COUNTER}, {$inc: {timeleft: -1}});
			return;
		}

		updateAgents();
		CurrentTurn.update({t: CURR_TURN.COUNTER}, {$set: {timeleft: TURN.DURATION}});

		var order = CurrentTurnOrders.findOne({}, { sort: {"seq": -1} });

		if(order == undefined)
			return;

		CurrentTurnOrders.remove({});

		movePlayer(order.what);
	}, 1000);

	Meteor.methods({
		'say': function(what){
			var seq = Chat.find({}).count();
			Chat.insert({ what: what, seq: seq });

			if(isOrder(what))
				CurrentTurnOrders.upsert({what: what}, {$inc: {seq: 1}});
		}
	});
});