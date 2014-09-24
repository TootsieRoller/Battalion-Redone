function CharWidth(test)
{
	if(test=='A')return 1;
	if(test=='B')return 1;
	if(test=='C')return 1;
	if(test=='D')return 1;
	if(test=='E')return 1;
	if(test=='F')return 1;
	if(test=='G')return 1;
	if(test=='H')return 1;
	if(test=='I')return .25;
	if(test=='J')return .5;
	if(test=='K')return 1;
	if(test=='L')return 1;
	if(test=='M')return 1;
	if(test=='N')return 1;
	if(test=='O')return 1;
	if(test=='P')return 1;
	if(test=='Q')return 1;
	if(test=='R')return 1;
	if(test=='S')return 1;
	if(test=='T')return 1;
	if(test=='U')return 1;
	if(test=='V')return 1;
	if(test=='W')return 1;
	if(test=='X')return 1;
	if(test=='Y')return 1;
	if(test=='Z')return 1;
	if(test=='a')return .75;
	if(test=='b')return .75;
	if(test=='c')return .75;
	if(test=='d')return .75;
	if(test=='e')return .75;
	if(test=='f')return .75;
	if(test=='g')return .75;
	if(test=='h')return .75;
	if(test=='i')return .25;
	if(test=='j')return .5;
	if(test=='k')return .75;
	if(test=='l')return .25;
	if(test=='m')return .75;
	if(test=='n')return .75;
	if(test=='o')return .75;
	if(test=='p')return .75;
	if(test=='q')return .75;
	if(test=='r')return .5;
	if(test=='s')return .5;
	if(test=='t')return .5;
	if(test=='u')return .75;
	if(test=='v')return .75;
	if(test=='w')return .75;
	if(test=='x')return .75;
	if(test=='y')return .75;
	if(test=='z')return .75;
	if(test==' ')return .5;
	if(test=='0')return 1;
	if(test=='1')return .25;
	if(test=='2')return 1;
	if(test=='3')return 1;
	if(test=='4')return 1;
	if(test=='5')return 1;
	if(test=='6')return 1;
	if(test=='7')return 1;
	if(test=='8')return 1;
	if(test=='9')return 1;
	if(test=='!')return .2;
	if(test=='@')return 1.25;
	if(test=='#')return 1;
	if(test=='$')return 1;
	if(test=='%')return 1.25;
	if(test=='^')return 1;
	if(test=='&')return 1;
	if(test=='*')return 1;
	if(test=='(')return .5;
	if(test==')')return .5;
	if(test=='<')return 1.25;
	if(test=='>')return 1.25;
	if(test=='?')return .75;
	if(test=='{')return .5;
	if(test=='}')return .5;
	if(test=='[')return .5;
	if(test==']')return .5;
	if(test=="'")return .25;
	if(test=='"')return .5;
	if(test=='.')return .25;
	return 1;
}

var Text_Class = function(font, color)
{
	if(font==null)font="10pt Times New Roman";
	if(color==null)color="#FFF";
	this.Draw = function(canvas, x, y, w, h, txt)
	{
		if(txt==null)return;
		if(typeof txt!=='string')txt=txt(); // for mutatable strings using closure
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
			curLen+=size*CharWidth(txt[i]);
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