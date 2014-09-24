var Route_Class = function(input)
{
	var route = [];
	var view = 0;
	if(input!=null)
	{
		for(var i=0;i<input.length;i++)
		{
			route[i] = input[i];
		}
	}

	this.next = function()
	{
		return route[view++];
	};
	this.refresh = function()
	{
		view = 0;
	};
	this.clone = function()
	{
		return new Route_Class(route);
	};
	this.add = function(input)
	{
		route[route.length] = input;
	};
};

var Path_Finder_Class = function(game, unit, x, y, moves, from, dir)
{
	this.Good = false;
	if(moves<0)return;
	if(!game.Terrain_Map.In_Range(x,y))return;
	var occupied = game.Units_Map.At(x,y);
	if(occupied!=null)
	{
		if(moves==0)return;
		if(occupied.Player!=unit.Player)return;
	}
	var back = from;
	while(back!=null)
	{
		if(back.X==x&&back.Y==y)return;
		back = back.Back;
	}
	this.Good = true;
	this.Back = from;

	var move_loss;
	if(from!=null)
	{
		move_loss = unit.Calculate_Move_Cost(game.Terrain_Map.At(x,y));
		if(move_loss>moves)return;
		from.Add_End(this);
		this.Route = from.Route.clone();
		this.Route.add(dir);
	}
	else
	{
		this.Route = new Route_Class();
		move_loss = 0;
	}

	this.X = x;
	this.Y = y;
	this.Moves_Left = moves-move_loss;

	this.ends = [this];
	this.Add_End = function(input)
	{
		this.ends[this.ends.length] = input;
		if(from!=null)from.Add_End(input);
	};

	this.Up = new Path_Finder_Class(game, unit, x, y-1, this.Moves_Left, this, 0);
	this.Down = new Path_Finder_Class(game, unit, x, y+1, this.Moves_Left, this, 1);
	this.Left = new Path_Finder_Class(game, unit, x-1, y, this.Moves_Left, this, 2);
	this.Right = new Path_Finder_Class(game, unit, x+1, y, this.Moves_Left, this, 3);
};

var Path_Finder_Handler = function(game, unit, x, y)
{
	var origin = new Path_Finder_Class(game, unit, x, y, unit.Movement);
	var ends = origin.ends;
	var spaces = [];
	var attacks = [];
	var attack_offsets =  Core.Target.Diamond(unit.Range[1], unit.Range[0], false);
	function in_range(x, y)
	{
		return game.Terrain_Map.In_Range(x,y);
	}
	function contains(arr, x, y)
	{
		for(var i=0;i<arr.length;i++)
		{
			if(x==arr[i][0]&&y==arr[i][1])return true;
		}
		return false;
	}
	function add_unique_pos(arr, x, y)
	{
		if(!in_range(x, y))return;
		if(contains(arr, x, y))return;
		arr.push([x,y]);
	}
	function attack_range(x, y)
	{
		for(var i=0;i<attack_offsets.length;i++)
		{
			add_unique_pos(attacks, x+attack_offsets[i][0], y+attack_offsets[i][1]);
		}
	}
	attack_range(x,y);
	if(ends!=null)
	{
		for(var i=0;i<ends.length;i++)
		{
			var cur = ends[i];
			if(cur.Good)
			{
				add_unique_pos(spaces, cur.X, cur.Y);
				if(!unit.Slow_Attack)
				{
					attack_range(cur.X, cur.Y);
				}
			}
		}
	}

	function get_routes(x, y)
	{
		var r = [];
		for(var i=0;i<ends.length;i++)
		{
			if(ends[i].Good)
			{
				if(ends[i].X==x&&ends[i].Y==y)
				{
					r[r.length] = i;
				}
			}
		}
		return r;
	}
	this.Shortest_Route = function(x, y)
	{
		if(ends==null)return null;
		var r = get_routes(x,y);
		if(r.length==0)return -1;
		var max = 0;
		for(var i=1;i<r.length;i++)
		{
			if(ends[r[i]].Moves_Left>ends[r[max]].Moves_Left)
			{
				max = i;
			}
		}
		return ends[r[max]];
	};
	this.All_Movable_Spaces = function()
	{
		return spaces;
	};
	this.Attackables = function()
	{
		return attacks;
	};
	this.Can_Move = function(x, y)
	{
		return contains(spaces, x, y);
	};
	this.Attackable = function(x, y)
	{
		return contains(attacks, x, y);
	};
};

