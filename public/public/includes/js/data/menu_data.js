/*** Level Select Screen ***/
Menu.LevelSelect = new Menu.Menu_Class("#77a8bc");
with(Menu.LevelSelect){
	Add(new Canvas.Drawable(new Text_Class("32pt Impact", "#A349A4"), null, 30, 10, 600, 45, "Level Select"));
	Add(new Canvas.Drawable(new Text_Class("28pt Impact", "#642D64"), null, 50, 65, 600, 45, "Free maps"));
	Add(new Canvas.Drawable(new Text_Class("28pt Impact", "#642D64"), null, 50, 300, 600, 45, "Premium maps"));
	Add(new Canvas.Drawable(new Text_Class("20pt Impact", "#000"), null, 30, 360, 600, 45, "None quite yet..."));
	Add(new Canvas.Drawable(Shape.Rectangle, null, 20, 280, 230, 3, "#000000", null, .6));
	Add(new Canvas.Drawable({ // back btn
		Draw:function(c, x, y, w, h, s){
			Shape.Rectangle.Draw(c,x,y,310,75,"#FFE39D");
			new Text_Class("36pt Arial", "#AD4329").Draw(c,x+90,y+20,260,55,"BACK");
			new Text_Class("36pt Arial", "#F7B4A5").Draw(c,x+87,y+17,260,55,"BACK");
		}
	}, null, 430, 10, 310, 75), function(){
		mainMenu();
	}, {
		Draw:function(c, x, y, w, h, s){
			Shape.Rectangle.Draw(c,x,y,310,75,"#FFD19D");
			new Text_Class("36pt Arial", "#AD4329").Draw(c,x+90,y+20,260,55,"BACK");
			new Text_Class("36pt Arial", "#F7B4A5").Draw(c,x+87,y+17,260,55,"BACK");
		}
	});

	var caption = new Text_Class("15pt Impact", "#642D64");
	for(var i=0;i<Levels.Length();i++){
		Add(new Canvas.Drawable({ // level display
			Draw:function(c,x,y,w,h,s){
				Levels.Terrain.Draw(c,x,y,w,h,s);
				caption.Draw(c,x+5,y+153,w,h,Levels.Names(s));
			}
		}, null, 30+160*i, 100, 150, 150, i), function(level){
			var gameName = "";
			while(gameName=="")gameName = prompt("Name the game ");
			if(!gameName)return;
			new_game(level, gameName);
		}, new Canvas.Drawable(Shape.Rectangle, null, 30+160*i, 100, 150, 150, "#666607", null, .5));
	}
}


/*** Before Game Lobby Menu ***/
Menu.PreGame = new Menu.Menu_Class("#77a8bc");
Menu.PreGame.Slots = [];
Menu.PreGame.Icon = {
	Image:null,
	Draw:function(canvas, x, y, w, h){
		if(this.Image==null)return;
		Canvas.ScaleImageData(canvas, this.Image, x*Menu.PreGame.xScale, y*Menu.PreGame.yScale, w/this.Image.width*Menu.PreGame.xScale, h/this.Image.height*Menu.PreGame.yScale);
	}
};
Menu.PreGame.Set = function(index, value){
	if(index>=this.Slots.length)return;
	this.Slots[index].State.Set(value);
};
Menu.PreGame.Map = function(map){
	var playersAmount = Levels.Players(map);
	this.Erase();
	this.Add(new Canvas.Drawable(new Text_Class("45pt Impact", "#FFD19D"), null, 50, 70, 600, 45, Levels.Names(map)));
	this.Add(new Canvas.Drawable({ // back btn
		Draw:function(c, x, y, w, h, s){
			Shape.Rectangle.Draw(c,x,y,85,35,"#FFE39D");
			new Text_Class("15pt Arial", "#AD4329").Draw(c,x+15,y+10,60,25,"BACK");
			new Text_Class("15pt Arial", "#F7B4A5").Draw(c,x+13,y+8,60,25,"BACK");
		}
	}, null, 80, 10, 85, 35), function(){
		if(online)socket.emit('leave');
		mainMenu();
	}, {
		Draw:function(c, x, y, w, h, s){
			Shape.Rectangle.Draw(c,x,y,85,35,"#FFD19D");
			new Text_Class("15pt Arial", "#AD4329").Draw(c,x+15,y+10,60,25,"BACK");
			new Text_Class("15pt Arial", "#F7B4A5").Draw(c,x+13,y+8,60,25,"BACK");
		}
	});

	var NameTxt = new Text_Class("40pt Calibri", "#000");
	this.Slots = [];
	this.Add(new Canvas.Drawable(Shape.Rectangle, null, 20, 150, 400, (playersAmount*52)-2, "#F2F3FF"));
	for(var i=0;i<playersAmount;i++){
		this.Slots[i] = new Canvas.Drawable(NameTxt, null, 40, 150+52*i, 400, 48, "");
		this.Slots[i].Index = Menu.PreGame;
		this.Add(this.Slots[i]);
		if(i!=0)this.Add(new Canvas.Drawable(Shape.Rectangle, null, 35, 148+52*i, 370, 2, "#000"));
	}
	this.Icon.Image = INTERFACE.Get_Sample(new Engine_Class(map));
	this.Add(new Canvas.Drawable(this.Icon, null, 450, 150, 300, 300, map));
};
Menu.PreGame.AddStarter = function(){
	this.Add(new Canvas.Drawable({ // default display
		Draw:function(c, x, y, w, h, s){
			Shape.Rectangle.Draw(c,x,y,w,h,"#A77CC3");
			new Text_Class("45pt Impact", "#7ECC9E").Draw(c,x+25,y+30,w,h,function(){
				if(INTERFACE.Game.Full())
					return " Start Game";
				return "Start with AI";
			});
		}
	}, null, 400, 40, 350, 100), function(){ // click function
		INTERFACE.Game.Host_Game(socket.game_id);
	}, { // hovered display
		Draw:function(c, x, y, w, h, s){
			Shape.Rectangle.Draw(c,x,y,w,h,"#63FF97");
			new Text_Class("45pt Impact", "#848DC6").Draw(c,x+25,y+30,w,h,function(){
				if(INTERFACE.Game.Full())
					return " Start Game";
				return "Start with AI";
			});
		}
	});
};


