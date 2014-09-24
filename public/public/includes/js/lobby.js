var lobby_handler = function(name, map, id)
{
	//get player amt from map
	var players = [];
	this.Set = function(index, value)
	{
		players[index] = value;
	};
	this.Length = function()
	{
		return players.length;
	};
	this.Name = function(){
		return name;
	};
	this.Map = function(){
		return map;
	};
	this.ID = function(){
		return id;
	};
	this.Join = function(){
		window.parent.join_game(id);
	};
};

var games = [];

function add_game(name, map, id)
{
	games[games.length] = new lobby_handler(name, map, id);
	setTimeout(function(){refresh();}, 5);
}

function remove_game(id)
{
	var index = -1;
	for(var i in games)
	{
		if(games[i].ID()==id)
		{
			index = i;
			break;
		}
	}
	if(index==-1)return;
	games.splice(index, 1);
	setTimeout(function(){refresh();}, 5);
}

function refresh()
{
	var output = document.getElementById('lobby');
	output.innerHTML = "";
	for(var i=0;i<games.length;i++)
	{
		var game_info = games[i];
		var node = document.createElement('div');
		node.setAttribute('class', 'gameList');
		node.setAttribute('id', game_info.ID());
		
		var name = document.createElement('div');
		name.setAttribute('class', 'name');
		name.innerHTML = game_info.Name();
		node.appendChild(name);
		
		var container = document.createElement('div');
		container.setAttribute('class', 'playersContainer');
		for(var j=0;j<game_info.Length();j++)
		{
			var player = document.createElement('div');
			player.setAttribute('class', 'playerIcon');
			player.setAttribute('id', i+'PI'+j);
			container.appendChild(player);
		}
		node.appendChild(container);
		
		var btn = document.createElement('div');
		btn.setAttribute('class', 'btnJoin');
		btn.innerHTML = "Join";
		btn.onclick = function(){
			remove_game(i);
			game_info.Join();
		};
		node.appendChild(btn);
		
		output.appendChild(node);
	}
}