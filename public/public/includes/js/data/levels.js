var Levels_Class = function()
{
	var unlocked_levels = 3;
	var LevelData = {
		Names:["Ampersand","Antipex","Rat Race","Onslaught"],
		Players:[2,2,4,2],
		Terrain:[
		/* Level 1 */
		[[1,5,5,5,5,5,5,5,1,1],
		[1,5,3,3,3,3,3,1,1,1],
		[1,1,3,3,3,3,1,2,1,1],
		[1,1,1,3,4,1,1,1,1,1],
		[1,1,1,1,3,3,1,1,1,1],
		[1,1,1,1,3,3,1,1,1,1],
		[1,1,1,1,1,4,3,1,1,1],
		[1,1,2,1,3,3,3,3,1,1],
		[1,1,1,3,3,3,3,3,5,1],
		[1,5,5,5,5,5,5,5,5,1]],
		/* Level 2 */
		[[10,10,5,5,1,1,1,1,1,1],
		[10,3,5,1,3,3,1,1,1,1],
		[1,1,1,3,3,3,3,1,3,3],
		[2,1,1,1,4,1,1,1,3,10],
		[1,1,3,1,1,4,1,1,1,10],
		[10,1,1,1,4,1,3,2,1,1],
		[10,3,1,1,1,4,1,1,1,2],
		[3,3,1,3,3,3,3,1,1,1],
		[1,1,1,1,3,3,1,5,3,10],
		[1,1,1,1,1,1,5,5,10,10]],
		/* Level 3 */
		[[2,1,1,1,3,8,3,1,1,1,2],
		[1,4,1,1,1,3,1,1,1,4,1],
		[1,1,1,3,1,1,1,3,1,1,1],
		[1,1,3,8,8,4,8,8,3,1,1],
		[3,1,1,8,1,6,1,8,1,1,3],
		[8,3,1,4,6,8,6,4,1,3,8],
		[3,1,1,8,1,6,1,8,1,1,3],
		[1,1,3,8,8,4,8,8,3,1,1],
		[1,1,1,3,1,1,1,3,1,1,1],
		[1,4,1,1,1,3,1,1,1,4,1],
		[2,1,1,1,3,8,3,1,1,1,2]],
		/* Level 4 */
		[[1,1,10,10,3,10,10,1,1,1],
		[1,10,10,1,1,3,10,10,10,1],
		[10,10,1,4,1,1,4,10,10,10],
		[10,10,1,1,5,4,1,10,10,10],
		[10,2,1,3,5,3,1,2,10,10],
		[10,10,1,4,5,1,1,10,10,10],
		[10,10,4,1,1,4,1,10,10,10],
		[3,10,10,3,1,1,10,10,10,4],
		[1,3,10,10,3,10,10,10,4,4],
		[1,1,10,10,10,10,10,10,4,4]]
		],
		Start:function(Game, lvl)
		{
			if(lvl==0)
			{
				Game.Add_Player("Red", 1);
				Game.Add_Player("Blue", 2);
				/* Player 1 */
				Game.Add_Unit(Characters.New(Game,"Scorpion Tank"), 2, 0, 0);
				Game.Add_Unit(Characters.New(Game,"Scorpion Tank"), 3, 0, 0);
				Game.Add_Unit(Characters.New(Game,"Annihilator Tank"), 2, 1, 0);
				Game.Add_Unit(Characters.New(Game,"Mortar Truck"), 3, 1, 0);
				Game.Add_Unit(Characters.New(Game,"Mortar Truck"), 4, 1, 0);
				Game.Add_Unit(Characters.New(Game,"Rocket Truck"), 2, 2, 0);
				/* Buildings */
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 4, 1, 0);
				Game.Add_Building(Buildings.New(Game,"Ground Control"), 1, 5, 0);
				Game.Add_Building(Buildings.New(Game,"City"), 6, 0, 0);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 7, 1, 0);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 8, 1, 0);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 9, 0, 0);
				/* Player 2 */
				Game.Add_Unit(Characters.New(Game,"Scorpion Tank"), 7, 7, 1);
				Game.Add_Unit(Characters.New(Game,"Scorpion Tank"), 8, 7, 1);
				Game.Add_Unit(Characters.New(Game,"Annihilator Tank"), 6, 6, 1);
				Game.Add_Unit(Characters.New(Game,"Mortar Truck"), 5, 6, 1);
				Game.Add_Unit(Characters.New(Game,"Mortar Truck"), 4, 7, 1);
				Game.Add_Unit(Characters.New(Game,"Rocket Truck"), 5, 7, 1);
				Game.Add_Unit(Characters.New(Game,"Strike Commando"), 4, 8, 1);
				/* Buildings */
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 5, 8, 1);
				Game.Add_Building(Buildings.New(Game,"Ground Control"), 8, 4, 1);
				Game.Add_Building(Buildings.New(Game,"City"), 3, 9, 1);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 2, 8, 1);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 1, 8, 1);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 0, 9, 1);
			}
			else if(lvl==1)
			{
				Game.Add_Player("Player 1", 1);
				Game.Add_Player("Player 2", 2);
				/* Player 1 */
				Game.Add_Unit(Characters.New(Game,"Rocket Truck"), 0, 6, 0);
				Game.Add_Unit(Characters.New(Game,"Flak Tank"), 0, 7, 0);
				Game.Add_Unit(Characters.New(Game,"Scorpion Tank"), 0, 8, 0);
				Game.Add_Unit(Characters.New(Game,"Flak Tank"), 0, 9, 0);
				Game.Add_Unit(Characters.New(Game,"Scorpion Tank"), 1, 7, 0);
				Game.Add_Unit(Characters.New(Game,"Annihilator Tank"), 1, 8, 0);
				Game.Add_Unit(Characters.New(Game,"Blockade"), 5, 1, 0);
				Game.Add_Unit(Characters.New(Game,"Blockade"), 5, 3, 0);
				/* Player 2 */
				Game.Add_Unit(Characters.New(Game,"Rocket Truck"), 7, 3, 1);
				Game.Add_Unit(Characters.New(Game,"Flak Tank"), 8, 4, 1);
				Game.Add_Unit(Characters.New(Game,"Scorpion Tank"), 9, 3, 1);
				Game.Add_Unit(Characters.New(Game,"Flak Tank"), 9, 2, 1);
				Game.Add_Unit(Characters.New(Game,"Scorpion Tank"), 7, 2, 1);
				Game.Add_Unit(Characters.New(Game,"Annihilator Tank"), 6, 3, 1);
				Game.Add_Unit(Characters.New(Game,"Blockade"), 4, 6, 1);
				Game.Add_Unit(Characters.New(Game,"Blockade"), 4, 8, 1);

				/* Buildings */
				Game.Add_Building(Buildings.New(Game,"City"), 4, 4);
				Game.Add_Building(Buildings.New(Game,"City"), 5, 5);
				/* Player 1 */
				Game.Add_Building(Buildings.New(Game,"City"), 0, 6, 0);
				Game.Add_Building(Buildings.New(Game,"City"), 2, 7, 0);
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 1, 3, 0);
				Game.Add_Building(Buildings.New(Game,"Command Center"), 3, 5, 0);
				Game.Add_Building(Buildings.New(Game,"Air Control"), 4, 0, 0);
				Game.Add_Building(Buildings.New(Game,"Ground Control"), 5, 8, 0);
				/* Player 2 */
				Game.Add_Building(Buildings.New(Game,"City"), 7, 2, 1);
				Game.Add_Building(Buildings.New(Game,"City"), 9, 3, 1);
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 8, 6, 1);
				Game.Add_Building(Buildings.New(Game,"Command Center"), 6, 4, 1);
				Game.Add_Building(Buildings.New(Game,"Air Control"), 5, 9, 1);
				Game.Add_Building(Buildings.New(Game,"Ground Control"), 4, 1, 1);
			}
			else if(lvl==2)
			{
				Game.Add_Player("Player 1", 1);
				Game.Add_Player("Player 2", 2);
				Game.Add_Player("Player 3", 3);
				Game.Add_Player("Player 4", 4);
				Game.Add_Building(Buildings.New(Game,"City"), 5, 2);
				Game.Add_Building(Buildings.New(Game,"City"), 2, 5);
				Game.Add_Building(Buildings.New(Game,"City"), 5, 8);
				Game.Add_Building(Buildings.New(Game,"City"), 8, 5);
				/* Player 1 */
				Game.Add_Unit(Characters.New(Game,"Jammer Truck"), 2, 2, 0);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 4, 2, 0);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 2, 4, 0);
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 0, 1, 0);
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 1, 0, 0);
				Game.Add_Building(Buildings.New(Game,"Command Center"), 4, 4, 0);
				Game.Add_Building(Buildings.New(Game,"Air Control"), 4, 1, 0);
				Game.Add_Building(Buildings.New(Game,"Ground Control"), 1, 4, 0);
				/* Player 2 */
				Game.Add_Unit(Characters.New(Game,"Jammer Truck"), 8, 2, 1);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 6, 2, 1);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 8, 4, 1);
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 10, 1, 1);
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 9, 0, 1);
				Game.Add_Building(Buildings.New(Game,"Command Center"), 6, 4, 1);
				Game.Add_Building(Buildings.New(Game,"Air Control"), 9, 4, 1);
				Game.Add_Building(Buildings.New(Game,"Ground Control"), 6, 1, 1);
				/* Player 3 */
				Game.Add_Unit(Characters.New(Game,"Jammer Truck"), 8, 8, 2);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 8, 6, 2);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 6, 8, 2);
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 9, 10, 2);
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 10, 9, 2);
				Game.Add_Building(Buildings.New(Game,"Command Center"), 6, 6, 2);
				Game.Add_Building(Buildings.New(Game,"Air Control"), 6, 9, 2);
				Game.Add_Building(Buildings.New(Game,"Ground Control"), 9, 6, 2);
				/* Player 4 */
				Game.Add_Unit(Characters.New(Game,"Jammer Truck"), 2, 8, 3);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 2, 6, 3);
				Game.Add_Building(Buildings.New(Game,"Oil Refinary"), 4, 8, 3);
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 1, 10, 3);
				Game.Add_Building(Buildings.New(Game,"Warfactory"), 0, 9, 3);
				Game.Add_Building(Buildings.New(Game,"Command Center"), 4, 6, 3);
				Game.Add_Building(Buildings.New(Game,"Air Control"), 1, 6, 3);
				Game.Add_Building(Buildings.New(Game,"Ground Control"), 4, 9, 3);
			}
			else if(lvl==3)
			{
				Game.Add_Player("Player 1", 1);
				Game.Add_Player("Player 2", 2);
				/* Player 1 */
				Game.Add_Unit(Characters.New(Game,"Flak Tank"), 0, 4, 0);
				Game.Add_Unit(Characters.New(Game,"Flak Tank"), 1, 4, 0);
				Game.Add_Unit(Characters.New(Game,"Scorpion Tank"), 2, 4, 0);
				Game.Add_Unit(Characters.New(Game,"Mortar Truck"), 1, 5, 0);
				Game.Add_Unit(Characters.New(Game,"Heavy Commando"), 2, 6, 0);
				Game.Add_Unit(Characters.New(Game,"Lance Tank"), 1, 3, 0);
				/* Player 2 */
				Game.Add_Unit(Characters.New(Game,"Flak Tank"), 8, 4, 1);
				Game.Add_Unit(Characters.New(Game,"Flak Tank"), 7, 4, 1);
				Game.Add_Unit(Characters.New(Game,"Scorpion Tank"), 6, 4, 1);
				Game.Add_Unit(Characters.New(Game,"Mortar Truck"), 7, 3, 1);
				Game.Add_Unit(Characters.New(Game,"Heavy Commando"), 6, 2, 1);
				Game.Add_Unit(Characters.New(Game,"Lance Tank"), 7, 5, 1);

				/* Buildings */
				Game.Add_Building(Buildings.New(Game,"Command Center"), 2, 2, 1);
				Game.Add_Building(Buildings.New(Game,"Command Center"), 6, 6, 0);
				/* setTimeout(function()
				{
					Dialog.Write("Narrator","Welcome to the game!");
					Dialog.Write("Narrator","You just clicked next.");
					Dialog.Write("Narrator","You did it again. Did you know that if the text is taking too long to display, you can just click next to automatically finish displaying the text? This message will display again so you can test it.");
					Dialog.Write("Narrator","You did it again. Did you know that if the text is taking too long to display, you can just click next to automatically finish displaying the text?");
					Dialog.Write("Narrator","Now here is a test to make sure that when you write something that is over the maximum it will display it correctly. I am not too sure at this point if it will work, but I guess we will found out sooner or later. Hopefully soon and that the answer is yes it works because I don't want to work on this too much longer. fjalkgahgakghaelkhgalkhgalkjhgalkjghakhgalkgjhakldghadklghgjhasgkjhagkjhsdglkahgkjdhsgjlghlsdkjghsdlgkjhdsglkjasdhglkjsdghlksdajghasdlkgh.");
					Dialog.Write("Narrator","Cool huh?");
					Dialog.Write("Narrator","Goodbye now!");
				},1500); */
			}
		}
	};

	this.Draw = function(level, canvas, xOffset, yOffset, width, height)
	{
		var map = LevelData.Terrain[level];
		var tileWidth = width/map.length;
		var tileHeight = height/map[0].length;
		debugger;
		for(var x=0;x<map.length;x++)
		for(var y=0;y<map[x].length;y++)
		{
			var img = Terrain_Data.TERRE[map[x][y]].Sprite.Image();
			Terrain_Data.TERRE[map[x][y]].Sprite.Draw(canvas,xOffset+x*tileWidth,yOffset+y*tileHeight,.1);
		}
	};
	this.Terrain = function(num)
	{
		return LevelData.Terrain[num];
	};
	this.Names = function(num)
	{
		return LevelData.Names[num];
	};
	this.Players = function(num)
	{
		return LevelData.Players[num];
	};
	this.From_Name = function(name)
	{
		for(var i in LevelData.Names)
		{
			if(LevelData.Names[i]==name)
			{
				return i;
			}
		}
	}
	this.Units = function(num)
	{
		return LevelData.Units[num];
	};
	this.Rows = function(num)
	{
		return LevelData.Terrain[num].length;
	};
	this.Cols = function(num)
	{
		return LevelData.Terrain[num][0].length;
	};
	this.Run = function(Game, lvl)
	{
		if(!Levels.Unlocked(lvl))
			return;
		Game.Name = LevelData.Names[lvl];
		LevelData.Start(Game, lvl);
	}
	this.Unlocked = function(num)
	{
		return (num<=unlocked_levels);
	};
	this.Current = function()
	{
		return unlocked_levels;
	};
	this.Next = function()
	{
		return ++unlocked_levels;
	}
};
var Levels = new Levels_Class();