var Move_Class = function(unit, start_x, start_y, terrain, changed)
{
	var line_of_tiles = [[start_x,start_y]];
	var moves = 0;
	var max_move = unit.Movement;
	var squares = 0;
	var view = 0;
	this.Restart = function(){view = 0;};
	this.Next = function()
	{
		if(view==squares)return -1;
		var cur = line_of_tiles[view];
		var next = line_of_tiles[view+1];
		var temp = adjacent(cur[0],cur[1],next[0],next[1]);
		view++;
		return temp;
	};
	this.Get = function(i)
	{
		if(i>=line_of_tiles.length)return null;
		return line_of_tiles[i];
	};
	this.Moves = function()
	{
		return squares;
	};
	function adjacent(x1,y1,x2,y2)
	{
		if(x1==x2&&Math.abs(y1-y2)==1)
		{
			if(y1+1==y2)return 0; // down
			return 1; // up
		}
		else if(y1==y2&&Math.abs(x1-x2)==1)
		{
			if(x1+1==x2)return 2; // right
			return 3; // left
		}
		return -1;
	}
	function move_cost(x,y)
	{
		return unit.Calculate_Move_Cost(terrain.At(x,y));
	}
	function cut(len)
	{
		var temp = [[start_x,start_y]];
		moves = 0;
		var i=1;
		for(;i<len;i++)
		{
			temp[i] = line_of_tiles[i];
			moves+=move_cost(line_of_tiles[i][0],line_of_tiles[i][1]);
		}
		squares = i-1;
		line_of_tiles = temp;
		if(changed!=null)
			changed(line_of_tiles);
	};
	function shortest(x, y)
	{
		var path = unit.Current_Path().Shortest_Route(x,y);
		var route = path.Route;
		cut(0);
		route.refresh();
		var cur = route.next();
		for(var last=0;cur!=null;last++)
		{
			var pos = line_of_tiles[last];
			if(cur==0){
				line_of_tiles[line_of_tiles.length] = [pos[0],pos[1]-1];
			}else if(cur==1){
				line_of_tiles[line_of_tiles.length] = [pos[0],pos[1]+1];
			}else if(cur==2){
				line_of_tiles[line_of_tiles.length] = [pos[0]-1,pos[1]];
			}else if(cur==3){
				line_of_tiles[line_of_tiles.length] = [pos[0]+1,pos[1]];
			}
			moves = squares;
			cur = route.next();
		}
		squares = line_of_tiles.length-1;
		moves = unit.Movement-path.Moves_Left;
		if(changed!=null)
			changed(line_of_tiles);
	}
	this.Path = function()
	{
		var path = [];
		var arr = line_of_tiles;
		for(var i=1;i<arr.length;i++)
		{
			path.push(adjacent(arr[i-1][0],arr[i-1][1],arr[i][0],arr[i][1]));
		}
		return path;
	};
	this.Add = function(x, y)
	{
		for(var i=0;i<line_of_tiles.length-1;i++)
		{
			if(line_of_tiles[i][0]==x&&line_of_tiles[i][1]==y)
			{
				cut(i+1);
				return;
			}
		}
		if(line_of_tiles[squares][0]==x&&line_of_tiles[squares][1]==y)return;
		if(!unit.Current_Path().Can_Move(x,y))
		{
			if(unit.Slow_Attack)
				this.Wipe();
			return;
		}
		var ad = adjacent(line_of_tiles[squares][0],line_of_tiles[squares][1],x,y);
		if(~ad)
		{
			var temp = moves+move_cost(x,y);
			if(temp>unit.Movement)
			{
				shortest(x, y);
				return;
			}
			moves = temp;
			line_of_tiles[++squares] = [x,y];
			if(changed!=null)
				changed(line_of_tiles);
			return;
		}
		else
		{
			shortest(x, y);
			return;
		}
		return;
	};
	this.Hide = function()
	{
		if(changed!=null)
			changed([]);
	};
	this.Wipe = function()
	{
		line_of_tiles = [[start_x,start_y]];
		moves = 0;
		squares = 0;
		view = 0;
		if(changed!=null)
			changed([]);
	};
};