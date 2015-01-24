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
			case '2': return "bigisland2";
			case '3': return "bigisland3";
			case '4': return "bigisland4";
			case '5': return "bigisland5";
			case '6': return "bigisland6";
			case '7': return "bigisland7";
			case '8': return "bigisland8";
			case '9': return "bigisland9";
			case 'A': return "bigislandA";
			case 'B': return "bigislandB";
			case 'C': return "bigislandC";
			case 'D': return "bigislandD";
			case 'E': return "bigislandE";
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

Meteor.startup(function(){
	MapObjects.find({}).observeChanges({
		changed: function(id, fields){
			if(fields.currTurnState != undefined){
				console.log(fields);
				console.log(id);
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
		}
	})
});