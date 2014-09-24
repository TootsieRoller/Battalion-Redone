var Terrain = {
	Terre_Class:function(game, terre_index, name, x, y)
	{
		function err(txt)
		{
			console.error(name+" of "+terre_index+": "+txt);
		}
		this.SELECTABLE = 2;

		var TerreData = Terrain_Data.TERRE[terre_index];
		var actions = [];

		this.Building = null;
		this.Unit = null;

		this.Name = TerreData.Name;
		this.Type = TerreData.Type;
		this.Protection = TerreData.Protection;
		this.Damage = TerreData.Damage;
		this.Height = TerreData.Height;
		this.Drag = TerreData.Drag;
		this.Source = terre_index;
		this.X = x;
		this.Y = y;
		this.X_Offset = function()
		{
			return TerreData.X;
		};
		this.Y_Offset = function()
		{
			return TerreData.Y;
		};


		this.Draw = function(canvas, x, y, zoom, h, state)
		{
			var img = TerreData.Sprite.Image();
			TerreData.Sprite.Draw(canvas,x,y,img.width*zoom,img.height*zoom);
		};
		this.UI_Draw = function(canvas, x, y, zoom)
		{
			this.Draw(canvas,x+this.X_Offset()*zoom,y+this.Y_Offset()*zoom,zoom);
		};

		this.Start_Turn = function()
		{
			if(this.Building!=null)
				this.Building.Start_Turn();
		};

		this.Description = function()
		{
			return TerreData.Description;
		};
		this.Index = function()
		{
			return index;
		};

		this.Clone = function(engine)
		{
			return new Terre_Class(engine,terre_index,x,y);
		};

		this.Action_Amt = function()
		{
			return actions.length;
		}
		this.Action = function(i)
		{
			return actions[i];
		}
		this.Add_Action = function(value)
		{
			actions[actions.length] = value;
		}
		this.Del_Action = function(value)
		{
			var found = false;
			var last_index;
			for(var i in actions)
			{
				if(index!=i.substring(2,i.length))
				{
					if(found)
					{
						actions[last_index] = actions[i];
						last_index = i;
					}
					continue;
				}
				if(i.substring(0,2)=="A_")
				{
					delete actions[i];
					found = true;
					last_index = i;
				}
			}
			if(!found)
			{
				err("Could not find index to delete.");
			}
		}
	},
	New:function(Game, name, x, y)
	{
		var index = Terrain_Data.Get(name);
		if(index==0)
		{
			console.log(name+" is not a proper terrain name.");
		}
		return new Terrain.Terre_Class(Game,index,"Terrain("+x+","+y+")",x,y);
	}
};