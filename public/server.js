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
	console.log('\********** Server listening on port %d **********', port);
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
		var removed = this.list[index];
		this.list[index] = null;
		for(var i=index+1;i<this.list.length;i++)
		{
			if(this.list[i]!=null)return removed;
		}
		var last_good = index;
		for(;last_good>0;last_good--)
		{
			if(this.list[last_good-1]!=null)break;
		}
		this.list.splice(last_good, this.list.length-last_good);
		return removed;
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
		var user = active.Remove(index);
		if(!user)return;
		amt--;
		timestamp("user "+user.username+" disconnected");
	};
	this.Reconnect = function(index, socket)
	{
		if(index>=active.list.length)return;
		var oldSocket = active.list[index];
		socket.index = index;
		socket.username = oldSocket.username;
		socket.vars = oldSocket.vars;
		active.list[index] = socket;
		timestamp("user",oldSocket.username,"reconnected");
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
	var playerData = [];
	var self = this;
	for(var i=0;i<slots;i++)
	{
		playerData[i] = [null,null,false];
		// 0 socket index
		// 1 most recent game data
		// 2 received game data for most recent check
	}
	self.Set = function(index, value){
		if(index>=playerData.length)return;
		playerData[index][0] = value;
	};
	self.Data = function(index){
		var arr = [];
		for(var i in playerData)
		{
			arr[i] = playerData[i][0];
		}
		return arr;
	};
	self.Length = function(){
		return playerData.length;
	};
	self.Name = function(){
		return name;
	};
	self.Map = function(){
		return map;
	};
	self.id = -1;
	self.lobby = -1;
	self.started = false;

	var lastValidGameState = null;
	var goodCallbackFnc = function(){};
	var badCallbackFnc = function(){};
	function recievedGameData(playerIndex){
		playerData[playerIndex][2] = true;
		for(var i in playerData){
			if(!playerData[i][2]){
				return; // someone has not sent in game data yet
			}
		} // if loop ends without returning, then all data is here for check
		for(var i=1;i<playerData.length;i++){
			if(playerData[i][1]!=playerData[i-1][1]){
					// games report differing data
				badCallbackFnc();
				return;
			}
		} // if loop ends all is okay
		lastValidGameState = playerData[0][1];
		goodCallbackFnc();
	};
	self.Check_Data = function(goodCallback, badCallback, requestIndex, requestData){
		self.Send({type:14}, requestIndex); // request everyone else send data
		for(var i in playerData){
			// clear last check
			playerData[i][2] = false;
		}
		self.Update_Data(requestIndex, requestData);
		if(typeof goodCallback==='function')
			goodCallbackFnc = goodCallback;
		else goodCallbackFnc = function(){};
		if(typeof badCallback==='function')
			badCallbackFnc = badCallback;
		else badCallbackFnc = function(){};
	};
	self.Update_Data = function(socketIndex, gameData){
		var playerIndex = null;
		for(var i in playerData){
			if(playerData[i][0]==socketIndex){
				playerIndex = i;
				break;
			}
		}
		if(playerIndex==null)return;
		playerData[playerIndex][1] = gameData;
		recievedGameData(playerIndex);
	};
	self.Revert = function(){
		self.Send({type:15,game:lastValidGameState});
	};

	self.Leave = function(socketIndex, rejoinTime, outOfTimeFnc){
		var empty = true;
		var playerIndex;
		for(var i in playerData)
		{
			if(playerData[i][0]==socketIndex)
			{
				playerIndex = i;
				continue;
			}
			if(playerData[i][0]!=null)
			{
				empty = false;
			}
		}
		if(empty)
		{
			Game_List.Close(self.id);
			if(typeof outOfTimeFnc==='function')outOfTimeFnc();
		}
		else if(playerIndex!=null)
		{
			playerData[playerIndex][0] = null;
			if(!self.started){	// if game hasn't started, just remove immediately
				self.Send({type:24,slot:playerIndex});
				if(typeof outOfTimeFnc==='function')outOfTimeFnc();
				return;
			}
			if(rejoinTime){ // give player chance to reconnect
				self.Send({type:28,slot:playerIndex}); // warn that player lost connection
				var disconPlayer = Connections.Socket(socketIndex); // disconnected player
				if(disconPlayer!=null)
					timestamp("user",disconPlayer.username,"lost connection mid game");
				setTimeout(function(){
					if(playerData[playerIndex][0]!=null)return;
					self.Send({type:24,slot:playerIndex}); // report player failed to reconnect
					if(typeof outOfTimeFnc==='function')outOfTimeFnc();
				}, rejoinTime);
			}else{ // player cannot try to reconnect, auto termination
				self.Send({type:24,slot:playerIndex});
				if(typeof outOfTimeFnc==='function')outOfTimeFnc();
			}
		}
	};
	self.Rejoin = function(playerIndex, socketIndex){
	console.log("rejoinging");
	console.log(playerIndex, socketIndex);
	console.log(playerData[playerIndex]);
	console.log(playerData);
		if(!playerData[playerIndex])return;
		if(playerData[playerIndex][0]!=null)return;
	console.log("good");
		var returningPlayer = Connections.Socket(socketIndex);
		if(returningPlayer==null)return;
		playerData[playerIndex][0] = socketIndex;
		self.Send({type:29,slot:playerIndex}, socketIndex); // report player reconnected
		var gamestate = lastValidGameState;
		if(gamestate==null){ // this is the case if the game hasn't started
			gamestate = self.Map; // so send new game data
		}
		returningPlayer.send({type:16,game:gamestate}); // send reconnected player last gamestate
	};
	self.Send = function(msg){
		if(!msg)return;
		// extra arguments means socket indexes excluded from message
		for(var i in playerData)
		{
			var curPlayer = Connections.Socket(playerData[i][0]);
			if(curPlayer==null)continue; // player has disconnected
			if(arguments.length!=1)
			{
				var con = false;
				for(var j=1;j<arguments.length;j++)
				{
					if(curPlayer.index==arguments[j])
					{
						con = true;
						break;
					}
				}
				if(con)continue;
			}
			curPlayer.send(msg);
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
		var gameId = games.Add(game);
		game.id = gameId;
		timestamp("Game",gameId,"->",game.Name(),"opened");
		return gameId;
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
		if(!cur)return;
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
		if(active[i].vars.lobby_listening)
		{
			if(active[i].index==sender)continue;
			active[i].send(data);
		}
	}
}

io.on('connection', function(socket){
	socket.vars = {
		online:false,
		in_game:null,
		lobby_listening:true
	};

	socket.on('lobby on', function(){
		socket.vars.lobby_listening = true;
	});
	socket.on('lobby off', function(){
		socket.vars.lobby_listening = false;
	});
	socket.on('refresh lobby', function(){
		if(!socket.vars.lobby_listening)return;
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
			if(Connections.Socket(i))
			if(Connections.Socket(i).vars.lobby_listening)
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

	socket.on('save game', function(data){
		var game = Game_List.Game(socket.vars.in_game);
		if(game==null)return;
		socket.vars.game_data = data;
		game.Update_Data(socket.index, data);
	});
	socket.on('send move', function(unit, x, y, path){
		var game = Game_List.Game(socket.vars.in_game);
		if(game==null)return;
		game.Send({
			type:11,
			unit:unit,
			x:x,y:y,
			path:path
		}, socket.index);
	});
	socket.on('send build', function(building, input){
		var game = Game_List.Game(socket.vars.in_game);
		if(game==null)return;
		game.Send({
			type:12,
			building:building,
			input:input
		}, socket.index);
	});
	socket.on('next player', function(gameData){
		var game = Game_List.Game(socket.vars.in_game);
		if(game==null)return;
		game.Check_Data(function(){ // check game data
			// game data good, continue game.
			game.Send({type:10}, socket.index);
		}, function(){
			game.Revert();
			timestamp("ERROR: game",game.id,game.Name(),"invalid, reverting to last saved point.");
		}, socket.index, gameData);
	});

	socket.on('open', function(map, name, slots){
		var game = new Game(map, name, slots);
		var game_id = Game_List.Add(game, socket.index);
		socket.vars.slotIndex = 0;
		socket.vars.in_game = game_id;
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
			if(socket.vars.in_game!=null)
			{
				Game_List.Game(socket.vars.in_game).Leave(socket.index);
			}
			socket.vars.in_game = game_id;
			socket.send({
				type:21,
				map:game.Map(),
				game:game.id,
				players:{
					c:connections,
					n:names
				}
			});
			game.Set(i, socket.index);
			socket.vars.slotIndex = i;
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
		var game = Game_List.Game(socket.vars.in_game);
		if(game==null)return;
		game.Leave(socket.index);
		socket.vars.in_game = null;
		socket.vars.lobby_listening = true;
		timestamp(socket.username,"left game",game.Name());
	});
	socket.on('close', function(){
		var game = Game_List.Game(socket.vars.in_game);
		if(game==null)return;
		timestamp("game "+socket.vars.in_game+" closed");
		send_lobby_info({
			type:25,
			game:socket.vars.in_game
		});
		var players = game.Data();
		for(var i in players)
		{
			if(players[i]==null)continue;
			// Connections.Socket(players[i]).vars.lobby_listening = true;
		}
		if(game.lobby==-1)
		{
			Lobby.Remove(game.lobby);
			game.lobby = -1;
		}
		Game_List.Close(socket.vars.in_game);
	});
	socket.on('start', function(){
		var game = Game_List.Game(socket.vars.in_game);
		if(game==null)return;
		game.Send({
			type:22
		}, socket.index); // exclude host from message
		var players = game.Data();
		for(var i in players)
		{
			if(players[i]==null)continue;
			Connections.Socket(players[i]).vars.lobby_listening = false;
		}
		game.started = true;
		timestamp("Game",game.id,"->",game.Name(),"started");
		send_lobby_info({
			type:25,
			game:socket.vars.in_game
		}, socket.index);
		Lobby.Remove(game.lobby);
		game.lobby = -1;
	});
	socket.on('chat', function(msg){
		if(socket.vars.in_game==null)return;
		Game_List.Game(socket.vars.in_game).Send({
			type:13,
			sender:socket.index, // send index instead and interpret client side
			txt:msg
		}, socket.index);
	});

	socket.on('log', function(msg){
		timestamp(socket.username+": "+msg);
	});

	socket.on('new user', function(username, password, email){
		if(socket.vars.online)return;
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
		if(socket.vars.online)return;
		db.users.find({username:username}, function(err, data){
			if(err||!data||data.length==0){
				socket.send({type:6});
			}else if(data.length==1){
				if(data[0].password!=password){
					socket.send({type:7});
					return;
				}
				var activeCons = Connections.Active();
				var rejoined = false;
				for(var i in activeCons){
					if(activeCons[i].username!=username)continue;
					if(!activeCons[i].vars.online){
						Connections.Reconnect(i, socket);
						rejoined = true;
						var game = Game_List.Game(socket.vars.in_game);
						if(game){
							game.Rejoin(socket.vars.slotIndex, socket.index);
						}
						break;
					}else{
						timestamp("ERROR: user",username,"tried to join twice at once");
						socket.send({type:8});
						return;
					}
				}
				if(!rejoined){
					socket.index = Connections.Add(socket);
					socket.username = username;
					timestamp("user",username,"connected");
				}
				socket.send({
					type:20,
					index:socket.index
				});
				socket.vars.online = true;
				socket.broadcast.emit('user joined', socket.username);
			}else socket.send({type:8});
		});
	});
	socket.on('disconnect', function(){
		if(!socket.vars.online)return;
		socket.vars.online = false;
		// echo globally that this client has left
		socket.broadcast.emit('user left', socket.username);
		var game = Game_List.Game(socket.vars.in_game);
		if(game){	// if in game, allow 30 secs to reconnect before removal
			game.Leave(socket.index, 30000, function(){
					// if they reconnect the system will auto join them to the game
					// if they havent reconnected after 30secs, remove them from server
				Connections.Disconnect(socket.index);
			});
			return;
		}
		Connections.Disconnect(socket.index);
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
		db.games.find({}, function(err, data){
			if(err||!data){
				timestamp("***Error printing game data.");
			}else{
				timestamp("***game data: ");
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
				console.log(i, Connections.Socket(i).username, Connections.Socket(i).vars.in_game);
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
		if(socket.vars.online)socket.send({type:0});
		else socket.send({type:4});
	});
});