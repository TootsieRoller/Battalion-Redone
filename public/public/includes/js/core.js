var backCanvas,charCanvas,moveUnitCanvas;
var dialogCanvas,tileCanvas;
var hudCanvas,avatarCanvas;
var statsCanvas,imageHolderCanvas;
var overlayCanvas,animationCanvas;
var menuCanvas,devCanvas;
var Background_Display,
	Character_Display,
	Tile_Display,
	HUD_Display,
	Avatar_Display,
	Stats_Display;
var FRAMERATEDISPLAY;
var lastLoop = new Date;

var	fps = 30,
	paused = false,
	currently_playing = false,
	gameInProgress = false,
	speedAdjustmentUp = false;
var tpf = 1000/fps;

var LOG = {
	list:[],
	indexer:0,
	display:function(){
		if(!devCanvas)return;
		devCanvas.clearRect(0, 0, Canvas.Width, Canvas.Height);
		var level = 0;
		for(var i in this.list)
		{
			this.list[i].txt.Draw(devCanvas, 10, (level++)*30, 600, 15, this.list[i].index+": "+this.list[i].msg);
		}
	},
	add:function(msg, color, time){
		if(time==null)time = 10000;
		if(this.list.length==0)
		{
			this.indexer = 0;
		}
		this.list.push({
			txt:new Text_Class("20pt Times New Roman", color),
			msg:msg,
			index:this.indexer
		});
		this.display();
		var i = this.indexer;
		setTimeout(function(){
			LOG.remove(i);
		},time);
		return this.indexer++;
	},
	clear:function(){
		this.list = [];
		this.display();
	},
	remove:function(index){
		for(var i in this.list)
		{
			if(this.list[i].index==index)
			{
				this.list.splice(i, 1);
			}
		}
		this.display();
	}
};

