var ENTER_KEY_CODE = 13;

var TILE_WIDTH = 64;
var TILE_HEIGHT = 64;

var VIEWPORT_WIDTH = 400;
var VIEWPORT_HEIGHT = 400;

Template.Chat.helpers({
	'chatList': function(){
		return Chat.find({}, { sort: {"seq": -1} });
	},
	'commandsList': function(){
		return CurrentTurnOrders.find({}, { sort: {"seq": -1} });
	},
	'turnTimeleft': function(){
		return CurrentTurn.findOne({t: 1}).timeleft;
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

Template.Viewport.helpers({
	'mapTilesList': function(){ return MapTiles.find({}); },
	'mapObjsList': function(){ return MapObjects.find({type: {$ne: OBJS_TYPES.PLAYER}}); },

	'leftXY': function(){ console.log(this); return this.left * TILE_WIDTH; },
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

	'tileClass': function(){
		switch(this.type){
			case 'i':
				return "island";
			case '.':
				return "ground";
			default:
				return "";
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

Meteor.startup(function () {
	Meteor.setInterval(function(){

	}, 2000);
});