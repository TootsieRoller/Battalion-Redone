var Char_Data = {
	CHARS:[],
	TypeToStr:["Ground","Air","Sea"],
	SortByType:[[],[],[]],
	MoveToStr:["Foot","Wheel","Tank","Low Air","Medium Air","High Air","Surface Water","Submerged","Immoveable"],
	SortByMove:[[],[],[],[],[],[],[],[],[]],
	Get:function(check)
	{
		for(var i=1;i<Char_Data.CHARS.length;i++)
		{
			if(check==Char_Data.CHARS[i].Name)
			{
				return i;
			}
		}
		return 0;
	},
	Reverse_Get:function(index)
	{
		if(index<Char_Data.CHARS.length)
		return CHARS[index];
	}
};

// idea -> jammers should be stealthed

var COMMON_RANGE = [1,1];
var CURCHAR = 0;
var CURMODS = Mod_List.Units;
Char_Data.CHARS[CURCHAR++] = {
	Name:"ERROR",
	Description:"ERROR",
	Type:0,
	Max_Health:0,
	Armor:0,
	Power:0,
	Weapon:0,
	Movement:0,
	Move_Type:0,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:0,
	Actions:[],
	Actable:true,
	Modifiers:[],
	Sprite:[ERRORIMG,ERRORIMG,ERRORIMG],
	AttackSFX:null,
	MoveSFX:null,
	X:[0,0,0],
	Y:[0,0,0]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Strike Commando",
	Description:"Basic land unit",
	Type:0,
	Max_Health:40,
	Armor:0,
	Power:20,
	Weapon:0,
	Movement:3,
	Move_Type:0,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:75,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Start_Turn.Capture,CURMODS.Move.Tracking],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('machine gun'),
	MoveSFX:SFXs.Retrieve('footstep'),
	X:[20,20,20],
	Y:[13,13,13]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Heavy Commando",
	Description:"Basic land unit",
	Type:0,
	Max_Health:40,
	Armor:0,
	Power:35,
	Weapon:2,
	Movement:3,
	Move_Type:0,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:100,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Start_Turn.Capture,CURMODS.Move.Tracking],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('gun shot'),
	MoveSFX:SFXs.Retrieve('footstep'),
	X:[14,20,20],
	Y:[13,13,13]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Jammer Truck",
	Description:"Stops air units from entering jammed area and uncloaks hidden units",
	Type:0,
	Max_Health:50,
	Armor:0,
	Power:0,
	Weapon:0,
	Movement:5,
	Move_Type:1,
	Slow:false,
	Range:[1,2], // enemies attacked will be partially disabled
	Cost:300,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Move.Radar,CURMODS.Idle.Jamming],
	Sprite:[],
	AttackSFX:null,
	MoveSFX:SFXs.Retrieve('car engine'),
	X:[2,15,7],
	Y:[5,7,7],
	Additional_Display:function(canvas, x, y){
		canvas.globalAlpha = .3;
		canvas.fillStyle = "#AAA";
		canvas.fillRect(x-TILESIZE,y-TILESIZE,TILESIZE*3,TILESIZE*3);
		canvas.fillRect(x-TILESIZE*2,y,TILESIZE,TILESIZE);
		canvas.fillRect(x+TILESIZE*2,y,TILESIZE,TILESIZE);
		canvas.fillRect(x,y-TILESIZE*2,TILESIZE,TILESIZE);
		canvas.fillRect(x,y+TILESIZE*2,TILESIZE,TILESIZE);
		canvas.globalAlpha = .4;
		canvas.strokeStyle = "#EEE";
		canvas.strokeWidth = 3;
		canvas.beginPath();
		canvas.moveTo(x-TILESIZE,y-TILESIZE);
		canvas.lineTo(x,y-TILESIZE);
		canvas.lineTo(x,y-TILESIZE*2);
		canvas.lineTo(x+TILESIZE,y-TILESIZE*2);
		canvas.lineTo(x+TILESIZE,y-TILESIZE);
		canvas.lineTo(x+TILESIZE*2,y-TILESIZE);
		canvas.lineTo(x+TILESIZE*2,y);
		canvas.lineTo(x+TILESIZE*3,y);
		canvas.lineTo(x+TILESIZE*3,y+TILESIZE);
		canvas.lineTo(x+TILESIZE*2,y+TILESIZE);
		canvas.lineTo(x+TILESIZE*2,y+TILESIZE*2);
		canvas.lineTo(x+TILESIZE,y+TILESIZE*2);
		canvas.lineTo(x+TILESIZE,y+TILESIZE*3);
		canvas.lineTo(x,y+TILESIZE*3);
		canvas.lineTo(x,y+TILESIZE*2);
		canvas.lineTo(x-TILESIZE,y+TILESIZE*2);
		canvas.lineTo(x-TILESIZE,y+TILESIZE);
		canvas.lineTo(x-TILESIZE*2,y+TILESIZE);
		canvas.lineTo(x-TILESIZE*2,y);
		canvas.lineTo(x-TILESIZE,y);
		canvas.lineTo(x-TILESIZE,y-TILESIZE);
		canvas.closePath();
		canvas.stroke();
	}
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Mortar Truck",
	Description:"Heavy distanced attack but with short range",
	Type:0,
	Max_Health:50,
	Armor:0,
	Power:48,
	Weapon:1,
	Movement:5,
	Move_Type:1,
	Slow:true,
	Range:[2,3],
	Cost:285,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Can_Attack.Counter_Range],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('attack'),
	MoveSFX:SFXs.Retrieve('car engine'),
	X:[2,15,15],
	Y:[5,2,7]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Rocket Truck",
	Description:"Weaker distanced attack but with long range",
	Type:0,
	Max_Health:40,
	Armor:0,
	Power:40,
	Weapon:2,
	Movement:6,
	Move_Type:1,
	Slow:true,
	Range:[3,5],
	Cost:470,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Can_Attack.Counter_Range],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('attack'),
	MoveSFX:SFXs.Retrieve('car engine'),
	X:[2,17,15],
	Y:[5,6,7]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Flak Tank",
	Description:"Very effective against air units",
	Type:0,
	Max_Health:70,
	Armor:1,
	Power:17,
	Weapon:0,
	Movement:6,
	Move_Type:2,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:240,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Can_Attack.Air_Raid,CURMODS.Damage.Flak],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('machine gun'),
	MoveSFX:SFXs.Retrieve('car engine'),
	X:[7,12,12],
	Y:[5,4,7]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Scorpion Tank",
	Description:"Basic tank unit",
	Type:0,
	Max_Health:70,
	Armor:1,
	Power:35,
	Weapon:1,
	Movement:6,
	Move_Type:2,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:270,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Damage.Fast_Attack],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('gun shot'),
	MoveSFX:SFXs.Retrieve('car engine'),
	X:[8,12,12],
	Y:[15,4,7]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Stealth Tank",
	Description:"Can hide itself",
	Type:0,
	Max_Health:40,
	Armor:1,
	Power:30,
	Weapon:0,
	Movement:5,
	Move_Type:2,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:340,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.End_Turn.Cloak],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('gun shot'),
	MoveSFX:SFXs.Retrieve('car engine'),
	X:[8,12,12],
	Y:[10,7,7]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Spider Tank",
	Description:"Can climb mountains",
	Type:0,
	Max_Health:70,
	Armor:1,
	Power:55,
	Weapon:1,
	Movement:4,
	Move_Type:2,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:250,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Attack.Stun],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('gun shot'),
	MoveSFX:SFXs.Retrieve('footstep'),
	X:[9,12,12],
	Y:[11,7,7]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Lance Tank",
	Description:"Can hit space directly behind enemy",
	Type:0,
	Max_Health:70,
	Armor:1,
	Power:35,
	Weapon:1,
	Movement:6,
	Move_Type:2,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:270,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Attack.Lance],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('gun shot'),
	MoveSFX:SFXs.Retrieve('car engine'),
	X:[5,12,12],
	Y:[10,4,7]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Annihilator Tank",
	Description:"Massive tank",
	Type:0,
	Max_Health:140,
	Armor:2,
	Power:70,
	Weapon:2,
	Movement:4,
	Move_Type:2,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:525,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Damage.Slow_Attack],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('attack'),
	MoveSFX:SFXs.Retrieve('car engine'),
	X:[3,3,0],
	Y:[3,4,0]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Warmachine",
	Description:"Creates other units",
	Type:0,
	Max_Health:75,
	Armor:1,
	Power:60,
	Weapon:2,
	Movement:3,
	Move_Type:2,
	Slow:true,
	Range:[2,2],
	Cost:525,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Self_Action.Miner,CURMODS.Self_Action.Builder],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('attack'),
	MoveSFX:SFXs.Retrieve('car engine'),
	X:[2,0,0],
	Y:[-17,-17,-10]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Blockade",
	Description:"Cannot move or attack, but enemies cannot cross",
	Type:0,
	Max_Health:70,
	Armor:1,
	Power:0,
	Weapon:0,
	Movement:0,
	Move_Type:8,
	Slow:true,
	Range:[0,0],
	Cost:0,
	Actions:[],
	Actable:false,
	Modifiers:[CURMODS.Self_Action.Irreparable],
	Sprite:[],
	AttackSFX:null,
	MoveSFX:null,
	X:[3,3,3],
	Y:[5,5,5]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Turret",
	Description:"Basic turret unit",
	Type:0,
	Max_Health:100,
	Armor:1,
	Power:40,
	Weapon:1,
	Movement:0,
	Move_Type:8,
	Slow:true,
	Range:[2,5],
	Cost:0,
	Actions:[],
	Actable:true,
	Modifiers:[],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('gun shot'),
	MoveSFX:null,
	X:[4,4,4],
	Y:[5,5,5]
};

