function overlapping(drawable, x, y)
{
	if(x>=drawable.X.data)
	if(x<drawable.X.data+drawable.Width.data)
	if(y>=drawable.Y.data)
	if(y<drawable.Y.data+drawable.Height.data)
		return true;
	return false;
}

var Menu = {
	Setter:function(index,info,input){
		info.data = input;
		index.Draw();
	},
	Menu_Class:function()
	{
		var draws = [];
		var clicks = [];
		var hovered = -1;
		var clickPos = -1;
		this.Background = null;
		this.Add = function(drawable, click, hovered, right_click)
		{
			if(drawable==null)return;
			if(click!=null||right_click!=null)clicks.push([draws.length, click, right_click]);
			draws.push([drawable, drawable.Source.data, hovered]);
		};
		this.Erase = function()
		{
			draws = [];
		}
		this.Draw = function()
		{
			if(this.Background!=null)
			{
				if(this.Background.Draw)
				{
					this.Background.Draw(menuCanvas, 0, 0, menuCanvas.width, menuCanvas.height);
				}
				else
				{
					Shape.Rectangle.Draw(menuCanvas, 0, 0, menuCanvas.width, menuCanvas.height, this.Background);
				}
			}
			for(var i in draws)
			{
				draws[i][0].Draw(menuCanvas);
			}
		};
		this.Close = function()
		{
			hovered = -1;
			menuCanvas.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
		};
		this.Click = function(x, y)
		{
			clickPos = [x,y];
		};
		this.Release = function(x, y)
		{
			if(~clickPos)
			if(Math.abs(x-clickPos[0])<5&&Math.abs(y-clickPos[1])<5)
			for(var i=clicks.length-1;i>=0;i--)
			{
				var cur = clicks[i];
				if(overlapping(draws[cur[0]][0], x, y))
				{
					if(!cur[1])continue;
					cur[1]();
					return;
				}
			}
			clickPos = -1;
		};
		this.Right_Click = function(x, y)
		{
			for(var i=clicks.length-1;i>=0;i--)
			{
				var cur = clicks[i];
				if(overlapping(draws[cur[0]][0], x, y))
				{
					if(!cur[2])continue;
					cur[2]();
					return;
				}
			}
		};
		this.Mouse_Move = function(x, y)
		{
			if(~hovered)
			{
				var cur = draws[hovered];
				if(!overlapping(cur[0], x, y))
				{
					cur[0].Source.data = cur[1];
					// cur[0].Clear(menuCanvas);
					cur[0].Draw(menuCanvas);
					hovered = -1;
				}
				return;
			}
			for(var i=draws.length-1;i>=0;i--)
			{
				var cur = draws[i];
				if(!cur[2])continue;
				if(overlapping(cur[0], x, y))
				{
					cur[0].Source.data = cur[2];
					// cur[0].Clear(menuCanvas);
					cur[0].Draw(menuCanvas);
					hovered = i;
					return;
				}
			}
		};
	}
};