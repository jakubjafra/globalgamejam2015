/*
i - island
s - siren
d,f,g - stones(1, 2, 3)
hexcode - big island (0 - kupiecka, 1 - czarna)
p - port
m,n,b - fale
W - twister
w - wreck
*/

/*
var mapDesc = [
	".0Ip..1pII..........",
	".IIII.IIII.....i....",
	".IIII.IIII...g......",
	".IIII.III..........d",
	"........s...........",
	"...........mnb......",
	"...i.W...w...d......",
	"........i...........",
	"....................",
];
*/

var mapDesc = [
	".....d...g...n....w....d....m....W......n.....g...",
	"..W......b...0Ip..............i.....f......m....W.",
	"...m...s.....IIII......W..b..w..d....i....s....i..",
	"..........g..IIII..d.m....s......n.......n..b.....",
	".n..g..m.....IIII......i..w...1pII...w.......f....",
	"b..........m....b.....n.......IIII.....m.d.....i..",
	"...i.W...w...d...w........g...IIII..f......W..s...",
	"........i.n.......s...i.......III..............m..",
	"..m..s.........f.m.........i.......s...w..i.......",
	".i.......f..m...........g.......W........b.....d.."
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
			return false;
	}

	var tile = MapTiles.findOne({top: playerState.top, left: playerState.left});
	if(tile == undefined || (tile.type !== "." && tile.type !== "p" && tile.type !== "b" && tile.type !== "n" && tile.type !== "m" && tile.type !== "1" && tile.type !== "W")){
		console.log("refused movement");
		return false;
	}
	

	var objs = MapObjects.findOne({top: playerState.top, left: playerState.left});

	if(objs != undefined){
		CurrentTurn.update({t: CURR_TURN.STATE}, {$set: {value: TURN.STATE_COMBAT}});
		CurrentTurn.update({t: CURR_TURN.COUNTER}, {$set: {timeleft: TURN.DURATION_COMBAT}});
	}

	change.$set = {lastCommand: what};

	if(tile.type == "W"){
		var x = MapTiles.find({type: '.'}).fetch();
		var y = x[Math.floor(x.length * Math.random())];

		change = {$set: {left: y.left, top: y.top, lastCommand: what}};
	}


	MapObjects.update({_id: objectId}, change);

	return true;
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
	var target = MapObjects.findOne({_id: objId});
	if(target == undefined)
		return;

	var possibilites = [];
	if(target.hp.white > 0)
		possibilites.push('hp.white');
	if(target.hp.black > 0)
		possibilites.push('hp.black');

	var descreaseHpType = possibilites[Math.floor(possibilites.length * Math.random())];

	if(descreaseHpType == 'hp.white')
		MapObjects.update({_id: objId}, {$set: {currTurnState: OBJS_STATE.HITTED}, $inc: {'hp.white': -1}});
	else
		MapObjects.update({_id: objId}, {$set: {currTurnState: OBJS_STATE.HITTED}, $inc: {'hp.black': -1}});

	MapObjects.update({$and: [{_id: objId}, {'hp.white': {$lte: 0}}]}, {$set: {behaviour: MERCHANTS.STUPID}});
	MapObjects.remove({$and: [{'hp.white': {$lte: 0}}, {'hp.black': {$lte: 0}}]});
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

