var Characters = {
	Char_Class:function(game, char_index)
	{
		function err(txt)
		{
			console.error(name+index+": "+txt);
		}
		this.SELECTABLE = 1;

		var CharData = Char_Data.CHARS[char_index];
		var name = CharData.Name;
		var select = Select_Animation.New(animationCanvas, -60, -60, 60, 60, false);
		this.Description = function()
		{
			return CharData.Description;
		};
		this.Index = null;


		this.Terrain = function()
		{
			return game.Terrain_Map.At(this.X, this.Y);
		};

		this.Game = game;
		this.Name = name;
		this.Source = char_index;
		this.Unit_Type = CharData.Type;
		this.Max_Health = CharData.Max_Health;
		this.Health = CharData.Max_Health;
		this.Armor = CharData.Armor;
		this.Power = CharData.Power;
		this.Weapon = CharData.Weapon;
		this.Movement = CharData.Movement;
		this.Move_Type = CharData.Move_Type;
		this.Slow_Attack = CharData.Slow;
		this.Range = CharData.Range;
		this.Player = null;
		this.Attacking = null;
		this.Killed = null;
		this.Idle = false;
		this.State = 0;
		this.Sprites = [];
		this.X;
		this.Y;
		var tileXOff = 0;
		var tileYOff = 0;
		this.X_Offset = function()
		{
			return CharData.X[this.State]+tileXOff;
		};
		this.Y_Offset = function()
		{
			return CharData.Y[this.State]+tileYOff;
		};
		this.Data = function()
		{
			var self = this;
			return {
				index:char_index,
				x:self.X,
				y:self.Y,
				health:self.Health
			};
		};

		var mods = Core.Array.Clone(CharData.Modifiers);
		var mod_amt = mods.length;

		this.display_health = true;
		this.Active = false;
		this.Set_Active = function(value)
		{
			if(!CharData.Actable)return;
			this.Active = value;
			select.set({show:value});
		};
		this.Draw = function(canvas, x, y, z)
		{
			var pic = this.Sprites[this.State];
			// var pic = zoom(this.Sprites[this.State], z);
			if(this.Idle)
			{
				pic = darken(pic);
			}
			canvas.putImageData(pic,x,y);
		};
		this.UI_Draw = function(canvas, x, y, zoom)
		{
			this.Draw(canvas,x+this.X_Offset()*zoom,y+this.Y_Offset()*zoom,zoom);
			if(this.Health<=0)return;
			if(this.display_health)
			if(this.Health!=this.Max_Health)
			{
				var percent = this.Health/this.Max_Health;
				Shape.Rectangle.Draw(HUD_Display.Context, x+3, y+54, 54, 5, "#000");
				var width;
				for(var i=0;i<4;i++)
				{
					width = Math.floor(13*(percent/.25-i));
					if(width>13)
					{
						width = 13;
					}
					Shape.Rectangle.Draw(HUD_Display.Context, x+4+13*i, y+55, width, 3, Team_Colors.Health_Display[i]);
					if(width<13)break;
				}
			}
			if(CharData.Additional_Display)
			{
				CharData.Additional_Display(overlayCanvas, x, y);
			}
			if(this.Active)
			{
				select.set({
					x:x,
					y:y
				});
			}
		};

		this.Act = function(x, y, mover)
		{
			if(mover==null)
			{
				console.error("move not defined");
				return;
			}
			var end = [this.X,this.Y];
			for(var i=0;i<mover.length;i++)
			{
				if(mover[i]==0)
				{
					end[1]++;
				}
				else if(mover[i]==1)
				{
					end[1]--;
				}
				else if(mover[i]==2)
				{
					end[0]++;
				}
				else if(mover[i]==3)
				{
					end[0]--;
				}
			}
			if(end[0]==x&&end[1]==y)
			{
				var occupied = game.Units_Map.At(x,y);
				if(occupied!=null)return false;
				this.Set_Active(false);
				this.Move_To(mover,end,function(unit){
					unit.Idle = true;
					game.Interface.Draw();
					if(!~unit.Player.Next_Active_Unit())
					if(!~unit.Player.Next_Active_Building())
					{
						game.Next_Player();
					}
				});
				return true;
			}
		// this code has error when on server as sent move doesnt initialize path
		// only put this back in if bug appears where unit can attack wherever even when not in range
		// if(this.Current_Path().Attackable(x,y))
			var defender = game.Units_Map.At(x,y);
			if(defender==null)return false;
			if(!this.Can_Attack(defender))return false;
			if(this.Slow_Attack)
			{
				if(!this.In_Range(this.X,this.Y,defender))return false;
				this.Setup_Attack(defender);
				return true;
			}
			if(!this.In_Range(end[0],end[1],defender))return false;
			var place = game.Units_Map.At(end[0],end[1]);
			if(place==null||place==this)
			{
				this.Setup_Attack(defender, mover, end);
				return true;
			}
			return false;
		};
		this.Start_Turn = function(client)
		{
			if(client)
			{
				if(CharData.Actable)
				{
					this.Set_Active(true);
				}
			}
			else
			{
				if(CharData.Actable)
				{
					this.Active = true;
				}
			}
			this.Idle = false;
			var available = this.Mods_By_Type("Start Turn");
			for(var i=0;i<available.length;i++)
			{
				available[i].Do(this);
			}
		};
		this.End_Turn = function(act)
		{
			if(act==null)act = true;
			this.Set_Active(false);
			this.Idle = false;
			this.Attacking = null;
			select.set({show:false});
			if(act)
			{
				var available = this.Mods_By_Type("End Turn");
				for(var i=0;i<available.length;i++)
				{
					available[i].Do(this);
				}
			}
		};

		this.On_Move = function(unit, mover){};
		function recur_animation(unit, mover, done, i){
			var dir = mover[i];
			if(dir!=null)
			{
				if(dir==0)
					unit.Down(function(){
						unit.Y++;
						recur_animation(unit, mover, done, i+1);
					});
				else if(dir==1)
					unit.Up(function(){
						unit.Y--;
						recur_animation(unit, mover, done, i+1);
					});
				else if(dir==2)
					unit.Right(function(){
						unit.X++;
						recur_animation(unit, mover, done, i+1);
					});
				else if(dir==3)
					unit.Left(function(){
						unit.X--;
						recur_animation(unit, mover, done, i+1);
					});
				return;
			}
			tileXOff = 0;
			tileYOff = 0;
			done(unit);
		}
		function recur_slide(incFnc, frames, callback){
			if(frames<=0)
			{
				callback();
				return;
			}
			incFnc();
			game.Interface.Simple_Draw();
			setTimeout(function(){recur_slide(incFnc, frames-1, callback);},tpf);
		}
		this.Animate_Move = function(mover, done){
			this.display_health = false;
			recur_animation(this, mover, done, 0);
		};
		this.Face = function(x, y){
			x-=this.X;
			y-=this.Y;
			var hyp = Math.sqrt(x*x+y*y);
			var angle = Math.round(180/Math.PI*Math.acos(x/hyp));
			if(angle<=45&&angle>=-45)this.Face_Right();
			else if(angle>=135&&angle<=225)this.Face_Left();
			else
			{
				angle = Math.round(180/Math.PI*Math.asin(y/hyp));
				if(angle>45&&angle<135)
					this.Face_Down();
				else this.Face_Up();
			}
		};
		this.Face_Right = function(){
			this.State = 0;
		};
		this.Face_Up = function(){
			this.State = 1;
		};
		this.Face_Down = function(){
			this.State = 2;
		};
		this.Face_Left = function(){
			this.State = 3;
		};
		this.Up = function(callback){
			this.Face_Up();
			var amt = TILESIZE/6;
			recur_slide(function(){
				tileYOff-=amt;
			},6,callback);
		};
		this.Down = function(callback){
			this.Face_Down();
			var amt = TILESIZE/6;
			recur_slide(function(){
				tileYOff+=amt;
			},6,callback);
		};
		this.Left = function(callback){
			this.Face_Left();
			var amt = TILESIZE/6;
			recur_slide(function(){
				tileXOff-=amt;
			},6,callback);
		};
		this.Right = function(callback){
			this.Face_Right();
			var amt = TILESIZE/6;
			recur_slide(function(){
				tileXOff+=amt;
			},6,callback);
		};

		this.Move_From = function()
		{
			this.Terrain().Unit = null;
			var b = this.Terrain().Building;
			if(b!=null)
			{
				if(!b.Idle)b.Set_Active(true);
			}
		};
		this.Move_To = function(mover, end, callback)
		{
			this.Move_From();
			game.Interface.Set_Moving_Unit(this);
			game.Interface.Allow_Controls(false);
			this.On_Move(this, mover);
			this.display_health = false;
			var oldX = this.X;
			var oldY = this.Y;
			this.Animate_Move(mover,function(unit){
				game.Units_Map.Set(oldX,oldY,null);
				game.Units_Map.Set(unit.X,unit.Y,unit);
				game.Interface.Allow_Controls(true);
				game.Interface.Set_Moving_Unit(null);
				unit.display_health = true;
				unit.Terrain().Unit = unit;
				var b = unit.Terrain().Building;
				if(b!=null)
				{
					b.Set_Active(false);
				}
				var available = unit.Mods_By_Type("Properties");
				for(var i=0;i<available.length;i++)
				{
					available[i].Do(unit);
				}
				callback(unit);
			});
		};
		this.Hurt = function(amt)
		{
			this.Health-=amt;
			if(this.Health<=0)
			{
				this.Die();
				return;
			}
			if(this.Health>this.Max_Health)
			{
				this.Health = this.Max_Health;
			}
			game.Interface.Draw();
		};
		this.Setup_Attack = function(target, mover, end)
		{
			game.Interface.Allow_Controls(false);
			this.Attacking = target;
			this.Set_Active(false);
			var atkFnc = function(unit){
				unit.Idle = true;
				var available = unit.Mods_By_Type("Attack");
				for(var i=0;i<available.length;i++)
				{
					available[i].Do(unit);
				}
				unit.Attacking = null;
				game.Interface.Draw();
				if(target.In_Range(target.X,target.Y,unit)&&target.Can_Attack(unit)){
					target.Attack(unit,function(){
						game.Interface.Allow_Controls(true);
						game.Interface.Draw();
						if(!~unit.Player.Next_Active_Unit())
						if(!~unit.Player.Next_Active_Building())
						{
							game.Next_Player();
						}
					});
				}else{
					game.Interface.Allow_Controls(true);
					if(!~unit.Player.Next_Active_Unit())
					if(!~unit.Player.Next_Active_Building())
					{
						game.Next_Player();
					}
				}
			};
			if(mover!=null)
			{
				this.Move_To(mover,end,function(unit){
					unit.Attack(target,atkFnc);
				});
				return;
			}
			this.Attack(target,atkFnc);
		};
		this.Attack = function(defender, callback)
		{
			this.Killed = null;
			this.Face(defender.X, defender.Y);
			var damage = this.Calculate_Damage(defender);
			this.Player.data.damage_delt+=damage;
			defender.Player.data.damage_received+=damage;
			defender.Hurt(this.Calculate_Damage(defender));
			if(defender.Dead)
			{
				this.Player.data.units_killed++;
				this.Killed = defender;
				if(defender.Player.All_Units().length==0)
				{
					defender.Player.Lose();
				}
			}
			if(callback!=null)
				callback(this);
		}
		this.In_Range = function(x, y, defender)
		{
			var dis = Math.abs(defender.X-x)+Math.abs(defender.Y-y);
			return (dis-this.Range[0]<this.Range[1]&&dis>=this.Range[0]);
		};
		this.Can_Attack = function(defender)
		{
			if(defender.Player==this.Player)return false;
			var available = this.Mods_By_Type("Can Attack");
			for(var i=0;i<available.length;i++)
			{
				var response = available[i].Do([this,defender]);
				if(response)return true;
				else if(response==null)continue;
				return false;
			}
			if(defender.Unit_Type==1||defender.Unit_Type==2)return false;
			return true;
		};

		this.Calculate_Damage = function(defender)
		{
			var bonus = this.Health/this.Max_Health;
			if(this.Weapon==0)
			{
				if(defender.Armor==0)
				{
					bonus*=1.5;
				}else if(defender.Armor==1)
				{
					
				}else
				{
					bonus*=.5;
				}
			}else if(this.Weapon==1)
			{
				if(defender.Armor==0)
				{
					
				}else if(defender.Armor==1)
				{
					
				}else
				{
					
				}
			}else
			{
				if(defender.Armor==0)
				{
					bonus*=.5;
				}else if(defender.Armor==1)
				{
					
				}else
				{
					bonus*=1.5;
				}
			}
			if(defender.Unit_Type==0)
			{
				var tile_def = defender.Terrain();
				if(tile_def.Building!=null)
					tile_def = tile_def.Building;
				bonus*=(1-tile_def.Protection);
				// console.log("b4 height",bonus);
				// bonus*=1+(this.Terrain().Height-tile_def.Height)/100;
				// console.log("aftr height",1+this.Terrain().Height-tile_def.Height,bonus);
			}
			var available = this.Mods_By_Type("Damage");
			for(var i=0;i<available.length;i++)
			{
				bonus*=available[i].Do([this, defender]);
			}
			return Math.ceil(bonus*this.Power);
		};
		this.Calculate_Move_Cost = function(terrain)
		{
			// terrain types
			// 0 = dirty
			// 1 = rough
			// 2 = rugged
			// 3 = clean
			// 4 = hole-y
			// 5 = slippery
			// 6 = sea
			// 7 = impassable

			// mover types
			// 0 = foot
			// 1 = wheel
			// 2 = tank
			// 3 = low air
			// 4 = med air
			// 5 = high air
			// 6 = surface water
			// 7 = submerged
			var t_data = Terrain_Data.TERRE[terrain.Source];
			var bonus = 1;
			//check modifiers path
			if(t_data.Type==7)return 100;
			if(t_data.Type==0)
			{
				if(this.Move_Type==1)bonus+=.5;
				if(this.Unit_Type==1)return 1;
				if(this.Unit_Type==2)return 100;
			}
			else if(t_data.Type==1)
			{
				if(this.Move_Type==0)bonus-=.5;
				if(this.Unit_Type==1)return 1;
				if(this.Unit_Type==2)return 100;
			}
			else if(t_data.Type==2)
			{
				if(this.Move_Type==1||this.Move_Type==2)return 100;
				if(this.Unit_Type==1)return 1;
				if(this.Unit_Type==2)return 100;
			}
			else if(t_data.Type==3)
			{
				if(this.Move_Type==1)bonus-=.5;
				if(this.Unit_Type==1)return 1;
				if(this.Unit_Type==2)return 100;
			}
			else if(t_data.Type==4)
			{
				if(this.Move_Type==0)bonus+=.5;
				if(this.Unit_Type==1)return 1;
				if(this.Unit_Type==2)return 100;
			}
			else if(t_data.Type==5)
			{
				if(this.Move_Type==0)bonus+=1;
				if(this.Move_Type==1)bonus+=1.5;
				if(this.Move_Type==2)bonus+=.5;
				if(this.Unit_Type==1)return 1;
				if(this.Unit_Type==2)return 100;
			}
			else if(t_data.Type==6)
			{
				if(this.Unit_Type==1)return 1;
				if(this.Unit_Type==0)return 100;
			}
			else if(t_data.Type==7)
			{
				return 100;
			}
			return Math.ceil(bonus*terrain.Drag);
		};

		var breatherValue = false;
		this.Breath = function()
		{
/* function breath(){
	if(breathDir==1){	// breath in
		breathAmt-=breathInc;
		if(breathAmt<-breathMax)
			breathDir=-1;
	}else{  			// breath out
		breathAmt+=breathInc;
		if(breathAmt>breathMax)
			breathDir=1;
	}
} */
		};

		this.Clone = function(engine)
		{
			return new Char_Class(engine,char_index,Converter.Map.X(x),Converter.Map.Y(y));
		};

		this.Dead = false;
		this.Die = function(keep_data)
		{
			this.Dead = true;
			this.Health = 0;
			this.Move_From();
			Core.Explode(this);
			if(!keep_data)
			{
				this.Player.Remove_Unit(this);
				game.Remove_Unit(this);
			}
		};

		var move_path;
		this.Mover = null;
		this.Start_Path = function(x, y)
		{
			move_path = new Path_Finder_Handler(game, this, x, y);
		};
		this.Current_Path = function()
		{
			return move_path;
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
	New:function(Game, name)
	{
		var index = Char_Data.Get(name);
		if(index==0)
		{
			console.log(name+" is not a proper unit name.");
		}
		return new Characters.Char_Class(Game,index);
	}
};