function validateSignup(user, pass){
	if(!user||!pass)return false;
	if(user==""||pass=="")return false;
	return true;
}
function reportLoggedIn(user, pass, report){
	if(!LOADED){
		report("The game has not loaded yet.");
		return;
	}
	if(CONNECTED){
		report("Already signed in... try refreshing");
		return;
	}
	if(!validateSignup(user, pass))return;
	CONNECT(user, pass, report);
}
function reportNewUser(user, pass){
	if(!LOADED)return;
	if(CONNECTED)return;
	if(!validateSignup(user, pass))return;
	if(new Date-LAST_CONNECT_MESSAGE<5000){
		if(report)report("Please wait 5 seconds before retrying...");
		return;
	}
	LAST_CONNECT_MESSAGE = new Date;
	socket.emit('new user', user, pass);
}
function logOut(){
	
}

var gameFrame;
var game;
var title_box_alert = function(updated){
	var old = document.title;
	this.time = 1000;
	var kill = false;
	var self = this;
	var toggle = true;
	this.stop = function(){
		kill = true;
	};
	var refresh_fnc = function(){
		if(kill){
			document.title = old;
			return;
		}
		if(toggle)
		{
			document.title = updated;
			toggle = false;
		}
		else
		{
			document.title = old;
			toggle = true;
		}
		setTimeout(refresh_fnc, self.time);
	};
	refresh_fnc();
};
var CONNECTED = false;
var CONNECTION_TIMEOUT = 0;
var LOADED = false;
var lobby_open = false;
var socket;
if(typeof io!=='undefined'){socket = io();}
var onFinishedLoadingList = [];
function onFinishedLoading(fnc){
	if(onFinishedLoadingList==null)return;
	onFinishedLoadingList.push(fnc);
}
window.onload = function(){
	LOADED = true;
	gameFrame = document.getElementById('gameFrame');
	game = gameFrame.contentWindow;
	socket.on('public log', function(msg, color, time){
		if(game.LOG)game.LOG.add(msg, color, time);
	});
	socket.on('set client data', function(index, name){
		socket.index = index;
		socket.username = name;
	});
	socket.on('user joined', function(username){
		if(game.LOG)game.LOG.add(username+" joined","#FF0");
		if(!lobby_open)return;
		lobby.contentWindow._activeUsers.add();
		lobby.contentWindow._lobbyAmt.add();
	});
	socket.on('user left', function(username){
		if(game.LOG)game.LOG.add(username+" left","#FF0");
		if(!lobby_open)return;
		lobby.contentWindow._activeUsers.sub();
	});

	socket.on('message', function(data){
	// timestamp(data.type);
		if(data.type==null)return;
			/** initiate connection and errors */
		if(data.type==0)
		{	// refresh connection
			CONNECTION_TIMEOUT = 0;
		}
		else if(data.type==1)/** unused */
		{	}
		else if(data.type==2)
		{	// refresh connection info
			if(!lobby_open)return;
			lobby.contentWindow._openGames.value = data.g;
			lobby.contentWindow._openGames.update();
			lobby.contentWindow._lobbyAmt.value = data.l;
			lobby.contentWindow._lobbyAmt.update();
			lobby.contentWindow._activeUsers.value = data.a;
			lobby.contentWindow._activeUsers.update();
			lobby.contentWindow._gamesPlaying.value = data.p;
			lobby.contentWindow._gamesPlaying.update();
		}
		else if(data.type==3)
		{	// receive already opened games data
			if(!lobby_open)return;
			for(var i in data.info)
			{
				lobby.contentWindow.add_game(data.info[i].name,data.info[i].map,data.info[i].game);
				lobby.contentWindow._openGames.add();
				// add player list
			}
		}
		else if(data.type==4)
		{	// client disconnected
			CONNECTED = false;
			CONNECTION_TIMEOUT = 0;
		}
		else if(data.type==5)
		{	// report username taken
			var err_report = gameFrame.contentWindow;
			if(err_report==null)return;
			if(err_report.report==null)return;
			err_report.report("User name taken!");
		}
		else if(data.type==6)
		{	// report username does not exist
			var err_report = gameFrame.contentWindow;
			if(err_report==null)return;
			if(err_report.report==null)return;
			err_report.report("Username does not exist!");
		}
		else if(data.type==7)
		{	// report password is not correct
			var err_report = gameFrame.contentWindow;
			if(err_report==null)return;
			if(err_report.report==null)return;
			err_report.report("Password not correct!");
		}
		else if(data.type==8)
		{	// error connecting to server
			if(!game.LOG){
				if(game.report==null)return;
				game.report("General error when signing-up/logging-in");
			}else{
				window.location.reload();
			}
		}
		else if(data.type==9)
		{	// new user added correctly
			var loginFrame = gameFrame.contentWindow;
			if(loginFrame==null)return;
			if(loginFrame.login==null)return;
			LAST_CONNECT_MESSAGE = 0;
			loginFrame.login();
		}

			/** game messages */
		else if(data.type==10)
		{	// end turn
			game.INTERFACE.Game.Active_Player().End_Turn();
		}
		else if(data.type==11)
		{	// move unit
			game.INTERFACE.Game.Move(data.unit, data.x, data.y, data.path);
		}
		else if(data.type==12)
		{	// act building
			var result = game.INTERFACE.Game.Build(data.building, data.input);
			game.INTERFACE.Draw();
		}
		else if(data.type==13)
		{	// receive chat message
			if(lobby_open)return;
			lobby.contentWindow.add_msg(data.sender, data.txt);
		}
		else if(data.type==14)
		{	// request game data
			if(!game.INTERFACE.Game)return;
			socket.emit('save game', JSON.stringify(game.INTERFACE.Game.Data()));
		}
		else if(data.type==15)
		{	// report invalid game data -> fix or break if unfixable
			if(!game.INTERFACE.Game)return;
			if(data.game==null)
			{ // no gamestate to revert to
				game.INTERFACE.Game.End_Game();
				if(!game.LOG)return;
				game.LOG.add("ERROR: Game data issue. Could not salvage game.", "#F00", 10000);
				game.LOG.add("Game ended and no points were lost", "#F00", 10000);
				game.LOG.add("Note for dev., add button to auto restart last game?", "#FFF", 20000);
				return;
			}
			setTimeout(function(){ // reset game after 5 seconds
				game.INTERFACE.setGame(new game.Engine_Class(data.game));
				game.INTERFACE.Game.Start();
			}, 5000);
			if(!game.LOG)return;
			game.LOG.add("ERROR: Game data issue. Reverting game to last saved point...", "#F00", 10000);
		}
		else if(data.type==16)
		{	// player reconnected
			gameFrame.onload = function(){
				if(!game.load_game)return;
				game.load_game(data.game);
				if(!game.LOG)return;
				game.LOG.add("Resuming game from last saved gamestate", "#FFF", 5000);
			}
		}

			/** lobby connections */
		else if(data.type==20)
		{	// caching user info and validating connection
			socket.index = data.index;
			CONNECTED = true;
			CHECK_CONNECTION();
			if(gameFrame.src!="includes/game.html")
				gameFrame.src = "includes/game.html";
			document.title = socket.username+" playing Battalion";
			openLobby();
		}
		else if(data.type==21)
		{	// setup game to play
			game.init_map(data.map, data.players, data.game);
		}
		else if(data.type==22)
		{	// starting game
			if(game.LOG)game.LOG.add("game started","#F00");
			game.INTERFACE.Game.Start();
			lobby.contentWindow._openGames.sub();
		}
		else if(data.type==23)
		{	// report opened game id
			socket.game_id = data.id;
		}
		else if(data.type==24)
		{	// player timed-out-of/left game
			if(game.currently_playing)
			{
				game.INTERFACE.Game.Leave(data.slot);
			}
			else game.Menu.PreGame.Set(data.slot, "");
		}
		else if(data.type==25)
		{	// game closed in lobby
			if(!lobby_open)return;
			lobby.contentWindow.remove_game(data.game);
			lobby.contentWindow._openGames.sub();
		}
		else if(data.type==26)
		{	// join game
			if(game.LOG)game.LOG.add(data.name+" joined game","#F00");
			game.INTERFACE.Game.Set_Player(data.slot, data.player, data.name);
			game.Menu.PreGame.Set(data.slot, data.name);
		}
		else if(data.type==27)
		{	// open game in lobby
			if(!lobby_open)return;
			lobby.contentWindow.add_game(data.name,data.map,data.game);
			lobby.contentWindow._openGames.add();
			// if(game.LOG)game.LOG.add(Levels.Names(data.map)+" opened with id "+data.game,"#F00");
		}
		else if(data.type==28)
		{	// player lost connection
			if(!game.LOG)return;
			var playerName = game.INTERFACE.Game.Player(data.slot);
			if(playerName)
				playerName = playerName.Name;
			else playerName = data.slot;
			game.LOG.add("Warning, player "+playerName+" lost connection", "#FFF", 10000);
			game.LOG.add("This player has 30 seconds to reconnect", "#FFF", 20000);
			game.LOG.add("Otherwise they forfeit the game", "#FFF", 30000);
		}
		else if(data.type==29)
		{	// player regained connection
			if(!game.LOG)return;
			var playerName = game.INTERFACE.Game.Player(data.slot);
			if(playerName)
				playerName = playerName.Name;
			else playerName = data.slot;
			game.LOG.add("Player "+playerName+" reconnected connection.", "#FFF");
		}

			/** in-game error messages */
		else if(data.type==100)
		{	// could not connect to game message
			if(game.LOG)game.LOG.add("ERROR:Could not connect to game "+data.game, "#F00");
		}

			/** logs */
		else if(data.type==110)
		{	// console log message
			console.warn("WARNING: IMPROPER USE OF MESSAGING");
			console.log(data.msg);
		}
		else if(data.type==111)
		{	// game log message
			console.warn("WARNING: IMPROPER USE OF MESSAGING");
			if(game.LOG)game.LOG.add(data.msg, data.color);
		}
	});
	for(var i in onFinishedLoadingList){
		onFinishedLoadingList[i]();
	}
	onFinishedLoadingList = null;
};

