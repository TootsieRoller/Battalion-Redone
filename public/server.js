var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var mongo = require('mongojs');
var db = mongo('BattalionData', ['users', 'games']);

db.on('error', function(err){
	console.log('DB ERR:', err);
});

server.listen(port, function(){
	console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

function timestamp(){
	var str = "";
	for(var i in arguments)
	{
		str+=arguments[i]+" ";
	}
	console.log(new Date().toLocaleTimeString(),"->",str);
}
var data_list = function(){
	this.list = [];
	this.Add = function(data)
	{
		var i = 0;
		for(;i<this.list.length;i++)
		{
			if(this.list[i]==null)break;
		}
		this.list[i] = data;
		return i;
	};
	this.Remove = function(index)
	{
		if(index>=this.list.length)return false;
		this.list[index] = null;
		for(var i=index+1;i<this.list.length;i++)
		{
			if(this.list[i]!=null)return true;
		}
		var last_good = index;
		for(;last_good>0;last_good--)
		{
			if(this.list[last_good-1]!=null)break;
		}
		this.list.splice(last_good, this.list.length-last_good);
		return true;
	};
	this.Active = function()
	{
		var running = [];
		for(var i in this.list)
		{
			if(this.list[i]!=null)
			{
				running.push(this.list[i]);
			}
		}
		return running;
	};
};
var con_handler = function(){
	var active = new data_list();
	var amt = 0;
	this.Socket = function(index)
	{
		if(index>=active.list.length)return null;
		return active.list[index];
	};
	this.Add = function(socket)
	{
		amt++;
		return active.Add(socket);
	};
	this.Disconnect = function(index)
	{
		if(active.Remove(index))
			amt--;
	};
	this.Length = function()
	{
		return active.list.length;
	};
	this.Amount = function()
	{
		return amt;
	};
	this.Active = function()
	{
		return active.Active();
	};
};
var Connections = new con_handler();
var Game = function(map, name, slots){
	var players = [];
	for(var i=0;i<slots;i++)
	{
		players[i] = null;
	}
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
	this.lobby = -1;

	this.Leave = function(gone){
		var empty = true;
		for(var i in players)
		{
			if(players[i]==gone)
			{
				players[i] = null;
				this.Send({type:24,slot:i});
				if(!empty)return;
				continue;
			}
			if(players[i]!=null)
			{
				empty = false;
			}
		}
		if(empty)
		{
			Game_List.Close(this.id);
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
var gl_handler = function(){
	var games = new data_list();
	var amt = 0;
	this.Length = function()
	{
		return games.list.length;
	};
	this.Amount = function()
	{
		return amt;
	};
	this.Add = function(game, host)
	{
		game.Set(0, host);
		amt++;
		return games.Add(game);
	};
	this.Active = function()
	{
		return games.Active();
	};
	this.Game = function(index)
	{
		if(index==null)return null;
		if(index>=games.list.length)return null;
		return games.list[index];
	};
	this.Close = function(index)
	{
		var cur = games.Remove(index);
		if(cur)
			amt--;
		timestamp("Game",cur.id,"->",cur.Name(),"closed");
	};
};
var Game_List = new gl_handler();
var Lobby = new data_list();

function send_lobby_info(data, sender){
	var active = Connections.Active();
	for(var i in active)
	{
		if(active[i].lobby_listening)
		{
			if(active[i].index==sender)continue;
			active[i].send(data);
		}
	}
}

io.on('connection', function(socket){
	var addedUser = false;
	socket.in_game = null;
	socket.lobby_listening = true;

	socket.on('lobby on', function(){
		socket.lobby_listening = true;
	});
	socket.on('lobby off', function(){
		socket.lobby_listening = false;
	});
	socket.on('refresh lobby', function(){
		if(!socket.lobby_listening)return;
		var data = [];
		var open_games = Lobby.Active();
		for(var i in open_games)
		{
			var game = Game_List.Game(open_games[i]);
			if(game==null)continue;
			data[i] = {
				game:game.id,
				map:game.Map(),
				name:game.Name()
				//, add player list
			};
		}
		socket.send({
			type:3,
			info:data
		});
		// also send connection info
		var lbyAmt = 0;
		var active_users = Connections.Active();
		for(var i in active_users)
		{
			if(Connections.Socket(i).lobby_listening)
				lbyAmt++;
		}
		socket.send({
			type:2,
			g:open_games.length,
			l:lbyAmt,
			a:Connections.Amount(),
			p:Game_List.Amount()-open_games.length
		});
	});

	socket.on('send move', function(unit, x, y, path){
		var game = Game_List.Game(socket.in_game);
		if(game==null)return;
		game.Send({
			type:11,
			unit:unit,
			x:x,y:y,
			path:path
		}, socket.index);
	});
	socket.on('send build', function(building, input){
		var game = Game_List.Game(socket.in_game);
		if(game==null)return;
		game.Send({
			type:12,
			building:building,
			input:input
		}, socket.index);
	});
	socket.on('next player', function(){
		var game = Game_List.Game(socket.in_game);
		if(game==null)return;
		game.Send({type:10}, socket.index);
	});

	socket.on('open', function(map, name, slots){
		var game = new Game(map, name, slots);
		game.Set(0, socket.index);
		var game_id = Game_List.Add(game, socket.index);
		game.id = game_id;
		timestamp(socket.username+" opened map "+map+" in game "+game_id);
		//get map data
		socket.in_game = game_id;
		game.lobby = Lobby.Add(game_id);
		send_lobby_info({
			type:27,
			game:game_id,
			map:map,
			name:name
		}, socket.index);
		socket.send({
			type:23,
			id:game_id
		});
	});
	socket.on('join', function(game_id){
	//search node
		var game = Game_List.Game(game_id);
		var connections = game.Data();
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
			if(socket.in_game!=null)
			{
				Game_List.Game(socket.in_game).Leave(socket.index);
			}
			socket.in_game = game_id;
			socket.send({
				type:21,
				map:game.Map(),
				game:game.id,
				players:{
					c:connections,
					n:names
				}
			});
			game.Set(i,socket.index);
			connections[i] = socket.index;
			game.Send({
				type:26,
				player:socket.index,
				name:socket.username,
				/* game:game_id, */
				slot:i
			}, socket.index);
			socket.broadcast.emit('joined game', socket.index, socket.username, game_id, i);
			timestamp(socket.username+" joined game "+game_id);
			return;
		}
		socket.send({
			type:100,
			game:game_id
		});
	});
	socket.on('leave', function(){
		var game = Game_List.Game(socket.in_game);
		if(game==null)return;
		game.Leave(socket.index);
		socket.in_game = null;
		socket.lobby_listening = true;
		timestamp(socket.username,"left game",game.Name());
	});
	socket.on('close', function(){
		var game = Game_List.Game(socket.in_game);
		if(game==null)return;
		timestamp("game "+socket.in_game+" closed");
		send_lobby_info({
			type:25,
			game:socket.in_game
		});
		var players = game.Data();
		for(var i in players)
		{
			if(players[i]==null)continue;
			Connections.Socket(players[i]).lobby_listening = true;
		}
		if(game.lobby==-1)
		{
			Lobby.Remove(game.lobby);
			game.lobby = -1;
		}
		Game_List.Close(socket.in_game);
	});
	socket.on('start', function(){
		var game = Game_List.Game(socket.in_game);
		if(game==null)return;
		game.Send({
			type:22
		}, socket.index); // exclude host from message
		var players = game.Data();
		for(var i in players)
		{
			if(players[i]==null)continue;
			Connections.Socket(players[i]).lobby_listening = false;
		}
		timestamp("game "+socket.in_game+" started");
		send_lobby_info({
			type:25,
			game:socket.in_game
		}, socket.index);
		Lobby.Remove(game.lobby);
		game.lobby = -1;
	});
	socket.on('chat', function(msg){
		if(socket.in_game==null)return;
		Game_List.Game(socket.in_game).Send({
			type:13,
			sender:socket.username, // send index instead and interpret client side
			txt:msg
		}, socket.index);
	});

	socket.on('log', function(msg){
		timestamp(socket.username+": "+msg);
	});

	socket.on('new user', function(username, password, email){
		if(addedUser)return;
		db.users.find({username:username}, function(err, data){
			if(err){
				socket.send({type:8});
				return;
			}
			if(data.length==0){
				db.users.save({
					username:username,
					password:password,
					email:email,
					level:1,
					points:0,
					totalGames:0,
					gamesWon:0
				}, function(err, saved){
					if(err||!saved)socket.send({type:8});
					else{
						socket.send({type:9});
						timestamp("New user",saved.username,"added");
					}
				});
			}
			else socket.send({type:5});
		});
	});
	socket.on('connect user', function(username, password){
		if(addedUser)return;
		db.users.find({username:username}, function(err, data){
			if(err||!data||data.length==0){
				socket.send({type:6});
			}else if(data.length==1){
				if(data[0].password!=password){
					socket.send({type:7});
					return;
				}
				socket.username = username;
				socket.index = Connections.Add(socket);
				socket.send({
					type:20,
					index:socket.index
				});
				addedUser = true;
				timestamp("user",username,"connected");
				socket.broadcast.emit('user joined', socket.username);
			}else socket.send({type:8});
		});
	});
	socket.on('disconnect', function(){
		if(!addedUser)return;
		if(socket.in_game!=null)
		{
			Game_List.Game(socket.in_game).Leave(socket.index);
		}
		Connections.Disconnect(socket.index);
		timestamp("user "+socket.username+" left");

		// echo globally that this client has left
		socket.broadcast.emit('user left', socket.username);
		addedUser = false;
	});
	
	socket.on('print data', function(){
		db.users.find({}, function(err, data){
			if(err||!data){
				timestamp("***Error printing user data.");
			}else{
				timestamp("***user data: ");
				data.forEach(function(cur){
					console.log(cur.username, cur.password);
				});
			}
		});
		timestamp("Printing data");
		console.log("Connections",Connections.Amount());
		for(var i=0;i<Connections.Length();i++)
		{
			if(Connections.Socket(i)!=null)
			{
				console.log(i, Connections.Socket(i).username, Connections.Socket(i).in_game);
			}
			else console.log(i, null);
		}
		console.log("Game_List",Game_List.Amount(),Game_List.Active().length);
		for(var i=0;i<Game_List.Length();i++)
		{
			if(Game_List.Game(i)!=null)
			{
				console.log(i, Game_List.Game(i).Name(), Game_List.Game(i).id, Game_List.Game(i).Data());
			}
			else console.log(i, null);
		}
		console.log("Lobby",Lobby.list.length);
		for(var i=0;i<Lobby.list.length;i++)
		{
			console.log(i, Lobby.list[i]);
		}
		timestamp("Print data done");
	});

	socket.on('check', function(){
		if(addedUser)socket.send({type:0});
		else socket.send({type:4});
	});
});