Char_Data.CHARS[CURCHAR++] = {
	Name:"Raptor Fighter",
	Description:"Basic air unit",
	Type:1,
	Max_Health:50,
	Armor:0,
	Power:25,
	Weapon:0,
	Movement:8,
	Move_Type:4,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:235,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Self_Action.Irreparable,CURMODS.Can_Attack.Air_Raid],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('machine gun'),
	MoveSFX:SFXs.Retrieve('jet'),
	X:[7,0,4],
	Y:[7,0,5]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Condor Bomber",
	Description:"Drops bombs of massive damage",
	Type:1,
	Max_Health:72,
	Armor:1,
	Power:70,
	Weapon:2,
	Movement:4,
	Move_Type:4,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:600,
	Actions:[],
	Actable:true,
	Modifiers:[],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('attack'),
	MoveSFX:SFXs.Retrieve('air'),
	X:[2,3,7],
	Y:[4,3,7]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Vulture Drone",
	Description:"Can move again if attack kills",
	Type:1,
	Max_Health:55,
	Armor:1,
	Power:30,
	Weapon:1,
	Movement:5,
	Move_Type:3,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:550,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Attack.Vulture],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('machine gun'),
	MoveSFX:SFXs.Retrieve('jet'),
	X:[7,6,7],
	Y:[10,7,7]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Transporter",
	Description:"Can transport a non-air unit through the air",
	Type:1,
	Max_Health:50,
	Armor:0,
	Power:0,
	Weapon:0,
	Movement:6,
	Move_Type:3,
	Slow:true,
	Range:[0,0],
	Cost:0,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Self_Action.Transport],
	Sprite:[],
	AttackSFX:null,
	MoveSFX:SFXs.Retrieve('air'),
	X:[0,0,0],
	Y:[0,0,0]
};

