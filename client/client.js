var ENTER_KEY_CODE = 13;

var TILE_WIDTH = 64;
var TILE_HEIGHT = 64;

var VIEWPORT_WIDTH = 800;
var VIEWPORT_HEIGHT = 400;

Template.Chat.helpers({
	'chatList': function(){
		return Chat.find({}, { sort: {"seq": -1} });
	},
	'commandsList': function(){
		return CurrentTurnOrders.find({}, { sort: {"seq": -1} });
	},
	'turnTimeleft': function(){
		return CurrentTurn.findOne({t: CURR_TURN.COUNTER}).timeleft;
	}
});

Template.Chat.events({
	'keypress #chat_input': function(event){
		if(event.which == ENTER_KEY_CODE){
			var inputedText = $(event.currentTarget).val();
			$(event.currentTarget).val("");

			Meteor.call('say', inputedText);
		}
	}
});

Template.Tile.helpers({
	'leftXY': function(){ return this.left * TILE_WIDTH; },
	'topXY': function(){ return this.top * TILE_HEIGHT; },

	'isNotMare': function(){
		return this.type != '.';
	},
	'isMerchantIsland': function(){
		return this.type == '0';
	},
	'isMurzynskaIsland': function(){
		return this.type == '1';
	},
	'isSiren': function(){
		return this.type == "s";
	},

	'id': function(){
		return this._id;
	},

	'tileClass': function(){
		switch(this.type){
			case 'i': return "island";
			case 'd': return "stones1";
			case 'f': return "stones2";
			case 'g': return "stones3";
			case 's': return "siren";
			case '.': return "ground";
			case '0': return "bigisland0";
			case '1': return "bigisland1";
			case 'w': return "wreck";
			case 'W': return "twister";
			default: return "";
		}
	}
});

Template.Tile.rendered = function(){
	Meteor.setTimeout(_.bind(function(){
			if(this.findAll(".map_tile > div").length)
				this.findAll(".map_tile > div")[0].className += "animation";
		}, this),
		Math.floor(Math.random() * 2000)
	);
}

Template.Viewport.helpers({
	'mapTilesList': function(){ return MapTiles.find({}); },
	'mapObjsList': function(){ return MapObjects.find({type: {$ne: OBJS_TYPES.PLAYER}}); },

	'leftXY': function(){ return this.left * TILE_WIDTH; },
	'topXY': function(){ return this.top * TILE_HEIGHT; },

	'viewport': function(){
		return {
			width: VIEWPORT_WIDTH,
			height: VIEWPORT_HEIGHT
		};
	},

	'viewportOffsetTop': function(){
		var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
		if(player == undefined)
			return 0;
		else{
			player.top *= TILE_HEIGHT;
			return (-player.top - TILE_HEIGHT / 2 + VIEWPORT_HEIGHT / 2);
		}
	},
	'viewportOffsetLeft': function(){
		var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
		if(player == undefined)
			return 0;
		else{
			player.left *= TILE_WIDTH;
			return (-player.left - TILE_WIDTH / 2 + VIEWPORT_WIDTH / 2);
		}
	},

	'objClass': function(){
		return "";
	},
	'objLastMovement': function(){
		return this.lastCommand + " " + this.lastCommand + "-tmp";
	}
});

Template.Player.helpers({
	'objClass': function(){
		return "player";
	},
	'objLastMovement': function(){
		var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
		return player.lastCommand + " " + player.lastCommand + "-tmp";
	},
	'id': function(){
		return MapObjects.findOne({type: OBJS_TYPES.PLAYER})._id;
	}
});

Template.Obj.helpers({
	'objClass': function(){
		switch(this.type){
			case OBJS_TYPES.MERCHANT:
				return "merchant";

			default:
				return "";
		}
	},
	'id': function(){
		return this._id;
	},
	'objLastMovement': function(){
		return this.lastCommand + " " + this.lastCommand + "-tmp";
	},

	'leftXY': function(){ return this.left * TILE_WIDTH; },
	'topXY': function(){ return this.top * TILE_HEIGHT; }
});

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