var Core = {
	Target_Class:function(input)
	{
		var Move_Class = function(input)
		{
			var x = input[0];
			var y = input[1];
			this.X = function()
			{
				return x;
			};
			this.Y = function()
			{
				return y;
			};
		};
		var map = [];
		for(var i=0;i<input.length;i++)
		{
			map[i] = new Move_Class(input[i]);
		}
		this.at = function(index)
		{
			return map[index];
		};
		this.length = function()
		{
			return map.length;
		};
	},
	Target:{
		Diamond:function(rad, start, core)
		{
			var so_far = [];
			if(start==null)
			{
				start = 1;
				so_far[0] = [0,0];
			}
			else if(core||core==null)
				so_far[0] = [0,0];
			for(var i=start;i<=rad;i++)
			{
				so_far.push([i,0]);
				so_far.push([-i,0]);
				so_far.push([0,i]);
				so_far.push([0,-i]);
				for(var j=1;j<i;j++)
				{
					so_far.push([i-j,j]);
					so_far.push([j-i,j]);
					so_far.push([i-j,-j]);
					so_far.push([j-i,-j]);
				}
			}
			return so_far;
		},
		Circle:function(rad, offset, core)
		{
			var so_far = [];
			if(offset==null)
			{
				offset = 0;
				so_far[0] = [0,0];
			}
			else if(core||core==null)
				so_far[0] = [0,0];
			// for(var i=offset+1;i<=rad;i++)
			// for(var j=0;j<i;j++)
			// {
				// so_far.push([i-j,j];
				// so_far.push([j-i,j];
				// so_far.push([j,i-j];
				// so_far.push([j,j-i];
			// }
			return so_far;
		},
		Square:function(len, offset, core)
		{
			var so_far = [];
			if(offset==null)
			{
				offset = 0;
				so_far[0] = [0,0];
			}
			else if(core||core==null)
				so_far[0] = [0,0];
			for(var i=offset+1;i<=len;i++)
			{
				so_far.push([i,0]);
				so_far.push([-i,0]);
				for(var j=1;j<=len;j++)
				{
					so_far.push([i,j]);
					so_far.push([-i,j]);
					so_far.push([i,-j]);
					so_far.push([-i,-j]);
				}
				so_far.push([0,i]);
				so_far.push([0,-i]);
				for(j=1;j<=offset;j++)
				{
					so_far.push([j,i]);
					so_far.push([j,-i]);
					so_far.push([-j,i]);
					so_far.push([-j,-i]);
				}
			}
			return so_far;
		},
		X:function(len, offset, core)
		{
			var so_far = [];
			if(offset==null)
			{
				offset = 0;
				so_far[0] = [0,0];
			}
			else if(core||core==null)
				so_far[0] = [0,0];
			for(var i=offset+1;i<=len;i++)
			{
				so_far.push([i,i]);
				so_far.push([-i,i]);
				so_far.push([i,-i]);
				so_far.push([-i,-i]);
			}
			return so_far;
		},
		Plus:function(len, offset, core)
		{
			var so_far = [];
			if(offset==null)
			{
				offset = 0;
				so_far[0] = [0,0];
			}
			else if(core||core==null)
				so_far[0] = [0,0];
			for(var i=offset+1;i<=len;i++)
			{
				so_far.push([0,i]);
				so_far.push([0,-i]);
				so_far.push([i,0]);
				so_far.push([-i,0]);
			}
			return so_far;
		},
		T:function(len, width, offset, core)
		{
			var so_far = [];
			if(offset==null)
			{
				offset = 0;
				so_far[0] = [0,0];
			}
			else if(core||core==null)
				so_far[0] = [0,0];
			for(var i=offset+1;i<=len;i++)
			{
				so_far.push([0,i]);
				so_far.push([0,-i]);
				so_far.push([i,0]);
				so_far.push([-i,0]);
			}
			for(var i=1;i<=width;i++)
			{
				so_far.push([len,i]);
				so_far.push([len,-i]);
				so_far.push([-len,i]);
				so_far.push([-len,-i]);
				so_far.push([i,len]);
				so_far.push([-i,len]);
				so_far.push([i,-len]);
				so_far.push([-i,-len]);
			}
			return so_far;
		}
	},
	Smooth_Changer:function(drawable, value, change, i, callback)
	{
		if(i<=0)
		{
			if(callback!=null)callback(drawable);
			return;
		}
		value.Set(value.Get()+change);
		setTimeout(function(){Core.Smooth_Changer(drawable,value,change,i-1,callback);},tpf);
	},
	Fade_Drawable:function(drawable, end_val, frames, callback)
	{
		var change = (end_val-drawable.Alpha.Get())/frames;
		Core.Smooth_Changer(drawable,drawable.Alpha,change,frames,callback);
	},
	Grow_Drawable:function(drawable, end_width, end_height, frames, callback)
	{
		var change = (end_width-drawable.Width.Get())/frames;
		Core.Smooth_Changer(drawable,drawable.Width,change,frames,callback);
		change = (end_height-drawable.Height.Get())/frames;
		Core.Smooth_Changer(drawable,drawable.Height,change,frames,function(){});
	},
	Slide_Drawable_X:function(drawable, x_off, frames, callback)
	{
		var change = x_off/frames;
		Core.Smooth_Changer(drawable,drawable.X,change,frames,callback);
	},
	Slide_Drawable_Y:function(drawable, y_off, frames, callback)
	{
		var change = y_off/frames;
		Core.Smooth_Changer(drawable,drawable.Y,change,frames,callback);
	},
	Slide_Drawable:function(drawable, x_off, y_off, frames, callback)
	{
		var change = x_off/frames;
		Core.Smooth_Changer(drawable,drawable.X,change,frames,callback);
		change = y_off/frames;
		Core.Smooth_Changer(drawable,drawable.Y,change,frames,function(){});
	},
	Explode:function(selectable)
	{
		var d = HUD_Display.Add_Drawable(Images.Retrieve("Explosion"),selectable.SELECTABLE+"death"+selectable.X+","+selectable.Y,selectable.X*TILESIZE-INTERFACE.X_Offset(),(selectable.Y-.5)*TILESIZE-INTERFACE.Y_Offset(),TILESIZE,TILESIZE,null,Canvas.Clear,1,0);
		if(d!=null)
		Core.Fade_Drawable(d, 0, 10, function(){
			HUD_Display.Delete_Drawable(d);
		});
	},
	Array:{
		Clone:function(arr)
		{
			var temp = [];
			for(var i in arr)
			{
				temp[i] = arr[i];
			}
			return temp;
		},
		Equals:function(arr1, arr2)
		{
			if(arr1.length!=arr2.length)return false;
			for(var i=0;i<arr1.length;i++)
			{
				if(arr1[i]!=arr2[i])return false;
			}
			return true;
		},
		Equal_Position:function(pos1, pos2)
		{
			if(pos1[0]==pos2[0])
			if(pos1[1]==pos2[1])
				return true;
			return false;
		},
		Similar_Nodes:function(arr1, arr2)
		{
			var both = [];
			for(var i=0;i<arr1.length;i++)
			for(var j=0;j<arr2.length;j++)
			{
				if(Core.Array.Equals(arr1[i],arr2[j]))
				{
					both.push(arr1[i]);
				}
			}
			return both;
		},
		Overlapping_Positions:function(arr1, arr2)
		{
			var both = [];
			for(var i=0;i<arr1.length;i++)
			for(var j=0;j<arr2.length;j++)
			{
				if(Core.Array.Equal_Position(arr1[i],arr2[j]))
				{
					both.push(arr1[i]);
				}
			}
			return both;
		},
		Remove_Array_Index:function(arr, index)
		{
			var found = false;
			var temp_arr = [];
			for(var i in arr)
			{
				if(index==i)
				{
					found = true;
					delete arr[i];
					continue;
				}
				temp_arr[i] = arr[i];
			}
			if(!found)
			{
				console.error("Could not find "+index+" to delete.");
				return false;
			}
			arr = temp_arr;
			return true;
		},
		Organize:{
			Ascending:function(input)
			{
				var arr = Core.Array.Clone(input);
				if(arguments.length==1)
				{
					for(var step=0;step<arr.length-1;++step)
					for(var i=0;i<arr.length-step-1;++i)
					{
						if(arr[i]>arr[i+1])
						{
							var temp = arr[i];
							arr[i] = arr[i+1];
							arr[i+1] = temp;
						}
					}
					return;
				}
				for(var step=0;step<arr.length-1;++step)
				for(var i=0;i<arr.length-step-1;++i)
				{
					for(var order_by=1;order_by<arguments.length;order_by++)
					{
						var left = arguments[order_by](arr[i]);
						var right = arguments[order_by](arr[i+1]);
						if(left==right)continue;
						if(left>right)
						{
							var temp = arr[i];
							arr[i] = arr[i+1];
							arr[i+1] = temp;
						}
						break;
					}
				}
				return arr;
			},
			Descending:function(input)
			{
				var arr = Core.Array.Clone(input);
				if(arguments.length==1)
				{
					for(var step=0;step<arr.length-1;++step)
					for(var i=0;i<arr.length-step-1;++i)
					{
						if(arr[i]<arr[i+1])
						{
							var temp = arr[i];
							arr[i] = arr[i+1];
							arr[i+1] = temp;
						}
					}
					return;
				}
				for(var step=0;step<arr.length-1;++step)
				for(var i=0;i<arr.length-step-1;++i)
				{
					for(var order_by=1;order_by<arguments.length;order_by++)
					{
						var left = arguments[order_by](arr[i]);
						var right = arguments[order_by](arr[i+1]);
						if(left==right)continue;
						if(left<right)
						{
							var temp = arr[i];
							arr[i] = arr[i+1];
							arr[i+1] = temp;
						}
						break;
					}
				}
				return arr;
			},
			Reverse:function(arr)
			{
				var temp = [];
				for(var i=0;i<arr;i++)
				{
					temp[i] = arr[arr.length-i-1];
				}
				return temp;
			}
		}
	}
};

