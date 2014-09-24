var Team_Colors = {
	Health_Display:["#FF6347","#FFBF46","#E2FF46","#86FF46"],
	Color:[ // light to dark
		[[255,208,204],[232,186,185],[168,134,139],[102,81,99]], // grey
		[[255,144,133],[233,51,46],[170,22,44],[102,26,94]], // red
		[[169,207,255],[69,164,225],[43,95,199],[61,49,127]], // blue
		[[142,255,152],[59,255,20],[67,193,56],[22,145,15]], // green
		[[255,255,0],[229,229,43],[206,109,28],[125,137,13]], // yellow
	],
	Player:["White","Red","Blue","Green","Yellow"],
	Flags:[Images.Retrieve("White Flag"),Images.Retrieve("Red Flag"),Images.Retrieve("Blue Flag"),Images.Retrieve("Green Flag"),Images.Retrieve("Yellow Flag")],
	Base:Images.Retrieve("Flag Base"),
	Draw:function(canvas, x, y, h, player)
	{
		if(player==null)
			player = this.Flags[0];
		else player = this.Flags[player.Color];
		player.Draw(canvas, x, y-17);
		this.Base.Draw(canvas, x, y, 4, h);
	}
};

function changePixels(img, d1, d2)
{
	for(var i=0;i<img.data.length;i+=4)
	{
		for(var k=0;k<d1.length;k++)
		{
			if(img.data[i]==d1[k][0])
			if(img.data[i+1]==d1[k][1])
			if(img.data[i+2]==d1[k][2])
			{
				img.data[i] = d2[k][0];
				img.data[i+1] = d2[k][1];
				img.data[i+2] = d2[k][2];
				break;
			}
		}
	}
	return img;
}

function flipX(img)
{
	for(var i=0;i<img.height;i++)
	{
		var index = i*img.width*4;
		for(var j=0;j<img.width/2;j++)
		{
			var left = index+j*4;
			var right = index+(img.width-j-1)*4;
			var temp = [img.data[left],img.data[left+1],img.data[left+2],img.data[left+3]];
			img.data[left] = img.data[right];
			img.data[left+1] = img.data[right+1];
			img.data[left+2] = img.data[right+2];
			img.data[left+3] = img.data[right+3];
			img.data[right] = temp[0];
			img.data[right+1] = temp[1];
			img.data[right+2] = temp[2];
			img.data[right+3] = temp[3];
		}
	}
	return img;
}

function darken(img)
{
	var temp = imageHolderCanvas.createImageData(img.width,img.height);
	for(var i=0;i<img.data.length;i+=4)
	{
		temp.data[i] = img.data[i]*.7;
		temp.data[i+1] = img.data[i+1]*.7;
		temp.data[i+2] = img.data[i+2]*.7;
		temp.data[i+3] = img.data[i+3];
	}
	return temp;
}

function zoom(img, scale)
{
	var widthScaled = Math.floor(img.width*scale);
	var heightScaled = Math.floor(img.height*scale);
	var temp = imageHolderCanvas.createImageData(widthScaled, heightScaled);
	for(var y=0;y<heightScaled;y++)
	for(var x=0;x<widthScaled;x++)
	{
		var index = (Math.floor(y/scale)*img.width+Math.floor(x/scale))*4;
		var indexScaled = (y*widthScaled+x)*4;
		temp.data[indexScaled] = img.data[index];
		temp.data[indexScaled+1] = img.data[index+1];
		temp.data[indexScaled+2] = img.data[index+2];
		temp.data[indexScaled+3] = img.data[index+3];
	}
	return temp;
}

function merge(img1, img2)
{
	if(img1.data.length!=img2.data.length)return null;
	var temp = imageHolderCanvas.createImageData(img1.width,img1.height);
	for(var i=0;i<img1.data.length;i+=4)
	{
		if(img2.data[i+3]==0)
		{
			temp.data[i] = img1.data[i];
			temp.data[i+1] = img1.data[i+1];
			temp.data[i+2] = img1.data[i+2];
			temp.data[i+3] = img1.data[i+3];
		}
		else
		{
			temp.data[i] = img2.data[i];
			temp.data[i+1] = img2.data[i+1];
			temp.data[i+2] = img2.data[i+2];
			temp.data[i+3] = img2.data[i+3];
		}
	}
	return temp;
}

function clone(img)
{
	var temp = imageHolderCanvas.createImageData(img.width,img.height);
	for(var i=0;i<img.data.length;i++)
		temp.data[i] = img.data[i];
	return temp;
}