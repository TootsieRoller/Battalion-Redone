var Text_Class = function(font, color)
{
	if(font==null)font="10pt Times New Roman";
	if(color==null)color="#FFF";
	this.Draw = function(canvas, x, y, w, h, txt)
	{
		if(txt==null)return;
		if(typeof txt==='function')txt=txt(); // for mutatable strings using closure
		if(typeof txt!=='string')return;
		canvas.font = font;
		canvas.fillStyle = color;
		var size = parseInt(font);
		var newlines = 1;
		var curLen = 0;
		for(var i=0;i<txt.length;i++)
		{
			if(txt[i]=='\n')
			{
				i++;
				curLen = 0;
				continue;
			}
			curLen+=canvas.measureText(txt[i]).width;
			if(curLen>w)
			{
				var crop = 1;
				while(txt[i-crop]!=' ')
				{
					if(crop==i)
					{
						crop = 0;
						break;
					}
					crop++;
				}
				i-=crop;
				var leadingSpaces = 1;
				while(txt[i+leadingSpaces]==' ')
				{
					leadingSpaces++;
				}
				txt = txt.substring(0,i)+'\n'+txt.substring(i+leadingSpaces);
				curLen = 0;
				i+=2;
			}
		}
		var curNewline = txt.indexOf('\n'),
			lastNewline = 0;
		while(~curNewline)
		{
			if((newlines-1)*size>h)return;
				// console.log(">"+txt.substring(lastNewline,curNewline),x+1,y+newlines*size);
			canvas.fillText(txt.substring(lastNewline,curNewline),x+1,y+newlines*size);
			newlines++;
			lastNewline = curNewline;
			curNewline = txt.indexOf('\n',curNewline+1);
		}
				// console.log(">"+txt.substring(lastNewline),x+1,y+newlines*size);
		canvas.fillText(txt.substring(lastNewline),x+1,y+newlines*size);
	};
};

var STDTXT = new Text_Class();