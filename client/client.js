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

	'tileClass': function(){
		switch(this.type){
			case 'i': return "island";
			case '1': return "stones1";
			case '2': return "stones2";
			case '3': return "stones3";
			case 's': return "siren";
			case '.': return "ground";
			default: return "";
		}
	}
});

Template.Tile.rendered = function(){
	Meteor.setTimeout(_.bind(function(){
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
	'objLastMovement': function(){
		return this.lastCommand + " " + this.lastCommand + "-tmp";
	},

	'leftXY': function(){ return this.left * TILE_WIDTH; },
	'topXY': function(){ return this.top * TILE_HEIGHT; },
});

Meteor.startup(function(){
});