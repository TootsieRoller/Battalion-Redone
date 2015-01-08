var Menu = {
	Menu_Class:function(bgInput)
	{
		var draws = [];
		var clicks = [];
		var hovered = -1;
		var clickPos = -1;
		var self = this;
		self.xScale = 1;
		self.yScale = 1;
		if(typeof bgInput==='undefined')bgInput=null;
		self.Background = bgInput;
		self.Add = function(drawable, click, hovered, right_click)
		{
			if(drawable==null)return;
			if(click!=null||right_click!=null)clicks.push([draws.length, click, right_click]);
			draws.push([drawable, drawable.Source.data, hovered]);
		};
		self.Erase = function()
		{
			draws = [];
		}
		self.Draw = function()
		{
			menuCanvas.save();
			menuCanvas.scale(self.xScale, self.yScale);
			if(self.Background!=null)
			{
				if(self.Background.Draw)
				{
					self.Background.Draw(menuCanvas, 0, 0, menuCanvas.width, menuCanvas.height);
				}
				else if(typeof self.Background==='string')
				{
					Shape.Rectangle.Draw(menuCanvas, 0, 0, menuCanvas.width, menuCanvas.height, self.Background);
				}
			}
			for(var i in draws)
			{
				draws[i][0].Draw(menuCanvas);
			}
			menuCanvas.restore();
		};
		self.Scale = function(x, y)
		{
			self.xScale = x;
			self.yScale = y;
			self.Draw();
		};
		self.Close = function()
		{
			hovered = -1;
			menuCanvas.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
		};
		self.Click = function(x, y)
		{
			x/=self.xScale;
			y/=self.yScale;
			clickPos = [x,y];
		};
		self.Release = function(x, y)
		{
			x/=self.xScale;
			y/=self.yScale;
			if(~clickPos)
			if(Math.abs(x-clickPos[0])<5&&Math.abs(y-clickPos[1])<5)
			for(var i=clicks.length-1;i>=0;i--)
			{
				var cur = clicks[i];
				if(Canvas.overlappingDrawable(draws[cur[0]][0], x, y))
				{
					if(!cur[1])continue;
					cur[1](draws[cur[0]][0].State.data);
					return;
				}
			}
			clickPos = -1;
		};
		self.Right_Click = function(x, y)
		{
			x/=self.xScale;
			y/=self.yScale;
			for(var i=clicks.length-1;i>=0;i--)
			{
				var cur = clicks[i];
				if(Canvas.overlappingDrawable(draws[cur[0]][0], x, y))
				{
					if(!cur[2])continue;
					cur[2](draws[cur[0]][0].State.data);
					return;
				}
			}
		};
		self.Mouse_Move = function(x, y)
		{
			x/=self.xScale;
			y/=self.yScale;
			if(~hovered)
			{
				var cur = draws[hovered];
				if(!Canvas.overlappingDrawable(cur[0], x, y))
				{
					menuCanvas.save();
					menuCanvas.scale(self.xScale, self.yScale);
					cur[0].Source.data = cur[1];
					cur[0].Draw(menuCanvas);
					menuCanvas.restore();
					hovered = -1;
				}
				return;
			}
			for(var i=draws.length-1;i>=0;i--)
			{
				var cur = draws[i];
				if(!cur[2])continue;
				if(Canvas.overlappingDrawable(cur[0], x, y))
				{
					menuCanvas.save();
					menuCanvas.scale(self.xScale, self.yScale);
					cur[0].Source.data = cur[2];
					cur[0].Draw(menuCanvas);
					menuCanvas.restore();
					hovered = i;
					return;
				}
			}
		};
	}
};