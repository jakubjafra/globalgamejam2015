var mapDesc = [
	"......",
	"......",
	"..i...",
	"......",
	"......",
	"....i."
];

var objsDesc = [
	new Player(3, 3)
];

function isOrder(what){
	for(var i = 0; i < ORDERS.length; i++)
		if(what === ORDERS[i])
			return true;

	return false;
}

function movePlayer(what){
	var change = {};
	var playerState = MapObjects.find({type: OBJS_TYPES.PLAYER});

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

	// TODO: sprawdź co to za tile

	change.$set = {lastCommand: what};

	MapObjects.update({type: OBJS_TYPES.PLAYER}, change);
	console.log("player moved " + what);
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