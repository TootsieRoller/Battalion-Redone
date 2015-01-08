var Terrain = {
	Terre_Class:function(game, terre_index, name, x, y)
	{
		function err(txt)
		{
			console.error(name+" of "+terre_index+": "+txt);
		}
		this.SELECTABLE = 2;

		var TerreData = Terrain_Data.TERRE[terre_index];
		var mods = Core.Array.Clone(TerreData.Modifiers);
		var mod_amt = mods.length;

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


		this.Draw = function(canvas, x, y, zoom)
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

		
		this.Mods_By_Type = function(type)
		{
			var cur = [];
			for(var i=0;i<mod_amt;i++)
			{
				if(mods[i].Type==type)
					cur.push(mods[i]);
			}
			return cur;
		};
		this.Modifier_Amt = function()
		{
			return mod_amt;
		}
		this.Modifier = function(i)
		{
			if(i<mod_amt&&i>=0)
				return mods[i];
			err("Not a valid index");
			return null;
		}
		this.Add_Modifier = function(value)
		{
			mods[mod_amt++] = value;
		}
		this.Del_Modifier = function(value)
		{
			if(i<mod_amt&&i>=0)
				mods[value] = mods[--mod_amt];
			err("Not a valid index");
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