Template.Combat.helpers({
	'isCombatMode': function(){
		var val = CurrentTurn.findOne({t: CURR_TURN.STATE}).value;
		return val == TURN.STATE_COMBAT || val == TURN.STATE_FIGHT_SUMMARY;
	},
	'playerDefense': function(){
		var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
		return player.hp.white + player.hp.black * 2;
	},
	'playerAttack': function(){
		var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
		return player.hp.white * 2 + player.hp.black;
	},
	'playerLastCommand': function(){
		var r = CurrentTurn.findOne({t: CURR_TURN.COMBAT_LAST_ORDERS});
		return r.player;
	},
	'enemyLastCommand': function(){
		var r = CurrentTurn.findOne({t: CURR_TURN.COMBAT_LAST_ORDERS});
		return r.player;
	},
	'enemyDefense': function(){
		var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
		var enemy = MapObjects.findOne({type: OBJS_TYPES.MERCHANT, top: player.top, left: player.left});
		return enemy.hp.white + enemy.hp.black * 2;
	},
	'enemyAttack': function(){
		var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
		var enemy = MapObjects.findOne({type: OBJS_TYPES.MERCHANT, top: player.top, left: player.left});
		return enemy.hp.white * 2 + enemy.hp.black;
	},
	'playerPiratesCount': function(){
		var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
		return player.hp.white + player.hp.black;
	},
	'playerPirates': function(){
		var arr = [];
		var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
		for(var i = 0; i < player.hp.white; i++) arr.push({what: "bialy"});
		for(var i = 0; i < player.hp.black; i++) arr.push({what: "czarny"});
			shuffle(arr);
		return arr;
	},
	'enemyPiratesCount': function(){
		var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
		var enemy = MapObjects.findOne({type: OBJS_TYPES.MERCHANT, top: player.top, left: player.left});
		return enemy.hp.white + enemy.hp.black;
	},
	'enemyPirates': function(){
		var arr = [];
		var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
		var enemy = MapObjects.findOne({type: OBJS_TYPES.MERCHANT, top: player.top, left: player.left});
		for(var i = 0; i < enemy.hp.black; i++) arr.push({what: "czarny"});
		for(var i = 0; i < enemy.hp.white; i++) arr.push({what: "bialy"});
			shuffle(arr);
		return arr;
	}
});

Template.GameLost.helpers({
	'isGameOverMode': function(){
		var val = CurrentTurn.findOne({t: CURR_TURN.STATE}).value;
		return val == TURN.STATE_GAME_LOST;
	}
});

Meteor.startup(function(){
	/*
	CurrentTurn.find({t: CURR_TURN.STATE}).observeChanges({
		changed: function(id, fields){
			console.log(fields);
		}
	});
	*/

	CurrentTurn.find({t: CURR_TURN.COMBAT_LAST_ORDERS}).observe({
		changed: function(newDoc, oldDoc){
			console.log(newDoc);
		}
	});

	MapObjects.find({}).observeChanges({
		changed: function(id, fields){
			console.log(fields);

			if(fields.currTurnState != undefined){
				switch(fields.currTurnState){
					case OBJS_STATE.NORMAL:
						$("#"+id+" > img").removeClass("on_hitted");
						break;

					case OBJS_STATE.HITTED:
						$("#"+id+" > img").addClass("on_hitted");
						break;

					default:
						break;
				}
			}

			var player = MapObjects.findOne({type: OBJS_TYPES.PLAYER});
			if(id == player._id && (fields.top != undefined || fields.left != undefined)){
				$(".siren").each(function(){
					var ID = $(this).attr("id");
					var sirenData = MapTiles.findOne({_id: ID});

					var len = Math.sqrt((sirenData.top - player.top) * (sirenData.top - player.top) +
								(sirenData.left - player.left) * (sirenData.left - player.left));

					if(len < 2)
						$(this).addClass("nearby");
					else
						$(this).removeClass("nearby");
				});
			}
		}
	})
});