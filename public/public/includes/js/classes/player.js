var Player_Class = function(game, name, team, colors)
{
	this.data = {
		damage_delt:0,
		damage_received:0,
		units_gained:0,
		units_killed:0,
		money_gained:0,
		money_spent:0,
		turns_alive:0,
		buildings_captured:0,
		buildings_lost:0
	};

	var Units = [];
	var Buildings = [];
	var charSprites = [];
	var placeSprites = [];
	this.Color = colors;
	this.Game = game;
	imageHolderCanvas.clearRect(0,0,imageHolderCanvas.width,imageHolderCanvas.height);
	for(var x=0;x<Char_Data.CHARS.length;x++)
	{
		charSprites[x] = [];
		for(var y=0;y<3;y++)
		{
			var img = Char_Data.CHARS[x].Sprite[y];
			img.Draw(imageHolderCanvas,0,0);
			charSprites[x][y] = changePixels(imageHolderCanvas.getImageData(0,0,img.Image().width,img.Image().height), Team_Colors.Color[0], Team_Colors.Color[colors]);
			imageHolderCanvas.clearRect(0,0,img.Image().width,img.Image().height);
		}
		var c = Char_Data.CHARS[x];
		var img = c.Sprite[0];
		c.X[3] = 60-img.Image().width-c.X[0];
		c.Y[3] = c.Y[0];
		img.Draw(imageHolderCanvas,0,0);
		charSprites[x][3] = flipX(changePixels(imageHolderCanvas.getImageData(0,0,img.Image().width,img.Image().height), Team_Colors.Color[0], Team_Colors.Color[colors]));
		imageHolderCanvas.clearRect(0,0,img.Image().width,img.Image().height);
	}
	for(var x=0;x<Building_Data.PLACE.length;x++)
	{
		var img = Building_Data.PLACE[x].Sprite;
		img.Draw(imageHolderCanvas,0,0);
		placeSprites[x] = changePixels(imageHolderCanvas.getImageData(0,0,img.Image().width,img.Image().height), Team_Colors.Color[0], Team_Colors.Color[colors]);
		imageHolderCanvas.clearRect(0,0,img.Image().width,img.Image().height);
	}

	this.Name = name;
	this.Team = team;
	this.Game = game;
	this.Dead = false;
	function ICON_DRAWER(imgData)
	{
		this.Draw = function(canvas, x, y, w, h)
		{
			if(w==null)w=imgData.width;
			if(h==null)h=imgData.height;
			var back = canvas.getImageData(x, y, w, h);
			var canvasXScale = Canvas.Width/Canvas.MaxWidth;
			var canvasYScale = Canvas.Height/Canvas.MaxHeight;
			canvas.putImageData(scale(merge(back, scale(imgData, w/imgData.width, h/imgData.height)), canvasXScale, canvasYScale), x*canvasXScale, y*canvasYScale);
		};
	};
	this.Icon = new ICON_DRAWER(charSprites[1][0]);
	this.Data = function()
	{
		var self = this;
		var units_data = [];
		var build_data = [];
		for(var i in Units)
		{
			units_data.push(Units[i].Data());
		}
		for(var i in Buildings)
		{
			build_data.push(Buildings[i].Data());
		}
		return {
			name:self.Name,
			color:colors,
			data:self.data,
			units:units_data,
			buildings:build_data
		};
	};

	var disallowed_units = [12,13,14,18];
	var controls = [0,0,0];
	var resources = 0;

	this.Active = false;
	this.Start_Turn = function(actable)
	{
		this.data.turns_alive++;
		this.Active = true;
		for(var i in Units)
		{
			Units[i].Start_Turn(actable);
			if(game.Game_Over)
				return;
		}
		for(var i in Buildings)
		{
			Buildings[i].Start_Turn(actable);
			if(game.Game_Over)
				return;
		}
	};
	this.End_Turn = function()
	{
		this.Active = false;
		for(var i in Units)
		{
			Units[i].End_Turn();
			if(game.Game_Over)
				return;
		}
		for(var i in Buildings)
		{
			Buildings[i].End_Turn();
			if(game.Game_Over)
				return;
		}
		game.Next_Player();
	};

	this.Add_Income = function(value)
	{
		if(value>0)
			this.data.money_gained+=value;
		else this.data.money_spent-=value;
		resources+=value;
		if(game.Interface!=null)
			game.Interface.Update_Player_Info();
	};
	this.Cash_Money = function()
	{
		return resources;
	};

	this.Disallow_Unit = function(index)
	{
		for(var i in disallowed_units)
		if(disallowed_units[i]==index)
		{
			console.error("Unit not allowed to begin with!");
			return false;
		}
		disallowed_units.push(index);
		return true;
	};
	this.Reallow_Unit = function(index)
	{
		var pos = disallowed_units.indexOf(unit);
		if(~pos)
		{
			disallowed_units.splice(pos,1);
			return true;
		}
		console.error("No unit previously disallowed that match that index.");
		return false;
	};
	this.Disallowed = function()
	{
		var temp = [];
		for(var i=0;i<3;i++)
		{
			if(controls[i]==0)
			{
				for(var j=0;j<Char_Data.SortByType[i].length;j++)
				{
					temp.push(Char_Data.SortByType[i][j]);
				}
			}
		}
		for(var i=0;i<disallowed_units.length;i++)
		{
			temp.push(disallowed_units[i]);
		}
		return temp;
	};
	this.Calculate_Cost = function(unit)
	{
		for(var i in disallowed_units)
		if(disallowed_units[i]==unit)
			return null;
		var discount = 1-controls[Char_Data.CHARS[unit].Type]*.05;
		return Math.ceil(Char_Data.CHARS[unit].Cost*discount);
	};
	this.Unit_Images = function()
	{
		return charSprites;
	};

	this.Kill_All = function(keep_data)
	{
		for(var i in Units)
		{
			Units[i].Die(true);
			if(!keep_data)game.Remove_Unit(Units[i]);
		}
		Units = [];
		for(var i in Buildings)
		{
			Buildings[i].Die(true);
		}
		Buildings = [];
	};
	this.Next_Active_Unit = function()
	{
		for(var i in Units)
		{
			if(Units[i].Active)return Units[i];
		}
		return -1;
	};
	this.Next_Active_Building = function()
	{
		for(var i in Buildings)
		{
			if(Buildings[i].Active)return Buildings[i];
		}
		return -1;
	};

	this.Lose = function()
	{
		this.Kill_All();
		game.Player_Died(this);
	};
	this.Win = function()
	{
		game.Player_Won(this);
	};

	this.Capture = function(input)
	{
		this.data.buildings_captured++;
		Buildings.push(input);
		input.Sprite = placeSprites[input.Source];
		input.Captured_By(this);
		if(input.Owner!=null)
		{
			input.Owner.Lose_Building(input);
		}
		input.Owner = this;
	};
	this.Add_Control = function(type, gain)
	{
		if(type==null)return;
		if(gain==null)gain = true;
		if(type>2||type<0)
			return;
		if(gain)controls[type]++;
		else controls[type]--;
		if(controls[type]<0)controls[type]=0;
	};
	this.Lose_Building = function(input)
	{
		this.data.buildings_lost++;
		var pos = Buildings.indexOf(input);
		if(~pos)
		{
			Buildings.splice(pos,1);
			return true;
		}
		return false;
	}

	this.Add_Unit = function(input)
	{
		this.data.units_gained++;
		Units.push(input);
		input.Player = this;
		input.Sprites = charSprites[input.Source];
	};
	this.Remove_Unit = function(unit)
	{
		this.data.units_lost++;
		var pos = Units.indexOf(unit);
		if(~pos)
		{
			Units.splice(pos,1);
			if(Units.length==0)
			{
				this.Lose();
			}
			return true;
		}
		return false;
	};
};