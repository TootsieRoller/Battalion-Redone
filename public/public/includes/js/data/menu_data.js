Menu.PreGame = new Menu.Menu_Class();
//drawable(src, changed, x, y, w, h, sta, sty, alp, ang, emp)
// Add(drawable, click_function, hover_drawable, right_click_function)

Menu.PreGame.Slots = [null,null];
Menu.PreGame.Set = function(index, value)
{
	this.Slots[index].State.Set(value);
};
Menu.PreGame.Length = function(amount)
{
	this.Add(new Canvas.Drawable(Shape.Rectangle, null, 20, 150, 600, (amount*52)-2, "#F2F3FF"));

	var NameTxt = new Text_Class("40pt Calibri", "#000");
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
		INTERFACE.Game.Host_Game(Menu.PreGame.game_id);
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
	Menu.PreGame.Title = new Canvas.Drawable(new Text_Class("45pt Impact", "#00C7FF"), Menu.Setter, 50, 70, 600, 45, "UNDEFINED");
	Title.Index = Menu.PreGame;
	Add(Title);
}