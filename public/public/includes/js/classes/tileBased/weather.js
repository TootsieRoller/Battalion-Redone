var Building = {
	Place_Class:function(game, terre_index, name, x, y)
	{
		function err(txt)
		{
			console.error(name+" of "+terre_index+": "+txt);
		}
		this.SELECTABLE = 2;

		var BuildData = Building_Data.PLACE[terre_index];
		var actions = [];

		this.Owned = null;

		this.Type = BuildData.Type;
		this.Protection = BuildData.Protection;
		this.Damage = BuildData.Damage;
		this.Height = BuildData.Height;
		this.Drag = BuildData.Drag;
		this.Source = terre_index;
		this.X = x;
		this.Y = y;
		this.X_Offset = function()
		{
			return BuildData.X;
		};
		this.Y_Offset = function()
		{
			return BuildData.Y;
		};

		this.Draw = function(canvas, x, y, zoom)
		{
			var img = BuildData.Sprite.Image();
			BuildData.Sprite.Draw(canvas,x,y,img.width*zoom,img.height*zoom);
		};

		this.Name = function()
		{
			return BuildData.Name;
		};
		this.Description = function()
		{
			return BuildData.Description;
		};
		this.Index = function()
		{
			return index;
		};

		this.Clone = function(engine)
		{
			return new Place_Class(engine,terre_index,x,y);
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
		var index = Building_Data.Get(name);
		if(index==0)
		{
			console.log(name+" is not a proper terrain name.");
		}
		return new Building.Place_Class(Game,index,"Building("+x+","+y+")",x,y);
	}
};