/*** End Game Results Menu ***/
Menu.PostGame = new Menu.Menu_Class("#FFEFD8");
Menu.PostGame.Set = function(map, players, turn, close_func){
	with(Menu.PostGame){
		Erase();
		Add(new Canvas.Drawable(new Text_Class("15pt Impact", "#C48752"), null, 300, 90, 70, 30, (turn+1)+" days"));
		Add(new Canvas.Drawable(new Text_Class("45pt Impact", "#C48752"), null, 81, 38, 600, 45, map));

		var caption_txt = new Text_Class("20pt Arial", "#000");
		Add(new Canvas.Drawable(caption_txt, null, 160, 120, 70, 30, "name"));
		Add(new Canvas.Drawable(caption_txt, null, 333, 120, 70, 30, "units"));
		Add(new Canvas.Drawable(caption_txt, null, 420, 120, 70, 30, "funds"));
		Add(new Canvas.Drawable(caption_txt, null, 500, 120, 70, 30, "turns"));
		Add(new Canvas.Drawable(caption_txt, null, 580, 120, 160, 30, "damage dealt"));
		Add(new Canvas.Drawable(Shape.Box, null, 60, 143, 700, 399, "#000"));
		for(var i=0;i<players.length;i++){
			var cur = players[i];
			Add(new Canvas.Drawable(caption_txt, null, 22, 170+i*60, 54, 30, ""+(i+1)));
			Add(new Canvas.Drawable(Shape.Box, null, 65, 155+i*60, 690, 50, "#000"));
			Add(new Canvas.Drawable(cur.Icon, null, 80, 160+i*60, 40, 40));
			Add(new Canvas.Drawable(caption_txt, null, 148, 170+i*60, 170, 30, cur.Name));
			Add(new Canvas.Drawable(Shape.Rectangle, null, 320, 160+i*60, 2, 40, "#000"));
			Add(new Canvas.Drawable(caption_txt, null, 333, 170+i*60, 54, 30, ""+cur.data.units_gained));
			Add(new Canvas.Drawable(Shape.Rectangle, null, 405, 160+i*60, 2, 40, "#000"));
			Add(new Canvas.Drawable(caption_txt, null, 419, 170+i*60, 54, 30, ""+cur.data.money_gained));
			Add(new Canvas.Drawable(Shape.Rectangle, null, 490, 160+i*60, 2, 40, "#000"));
			Add(new Canvas.Drawable(caption_txt, null, 495, 170+i*60, 54, 30, ""+cur.data.turns_alive));
			Add(new Canvas.Drawable(Shape.Rectangle, null, 565, 160+i*60, 2, 40, "#000"));
			Add(new Canvas.Drawable(caption_txt, null, 575, 170+i*60, 54, 30, ""+cur.data.damage_delt));
		}

		Add(new Canvas.Drawable({ // default display
			Draw:function(c, x, y, w, h, s){
				Shape.Rectangle.Draw(c,x,y,350,75,"#FFE39D");
				new Text_Class("36pt Arial", "#AD4329").Draw(c,x+90,y+20,260,55,"FINISH");
				new Text_Class("36pt Arial", "#F7B4A5").Draw(c,x+87,y+17,260,55,"FINISH");
			}
		}, null, 430, 25, 350, 75), close_func, { // hovered display
			Draw:function(c, x, y, w, h, s){
				Shape.Rectangle.Draw(c,x,y,350,75,"#FFD19D");
				new Text_Class("36pt Arial", "#AD4329").Draw(c,x+90,y+20,260,55,"FINISH");
				new Text_Class("36pt Arial", "#F7B4A5").Draw(c,x+87,y+17,260,55,"FINISH");
			}
		});
	}
}