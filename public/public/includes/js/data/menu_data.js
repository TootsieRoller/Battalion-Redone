//drawable(src, changed, x, y, w, h, sta, sty, alp, ang, emp)
// Add(drawable, click_function, hover_drawable, right_click_function)

/*** Pre Game Lobby Menu ***/
Menu.PreGame = new Menu.Menu_Class();
Menu.PreGame.Title = new Canvas.Drawable(new Text_Class("45pt Impact", "#00C7FF"), Menu.Setter, 50, 70, 600, 45, "UNDEFINED");

Menu.PreGame.Slots = [];
Menu.PreGame.Set = function(index, value)
{
	if(index>=this.Slots.length)return;
	this.Slots[index].State.Set(value);
};
Menu.PreGame.Length = function(amount)
{
	this.Erase();
	this.Add(this.Title);
	this.Add(new Canvas.Drawable(Shape.Rectangle, null, 20, 150, 600, (amount*52)-2, "#F2F3FF"));

	var NameTxt = new Text_Class("40pt Calibri", "#000");
	this.Slots = [];
	for(var i=0;i<amount;i++)
	{
		this.Slots[i] = new Canvas.Drawable(NameTxt, Menu.Setter, 40, 150+52*i, 400, 48, "");
		this.Slots[i].Index = Menu.PreGame;
		this.Add(this.Slots[i]);
		if(i!=0)this.Add(new Canvas.Drawable(Shape.Rectangle, null, 35, 148+52*i, 570, 2, "#000"));
	}
};
Menu.PreGame.AddStarter = function()
{
	this.Add(new Canvas.Drawable({ // default display
		Back:new Canvas.Drawable(Shape.Rectangle, null, 0, 0, 350, 100, "#9860FF"),
		Txt:new Canvas.Drawable(new Text_Class("45pt Impact", "#63FF97"), null, 25, 30, 350, 45, function(){
			if(INTERFACE.Game.Full())
				return " Start Game";
			return "Start with AI";
		}),
		Draw:function(c, x, y, w, h, s){
			this.Back.Draw(c,x,y,w,h,s);
			this.Txt.Draw(c,x,y,w,h,s);
		}
	}, null, 400, 400, 350, 100), function(){ // click function
		document.getElementById("endTurn").style.display = "block";
		INTERFACE.Game.Host_Game(socket.game_id);
	}, { // hovered display
		Back:new Canvas.Drawable(Shape.Rectangle, null, 0, 0, 350, 100, "#63FF97"),
		Txt:new Canvas.Drawable(new Text_Class("45pt Impact", "#5D00FF"), null, 25, 30, 350, 45, function(){
			if(INTERFACE.Game.Full())
				return " Start Game";
			return "Start with AI";
		}),
		Draw:function(c, x, y, w, h, s){
			this.Back.Draw(c,x,y,w,h,s);
			this.Txt.Draw(c,x,y,w,h,s);
		}
	});
};

with(Menu.PreGame)
{
	Background = "#FFF696";
	Title.Index = Menu.PreGame;
}


/*** End Game Results Menu ***/
Menu.PostGame = new Menu.Menu_Class();
Menu.PostGame.Title = new Canvas.Drawable(new Text_Class("45pt Impact", "#C48752"), Menu.Setter, 81, 38, 600, 45, "UNDEFINED");
Menu.PostGame.Background = "#FFEFD8";
Menu.PostGame.Title.Index = Menu.PostGame;

Menu.PostGame.Set = function(map, players, turn, close_func)
{
	with(Menu.PostGame)
	{
		Erase();
		Title.State.Set(map);
		Add(new Canvas.Drawable(new Text_Class("8pt Impact", "#C48752"), null, 300, 90, 70, 30, "turn "+(turn+1)));
		Add(Title);

		var caption_txt = new Text_Class("16pt Arial", "#000");
		Add(new Canvas.Drawable(caption_txt, null, 160, 125, 70, 30, "name"));
		Add(new Canvas.Drawable(caption_txt, null, 333, 125, 70, 30, "units"));
		Add(new Canvas.Drawable(caption_txt, null, 420, 125, 70, 30, "funds"));
		Add(new Canvas.Drawable(caption_txt, null, 500, 125, 70, 30, "turns"));
		Add(new Canvas.Drawable(caption_txt, null, 580, 125, 120, 30, "damage"));
		Add(new Canvas.Drawable(Shape.Box, null, 60, 143, 700, 399, "#000"));
		for(var i=0;i<players.length;i++)
		{
			var cur = players[i];
			Add(new Canvas.Drawable(caption_txt, null, 22, 170+i*60, 54, 30, ""+(i+1)));
			Add(new Canvas.Drawable(Shape.Box, null, 65, 155+i*60, 690, 50, "#000"));
			Add(new Canvas.Drawable(cur.Icon, null, 90, 170+i*60, 100, 100));
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
			Back:new Canvas.Drawable(Shape.Rectangle, null, 0, 0, 350, 75, "#FFE69B"),
			Txt1:new Canvas.Drawable(new Text_Class("36pt Arial", "#AD4329"), null, 90, 20, 350, 75, "FINISH"),
			Txt2:new Canvas.Drawable(new Text_Class("36pt Arial", "#F7B4A5"), null, 87, 17, 350, 75, "FINISH"),
			Draw:function(c, x, y, w, h, s){
				this.Back.Draw(c,x,y,w,h,s);
				this.Txt1.Draw(c,x,y,w,h,s);
				this.Txt2.Draw(c,x,y,w,h,s);
			}
		}, null, 430, 25, 350, 75), close_func, { // hovered display
			Back:new Canvas.Drawable(Shape.Rectangle, null, 0, 0, 350, 75, "#FFAD3A"),
			Txt1:new Canvas.Drawable(new Text_Class("36pt Arial", "#AD4329"), null, 90, 20, 350, 75, "FINISH"),
			Txt2:new Canvas.Drawable(new Text_Class("36pt Arial", "#FF5492"), null, 87, 17, 350, 75, "FINISH"),
			Draw:function(c, x, y, w, h, s){
				this.Back.Draw(c,x,y,w,h,s);
				this.Txt1.Draw(c,x,y,w,h,s);
				this.Txt2.Draw(c,x,y,w,h,s);
			}
		});
	}
}