var Interface_Class = function()
{
	var allow_input = false;
	var self = this;
	var game,terrain_disp;
	self.setGame = function(g)
	{
		game = g;
		self.Game = g;
		if(g==null){
			self.Tiles = null;
			terrain_disp = null;
			return;
		}
		game.Set_Interface(self);
		self.Tiles = new Tile_Holder(Levels.Cols(g.Map), Levels.Rows(g.Map), function(ui, x, y){
			if(ui.Check_Controls())ui.Select_Tile(x, y);
		});
		self.Tiles.Interface = self;
		terrain_disp = new Tiling;
		terrain_disp.setup(600, 600, game.Terrain_Map.Width*TILESIZE, game.Terrain_Map.Height*TILESIZE, TILESIZE, TILESIZE);
	};
	self.Slide_Up = HUD_Display.Add_Drawable(Shape.Rectangle, "up", 100, 0, 400, 20, "#FF0", Canvas.Clear, 0);
	self.Slide_Down = HUD_Display.Add_Drawable(Shape.Rectangle, "down", 100, 580, 400, 20, "#FF0", Canvas.Clear, 0);
	self.Slide_Left = HUD_Display.Add_Drawable(Shape.Rectangle, "left", 0, 100, 20, 400, "#FF0", Canvas.Clear, 0);
	self.Slide_Right = HUD_Display.Add_Drawable(Shape.Rectangle, "right", 580, 100, 20, 400, "#FF0", Canvas.Clear, 0);
	function overSliders(x,y)
	{
		if(Canvas.overlappingDrawable(self.Slide_Up,x,y))return 0;
		if(Canvas.overlappingDrawable(self.Slide_Down,x,y))return 1;
		if(Canvas.overlappingDrawable(self.Slide_Left,x,y))return 2;
		if(Canvas.overlappingDrawable(self.Slide_Right,x,y))return 3;
		return -1;
	}
	var hovered_dir = [false,false,false,false];

	/** display */
	var clientWidth=0,clientHeight=0;
	var gameWidth=0,gameHeight=0;
	var x_offset=-1,y_offset=-1;
	self.X_Offset = function()
	{
		return x_offset;
	};
	self.Y_Offset = function()
	{
		return y_offset;
	};

	function paintOffMap(mapX, mapY, drawX, drawY, zoom){
		var at = game.Terrain_Map.At(mapX,mapY);
		var zoomedTile = TILESIZE*zoom;
		var left=null; // true if overflow, false if overflow in opposite direction
		var overlay = "rgba(0, 0, 0, 0.2)";
		if(mapX==0&&drawX>0){
			for(var lastDrawLeft=drawX;lastDrawLeft>0;lastDrawLeft-=zoomedTile){
				at.UI_Draw(backCanvas, lastDrawLeft-zoomedTile, drawY, zoom);
				backCanvas.fillStyle = overlay;
				backCanvas.fillRect(lastDrawLeft-zoomedTile, drawY, zoomedTile, zoomedTile);
			}
			left = true;
		}
		else if(mapX+1==game.Terrain_Map.Width&&drawX+zoomedTile<gameWidth){
			for(var lastDrawLeft=drawX+zoomedTile;lastDrawLeft<gameWidth;lastDrawLeft+=zoomedTile){
				at.UI_Draw(backCanvas, lastDrawLeft, drawY, zoom);
				backCanvas.fillStyle = overlay;
				backCanvas.fillRect(lastDrawLeft, drawY, zoomedTile, zoomedTile);
			}
			left = false;
		}
		if(mapY==0&&drawY>0){
			for(var lastDrawTop=drawY;lastDrawTop>0;lastDrawTop-=zoomedTile){
				at.UI_Draw(backCanvas, drawX, lastDrawTop-zoomedTile, zoom);
				backCanvas.fillStyle = overlay;
				backCanvas.fillRect(drawX, lastDrawTop-zoomedTile, zoomedTile, zoomedTile);
				if(left==null)continue;
				if(left){
					for(var lastDrawLeft=drawX;lastDrawLeft>0;lastDrawLeft-=zoomedTile){
						at.UI_Draw(backCanvas, lastDrawLeft-zoomedTile, lastDrawTop-zoomedTile, zoom);
						backCanvas.fillStyle = overlay;
						backCanvas.fillRect(lastDrawLeft-zoomedTile, lastDrawTop-zoomedTile, zoomedTile, zoomedTile);
					}
				}else{
					for(var lastDrawLeft=drawX+zoomedTile;lastDrawLeft<gameWidth;lastDrawLeft+=zoomedTile){
						at.UI_Draw(backCanvas, lastDrawLeft, lastDrawTop-zoomedTile, zoom);
						backCanvas.fillStyle = overlay;
						backCanvas.fillRect(lastDrawLeft, lastDrawTop-zoomedTile, zoomedTile, zoomedTile);
					}
				}
			}
		}
		else if(mapY+1==game.Terrain_Map.Height&&drawY+zoomedTile<gameHeight){
			for(var lastDrawTop=drawY+zoomedTile;lastDrawTop<gameHeight;lastDrawTop+=zoomedTile){
				at.UI_Draw(backCanvas, drawX, lastDrawTop, zoom);
				backCanvas.fillStyle = overlay;
				backCanvas.fillRect(drawX, lastDrawTop, zoomedTile, zoomedTile);
				if(left==null)continue;
				if(left){
					for(var lastDrawLeft=drawX;lastDrawLeft>0;lastDrawLeft-=zoomedTile){
						at.UI_Draw(backCanvas, lastDrawLeft-zoomedTile, lastDrawTop, zoom);
						backCanvas.fillStyle = overlay;
						backCanvas.fillRect(lastDrawLeft-zoomedTile, lastDrawTop, zoomedTile, zoomedTile);
					}
				}else{
					for(var lastDrawLeft=drawX+zoomedTile;lastDrawLeft<gameWidth;lastDrawLeft+=zoomedTile){
						at.UI_Draw(backCanvas, lastDrawLeft, lastDrawTop, zoom);
						backCanvas.fillStyle = overlay;
						backCanvas.fillRect(lastDrawLeft, lastDrawTop, zoomedTile, zoomedTile);
					}
				}
			}
		}
	}
	var paint = function(x, y, left, top, w, h, zoom){
		if(game==null)return;
		var at = game.Terrain_Map.At(y,x);
		if(at!=null){
			at.UI_Draw(backCanvas, left, top, zoom);
			paintOffMap(y,x,left,top,zoom); // y is width and x is height, i dont wanna deal with fixing it yet
			at = at.Building;
			if(at!=null)at.UI_Draw(buildingCanvas, left, top, zoom);
		}
		at = game.Units_Map.At(y,x);
		if(at!=null&&at!=moving_unit)at.UI_Draw(charCanvas, left, top, zoom);
		at = self.Tiles.At(y,x);
		if(at!=null)at.Draw(tileCanvas, left, top, w, h);
	};
	var simplePaint = function(x, y, left, top, w, h, zoom){
		if(game==null)return;
		at = game.Units_Map.At(y,x);
		if(at==moving_unit&&at!=null)
			at.UI_Draw(moveUnitCanvas, left, top, zoom);
	};
	var render = function(left, top, zoom, simple){
		if(game==null)return;
		moveUnitCanvas.clearRect(0,0,600,600);
		overlayCanvas.clearRect(0,0,600,600);
		if(simple)
		{
			terrain_disp.render(left, top, zoom, simplePaint);
			return;
		}
		TILESIZE = Math.floor(60*zoom);
		self.zoom = zoom;
		x_offset = left;
		y_offset = top;
		backCanvas.clearRect(0,0,600,600);
		buildingCanvas.clearRect(0,0,600,600);
		charCanvas.clearRect(0,0,600,600);
		// animationCanvas.clearRect(0,0,600,600);
		tileCanvas.clearRect(0,0,600,600);
		hudCanvas.clearRect(0,0,600,600);
		terrain_disp.render(left, top, zoom, paint);
		backCanvas.fillStyle = "#F88";
		backCanvas.fillRect(0,600,600,65);
	};

	var Status = {
		Display:0,
		Icon:Stats_Display.Add_Drawable(Images.Retrieve("empty"), "Icon", 2, 2, 1, 1, null, Canvas.Background),
		Name:Stats_Display.Add_Drawable(new Text_Class("15pt Times New Roman", "#000"), "Name", 70, 3, 200, 20, "", Canvas.Background),
		Desc:Stats_Display.Add_Drawable(new Text_Class("10pt Times New Roman", "#000"), "Desc", 70, 25, 200, 35, "", Canvas.Background),
		Info:Stats_Display.Add_Drawable(new Text_Class("10pt Times New Roman", "#000"), "Info", 290, 5, 130, 50, "", Canvas.Background),
		Divisor1:Stats_Display.Add_Drawable(Shape.Rectangle, "Div1", 280, 3, 2, 60, "#000", Canvas.Background, 0),
		Set:function(data)
		{
			Stats_Display.Background.Redraw();
			if(data==null)
			{
				this.Display = 0;
				this.Icon.Alpha.Set(0);
				this.Name.Alpha.Set(0);
				this.Desc.Alpha.Set(0);
				this.Info.Alpha.Set(0);
				this.Divisor1.Alpha.Set(0);
				return;
			}
			this.Display = data.SELECTABLE;
			this.Icon.Source.Set(data);
			this.Icon.X.Set(5+data.X_Offset());
			this.Icon.Y.Set(3+data.Y_Offset());
			this.Icon.State.Set(true);
			this.Icon.Alpha.Set(1);
			this.Name.State.Set(data.Name);
			this.Name.Alpha.Set(1);
			this.Desc.State.Set(data.Description());
			this.Desc.Alpha.Set(1);
			this.Info.Alpha.Set(1);
			this.Divisor1.Alpha.Set(1);
			if(data.SELECTABLE==1)
			{
				this.Info.State.Set(data.Health+" / "+data.Max_Health+" HP\n"+(data.Health/data.Max_Health*data.Power).toFixed(0)+" Strength\n"+Char_Data.TypeToStr[data.Unit_Type]+"\n"+data.Movement+" "+Char_Data.MoveToStr[data.Move_Type]);
			}
			else if(data.SELECTABLE==2)
			{
				this.Icon.State.Set(false);
				this.Info.State.Set((data.Protection*100)+"% Protection\n\n"+Terrain_Data.TypeToStr[data.Type]+"\n"+data.Damage+" Damage");
			}
			else if(data.SELECTABLE==3)
			{
				this.Info.State.Set(data.Stature+" / "+Building_Data.PLACE[data.Source].Stature+" HP\n"+(data.Protection*100)+"% Protection\n\n"+Building_Data.TypeToStr[data.Type]+"\n"+data.Defense+" Defense\n\n");
			}
		}
	};
	var Avatar = {
		Turn:Avatar_Display.Add_Drawable(new Text_Class("15pt Times New Roman", "#000"), "Turn", 80, 90, 200, 20, null, Canvas.Background),
		Current_Player:Avatar_Display.Add_Drawable(new Text_Class("15pt Times New Roman", "#000"), "Player1", 5, 110, 200, 20, null, Canvas.Background),
		Info:Avatar_Display.Add_Drawable(new Text_Class("10pt Times New Roman", "#000"), "Info", 5, 130, 200, 20, null, Canvas.Background),
		Icon:Avatar_Display.Add_Drawable(Images.Retrieve("empty"), "Icon", 10, 150, 100, 100, null, Canvas.Background),
		Update_Player_List:function(){
			// var cur = game.Active_Player();
			// var total = game.Total_Players();
		},
		Display:function(player){
			if(player==null)
			{
				this.Icon.Source.Set(BLANKIMG);
				this.Turn.State.Set("");
				this.Info.State.Set("");
				this.Current_Player.State.Set("");
				this.Update_Player_List();
				return;
			}
			this.Icon.Source.Set(player.Icon);
			this.Turn.State.Set("Day "+(game.Turn()+1));
			this.Info.State.Set("$"+player.Cash_Money());
			this.Current_Player.State.Set(player.Name);
			this.Update_Player_List();
		}
	};
	var Screen = {
		openDrawables:[],
		openButtons:[],
		Unit_List:function(player, building)
		{
			self.inputXScale = self.gameXScale;
			self.inputYScale = self.gameYScale;
			Screen.openDrawables[0] = Dialog_Display.Add_Drawable(Shape.Rectangle, "BLANK INFO BACKGROUND HANDLER",0,0,600,600,"#FFC251",Canvas.Merge,.5);
			if(!Screen.openDrawables[0])
			{
				Screen.openDrawables = [];
				console.error("Unit list already displayed.");
				return;
			}
			Screen.openButtons[0] = clickable.Add_Button(Screen.openDrawables[0], function(drawable){
				Screen.Hide_Unit_List();
			});
			var drawable = Dialog_Display.Add_Drawable(Shape.Rectangle,"POPUP BOX",60,30,480,540,"#000",Canvas.Merge,.7);
			Screen.openDrawables.push(drawable);
			Screen.openButtons.push(clickable.Add_Button(drawable, function(drawable){}));
			drawable = Dialog_Display.Add_Drawable(Shape.Rectangle,"POPUP BOX EXIT",490,30,50,50,"#F00",Canvas.Merge,1);
			Screen.openDrawables.push(drawable);
			Screen.openButtons.push(clickable.Add_Button(drawable, function(drawable){
				Screen.Hide_Unit_List();
			}));
			var TITLE = new Text_Class("15pt Times New Roman", "#FFF");
			var CAPTIONGOOD = new Text_Class("8pt Times New Roman", "#FFF");
			var CAPTIONBAD = new Text_Class("8pt Times New Roman", "#F00");
			var list = Char_Data.SortByType;
			var disallowed = player.Disallowed();
			var locked_img = Images.Retrieve("Locked");
			for(var i=0;i<list.length;i++)
			{
				Screen.openDrawables.push(Dialog_Display.Add_Drawable(TITLE, "UL title"+i, i*170+100, 40, 200, 20, Char_Data.TypeToStr[i], Canvas.Merge));
				var overflow_wrap = 0;
				var curY;
				for(var j=0;j<list[i].length;j++)
				{
					if(j%7==0)
					{
						overflow_wrap+=70;
						curY = 10;
					}
					var not_available = false;
					for(var k=0;k<disallowed.length;k++)
					{
						if(list[i][j]==disallowed[k])
						{
							not_available = true;
							break;
						}
					}
					var unit = Char_Data.CHARS[list[i][j]];
					var cost = player.Calculate_Cost(list[i][j]);
					drawable = Dialog_Display.Add_Drawable(Shape.Rectangle, "UL back "+i+","+j, i*170+overflow_wrap, curY+=70, 68, 68, "#4B5320", Canvas.Merge, [list[i][j], building, cost]);
					Screen.openDrawables.push(drawable);
					if(not_available)
					{
						Screen.openDrawables.push(Dialog_Display.Add_Drawable(locked_img, "UL "+i+","+j, i*170+overflow_wrap+21, curY+11, 30, 45, list[i][j], Canvas.Merge, building));
					}
					else
					{
						Screen.openDrawables.push(Dialog_Display.Add_Drawable(unit.Sprite[0], "UL "+i+","+j, i*170+overflow_wrap+unit.X[0]+5, curY+unit.Y[0], null, null, null, Canvas.Merge));
						if(cost<=player.Cash_Money())
						{
							Screen.openButtons.push(clickable.Add_Button(drawable, function(drawable){
								var unit_index = drawable.Alpha.Get()[0];
								var building = drawable.Alpha.Get()[1];
								var cost = drawable.Alpha.Get()[2];
								Screen.Hide_Unit_List();
								if(player.Cash_Money()>cost)
								{
									if(game.Build(building, unit_index))
									{
										if(online)socket.emit('send build', building.Index, unit_index);
									}
								}
							}, "UL btn "+i+", "+j));
							Screen.openDrawables.push(Dialog_Display.Add_Drawable(CAPTIONGOOD, "$UL "+i+","+j, i*170+overflow_wrap+22, curY+58, 70, 12, "$"+cost, Canvas.Merge));
						}
						else Screen.openDrawables.push(Dialog_Display.Add_Drawable(CAPTIONBAD, "$UL "+i+","+j, i*170+overflow_wrap+22, curY+58, 70, 12, "$"+cost, Canvas.Merge));
					}
				}
			}
		},
		Hide_Unit_List:function()
		{
			self.inputXScale = 1;
			self.inputYScale = 1;
			var count = 0;
			for(var i in Screen.openDrawables)
			{
				count++;
				Dialog_Display.Delete_Drawable(Screen.openDrawables[i]);
			}
			Screen.openDrawables = [];
			count = 0;
			for(var i in Screen.openButtons)
			{
				count++;
				clickable.Delete_Button(Screen.openButtons[i]);
			}
			Screen.openButtons = [];
			Dialog_Display.Clear();
			self.Select_Tile();
		},
		Next_Player:function(player,callback)
		{
			var collectiveDrawable = Dialog_Display.Add_Drawable({
				back:Shape.Rectangle,
				icon:player.Icon,
				name:new Text_Class("25pt Times New Roman", "#000"),
				Draw:function(c, x, y, w, h, s){
					this.back.Draw(c,x,y,w,h,"#FF0");
					this.icon.Draw(c,x+20,y+10);
					this.name.Draw(c,x+100,y+40,w,h,player.Name);
				}
			}, null, 600, 200, 400, 200, null, Canvas.Clear, .7);
			Core.Slide_Drawable_X(collectiveDrawable, -500, 10, function(collectiveDrawable){
				setTimeout(function(){
					Core.Fade_Drawable(collectiveDrawable, 0, 5, function(collectiveDrawable){
						Dialog_Display.Delete_Drawable(collectiveDrawable);
						Dialog_Display.Clear();
						callback();
					});
				}, 700);
			});
		}
	};

	var open_menu = null;
	this.Display_Menu = function(menu)
	{
		if(open_menu)return;
		open_menu = menu;
		menu.Scale(clientWidth/Canvas.MaxWidth, clientHeight/Canvas.MaxHeight);
		self.Click = menu.Click;
		self.Release = menu.Release;
		self.Right_Click = menu.Right_Click;
		self.Mouse_Move = menu.Mouse_Move;
	};
	this.Close_Menu = function()
	{
		if(open_menu)open_menu.Close();
		else return;
		open_menu = null;
		self.Click = click_fnc;
		self.Release = release_fnc;
		self.Right_Click = r_click_fnc;
		self.Mouse_Move = m_move_fnc;
	};

	/** input */
	self.gameXScale = 1;
	self.gameYScale = 1;
	self.inputXScale = 1;
	self.inputYScale = 1;
	self.zoom = 1;
	var clickPos=-1;
	var mousedown = false;
	self.Set_Controls = function(handler){
		handler.onmousedown = function(e){
			// console.log("click at x = "+e.layerX+";y = "+e.layerY);
			if(!self.Click(e.layerX,e.layerY))return;
			if(e.target.tagName.match(/input|textarea|select/i)) {
				return;
			}
			scroller.doTouchStart([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
			mousedown = true;
			return false;
		};
		handler.onmouseup = function(e){
			self.Release(e.layerX,e.layerY);
			if(!mousedown)return;
			scroller.doTouchEnd(e.timeStamp);
			mousedown = false;
			return false;
		};
		handler.oncontextmenu = function(e){
			self.Right_Click(e.layerX,e.layerY);
			return false;
		};
		handler.onmousemove = function(e){
			self.Mouse_Move(e.layerX,e.layerY);
			if(!mousedown)return;
			scroller.doTouchMove([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
			mousedown = true;
			return false;
		};
		handler.addEventListener(navigator.userAgent.indexOf("Firefox") > -1 ? "DOMMouseScroll" :  "mousewheel", function(e){
			scroller.doMouseZoom(e.detail ?(e.detail * -120) : e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
		}, false);
	};
	self.Clickable = {
		Button_Class:function(drawable, response, name){
			this.Name = name;
			this.Overlap = function(x, y)
			{
				var X = drawable.X.Get();
				var Y = drawable.Y.Get();
				if(x>=X&&x<X+drawable.Width.Get())
				if(y>=Y&&y<Y+drawable.Height.Get())
					return true;
				return false;
			};
			this.Click = function()
			{
				response(drawable);
			};
			this.Drawable = drawable;
		},
		Buttons:[],
		Add_Button:function(drawable, response, name){
			var btn = new this.Button_Class(drawable, response, name);
			this.Buttons.unshift(btn);
			return btn;
		},
		Delete_Button:function(index){
			var pos = this.Buttons.indexOf(index);
			if(~pos)
			{
				this.Buttons.splice(pos, 1);
				return this.Buttons.length;
			}
			return false;
		},
		Click:function(x, y){
			for(var i in this.Buttons)
			{
				if(this.Buttons[i].Overlap(x, y))
				{
					this.Buttons[i].Click();
					return true;
				}
			}
			return false;
		}
	};
	var clickable = self.Clickable;

	var click_fnc = function(x, y){
		if(!allow_input)return;
		x/=self.inputXScale;
		y/=self.inputYScale;
		if(hovered_dir[0])
		{
			scroller.scrollBy(0,-TILESIZE,true);
			return false;
		}
		if(hovered_dir[1])
		{
			scroller.scrollBy(0,TILESIZE,true);
			return false;
		}
		if(hovered_dir[2])
		{
			scroller.scrollBy(-TILESIZE,0,true);
			return false;
		}
		if(hovered_dir[3])
		{
			scroller.scrollBy(TILESIZE,0,true);
			return false;
		}
		clickPos = [x,y];
		return true;
	};
	var release_fnc = function(x, y){
		if(!allow_input)return;
		x/=self.inputXScale;
		y/=self.inputYScale;
		if(~clickPos)
		if(Math.abs(x-clickPos[0])<10&&Math.abs(y-clickPos[1])<10)
		{
			if(self.Clickable.Click(x, y))return;
			self.Tiles.Click(Math.floor((x+scroller.getValues().left)/TILESIZE),Math.floor((y+scroller.getValues().top)/TILESIZE));
		}
	};
	var r_click_fnc = function(x, y){
		if(!allow_input)return;
		x/=self.inputXScale;
		y/=self.inputYScale;
	};
	var m_move_fnc = function(x, y){
		if(!allow_input)return;
		if(mousedown)return;
		x/=self.inputXScale;
		y/=self.inputYScale;
		var dir = overSliders(x,y);
		if(dir==0)
		{
			if(!hovered_dir[0])
			if(scroller.getValues().top!=0)
			{
				hovered_dir[0] = true;
				self.Slide_Up.Alpha.Set(1);
				return;
			}
		}
		else if(hovered_dir[0])
		{
			hovered_dir[0] = false;
			self.Slide_Up.Alpha.Set(0);
		}
		if(dir==1)
		{
			if(!hovered_dir[1])
			if(scroller.getValues().top!=scroller.getScrollMax().top)
			{
				hovered_dir[1] = true;
				self.Slide_Down.Alpha.Set(1);
				return;
			}
		}
		else if(hovered_dir[1])
		{
			hovered_dir[1] = false;
			self.Slide_Down.Alpha.Set(0);
		}
		if(dir==2)
		{
			if(!hovered_dir[2])
			if(scroller.getValues().left!=0)
			{
				hovered_dir[2] = true;
				self.Slide_Left.Alpha.Set(1);
				return;
			}
		}
		else if(hovered_dir[2])
		{
			hovered_dir[2] = false;
			self.Slide_Left.Alpha.Set(0);
		}
		if(dir==3)
		{
			if(!hovered_dir[3])
			if(scroller.getValues().left!=scroller.getScrollMax().left)
			{
				hovered_dir[3] = true;
				self.Slide_Right.Alpha.Set(1);
				return;
			}
		}
		else if(hovered_dir[3])
		{
			hovered_dir[3] = false;
			self.Slide_Right.Alpha.Set(0);
		}
		self.Hover_Tile(Math.floor((x+scroller.getValues().left)/TILESIZE),Math.floor((y+scroller.getValues().top)/TILESIZE));
	};
	self.Click = click_fnc;
	self.Release = release_fnc;
	self.Right_Click = r_click_fnc;
	self.Mouse_Move = m_move_fnc;

	var scroller = new Scroller(render,{
		locking:false,
		zooming:true
	});
	self.reflow = function(w, h){
		gameWidth = w-210;
		gameHeight = h-65;
		clientWidth = w;
		clientHeight = h;
		self.gameXScale = gameWidth/600;
		self.gameYScale = gameHeight/600;
		document.getElementById('avatarCanvas').style.left = gameWidth+"px";
		document.getElementById('statsCanvas').style.top = gameHeight+"px";
		document.getElementById('endTurn').style.left = (gameWidth+8)+"px";
		document.getElementById('endTurn').style.top = (gameHeight+7)+"px";
		Dialog_Display.Scale(self.gameXScale, self.gameYScale);
		HUD_Display.Scale(self.gameXScale, self.gameYScale);
		Avatar_Display.Scale(1, self.gameYScale);
		Stats_Display.Scale(self.gameXScale, 1);
		Status.Icon.Width.Set(self.gameXScale);
		if(open_menu){
			open_menu.Scale(clientWidth/Canvas.MaxWidth, clientHeight/Canvas.MaxHeight);
			return;
		}
		if(game==null)return;
		Avatar_Display.Redraw();
		Stats_Display.Redraw();
		scroller.setDimensions(gameWidth, gameHeight, game.Terrain_Map.Width*TILESIZE, game.Terrain_Map.Height*TILESIZE);
	};

	/** functions */
	self.Draw = function(canvas, x, y, w, h, color)
	{
		scroller.repaint();
	};
	self.Simple_Draw = function(canvas, x, y, w, h, color)
	{
		scroller.simple_repaint();
	};
	self.Sample_Draw = function(canvas, x, y, w, h, sampledGame)
	{
		Canvas.ScaleImageData(canvas, self.Get_Sample(sampledGame), x, y, w/fullWidth, h/fullHeight);
	};
	self.Get_Sample = function(sampledGame)
	{
		if(sampledGame==null)return;
		if(!sampledGame.valid)return;
		var fullWidth = sampledGame.Terrain_Map.Width*TILESIZE;
		var fullHeight = sampledGame.Terrain_Map.Height*TILESIZE;
		imageHolderCanvas.clearRect(0, 0, fullWidth, fullHeight);
		for(var i=0;i<sampledGame.Terrain_Map.Width;i++)
		for(var j=0;j<sampledGame.Terrain_Map.Height;j++){
			var at = sampledGame.Terrain_Map.At(i,j);
			if(at!=null){
				at.UI_Draw(imageHolderCanvas, i*TILESIZE, j*TILESIZE, 1);
				at = at.Building;
				if(at!=null)at.UI_Draw(imageHolderCanvas, i*TILESIZE, j*TILESIZE, 1);
			}
			at = sampledGame.Units_Map.At(i,j);
			if(at!=null&&at!=moving_unit)at.UI_Draw(imageHolderCanvas, i*TILESIZE, j*TILESIZE, 1);
		}
		return imageHolderCanvas.getImageData(0, 0, fullWidth, fullHeight);
	};
	self.Display_Unit_List = function(player, building)
	{
		Screen.Unit_List(player, building);
	};
	self.Update_Player_Info = function()
	{
		Avatar.Display(game.Active_Player());
	};

	self.Allow_Controls = function(input)
	{
		allow_input = input;
		if(input)Select_Animation.Stop = false;
		else Select_Animation.Stop = true;
	};
	self.Check_Controls = function()
	{
		return allow_input;
	};
	self.Start = function()
	{
		Animations.kill = false;
		document.getElementById("gameHelpers").style.display = "block";
		window.parent.openChat();
	};
	self.End_Game = function(players, turns)
	{
		Animations.kill = true;
		document.getElementById("gameHelpers").style.display = "none";
		Canvas.Stop_All();
		Canvas.Set_Game(null);
		socket.game_id = null;
		if(players!=null)
		{
			players = Core.Array.Organize.Descending(players, function(index){
				return index.data.turns_alive;
			}, function(index){
				return index.data.damage_delt;
			}, function(index){
				return index.data.units_killed;
			}, function(index){
				return index.data.money_spent;
			});
			self = this;
			Menu.PostGame.Set(game.Name, players, turns, function(){
				self.Close_Menu();
				game = null;
				mainMenu();
			});
			self.Display_Menu(Menu.PostGame);
			self.setGame(null);
		}
		if(online)socket.emit();
	};
	self.Request_Connections = function()
	{
		if(game==null)return [];
		return game.Request_Connections();
	};
	self.ReportLeft = function(leavingPlayer)
	{
		window.parent.refreshChatList();
	};

	function hl_map(map, display)
	{
		for(var i=0;i<map.length;i++)
		{
			game.Interface.Tiles.At(map[i][0], map[i][1]).Set(display);
		}
	}
	function highlight_path(path)
	{
		hl_map(path.Attackables(), 2);
		hl_map(path.All_Movable_Spaces(), 1);
	}
	function highlight_both(path)
	{
		hl_map(Core.Array.Overlapping_Positions(path.Attackables(), path.All_Movable_Spaces()), 3);
	}
	function unhighlight_path(path)
	{
		hl_map(path.Attackables(), 0);
		hl_map(path.All_Movable_Spaces(), 0);
	}

	var selected_tile = null;
	var hovered_tile = null;
	var selected_unit = null;
	var hl_path = null;
	var moving_unit = null;
	self.Set_Moving_Unit = function(value)
	{
		moving_unit = value;
	};
	self.Set_Next_Player = function(player, actable)
	{
		self.Allow_Controls(false);
		Avatar.Display();
		Screen.Next_Player(player,function(){
			self.Allow_Controls(true);
			player.Start_Turn(actable);
			Avatar.Display(player);
			self.Draw();
		});
	};
	self.Selected_Unit = function()
	{
		return selected_unit;
	};
	self.Selected_Tile = function()
	{
		return selected_tile;
	};
	self.Hover_Tile = function(x, y)
	{
		if(!allow_input)return;
		if(selected_unit!=null)
		{
			if(hovered_tile!=null)
			{
				if(x==hovered_tile[0]&&y==hovered_tile[1])return;
				selected_unit.Mover.Add(x,y);
				hovered_tile = [x,y];
			}
		}
		else
		{
			if(hovered_tile!=null)
			{
				if(x==hovered_tile[0]&&y==hovered_tile[1])return;
			}
			hovered_tile = [x,y];
		}
	};
	self.Select_Tile = function(x, y)
	{
		if(arguments.length<2)
		{
			if(hl_path!=null)
			{
				unhighlight_path(hl_path);
			}
			if(selected_unit!=null)
			{
				if(selected_unit.Mover!=null)
				{
					selected_unit.Mover.Hide();
				}
				selected_unit = null;
			}
			Status.Set();
			selected_tile = null;
			return;
		}
		if(!allow_input)return;
		if(selected_tile!=null)
		if(selected_tile[0]==x&&selected_tile[1]==y)
		{
			// status click cycle goes:
			// Unit -> Building -> Terrain -> Unit
			// skipping when there is no data
			if(Status.Display==1)
			{
				var display = game.Terrain_Map.At(x,y);
				if(display.Building!=null)
					Status.Set(display.Building);
				else Status.Set(display);
			}
			else if(Status.Display==2)
			{
				var display = game.Terrain_Map.At(x,y);
				if(display.Unit!=null)
					Status.Set(display.Unit);
				else if(display.Building!=null)
					Status.Set(display.Building);
				else Status.Set(display);
			}
			else if(Status.Display==3)
			{
				Status.Set(game.Terrain_Map.At(x,y));
			}
			if(selected_unit!=null)
			{
				if(hl_path!=null)
				{
					unhighlight_path(hl_path);
				}
				if(selected_unit.Mover!=null)
				{
					selected_unit.Mover.Hide();
				}
				selected_unit.Open_Actions();
			}
			return;
		}
		selected_tile = [x,y];
		if(hl_path!=null)
		{
			unhighlight_path(hl_path);
		}
		if(selected_unit!=null)
		{
			selected_unit.Mover.Hide();
			var path = selected_unit.Mover.Path();
			if(game.Move(selected_unit, x, y, path))
			{
				if(online)socket.emit('send move', selected_unit.Index, x, y, path);
			}
			else
			{
				selected_tile = null;
				self.Select_Tile();
				return;
			}
			selected_unit = null;
			return;
		}
		if(game.Units_Map.At(x,y)!=null)
		{
			selected_unit = game.Units_Map.At(x,y);
			Status.Set(selected_unit);
			selected_unit.Start_Path(x, y);
			hl_path = selected_unit.Current_Path();
			highlight_path(hl_path);
			if(selected_unit.Slow_Attack)
				highlight_both(hl_path);
			if(selected_unit.Idle||!selected_unit.Active)
			{
				selected_unit = null;
				return;
			}
			if(selected_unit.Player!=game.Active_Player()||selected_unit.Player!=game.Client_Player())
			{
				selected_unit = null;
				return;
			}
			selected_unit.Mover = new Move_Class(selected_unit,x,y,game.Terrain_Map,function(list){
				scroller.repaint();
				var canvas = Tile_Display.Context;
				canvas.fillStyle = "#FF0";
				canvas.globalAlpha = .1;
				for(var i=0;i<list.length;i++)
				{
					canvas.globalAlpha+=.1;
					canvas.fillRect(list[i][0]*TILESIZE-scroller.getValues().left,list[i][1]*TILESIZE-scroller.getValues().top,TILESIZE,TILESIZE);
				}
			});
		}
		else
		{
			var selected = game.Terrain_Map.At(x,y);
			if(selected.Building!=null)
			{
				selected = selected.Building;
				Status.Set(selected);
				if(!selected.Active)return;
				if(selected.Owner!=game.Active_Player()||selected.Owner!=game.Client_Player())
					return;
				selected.Act();
			}
			else Status.Set(selected);
		}
	};
};