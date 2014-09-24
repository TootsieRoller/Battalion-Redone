var Engine_Class = function(terre)
{
	terre = Clone_Map(terre);
	if(terre!=null)
	{
		for(var x=0;x<terre.length;x++)
		for(var y=0;y<terre[x].length;y++)
		{
			terre[x][y] = new Terrain.Terre_Class(this,terre[x][y],"Terrain("+x+","+y+")",x,y);
		}
	}
	terre = new Map_Holder(terre);
	this.Terrain_Map = terre;
	var units = new Map_Holder(Blank_Map(terre.Width, terre.Height));
	this.Units_Map = units;
	var buildings = new Map_Holder(Blank_Map(terre.Width, terre.Height));
	this.Buildings_Map = buildings;
	var UI;
	this.Name = null;
	this.Interface = UI;
	var Units = [];
	var Buildings = [];
	var Players = [];
	var Connected_Players = [];
	var turn = 0;
	var cur_player = 0;
	this.Game_Over = false;
	var client = null;

	this.id = null;

	this.Set_Interface = function(ui)
	{
		UI = ui;
		this.Interface = ui;
	}
	this.End_Game = function()
	{
		this.Game_Over = true;
		if(UI!=null)
			UI.End_Game();
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
			for(var i in Buildings)
			{
				if(Buildings[i].Index==building)
				{
					building = Buildings[i];
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
	};
	this.Add_Building = function(input, x, y, team)
	{
		if(buildings.At(x,y)!=null)
		{
			console.error("Map position already occupied.");
			return;
		}
		input.Index = Buildings.length;
		Buildings.push(input);
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
		if(online)socket.emit('start', id);
		this.Start();
	};
	this.Start = function()
	{
		curently_playing = true;
		if(UI!=null)
		{
			UI.Close_Menu();
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
		Player[slot].Lose();
	};

	this.Set = function(data)
	{
		if(data.terrain!=null)
		{
			terre = data.terrain;
			this.Terrain_Map = terre;
		}
		if(data.unit_map!=null)
		{
			units = data.unit_map;
			this.Units_Map = units;
		}
		if(data.build_map!=null)
		{
			buildings = data.build_map;
			this.Buildings_Map = buildings;
		}
		if(data.name!=null)
		{
			this.Name = data.name;
		}
		if(data.units!=null)
		{
			Units = data.units;
		}
		if(data.buildings!=null)
		{
			Buildings = data.buildings;
		}
		if(data.players!=null)
		{
			Players = data.players;
		}
		if(data.con_players!=null)
		{
			Connected_Players = data.con_players;
		}
		if(data.turn!=null)
		{
			turn = data.turn;
		}
		if(data.cur_player!=null)
		{
			cur_player = data.cur_player;
		}
		if(data.game_over!=null)
		{
			this.Game_Over = data.game_over;
		}
	};
	this.Data = function()
	{
		var self = this;
		return {
			map_id:Levels.From_Name(self.Name),
			connected:JSON.stringify(Connected_Players)
		};
	};
	this.Clone = function()
	{
		var e = new Engine_Class(terre);
		return e;
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
	};
	this.Player_Died = function(input)
	{
		var pos = Players.indexOf(input);
		if(~pos)
		{
			var cur = Players[pos];
			Players[pos].Dead = true;
			var alive = -1;
			for(var i in Players)
			{
				if(!Player[i].Died)
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
				this.Player_Won(alive);
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
			console.error("stack trace");
			debugger;
			for(var i in Players)
			{
				if(Players[i]==null)continue;
				if(Players[i]==input)continue;
				if(Players[i].Died)continue;
				Players[i].Kill_All(true);
			}
			var self = this;
			setTimeout(function(){self.End_Game();},2000);
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
};