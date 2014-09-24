/* function Dialog_Class(canvas){
	var Cur_Drawing_Dialog = false;
	var abrupt_finish = false;
	var Display_Prompt_In = false;
	var Queued_Speakers = [];
	var Queued_Texts = [];
	function Draw(text,speaker,index,newlines)
	{
		if(!curently_playing)return;
		if(index==null)
		{
			if(Cur_Drawing_Dialog)
			{
				console.error("Cannot display two dialogs at once");
				return;
			}
			abrupt_finish = false;
			Cur_Drawing_Dialog = true;
			index = 1;
			newlines = 0;
			canvas.clearRect(0,0,Canvas.Width,Canvas.Height);
			if(text.length>200)
			{ // to fix texts that would overflow
				var i=190,found = false;
				for(;i<text.length&&i<=200;i++)
				{
					if(text[i]==' '||text[i]=='\n')
					{
						found = true;
						break;
					}
				}
				if(found)
				{
					Queue_At_Start(text.substring(i+1,text.length));
					Queue_Speaker_At_Start(speaker);
					text = text.substring(0,i)+'...';
				}
				else
				{
					Queue_At_Start(text.substring(200,text.length));
					Queue_Speaker_At_Start(speaker);
					text = text.substring(0,200)+'...';
				}
			}
			for(var i=0,last_newline=0;i<text.length;i++)
			{ // to allow tabs to display in canvas editor
				if(text[i]=='\t')
				{
					text = text.substring(0,i)+'    '+text.substring(i+1,text.length);
					i+=4;
					continue;
				}
				if(text[i]=='\n')
				{
					last_newline = i;
				}
				if(i-last_newline>50)
				{
					var j=i,found = false;
					for(;j<text.length&&j-i<=5;j++)
					{
						if(text[j]==' '||text[j]=='\n')
						{
							found = true;
							break;
						}
					}
					if(found)
					{
						text = text.substring(0,j)+'\n'+text.substring(j+1,text.length);
						last_newline = j;
						i = j;
					}
					else
					{
						text = text.substring(0,i)+'\n'+text.substring(i,text.length);
						last_newline = i++;
					}
				}
			}
			with(canvas)
			{
				clearRect(0,0,Canvas.Width,Canvas.Height);
				fillStyle = "blue";
				globalAlpha = 0.35;
				fillRect(70,520,675,115);
				fillRect(100,490,150,30);
				globalAlpha = 1;
				strokeStyle = "turquoise";
				strokeRect(70,520,675,115);
				strokeRect(100,490,150,30);
				font = "20pt Times New Roman";
				fillStyle = "white";
				fillText(speaker,110,513);
			}
		}
		while(text[index]==' ')
			index++;
		if(!abrupt_finish)
		{
			canvas.fillText(text.substring(0,index),100,550+newlines);
		}
		else
		{
			var loc = text.indexOf('\n');
			index = 0;
			while(loc!=-1)
			{
				var line = text.substring(0,loc);
				canvas.fillText(line,100,550+newlines);
				newlines+=25;
				text = text.substring(loc+1,text.length);
				loc = text.indexOf('\n');
			}
			canvas.fillText(text,100,550+newlines);
			Cur_Drawing_Dialog = false;
			return;
		}
		if(index==text.length)
		{
			Cur_Drawing_Dialog = false;
			return;
		}
		if(text[index]=='\n')
		{
			text = text.substring(index+1,text.length);
			index = 0;
			newlines+=25;
		}
		setTimeout(function(){Draw(text,speaker,index+1,newlines);},25);
	}
	function Slide_In(text,speaker,i)
	{
		with(canvas)
		{
			clearRect(0,0,Canvas.Width,Canvas.Height);
			fillStyle = "blue";
			globalAlpha = 0.35;
			fillRect(70,520+i,675,115);
			fillRect(100,490+i,150,30);
			globalAlpha = 1;
			strokeStyle = "turquoise";
			strokeRect(70,520+i,675,115);
			strokeRect(100,490+i,150,30);
		}
		if(i<=0)
		{
			Display_Prompt_In = true;
			Draw(text,speaker);
			Clickable.Add_Button("Dialog_Next",function(){
				Dialog.Next();
			},675,600,50,20,"Next");
			return;
		}
		setTimeout(function(){Slide_In(text,speaker,i-=5);},15);
	}
	function Slide_Out(i)
	{
		if(i==null)
		{
			Clickable.Delete_Button("Dialog_Next");
			i = 0;
		}
		with(canvas)
		{
			clearRect(0,0,Canvas.Width,Canvas.Height);
			fillStyle = "blue";
			globalAlpha = 0.35;
			fillRect(70,520+i,675,115);
			fillRect(100,490+i,150,30);
			globalAlpha = 1;
			strokeStyle = "turquoise";
			strokeRect(70,520+i,675,115);
			strokeRect(100,490+i,150,30);
		}
		if(i>=200)
		{
			Display_Prompt_In = false;
			return;
		}
		setTimeout(function(){Slide_Out(i+=5);},15);
	}
	function Queue_At_Start(addition)
	{
		for(var i=Queued_Texts.length;i>0;i--)
		{
			Queued_Texts[i] = Queued_Texts[i-1];
		}
		Queued_Texts[0] = addition;
	}
	function Queue(addition)
	{
		Queued_Texts[Queued_Texts.length] = addition;
	}
	function Get_First_Queue()
	{
		if(Queued_Texts.length==0)
			return "";
		var temp = Queued_Texts[0];
		Queued_Texts.splice(0,1);
		return temp;
	}
	function Queue_Speaker_At_Start(addition)
	{
		for(var i=Queued_Speakers.length;i>0;i--)
		{
			Queued_Speakers[i] = Queued_Speakers[i-1];
		}
		Queued_Speakers[0] = addition;
	}
	function Queue_Speaker(addition)
	{
		Queued_Speakers[Queued_Speakers.length] = addition;
	}
	function Get_First_Queued_Speaker()
	{
		if(Queued_Speakers.length==0)
			return "";
		var temp = Queued_Speakers[0];
		Queued_Speakers.splice(0,1);
		return temp;
	}
	this.Write = function(speaker,text,animate)
	{
		if(animate==null)
			animate = true;
		if(!Display_Prompt_In)
		{
			if(animate)
				Slide_In(text,speaker,200);
			else
				Slide_In(text,speaker,0);
		}
		else
		{
			Queue(text);
			Queue_Speaker(speaker);
		}
	}
	this.Next = function()
	{
		if(Cur_Drawing_Dialog)
		{
			abrupt_finish = true;
		}
		else
		{
			var text = Get_First_Queue();
			var speaker = Get_First_Queued_Speaker();
			if(text=="")
			{
				Slide_Out();
				return;
			}
			Draw(text,speaker);
		}
	}
	this.Currently_Drawing = function()
	{
		return Cur_Drawing_Dialog;
	}
}
var Dialog; */