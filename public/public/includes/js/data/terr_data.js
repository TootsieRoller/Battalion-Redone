var Terrain_Data = {
	TERRE:[],
	TypeToStr:["Dirty","Rough","Rugged","Clean","Hole-y","Slippery","Sea"],
	Get:function(check)
	{
		for(var i=0;i<Terrain_Data.TERRE.length;i++)
		{
			if(check==Terrain_Data.TERRE[i].Name)
			{
				return i;
			}
		}
		return 0;
	},
	Reverse_Get:function(index)
	{
		if(index<Terrain_Data.TERRE.length)
		return TERRE[index];
	}
};

var CURTERRE = 0;
var CURMODS = Mod_List.Terrain;
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"ERROR",
	Description:"ERROR",
	Type:0,
	Protection:0,
	Damage:0,
	Height:0,
	Drag:0,
	Modifiers:[],
	Sprite:ERRORIMG,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Plains",
	Description:"Basic terrain",
	Type:0,
	Protection:.1,
	Damage:0,
	Height:0,
	Drag:1,
	Modifiers:[],
	Sprite:null,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Hill",
	Description:"Gives ranged units an extended range",
	Type:1,
	Protection:.2,
	Damage:0,
	Height:20,
	Drag:2,
	Modifiers:[CURMODS.Properties.Extra_Sight],
	Sprite:null,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Forest",
	Description:"Gives defense boost",
	Type:1,
	Protection:.2,
	Damage:0,
	Height:0,
	Drag:2,
	Modifiers:[],
	Sprite:null,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Mountain",
	Description:"Hard to traverse but gives strong defense",
	Type:2,
	Protection:.4,
	Damage:0,
	Height:50,
	Drag:2,
	Modifiers:[],
	Sprite:null,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Road",
	Description:"Easy to traverse but provides no defense",
	Type:3,
	Protection:0,
	Damage:0,
	Height:0,
	Drag:1,
	Modifiers:[],
	Sprite:null,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Canyon",
	Description:"Dips down, but ranged units cannot target here",
	Type:5,
	Protection:0,
	Damage:0,
	Height:-10,
	Drag:1,
	Modifiers:[CURMODS.Properties.Extra_Sight],
	Sprite:null,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Wasteland",
	Description:"Provides lots of defense, but costs health to rest on.",
	Type:0,
	Protection:.5,
	Damage:-20,
	Height:0,
	Drag:1,
	Modifiers:[],
	Sprite:null,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Volcano",
	Description:"Impassable",
	Type:7,
	Protection:0,
	Damage:0,
	Height:0,
	Drag:100,
	Modifiers:[],
	Sprite:null,
	X:0,
	Y:-34
};
// also needs enriched and depleted implementation
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Ore Deposit",
	Description:"Can be mined for money",
	Type:4,
	Protection:0,
	Damage:0,
	Height:0,
	Drag:1,
	Modifiers:[],
	Sprite:null,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Sea",
	Description:"Basic sea terrain",
	Type:6,//0
	Protection:0,
	Damage:0,
	Height:0,
	Drag:1,
	Modifiers:[],
	Sprite:null,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Reef",
	Description:"Hard to traverse sea terrain",
	Type:6,//5
	Protection:.1,
	Damage:0,
	Height:0,
	Drag:2,
	Modifiers:[],
	Sprite:null,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Archipelago",
	Description:"Rough sea terrain",
	Type:6,//1
	Protection:.2,
	Damage:0,
	Height:0,
	Drag:2,
	Modifiers:[],
	Sprite:null,
	X:0,
	Y:0
};
Terrain_Data.TERRE[CURTERRE++] = {
	Name:"Rock Formation",
	Description:"Rocky sea terrain",
	Type:6,//2
	Protection:.7,
	Damage:-20,
	Height:0,
	Drag:2,
	Modifiers:[],
	Sprite:null,
	X:0,
	Y:0
};

	/** Simple set for common data */
for(var x=1;x<Terrain_Data.TERRE.length;x++)
{
	// setting sprites
	var _t = Terrain_Data.TERRE[x];
	_t.Sprite = Images.Declare("Terrain/"+_t.Name+".png",_t.Name);
	// _t.Sprite.Stretch(true);
	if(_t.Modifiers.length>0)
	{
		// writing descriptions
		for(var i=1;i<_t.Modifiers.length;i++)
		{
			// _t.Description+=_t.Modifiers[i].Name()+", ";
		}
		// _t.Description+=_t.Modifiers[0].Name();
	}
}