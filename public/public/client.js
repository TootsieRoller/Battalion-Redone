var socket = false;
if(typeof io!=='undefined')
{
socket = io();
// Socket events

var LOG = {
	list:[],
	indexer:0,
	display:function(){
		// if(!loaded)return;
		devCanvas.clearRect(0, 0, Canvas.Width, Canvas.Height);
		var level = 0;
		for(var i in this.list)
		{
			this.list[i].txt.Draw(devCanvas, 10, (level++)*30, 600, 15, this.list[i].index+": "+this.list[i].msg);
		}
	},
	add:function(msg, color, time){
		if(time==null)time = 10000;
		if(this.list.length==0)
		{
			this.indexer = 0;
		}
		this.list.push({
			txt:new Text_Class("20pt Times New Roman", color),
			msg:msg,
			index:this.indexer
		});
		this.display();
		var i = this.indexer;
		setTimeout(function(){
			LOG.remove(i);
		},time);
		return this.indexer++;
	},
	clear:function(){
		this.list = [];
		this.display();
	},
	remove:function(index){
		for(var i in this.list)
		{
			if(this.list[i].index==index)
			{
				this.list.splice(i, 1);
			}
		}
		this.display();
	}
};
socket.on('public log', function(msg, color, time){
	LOG.add(msg, color, time);
});

// Whenever the server emits 'login', log the login message
socket.on('login', function(data){
	socket.connection.Bad = false;
});

// Whenever the server emits 'move unit', apply change to client game
socket.on('building', function(building, input){
	LOG.add("performing "+input+" on building "+building,"#00F");
	INTERFACE.Game.Build(building, input);
});

var lobby = document.getElementById('lobbyFrame');

socket.on('message', function(data){
	if(data.type==null)return;
	if(data.type==0)
		console.log(data.msg);
	else if(data.type==1)
	{	 // log message
		LOG.add(data.msg, data.color);
	}
	else if(data.type==2)
	{	 // caching user info
		socket.index = data.index;
	}
	else if(data.type==3)
	{	 // setup game to play
		init_map(data.map, data.players, data.game);
	}
	else if(data.type==4)
	{	 // starting game
		LOG.add("game started","#F00");
		INTERFACE.Game.Start();
	}
	else if(data.type==5)
	{	 // report opened game id
		Menu.PreGame.game_id = data.id;
	}
	else if(data.type==6)
	{	 // player left game
	}
	else if(data.type==7)
	{	 // game closed in lobby
		lobby.contentWindow.remove_game(data.game);
	}
	else if(data.type==8)
	{	 // join game
		LOG.add(data.name+" joined game","#F00");
		INTERFACE.Game.Set_Player(data.slot, data.player, data.name);
		Menu.PreGame.Set(data.slot, data.name);
	}
	else if(data.type==9)
	{	 // open game
		LOG.add(Levels.Names(data.map)+" opened with id "+data.game,"#F00");
		// if(!currently_playing) // also allow units to open lobby midgame
		// {
			lobby.contentWindow.add_game(Levels.Names(data.map),data.map,data.game);
			// socket.emit('listening', socket.index, data.game);
			// add above function into server.js
			// every time a change occurs in room,
			// send message to listeners
		// }
	}
	else if(data.type==10)
	{	 // leave game
		if(curently_playing)
		{
			INTERFACE.Game.Leave(data.slot);
		}
		else Menu.PreGame.Set(data.slot, "");
	}
	else if(data.type==11)
	{	 // move unit
		INTERFACE.Game.Move(data.unit, data.x, data.y, data.path);
	}
	else if(data.type==12)
	{	 // act building
		var result = INTERFACE.Game.Build(data.building, data.input);
		INTERFACE.Draw();
	}
	else if(data.type==13)
	{	 // end turn
		INTERFACE.Game.Active_Player().End_Turn();
	}
});

// Whenever the server emits 'user joined', log it in the chat body
socket.on('user joined', function(data){
	LOG.add(data.username+" joined","#FF0");
});
socket.on('set client data', function(index, name){
	socket.index = index;
	socket.username = name;
});
socket.on('user left', function(data){
	LOG.add(data.username+" left","#FF0");
	if(socket.connection.Game!=null)
	{
		socket.connection.Game.Leave(socket);
	}
	socket.connection.Bad = true;
});

var Data_Handler = function()
{
	this.Bad = true;
	this.Game = null;
	this.Update = function()
	{
		if(this.Bad)return;
		socket.emit('update game',this.Game);
	};
};
socket.connection = new Data_Handler;
}

function join_game(game)
{
	socket.emit('join', socket.index, game);
	// socket.emit('halt lobby');
}