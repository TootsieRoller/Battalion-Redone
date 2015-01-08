function Image_list_class()
{
	var IMG_LOC = "./img/";
	function Image_Class(src,name,callback)
	{
		var img;
		var loaded;
		var stretchable = true;
		if(src.Draw)
		{
			loaded = true;
			img = src.Image();
			callback();
		}
		else
		{
			loaded = false;
			img = new Image();
			img.src = IMG_LOC+src;
			img.onload = function()
			{
				loaded = true;
				callback();
			};
		}
		this.Draw = function(canvas,x,y,w,h)
		{
			if(stretchable)
			if(w!=null&&h!=null)
			{
				canvas.drawImage(img,x,y,w,h);
				return;
			}
			canvas.drawImage(img,x,y);
		};
		this.Loaded = function()
		{
			return loaded;
		};
		this.Image = function()
		{
			return img;
		};
		this.Source = function()
		{
			return img.src;
		};
		this.Stretch = function(val)
		{
			stretchable = val;
		};
		this.Name = function()
		{
			return name;
		};
	}

	var Images = [];
	var total_images=0,loaded_images=0;
	this.Declare = function(src,name)
	{
		for(var i in Images)
		{
			if(name==i)
			{
				console.error("Image already declared with the name "+name);
				return;
			}
		}
		total_images++;Images[name] = new Image_Class(src,name,function(){
			loaded_images++;
		});
		return Images[name];
	};
	this.Delete = function(name)
	{
		return Core.Remove_Array_Index(Images,name);
	};
	this.Retrieve = function(name)
	{
		for(var i in Images)
		{
			if(name==i)
			{
				return Images[name];
			}
		}
		return null;
	};

	this.Done = function()
	{
		return (total_images==loaded_images);
	};
	this.Progress = function()
	{
		return loaded_images/total_images;
	};
	this.Empty = function()
	{
		total_images = 0;
		loaded_images = 0;
		Images = [];
	};
}

var Images = new Image_list_class();