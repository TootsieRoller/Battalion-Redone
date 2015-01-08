var Engine_Class = function(input)
{
	var UI;
	var Units = [];
	var Cities = [];
	var Players = [];
	var Connected_Players = [];
	var turn = 0;
	var cur_player = 0;
	var client = null;
	var terre;
	var units;
	var buildings;
	this.Terrain_Map = terre;
	this.Units_Map = units;
	this.Cities_Map = buildings;
	this.Name = null;
	this.Interface = UI;
	this.Game_Over = false;
	this.Map = null;
	this.id = null;
	this.valid = true;

	this.Set_Interface = function(ui)
	{
		UI = ui;
		this.Interface = ui;
	}
	this.End_Game = function()
	{
		this.Game_Over = true;
		if(UI!=null)
			UI.End_Game(Players, turn);
	};

	this.Move = function(unit, x, y, path)
	{
		if(unit.SELECTABLE==null)
		{
			var found = false;
			for(var i in Units)
			{
				if(Units[i].Index==unit)
				{
					unit = Units[i];
					found = true;
					break;
				}
			}
			if(!found)return false;
		}
		if(!unit.Active)return false;
		return unit.Act(x, y, path);
	};
	this.Build = function(building, input)
	{
		if(building.SELECTABLE==null)
		{
			var found = false;
			for(var i in Cities)
			{
				if(Cities[i].Index==building)
				{
					building = Cities[i];
					found = true;
					break;
				}
			}
			if(!found)return false;
		}
		return building.Act(input);
	};

	this.Add_Unit = function(input, x, y, team)
	{
		if(units.At(x,y)!=null)
		{
			console.error("Map position ("+x+","+y+") already occupied with "+units.At(x,y));
			return;
		}
		if(Players.length<=team)
		{
			console.error("Team number not valid.");
			return;
		}
		input.Index = Units.length;
		Units.push(input);
		units.Set(x,y,input);
		Players[team].Add_Unit(input);
		input.X = x;
		input.Y = y;
		return input;
	};
	this.Add_Building = function(input, x, y, team)
	{
		if(buildings.At(x,y)!=null)
		{
			console.error("Map position already occupied.");
			return;
		}
		input.Index = Cities.length;
		Cities.push(input);
		buildings.Set(x,y,input);
		var ter = terre.At(x,y)
		ter.Building = input;
		input.Terrain = ter;
		input.X = x;
		input.Y = y;
		if(team!=null)
		{
			if(team>=Players.length)
			{
				console.error("Team number not valid.");
				return;
			}
			Players[team].Capture(input);
		}
		return input;
	};
	this.Unit_Amount = function()
	{
		return Units.length;
	};
	this.Get_Unit = function(index)
	{
		if(index<Units.length)
		{
			return Units[index];
		}
		return null;
	};
	this.Remove_Unit = function(value)
	{
		var pos = Units.indexOf(value);
		if(~pos)
		{
			this.Units_Map.Set(value.X,value.Y,null);
			Units.splice(pos,1);
			return true;
		}
		return false;
	};
	this.Instances_Of = function(name)
	{
		var counter = 0;
		for(var i in Units)
		{
			if(Units[i].Name==name)
			{
				counter++;
			}
		}
		return counter;
	};

	var full = false;
	this.Full = function()
	{
		return full;
	};
	this.Set_Player = function(index, id, name, is_client)
	{
		Connected_Players[index] = id;
		Players[index].Name = name;
		if(is_client)
		{
			client = Players[index];
		}
		for(var i in Connected_Players)
		{
			if(Connected_Players[i]==null)
			{
				full = false;
				return;
			}
		}
		full = true;
	};
	this.Host_Game = function(id)
	{
		this.id = id;
		if(online)socket.emit('start');
		this.Start();
	};
	this.Start = function()
	{
		currently_playing = true;
		if(UI!=null)
		{
			UI.Close_Menu();
			Canvas.Reflow();
			UI.Start();
			UI.Draw();
			if(online)
			{
				UI.Set_Next_Player(Players[cur_player], (socket.index==Connected_Players[cur_player]));
			}
			else UI.Set_Next_Player(Players[cur_player]);
		}
	};
	this.Leave = function(slot)
	{
		Players[slot].Lose();
		if(UI)UI.ReportLeft(slot);
	};

	this.Data = function()
	{
		var self = this;
		var player_data = [];
		for(var i in Players)
		{
			player_data.push(Players[i].Data());
		}
		return {
			id:self.id,
			map:self.Map,
			name:self.Name,
			turn:turn,
			cur_player:cur_player,
			connected:Connected_Players,
			players:player_data
		};
	};
	this.Clone = function()
	{
		return new Engine_Class(JSON.stringify(this.Data()));
	};
	this.Restart = function()
	{
		if(UI!=null)
		{
			UI.Select_Tile();
		}
		Units = [];
		Players = [];
		Connected_Players = [];
		turn = 0;
		cur_player = 0;
		Units_Map.Wipe();
	};

	this.Add_Player = function(name, color)
	{
		var player = new Player_Class(this, name, Players.length, color);
		Players.push(player);
		Connected_Players.push(null);
		return player;
	};
	this.Player_Died = function(input)
	{
		var pos = Players.indexOf(input);
		if(~pos)
		{
			Players[pos].Dead = true;
			var alive = -1;
			for(var i in Players)
			{
				if(!Players[i].Dead)
				{
					if(alive!=-1)
					{
						alive = -1;
						break;
					}
					alive = i;
				}
			}
			if(alive!=-1)
			{
				this.Player_Won(Players[alive]);
			}
			if(UI!=null)
				UI.Draw();
			return;
		}
		console.error("Player not attached to this game.");
	};
	this.Player_Won = function(input)
	{
		var pos = Players.indexOf(input);
		if(~pos)
		{
			if(UI==null)return;
			alert(input.Name+" wins!");
			for(var i in Players)
			{
				if(Players[i]==null)continue;
				if(Players[i]==input)continue;
				if(Players[i].Dead)continue;
				Players[i].Kill_All(true);
			}
			var self = this;
			setTimeout(function(){self.End_Game(true);},1000);
			return;
		}
		console.error("Player not attached to this game.");
	};
	this.Total_Players = function()
	{
		return Players.length;
	};
	this.Active_Player = function()
	{
		return Players[cur_player];
	};
	this.Client_Player = function()
	{
		return client;
	};
	this.Player = function(index)
	{
		if(index>=Players.length)return null;
		return Players[index];
	};
	this.Next_Player = function()
	{
		if(UI!=null)
		if(!UI.Check_Controls())return;
		cur_player++;
		while(Players[cur_player%Players.length].Dead)cur_player++;
		if(cur_player>=Players.length)
		{
			cur_player = 0;
			turn++;
		}
		if(UI!=null)
		{
			UI.Select_Tile();
			UI.Set_Next_Player(Players[cur_player], (socket.index==Connected_Players[cur_player]));
		}
		if(Connected_Players[cur_player]==null)
		{
			var self = this;
			LOG.add("No AI, ending turn in 5 seconds.", "#FFF", 1000);
			setTimeout(function(){
				LOG.add("No AI, ending turn in 4 seconds.", "#FFF", 1000);
				setTimeout(function(){
					LOG.add("No AI, ending turn in 3 seconds.", "#FFF", 1000);
					setTimeout(function(){
						LOG.add("No AI, ending turn in 2 seconds.", "#FFF", 1000);
						setTimeout(function(){
							LOG.add("No AI, ending turn in 1 second.", "#FFF", 1000);
								setTimeout(function(){
									AI.Solve(self);
								}, 1000);
						}, 1000);
					}, 1000);
				}, 1000);
			}, 1000);
		}
	};
	this.Request_Connections = function()
	{
		var nameList = [];
		for(var i in Players)
		{
			if(Connected_Players[i]==null)continue;
			nameList.push([Players[i].Name, Connected_Players[i]]);
		}
		return nameList;
	};
	this.Turn = function()
	{
		return turn;
	};

	this.Set_Interface = function(ui)
	{
		this.Interface = ui;
		UI = ui;
	};

	if(typeof(input)==='string')
	{ // when input is encrypted data for existing game--load gamestate
		var data = JSON.parse(input);
		this.id = data.id;
		this.Map = data.map;
		this.Name = data.name;
		turn = data.turn;
		cur_player = data.cur_player;
		var map = Clone_Map(Levels.Terrain.Data(data.map));
		if(map!=null)
		{
			for(var x=0;x<map.length;x++)
			for(var y=0;y<map[x].length;y++)
			{
				map[x][y] = new Terrain.Terre_Class(this,map[x][y],"Terrain("+x+","+y+")",x,y);
			}
		}
		terre = new Map_Holder(map);
		units = new Map_Holder(Blank_Map(terre.Width, terre.Height));
		buildings = new Map_Holder(Blank_Map(terre.Width, terre.Height));
		this.Terrain_Map = terre;
		this.Units_Map = units;
		this.Cities_Map = buildings;
		Connected_Players = data.connected;
		var players = data.players;
		for(var p in players)
		{
			var p_data = players[p];
			var player = this.Add_Player(p_data.name, p_data.color);
			player.data = p_data.data;
			if(Connected_Players[p]==socket.index){
				client = player;
			}
			var cur_units = p_data.units;
			for(var u in cur_units)
			{
				var u_data = cur_units[u];
				this.Add_Unit(new Characters.Char_Class(this, u_data.index), u_data.x, u_data.y, p).Health = u_data.health;
			}
			var cur_build = p_data.buildings;
			for(var b in cur_build)
			{
				var b_data = cur_build[b];
				var cur_b = this.Add_Building(new Buildings.Build_Class(this, b_data.index), b_data.x, b_data.y, p);
				cur_b.Stature = b_data.stature;
				cur_b.Resources = b_data.resources;
			}
		}
	}
	else if(typeof(input)!=='undefined')
	{ // when input is a map id--make new game
		var map = Clone_Map(Levels.Terrain.Data(input));
		if(map!=null)
		{
			for(var x=0;x<map.length;x++)
			for(var y=0;y<map[x].length;y++)
			{
				map[x][y] = new Terrain.Terre_Class(this,map[x][y],"Terrain("+x+","+y+")",x,y);
			}
		}
		this.Map = input;
		this.id = -1;
		terre = new Map_Holder(map);
		units = new Map_Holder(Blank_Map(terre.Width, terre.Height));
		buildings = new Map_Holder(Blank_Map(terre.Width, terre.Height));
		this.Terrain_Map = terre;
		this.Units_Map = units;
		this.Cities_Map = buildings;
		Levels.Run(this, input);
	}
	else this.valid = false; // game does not have valid input to function
};