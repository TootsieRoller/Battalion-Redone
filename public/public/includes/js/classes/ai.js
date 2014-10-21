var AI = {
	STATE:{
		Move:0,
		Attack:1
	},
	// make so char has ui
	Solve:function(game, chars)
	{
		game.Active_Player().End_Turn();
		/* var q = AI.Recursion(game,chars,0);
		console.log("ai.q.length = "+q.length);
		for(var i=0;i<q.length;i++)
		{
			if(q[i][0]==AI.STATE.Move)
			{
				Game.Queue(true,q[i][1].Name()+q[i][1].Index(),function(arguments){
					arguments[0].Move(arguments[1],arguments[2]);
					Interface.Slide_Unit(arguments[0],arguments[1],arguments[2]);
				},[q[i][1],q[i][2],q[i][3]]);
			}
		} */
	},
	Recursion:function(game, chars, i)
	{
		var queue = [];
		for(var j=0;j<chars.length;j++)
		{
			var _char = chars[j];
			// var set = false;
			// for(var i=0;i<_char.Action_Amt();i++)
			// {
				// var a = _char.Action(i);
				// for(var j=0;j<a.Target_Amount();j++)
				// {
					// var x = a.Target(j).X()+Converter.Map.X(_char.X());
					// var y = a.Target(j).Y()+Converter.Map.Y(_char.Y());
					// if(game.Map.At(x,y)!=-1)
					// {
						// set = true;
						// break;
					// }
				// }
			// }
			// if(set)
				// continue;
			for(var i=0;i<_char.Move_Amount();i++)
			{
				var m = _char.Get_Move(i);
				var x = m.X()+Converter.Map.X(_char.X());
				var y = m.Y()+Converter.Map.Y(_char.Y());
				if(game.Map.At(x,y)==-1)
				{
					if(Math.random()>.6)
					{
						queue[queue.length] = [AI.STATE.Move,_char,x,y];
						break;
					}
				}
			}
		}
		return queue;
	}
};