function willAttack(obj, type){
	return Math.floor(Math.random() * (MERCHANTS.NORMAL + 1)) == 1;
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
					if(willAttack(obj, obj.behaviour)){
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

var attackModifier = {
	"attack": 1.75,
	"defense": 0.5,
	"run": 0
};

var defenseModifier = {
	"attack": 0.5,
	"defense": 1,
	"run": 0.25
};


function getEnemyOrder(enemy){
	switch(enemy.behaviour){
		case MERCHANTS.STUPID:
			return "run";

		case MERCHANTS.NORMAL:
			if(enemy.hp.white == 0)
				return "run";
			else if(enemy.hp.white >= enemy.hp.black)
				return "attack";
			else
				return "defense";

		case MERCHANTS.AGGRESIVE:
			return "attack";
	}
}

function getLosts(factor){
	if(factor < 1.5)
		return 0;
	else if(factor < 2)
		return 1;
	else if(factor < 3)
		return 2;
	else
		return 3;
}

function updateCombat(order){
	if(order == "")
		order = "defense";

	var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
	var enemy = MapObjects.findOne({type: OBJS_TYPES.MERCHANT, top: player.top, left: player.left});

	if(enemy == undefined){
		CurrentTurn.update({t: CURR_TURN.STATE}, {$set: {value: TURN.STATE_MAP}});
		return;
	}

	var playerOrder = order;
	var enemyOrder = getEnemyOrder(enemy);

	var playerBaseAttack = player.hp.white * 2 + player.hp.black;
	var enemyBaseAttack = enemy.hp.white * 2 + enemy.hp.black;

	var playerBaseDefense = player.hp.white + player.hp.black * 2;
	var enemyBaseDefense = enemy.hp.white + enemy.hp.black * 2;

	var playerAttack = playerBaseAttack * attackModifier[playerOrder];
	var enemyAttack = enemyBaseAttack * attackModifier[enemyOrder];

	var playerDefense = playerBaseDefense * defenseModifier[playerOrder];
	var enemyDefense = enemyBaseDefense * defenseModifier[enemyOrder];

	var playerHPLost = getLosts(enemyAttack / playerDefense);
	var enemyHPLost = getLosts(playerAttack / enemyDefense);

	console.log("you choosed " + playerOrder);
	console.log("they choosed " + enemyOrder);

	CurrentTurn.update({t: CURR_TURN.COMBAT_LAST_ORDERS}, {$set: {player: playerOrder, enemy: enemyOrder}});

	if(playerOrder == "run"){
		var haveRunned = Math.floor(3 * Math.random()) >= 1;
		if(haveRunned){
			if(moveObject(player._id, directions[Math.floor(directions.length * Math.random())]) == true){
				CurrentTurn.update({t: CURR_TURN.STATE}, {$set: {value: TURN.STATE_MAP}});
				return;
			}
			else
				console.log("you didnt run away!");
		}
	}

	if(enemyOrder == "run"){
		var haveRunned = Math.floor(3 * Math.random()) >= 1;
		if(haveRunned){
			if(moveObject(enemy._id, directions[Math.floor(directions.length * Math.random())]) == true){
				CurrentTurn.update({t: CURR_TURN.STATE}, {$set: {value: TURN.STATE_MAP}});
				return;
			}
			else
				console.log("they didnt run away!");
		}
	}


	if(playerHPLost >= (player.hp.black + player.hp.white)){
		console.log("YOU LOST!");
		CurrentTurn.update({t: CURR_TURN.STATE}, {$set: {value: TURN.STATE_GAME_LOST}});
	} else{
		var playerBlackLosts = 0;
		var playerWhiteLosts = 0;
		if(player.hp.black > playerHPLost)
			playerBlackLosts = playerHPLost;
		else if(player.hp.black == 0)
			playerWhiteLosts = playerHPLost;
		else{
			playerBlackLosts = player.hp.black;
			playerHPLost -= player.hp.black;
			playerWhiteLosts = playerHPLost;
		}

		console.log("after attack you lost " + playerBlackLosts + " czarnych " + playerWhiteLosts + " białych");

		MapObjects.update({type: OBJS_TYPES.PLAYER}, {$inc: {'hp.black': -playerBlackLosts, 'hp.white': -playerWhiteLosts}});
	}

	if(enemyHPLost >= (enemy.hp.black + enemy.hp.white)){
		console.log("they died! you have won!");
		MapObjects.remove({type: OBJS_TYPES.MERCHANT, top: player.top, left: player.left});
		CurrentTurn.update({t: CURR_TURN.STATE}, {$set: {value: TURN.STATE_FIGHT_SUMMARY}});
	} else{
		var enemyBlackLosts = 0;
		var enemyWhiteLosts = 0;
		if(enemy.hp.black > enemyHPLost)
			enemyBlackLosts = enemyHPLost;
		else if(enemy.hp.black == 0)
			enemyWhiteLosts = enemyHPLost;
		else{
			enemyBlackLosts = enemy.hp.black;
			enemyHPLost -= enemyBlackLosts;
			enemyWhiteLosts = enemyHPLost;
		}

		console.log("after attack they lost " + enemyBlackLosts + " czarnych " + enemyWhiteLosts + " białych");

		MapObjects.update({type: OBJS_TYPES.MERCHANT, top: player.top, left: player.left}, {$inc: {'hp.black': -enemyBlackLosts, 'hp.white': -enemyWhiteLosts}});
	}
}

Meteor.startup(function(){
	(function makeMap(map, objs){
		Chat.remove({});
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
		CurrentTurn.insert({t: CURR_TURN.COMBAT_LAST_ORDERS, player: "", enemy: ""});
	})(mapDesc, objsDesc);

	Meteor.setInterval(function(){
		var turn = CurrentTurn.findOne({t: CURR_TURN.COUNTER});
		var state = CurrentTurn.findOne({t: CURR_TURN.STATE});

		if(turn.timeleft > 0){
			CurrentTurn.update({t: CURR_TURN.COUNTER}, {$inc: {timeleft: -1}});
			return;
		}

		MapObjects.update({}, {$set: {currTurnState: OBJS_STATE.NORMAL}}, {multi: true});

		switch(state.value){
			case TURN.STATE_MAP:
				CurrentTurn.update({t: CURR_TURN.COUNTER}, {$set: {timeleft: TURN.DURATION}});

				updateAgents();

				var order = CurrentTurnOrders.findOne({}, { sort: {"seq": -1} });

				if(order == undefined)
					return;

				CurrentTurnOrders.remove({});

				doOrder(MapObjects.findOne({type: OBJS_TYPES.PLAYER})._id, order.what, state.value);
				break;

			case TURN.STATE_COMBAT:
				CurrentTurn.update({t: CURR_TURN.COUNTER}, {$set: {timeleft: TURN.DURATION_COMBAT}});

				var order = CurrentTurnOrders.findOne({}, { sort: {"seq": -1} });

				CurrentTurnOrders.remove({});

				if(order != undefined && order.what != undefined)
					updateCombat(order.what);
				else
					updateCombat("");
				break;

			case TURN.STATE_FIGHT_SUMMARY:
				CurrentTurn.update({t: CURR_TURN.STATE}, {$set: {value: TURN.STATE_MAP}});
				break;

			default:
				break;
		}
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