var online = false;
var socket;
window.onload = function(){
	if(window.parent)socket = window.parent.socket;
	if(socket)online = true;

	document.getElementById("endTurn").onchange = function(e){
		console.error("end turn button state changed",e);
	};
	
	// game setup
	FRAMERATEDISPLAY = window.parent.document.getElementById("frames");
	FRAMERATEDISPLAY.value = 0;
	FRAMERATEDISPLAY.update = 0;
	Canvas.Add_Ticker(function(){
		var thisLoop = new Date;
		var _fps = Math.round(1000/(thisLoop-lastLoop));
		lastLoop = thisLoop;
		if(Math.abs(FRAMERATEDISPLAY.value-_fps)>5)FRAMERATEDISPLAY.update+=5;
		if(++FRAMERATEDISPLAY.update>=30)
		{
			FRAMERATEDISPLAY.update = 0;
			FRAMERATEDISPLAY.innerHTML= ("0"+_fps.toString()).slice(-2) + "/" + fps.toString() + " FPS";
			FRAMERATEDISPLAY.value = _fps;
			if(_fps<10)
				FRAMERATEDISPLAY.style.color = "#f00";
			else if(_fps<20)
				FRAMERATEDISPLAY.style.color = "#909310";
			else
				FRAMERATEDISPLAY.style.color = "#12790b";
		}
	});

	var starters = getElementsByClass("btnLevelIcon","img");
	for(var i=0;i<starters.length;i++){
		starters[i].onclick = function(){
			new_game(this.id.split("+"), prompt("Name the game"));
		};
	}
	imageHolderCanvas = initiateCanvas("imageHolder");

	backCanvas = initiateCanvas("backgroundCanvas");
	Background_Display = Canvas.Create_Canvas(backCanvas, "back");

	charCanvas = initiateCanvas("charCanvas");
	// Character_Display = Canvas.Create_Canvas(charCanvas, "char");
	// Character_Display.Additonal_Display(function(canvas, Game){
		// var amount = Game.Unit_Amount();
		// for(var i=0;i<amount;i++){
			// Game.Get_Unit(i).Breath();
		// }
	// });
	
	moveUnitCanvas = initiateCanvas("moveUnitCanvas");
	buildingCanvas = initiateCanvas("buildingCanvas");

	tileCanvas = initiateCanvas("tileCanvas");
	Tile_Display = Canvas.Create_Canvas(tileCanvas, "tile");

	animationCanvas = initiateCanvas("animationCanvas");
	overlayCanvas = initiateCanvas("overlayCanvas");
	menuCanvas = initiateCanvas("menuCanvas");
	devCanvas = initiateCanvas("devCanvas");

	hudCanvas = initiateCanvas("hudCanvas");
	HUD_Display = Canvas.Create_Canvas(hudCanvas, "hud");

	avatarCanvas = initiateCanvas("avatarCanvas");
	Avatar_Display = Canvas.Create_Canvas(avatarCanvas, "avatar");
	Avatar_Display.Background.State.Set("#88F");
	Avatar_Display.Background.Alpha.Set(1);

	statsCanvas = initiateCanvas("statsCanvas");
	Stats_Display = Canvas.Create_Canvas(statsCanvas, "stat");
	Stats_Display.Background.State.Set("#F88");
	Stats_Display.Background.Alpha.Set(1);

	dialogCanvas = initiateCanvas("dialogCanvas");
	Dialog_Display = Canvas.Create_Canvas(dialogCanvas, "dialog");
	// Dialog = new Dialog_Class(dialogCanvas);

	Canvas.Next_Tick();
	mainMenu();

	document.getElementById('overlay').style.display = 'none';
};