var LAST_CONNECT_MESSAGE = 0;
function CONNECT(name, pass, report){
	if(CONNECTED)return;
	if(new Date-LAST_CONNECT_MESSAGE<5000){
		if(report)report("Please wait 5 seconds before retrying...");
		return;
	}
	LAST_CONNECT_MESSAGE = new Date;
	socket.username = name;
	socket.password = pass;
	socket.emit('connect user', name, pass);
}
function CHECK_CONNECTION(){
	if(CONNECTION_TIMEOUT>5)
	{
		if(CONNECTED)
		{
			LOST_CONNECTION();
			CONNECTED = false;
		}
	}
	else
	{
		if(!CONNECTED)
		{
			CONNECT(socket.username, socket.password);
			RECONNECTED();
		}
		CONNECTION_TIMEOUT++;
	}
	socket.emit('check');
	setTimeout(function(){CHECK_CONNECTION()}, 3000);
}
function LOST_CONNECTION(){
	var time = new Date().toLocaleTimeString();
	console.error("Lost connection at "+time);
	if(game.LOG)game.LOG.add("Lost connection at "+time,"#F00",10000);
	document.title_alert = new title_box_alert("LOST CONNECTION");
}
function RECONNECTED(){
	var time = new Date().toLocaleTimeString();
	console.error("Regained connection at "+time);
	if(game.LOG)game.LOG.add("Regained connection at "+time,"#0F0",5000);
	refresh_lobby();
	if(document.title_alert)
	{
		document.title_alert.stop();
	}
}

