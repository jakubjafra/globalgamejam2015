/*
i - island
s - siren
d,f,g - stones(1, 2, 3)
hexcode - big island
*/

var mapDesc = [
	".0Ip..1pII..........",
	".IIII.IIII.....i....",
	".IIII.IIII...g......",
	".IIII.III..........d",
	"........s...........",
	"....................",
	"...i.........d......",
	"........i...........",
	"....................",
];

var objsDesc = [
	//new Merchant(3, 3, MERCHANTS.NORMAL),
	new Player(7, 8),
	new Merchant(8, 8, MERCHANTS.AGGRESIVE)
];

function isOrder(what){
	for(var i = 0; i < ORDERS.length; i++)
		if(what === ORDERS[i])
			return true;

	return false;
}

var directions = ["top", "left", "bottom", "right"];

function doOrder(objectId, what, gamestate){
	switch(gamestate){
		case TURN.STATE_MAP:
				switch(what){
					case "top":
					case "left":
					case "bottom":
					case "right":
						moveObject(objectId, what);
						break;

					case "fire":
						playerRandFire(objectId);
						break;

					default:
						break;
				}
			break;

		case TURN.STATE_COMBAT:
				console.log(what);
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
	if(tile == undefined || (tile.type !== "." && tile.type !== "p" && tile.type !== "1")){
		console.log("refused movement");
		return;
	}

	var objs = MapObjects.findOne({top: playerState.top, left: playerState.left});

	if(objs != undefined){
		CurrentTurn.update({t: CURR_TURN.STATE}, {$set: {value: TURN.STATE_COMBAT}});
	}

	change.$set = {lastCommand: what};

	MapObjects.update({_id: objectId}, change);
}

function playerRandFire(objectId){
	var objState = MapObjects.findOne({_id: objectId, type: {$ne: 0}});
	if(objState == undefined)
		return;

	var minTop = objState.top - 2;
	var maxTop = objState.top + 2;
	var minLeft = objState.left - 2;
	var maxLeft = objState.left + 2;

	var objectInRange = MapObjects.find({$and: [ { _id: {$ne: objectId} },
		{ $and: [
			{ top: {$gte: minTop} },
			{ top: {$lte: maxTop} }
		] }, 
		{ $and: [
			{ left: {$gte: minLeft} },
			{ left: {$lte: maxLeft} }
		] } ]
	}).fetch();

	if(objectInRange.length == 0)
		return;

	var choosedId = Math.floor(Math.random() * objectInRange.length);
	var choosed = objectInRange[choosedId];

	console.log("player fired at " + choosed._id);
	makeFireOn(choosed._id);
}

function makeFireOn(objId){
	MapObjects.update({_id: objId}, {$set: {currTurnState: OBJS_STATE.HITTED}});
}

function fireObjectAt(objectId, whatId){
	if(whatId == MapObjects.findOne({type: OBJS_TYPES.PLAYER})._id)
		console.log(objectId + " fired at player");
	else
		console.log(objectId + " fired at " + whatId);

	makeFireOn(whatId);
}

function randDirection(){
	var dirId = Math.floor(Math.random() * directions.length * 2);
	if(dirId >= 4)
		return "";
	else
		return directions[dirId];
}

function isPlayerInFireRange(object){
	var playerId = MapObjects.findOne({type: OBJS_TYPES.PLAYER})._id;

	var minTop = object.top - 2;
	var maxTop = object.top + 2;
	var minLeft = object.left - 2;
	var maxLeft = object.left + 2;

	var objectInRange = MapObjects.findOne({$and: [ { _id: playerId },
		{ $and: [
			{ top: {$gte: minTop} },
			{ top: {$lte: maxTop} }
		] }, 
		{ $and: [
			{ left: {$gte: minLeft} },
			{ left: {$lte: maxLeft} }
		] } ]
	});

	if(objectInRange == undefined)
		return false;
	else{
		console.log(objectInRange);
		return objectInRange._id;
	}
}

function isPlayerInDirectAttackRange(object){
	var playerId = MapObjects.findOne({type: OBJS_TYPES.PLAYER})._id;

	var minTop = object.top - 1;
	var maxTop = object.top + 1;
	var minLeft = object.left - 1;
	var maxLeft = object.left + 1;

	var objectInRange = MapObjects.findOne({_id: playerId,
		$or: [
			{ top: {$eq: minTop} },
			{ top: {$eq: maxTop} },
			{ left: {$eq: minLeft} },
			{ left: {$eq: maxLeft} }
		]
	});

	if(objectInRange == undefined)
		return false;
	else
		return objectInRange._id;
}

function willAttack(obj){
	return Math.floor(Math.random() * 2) == 1;
}

function updateAgents(){
	MapObjects.find({type: {$ne: OBJS_TYPES.PLAYER}}).fetch().forEach(function(obj){
		switch(obj.behaviour){
			case MERCHANTS.STUPID:
				moveObject(obj._id, randDirection());
				break;

			case MERCHANTS.NORMAL:
			case MERCHANTS.AGGRESIVE:
				var id = false;
				if((id = isPlayerInFireRange(obj)) != false){
					if(willAttack(obj)){
						fireObjectAt(obj._id, id);
					} else
						moveObject(obj._id, randDirection());
				} else
					moveObject(obj._id, randDirection());
				break;

			default:
				return;
		}
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
		CurrentTurn.insert({t: CURR_TURN.STATE, value: TURN.STATE_MAP});
	})(mapDesc, objsDesc);

	Meteor.setInterval(function(){
		var turn = CurrentTurn.findOne({t: CURR_TURN.COUNTER});
		var state = CurrentTurn.findOne({t: CURR_TURN.STATE});

		if(turn.timeleft > 0){
			CurrentTurn.update({t: CURR_TURN.COUNTER}, {$inc: {timeleft: -1}});
			return;
		}

		CurrentTurn.update({t: CURR_TURN.COUNTER}, {$set: {timeleft: TURN.DURATION}});

		MapObjects.update({}, {$set: {currTurnState: OBJS_STATE.NORMAL}}, {multi: true});

		switch(state.value){
			case TURN.STATE_MAP:
				// updateAgents();
				break;

			case TURN.STATE_COMBAT:
				break;

			default:
				break;
		}

		var order = CurrentTurnOrders.findOne({}, { sort: {"seq": -1} });

		if(order == undefined)
			return;

		CurrentTurnOrders.remove({});

		doOrder(MapObjects.findOne({type: OBJS_TYPES.PLAYER})._id, order.what, state.value);
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