function tester()
{
var obj = {"id":0,"map":1,"connected":[0,null],"players":[{"name":"TootsieRoller","color":1,"data":{"damage_delt":101,"damage_received":0,"units_gained":8,"units_killed":0,"money_gained":240,"money_spent":0,"turns_alive":1,"buildings_captured":6,"buildings_lost":0},"units":[{"index":5,"x":0,"y":6,"health":40},{"index":6,"x":0,"y":7,"health":70},{"index":7,"x":0,"y":8,"health":70},{"index":6,"x":0,"y":9,"health":70},{"index":7,"x":4,"y":7,"health":70},{"index":11,"x":3,"y":6,"health":140},{"index":13,"x":5,"y":1,"health":70},{"index":13,"x":5,"y":3,"health":70}],"buildings":[{"index":6,"x":0,"y":6,"stature":20,"resources":880},{"index":6,"x":2,"y":7,"stature":20,"resources":880},{"index":5,"x":1,"y":3,"stature":20,"resources":0},{"index":1,"x":3,"y":5,"stature":30,"resources":0},{"index":3,"x":4,"y":0,"stature":20,"resources":0},{"index":2,"x":5,"y":8,"stature":20,"resources":0}]},{"name":"Player 2","color":2,"data":{"damage_delt":0,"damage_received":101,"units_gained":8,"units_killed":0,"money_gained":0,"money_spent":0,"turns_alive":0,"buildings_captured":6,"buildings_lost":0},"units":[{"index":5,"x":7,"y":3,"health":40},{"index":6,"x":8,"y":4,"health":70},{"index":7,"x":9,"y":3,"health":70},{"index":6,"x":9,"y":2,"health":70},{"index":7,"x":7,"y":2,"health":70},{"index":11,"x":6,"y":3,"health":140},{"index":13,"x":4,"y":6,"health":7},{"index":13,"x":4,"y":8,"health":32}],"buildings":[{"index":6,"x":7,"y":2,"stature":20,"resources":1000},{"index":6,"x":9,"y":3,"stature":20,"resources":1000},{"index":5,"x":8,"y":6,"stature":20,"resources":0},{"index":1,"x":6,"y":4,"stature":30,"resources":0},{"index":3,"x":5,"y":9,"stature":20,"resources":0},{"index":2,"x":4,"y":1,"stature":20,"resources":0}]}]};
var s = JSON.stringify(obj);
var g = new Engine_Class(s);
INTERFACE.setGame(g);
INTERFACE.Draw();
}