function openLobby(){
	lobby.src = "includes/lobby.html";
	document.getElementById("refreshLobby").href = "includes/lobby.html";
	socket.emit('lobby on');
}
function openChat(){
	lobby_open = false;
	document.getElementById("refreshLobby").href = "includes/chat.html";
	lobby.src = "includes/chat.html";
}

function refreshChatList(){
	if(lobby_open)return;
	var list = game.INTERFACE.Request_Connections();
	for(var i in list){
		lobby.contentWindow.addPlayer(list[i][0], list[i][1]);
	}
}
function refresh_lobby(){
	if(!lobby_open)return;
	lobby.contentWindow.games = [];
	lobby.contentWindow.refresh();
	socket.emit('refresh lobby');
}
function refresh_game(){
	gameFrame.src = gameFrame.src;
}

function send_chat(text){
	if(!game.currently_playing)return;
	socket.emit('chat', text);
	lobby.contentWindow.add_msg(socket.index, text);
}
function join_game(game){
	if(game.currently_playing)
	{
		if(!confirm("Are you sure you want to leave this game?"))
			return;
		game.INTERFACE.Game.End_Game(false);
	}
	socket.emit('join', game);
}

function timestamp(){
	var str = "";
	for(var i in arguments)
	{
		str+=arguments[i]+" ";
	}
	console.log(new Date().toLocaleTimeString(),"->",str);
}
var lobby = document.getElementById('lobbyFrame');