Char_Data.CHARS[CURCHAR++] = {
	Name:"Intrepid",
	Description:"Can capture sea buildings",
	Type:2,
	Max_Health:50,
	Armor:0,
	Power:15,
	Weapon:0,
	Movement:6,
	Move_Type:6,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:200,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Start_Turn.Capture,CURMODS.Move.Tracking],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('machine gun'),
	MoveSFX:SFXs.Retrieve('boat'),
	X:[0,0,0],
	Y:[0,0,0]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Hunter Support",
	Description:"Can attack air units",
	Type:2,
	Max_Health:90,
	Armor:1,
	Power:17,
	Weapon:0,
	Movement:5,
	Move_Type:6,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:450,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Can_Attack.Air_Raid,CURMODS.Damage.Flak],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('attack'),
	MoveSFX:SFXs.Retrieve('boat'),
	X:[0,0,0],
	Y:[0,0,0]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Corvette",
	Description:"Basic sea unit",
	Type:2,
	Max_Health:90,
	Armor:1,
	Power:45,
	Weapon:1,
	Movement:5,
	Move_Type:6,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:500,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.Damage.Fast_Attack],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('attack'),
	MoveSFX:SFXs.Retrieve('boat'),
	X:[0,0,0],
	Y:[0,0,0]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"Battle Cruiser",
	Description:"Can attack from the farthest distance in the game",
	Type:2,
	Max_Health:140,
	Armor:2,
	Power:55,
	Weapon:2,
	Movement:4,
	Move_Type:6,
	Slow:true,
	Range:[2,6],
	Cost:800,
	Actions:[],
	Actable:true,
	Modifiers:[],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('attack'),
	MoveSFX:SFXs.Retrieve('boat'),
	X:[0,0,0],
	Y:[0,0,0]
};
Char_Data.CHARS[CURCHAR++] = {
	Name:"U-Boat",
	Description:"Can hide underwater",
	Type:2,
	Max_Health:25,
	Armor:0,
	Power:35,
	Weapon:2,
	Movement:4,
	Move_Type:7,
	Slow:false,
	Range:COMMON_RANGE,
	Cost:475,
	Actions:[],
	Actable:true,
	Modifiers:[CURMODS.End_Turn.Cloak],
	Sprite:[],
	AttackSFX:SFXs.Retrieve('attack'),
	MoveSFX:SFXs.Retrieve('boat'),
	X:[0,0,0],
	Y:[0,0,0]
};

	/** Simple set for common data */
for(var x=1;x<Char_Data.CHARS.length;x++)
{
	var _c = Char_Data.CHARS[x];
		// setting sprites
	_c.Sprite[0] = Images.Declare("Units/"+_c.Name+".png",_c.Name);
	_c.Sprite[1] = Images.Declare("Units/up/"+_c.Name+".png",_c.Name+" Up");
	_c.Sprite[2] = Images.Declare("Units/down/"+_c.Name+".png",_c.Name+" Down");
	Char_Data.SortByType[_c.Type].push(x);
	Char_Data.SortByMove[_c.Move_Type].push(x);
	if(_c.Modifiers.length>0)
	{
		// writing descriptions
		for(var i=1;i<_c.Modifiers.length;i++)
		{
			// _c.Description+=_c.Modifiers[i].Name()+", ";
		}
		// _c.Description+=_c.Modifiers[0].Name();
	}
}