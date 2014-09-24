var Shape = {
	Rect_Class:function(f)
	{
		this.Draw = function(canvas, x, y, w, h, c)
		{
			if(f){
				canvas.fillStyle = c;
				canvas.fillRect(x,y,w,h);
			}else{
				canvas.strokeStyle = c;
				canvas.strokeRect(x,y,w,h);
			}
		};
	},
	Ellip_Class:function(f)
	{
		function curve(c,x,y,w,h)
		{
			canvas.beginPath();
			canvas.moveTo(x, y - h/2);
			canvas.bezierCurveTo(
				x + w/2, y - h/2,
				x + w/2, y + h/2,
				x, y + h/2);
			canvas.bezierCurveTo(
				x - w/2, y + h/2,
				x - w/2, y - h/2,
				x, y - h/2);
		}
		this.Draw = function(canvas, x, y, w, h, c)
		{
			if(f){
				canvas.fillStyle = c;
				curve(canvas,x,y,w,h);
				canvas.fill();
				canvas.closePath();
			}else{
				canvas.strokeStyle = c;
				curve(canvas,x,y,w,h);
				canvas.stroke();
				canvas.closePath();
			}
		};
	}
};

Shape.Rectangle = new Shape.Rect_Class(true);
Shape.Box = new Shape.Rect_Class(false);
Shape.Ellipse = new Shape.Ellip_Class(true);
Shape.Ball = new Shape.Ellip_Class(false);