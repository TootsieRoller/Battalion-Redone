// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function(){
	console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Server Scripts

function timestamp()
{
	var str = "";
	for(var i in arguments)
	{
		str+=arguments[i]+" ";
	}
	console.log(new Date().toLocaleTimeString(),"->",str);
}

var con_handler = function()
{
	var active = [];
	this.Socket = function(index)
	{
		if(index>=active.length)return null;
		return active[index];
	};
	this.Add = function(socket)
	{
		active.push(socket);
		return active.length-1;
	};
	this.Disconnect = function(index)
	{
		if(index>=active.length)return;
		return active.splice(index,1);
	};
	this.Amount = function()
	{
		return active.length;
	};
};
var Connections = new con_handler();

var Game = function(map, name)
{
	//get player amt from map
	var players = [null,null];
		// HOLY SHIT THIS IS IN NEED OF A FIX
	this.Set = function(index, value){
		if(index>=players.length)return;
		players[index] = value;
	};
	this.Data = function(index){
		var arr = [];
		for(var i in players)
		{
			arr[i] = players[i];
		}
		return arr;
	};
	this.Length = function(){
		return players.length;
	};
	this.Name = function(){
		return name;
	};
	this.Map = function(){
		return map;
	};
	this.id = -1;

	this.Leave = function(gone){
		var empty = true;
		for(var i in players)
		{
			if(players[i]==gone)
			{
				players[i] = null;
				this.Send({type:10,slot:i});
				if(!empty)return;
				continue;
			}
			if(player[i]!=null)
			{
				empty = false;
			}
		}
		if(empty)
		{
			Lobby.Close(this.id);
		}
	};
	this.Send = function(msg){
		if(!msg)return;
		// extra arguments means socket indexes excluded from message
		for(var i in players)
		{
			if(players[i]==null)continue;
			if(arguments.length!=1)
			{
				var con = false;
				for(var j=1;j<arguments.length;j++)
				{
					if(Connections.Socket(players[i]).index==arguments[j])
					{
						con = true;
						break;
					}
				}
				if(con)continue;
			}
			Connections.Socket(players[i]).send(msg);
		}
	};
};

var lob_handler = function()
{
	var games = [];
	this.Amount = function()
	{
		return games.length;
	};
	this.Add = function(game, host)
	{
		game.Set(0, host);
		games.push(game);
		return games.length-1;
	};
	this.Game = function(index)
	{
		if(index>=games.length)return null;
		return games[index];
	};
	this.Close = function(index)
	{
		if(index>=games.length)return null;
		return games.splice(index,1);
	};
};
var Lobby = new lob_handler();

// io.sockets.emit
io.on('connection', function(socket){
	var addedUser = false;

	// when the client emits 'new message', this listens and executes
	socket.on('send move', function(game, player, unit, x, y, path){
		Lobby.Game(game).Send({
			type:11,
			unit:unit,
			x:x,y:y,
			path:path
		}, player);
	});
	socket.on('send build', function(game, player, building, input){
		Lobby.Game(game).Send({
			type:12,
			building:building,
			input:input
		}, player);
	});
	socket.on('next player', function(game_id){
		Lobby.Game(game_id).Send({type:13}, socket.index);
	});

	socket.on('open', function(map, name){
		var game = new Game(map, name);
		game.Set(0, socket.index);
		var game_id = Lobby.Add(game, socket.index);
		game.id = game_id;
		timestamp(socket.username+" opened map "+map+" in game "+game_id);
		//get map data
		socket.broadcast.emit('message',{
			type:9,
			game:game_id,
			map:map
		});
		socket.send({
			type:5,
			id:game_id
		});
	});
	socket.on('join', function(player_id, game_id){
	//search node
		var game = Lobby.Game(game_id);
		var connections = game.Data();
		var player = Connections.Socket(player_id);
		var names = [];
		for(var i in connections)
		{
			if(connections[i]==null)
			{
				names.push("");
			}
			else names.push(Connections.Socket(connections[i]).username);
		}
		for(var i in connections)
		{
			if(connections[i]!=null)
				continue;
			player.send({
				type:3,
				map:game.Map(),
				game:game.id,
				players:{
					c:connections,
					n:names
				}
			});
			game.Set(i,player_id);
			connections[i] = player_id;
			game.Send({
				type:8,
				player:player_id,
				name:player.username,
				/* game:game_id, */
				slot:i
			}, player.index);
			player.broadcast.emit('joined game', player_id, player.username, game_id, i);
			player.send({
				type:1,
				msg:"Connected to game "+game_id,
				color:"#0F0"
			});
			timestamp(player.username+" joined game "+game_id);
			return;
		}
		player.send({
			type:1,
			msg:"ERROR:Could not connect to game "+game_id,
			color:"#F00"
		});
	});
	socket.on('leave', function(player_id, game_id){
		var game = Lobby.Game(game_id);
		game.Send({
			type:6,
			player:player_id
		}, player_id);
		timestamp(Connections.Socket(player_id).username,"left game",Lobby.Game(game_id).Name);
		game.Leave(player_id);
		// send to client lobby
	});
	socket.on('close', function(game){
		timestamp("game "+game_id+" closed");
		socket.broadcast.emit('message',{
			type:7,
			game:game_id
		});
		Lobby.Close(game);
	});
	socket.on('start', function(game_id){
		Lobby.Game(game_id).Send({
			type:4
		}, socket.index); // exclude host from message
		timestamp("game "+game_id+" started");
		socket.broadcast.emit('message',{
			type:7,
			game:game_id
		});
	});

	socket.on('log', function(msg){
		timestamp(socket.username+": "+msg);
	});

	socket.on('add user', function(username, password){
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		socket.index = Connections.Add(socket);
		socket.send({
			type:2,
			index:socket.index
		});
		addedUser = true;
		timestamp("new user",username,"connected");
		// echo globally(all clients) that a person has connected
		socket.broadcast.emit('user joined',{
			username:socket.username,
			numUsers:Connections.Amount()
		});
	});
	socket.on('disconnect', function(){
		if(addedUser){
			for(var i=0;i<Lobby.Amount();i++){
				var game = Lobby.Game(i);
				var data = game.Data();
				var found = false;
				for(var j in data){
					if(data[j]==socket.username){
						game.Leave(j);
						found = true;
						break;
					}
				}
				if(found)break;
			}
			Connections.Disconnect(socket.index);
			timestamp("user "+socket.username+" left");

			// echo globally that this client has left
			socket.broadcast.emit('user left',{
				username:socket.username,
				numUsers:Connections.Amount()
			});
		}
	});
});