var INTERFACE;
function init_map(map, players, game_id){
	document.getElementById("mainMenu").style.display="none";
	var Game = new Engine_Class(Levels.Terrain(map));
	Game.id = game_id;
	Game.Map = map;
	var UI = new Interface_Class(Levels.Rows(map), Levels.Cols(map), Game);
	Levels.Run(Game, map);
	UI.Set_Controls(document.getElementById("inputHandler"));
	UI.Allow_Controls(true);
	Canvas.Set_Game(Game);
	Canvas.Redraw();
	Canvas.Start_All();
	document.getElementById("endTurn").onclick = function(){
		if(Game.Client_Player().Active)
		{
			Game.Client_Player().End_Turn();
			if(online)socket.emit('next player', Game.id);
		}
	};
	window.parent.document.getElementById("menuButton").onclick = function(){
		if(!confirm("Are you sure?\nYou will lose all current progress"))
			return;
		if(online)socket.emit('leave');
		Game.End_Game();
	};
	gameInProgress = true;
	if(INTERFACE!=null){
		INTERFACE.Close_Menu();
		INTERFACE = null;
	}
	INTERFACE = UI;
	Menu.PreGame.Length(Levels.Players(map));
	Menu.PreGame.Title.State.Set(Levels.Names(map));
	if(players!=null)
	{
		var set = false;
		for(var i in players.c)
		{
			if(players.c[i]==null)
			{
				if(!set)
				{
					Game.Set_Player(i, socket.index, socket.username, true);
					Menu.PreGame.Set(i, socket.username);
					set = true;
				}
				continue;
			}
			Game.Set_Player(i, players.c[i], players.n[i], false);
			Menu.PreGame.Set(i, players.n[i]);
		}
	}
	else
	{
		Game.Set_Player(0, socket.index, socket.username, true);
		Menu.PreGame.Set(0, socket.username);
		Menu.PreGame.AddStarter();
	}
	UI.Display_Menu(Menu.PreGame);
}
function new_game(level, name){
	level = parseInt(level);
	if(!Levels.Unlocked(level))
	{
		alert("Level "+(level+1)+" is locked.");
		return;
	}
	init_map(level);
	if(online){
		socket.emit("open", level, (name?name:"UNNAMMED"), Levels.Players(level));
		window.parent.lobby.contentWindow.add_game(name,level,-1,true);
		window.parent.lobby.contentWindow._openGames.add();
	}
}

function mainMenu(){
	currently_playing = false;
	Canvas.Stop_All();
	Animations.Remove_All();
	Canvas.Run_Next_Tick(function(){
		for(var i in Canvas.Contexts)
		{
			var ctx = Canvas.Contexts[i];
			ctx.clearRect(0, 0, ctx.width, ctx.height);
		}
		backCanvas.fillStyle = "#77a8bc";
		backCanvas.fillRect(0,0,Canvas.Width,Canvas.Height);
	});

	document.getElementById("endTurn").style.display = "none";
	document.getElementById("mainMenu").style.display="block";
	window.parent.document.getElementById("menuButton").onclick = function(){
		mainMenu();
	};
	window.parent.openLobby();
	var elements = getElementsByClass("btn_super","div");
	for(var i=0;i<elements.length;i++)
	{
		elements[i].style.display = "block";
	}
	elements = getElementsByClass("sub_menu","div");
	for(var i=0;i<elements.length;i++)
	{
		elements[i].style.display = "none";
	}
}

function displaySpeed(e){
	if(!speedAdjustmentUp){
		speedAdjustmentUp = true;
		displayNext(e);
	}
	else{
		speedAdjustmentUp = false;
		do{
			e = e.nextSibling;
		}while(e&&e.nodeType!=1);
		e.style.display = "none";
	}
}

function getElementsByClass(searchClass,tag,node){
	if(tag==null)
		tag = "*";
	if(node==null)
		node = document;
	var classElements = new Array();
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
	for(i=0,j=0;i<elsLen;i++){
		if(pattern.test(els[i].className)){
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
}

function sfxToggle(button){
	// if(sfx){
		// button.innerHTML = "SFX Off";
		// sfx = false;
	// }
	// else{
		// button.innerHTML = "SFX On";
		// sfx = true;
	// }
}

function displayNext(id_to_show){
	var elements = getElementsByClass("btn_super","div");
	for(var i=0;i<elements.length;i++)
	{
		elements[i].style.display = "none";
	}
	id_to_show = id_to_show.substring(id_to_show.indexOf("->")+2,id_to_show.length);
	document.getElementById(id_to_show).style.display = "block";
}
function backNav(x){
	x.style.display = "none";
	var elements = getElementsByClass("btn_super","div");
	for(var i=0;i<elements.length;i++)
	{
		elements[i].style.display = "block";
	}
}