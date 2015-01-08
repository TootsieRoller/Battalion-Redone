var Buildings = {
	Build_Class:function(game, place_index)
	{
		function err(txt)
		{
			console.error("Building of "+place_index+" at ("+this.X+", "+this.Y+"): "+txt);
		}
		this.SELECTABLE = 3;

		var BuildData = Building_Data.PLACE[place_index];
		var actions = [];
		var select = Select_Animation.New(animationCanvas, -60, -60, 60, 60, false);
		this.Description = function()
		{
			return BuildData.Description;
		};
		this.Index = null;

		this.Name = BuildData.Name;
		this.Owner = null;
		this.Terrain = null;

		this.Type = BuildData.Type;
		this.Protection = BuildData.Protection;
		this.Stature = BuildData.Stature;
		this.Defense = BuildData.Defense;
		this.Injuries = BuildData.Injuries;
		this.Height = BuildData.Height;
		this.Drag = BuildData.Drag;
		this.Source = place_index;
		this.Sprite = null;
		this.Resources = BuildData.Resources;
		this.Income = BuildData.Income;
		this.X;
		this.Y;
		this.dispX = 0;
		this.dispY = 0;
		this.X_Offset = function()
		{
			return BuildData.X;
		};
		this.Y_Offset = function()
		{
			return BuildData.Y;
		};
		this.Data = function()
		{
			var self = this;
			return {
				index:place_index,
				x:self.X,
				y:self.Y,
				stature:self.Stature,
				resources:self.Resources
			};
		};

		var mods = Core.Array.Clone(BuildData.Modifiers);
		var mod_amt = mods.length;
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
		};
		this.Modifier = function(i)
		{
			if(i<mod_amt&&i>=0)
				return mods[i];
			err("Not a valid index");
			return null;
		};
		this.Add_Modifier = function(value)
		{
			mods[mod_amt++] = value;
		};
		this.Del_Modifier = function(value)
		{
			if(i<mod_amt&&i>=0)
				mods[value] = mods[--mod_amt];
			err("Not a valid index");
		};

		this.Draw = function(canvas, x, y, xScale, yScale)
		{
			if(this.Sprite==null)
			{
				var img = BuildData.Sprite.Image();
				BuildData.Sprite.Draw(canvas,x,y,img.width*xScale,img.height*yScale);
			}
			else
			{
				x = Math.floor(x);
				y = Math.floor(y);
				var pic = this.Sprite;
				var behind = canvas.getImageData(x, y, pic.width, pic.height);
				pic = merge(behind, pic);
				Canvas.ScaleImageData(canvas, pic, x, y, xScale, yScale);
			}
		};
		this.UI_Draw = function(canvas, x, y, zoom)
		{
			this.dispX = x;
			this.dispY = y;
			this.Draw(canvas,x+this.X_Offset()*zoom,y+this.Y_Offset()*zoom,zoom,zoom);
			if(this.Active)
			{
				select.set({
					x:x,
					y:y,
					width:60*zoom,
					height:60*zoom
				});
			}
			if(this.Stature!=BuildData.Stature)
			{
				var percent = this.Stature/BuildData.Stature;
				if(percent<0)
					percent = 0;
				var height = 60*(1-percent);
				Team_Colors.Draw(canvas, x+50*zoom, y+height, TILESIZE-height, this.Owner);
			}
			if(this.Resources!=0)
			{
				canvas.save();
				canvas.translate(x, y);
				canvas.scale(zoom, zoom);
				Shape.Rectangle.Draw(canvas, 5, 40, 50, 12, "#4B5320");
				new Text_Class("8pt Times New Roman","#FFF").Draw(canvas, 7, 41, 60, 10, "$"+this.Resources);
				canvas.restore();
			}
		};

		this.Active = false;
		this.Set_Active = function(value)
		{
			if(!BuildData.Act)return;
			this.Active = value;
			select.set({show:value});
		};
		this.Act = function(input)
		{
			return BuildData.Act(game, this, input);
		};

		this.Start_Turn = function(client)
		{
			if(client)
			{
				if(BuildData.Act)
				{
					this.Set_Active(true);
				}
			}
			else
			{
				if(BuildData.Act)
				{
					this.Active = true;
				}
			}
			if(raiding_player!=null)
			if(this.Terrain.Unit==null||this.Terrain.Unit.Player!=raiding_player)
			{
				this.Stature = BuildData.Stature;
				raiding_player = null;
			}
			var amt = Math.min(this.Resources, this.Income);
			if(amt!=0)
			{
				this.Resources-=amt;
				if(this.Owner!=null)this.Owner.Add_Income(amt);
				// select.values.x,y
				var risingTxt = HUD_Display.Add_Drawable(new Text_Class("18pt Times New Roman","#0F0"), "Income "+this.X+","+this.Y, this.dispX+8, this.dispY+38, 100, 30, "$"+amt);
				Core.Slide_Drawable_Y(risingTxt, -30, 10, function(){
					Core.Fade_Drawable(risingTxt, 0, 10);
					Core.Slide_Drawable_Y(risingTxt, -30, 10, function(){
						HUD_Display.Delete_Drawable(risingTxt);
					});
				});
			}
		};
		this.End_Turn = function()
		{
			this.Set_Active(false);
		};

		this.Clone = function(engine)
		{
			return new Build_Class(engine,place_index,x,y);
		};

		var raiding_player = null;
		this.Raid = function(unit, amt)
		{
			raiding_player = unit.Player;
			this.Stature-=amt;
			if(this.Stature<=0)
			{
				this.Stature = BuildData.Stature;
				unit.Player.Capture(this);
			}
			else if(this.Owner!=null)unit.Health-=this.Defense;
			game.Interface.Draw();
		};
		this.Captured_By = function(player)
		{
			var available = this.Mods_By_Type("Capture");
			for(var i=0;i<available.length;i++)
			{
				available[i].Do([this, player]);
			}
		};
		this.Die = function(keep_data)
		{
			if(!keep_data)
			{
				if(this.Owner!=null)
					this.Owner.Lose_Building(this);
			}
			this.Owner = null;
			this.Sprite = null;
			Core.Explode(this);
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
			actions.push(value);
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
	New:function(Game, name)
	{
		var index = Building_Data.Get(name);
		if(index==0)
		{
			console.log(name+" is not a proper terrain name.");
		}
		return new Buildings.Build_Class(Game,index);
	}
};