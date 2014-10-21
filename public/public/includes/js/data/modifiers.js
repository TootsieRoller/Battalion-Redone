var Mod_Class = function(name, act, type, arguments, desc)
{
	this.Name = name;
	this.Type = type;
	this.Description = desc;
	this.Args = arguments;
	this.Do = function(args)
	{
		return act(args);
	};
};

// search for '//check modifiers' in all docs
var Mod_List = {
	Units:{
		Idle:{
			Jamming:new Mod_Class("Jamming",function(){
			},"Idle",[""],"Enemy planes cannot enter and detects hidden stealth units within area")
		},
		Move:{
			Tracking:new Mod_Class("Tracking",function(){
				
			},"Move",[""],"attack stealth if ran into"),
			Radar:new Mod_Class("Radar",function(){
				
			},"Move",[""],"Detects stealth units at start of turn")
		},
		Attack:{
			Lance:new Mod_Class("Lance",function(unit){
				var lanced;
				if(unit.State==0)lanced = unit.Game.Units_Map.At(unit.X+2, unit.Y);
				else if(unit.State==1)lanced = unit.Game.Units_Map.At(unit.X, unit.Y-2);
				else if(unit.State==2)lanced = unit.Game.Units_Map.At(unit.X, unit.Y+2);
				else if(unit.State==3)lanced = unit.Game.Units_Map.At(unit.X-2, unit.Y);
				if(lanced!=null)unit.Attack(lanced);
			},"Attack","current unit","Can attack area directly behind the unit attacked when it initiates attack"),
			Vulture:new Mod_Class("Vulture",function(unit){
				if(unit.Killed!=null)
				{
					unit.Idle = false;
					unit.Set_Active(true);
				}
			},"Attack","current unit","Can move again if it kills an enemy unit"),
			Stun:new Mod_Class("Stun",function(unit){
				// if(unit.Attacking!=null)
					// unit.Attacking.Stunned = true;
			},"Attack","current unit","Can move again if it kills an enemy unit")
		},
		Start_Turn:{
			Capture:new Mod_Class("Capture",function(unit){
				var on_building = unit.Terrain().Building;
				if(on_building==null)return;
				if(on_building.Owner==unit.Player)return;
				var bonus = unit.Health/unit.Max_Health;
				//check modifiers raid
				on_building.Raid(unit,bonus*10);
			},"Start Turn","unit","Can capture buildings"),
			Repair:new Mod_Class("Repair",function(unit){
				unit.Health+=10;
				if(unit.Health>unit.Max_Health)
					unit.Health = unit.Max_Health;
			},"Start Turn","current unit","Heals self a little bit at the start of its turn")
		},
		End_Turn:{
			Cloak:new Mod_Class("Capture",function(unit){
			},"End Turn",[""],"Can use cloak if not by enemy unit at end of turn")
		},
		Self_Action:{
			Transport:new Mod_Class("Transport",function(unit){
			},"Self Action",[""],"Can move other units"),
			Builder:new Mod_Class("Builder",function(unit){
			},"Self Action",[""],"Can build other units"),
			Miner:new Mod_Class("Miner",function(unit){
			},"Self Action",[""],"Can mine ore"),
			Irreparable:new Mod_Class("Irreparable",function(unit){
			},"Self Action",[""],"Cannot repair unit--better look for a heal zone")
		},
		Can_Attack:{
			Counter_Range:new Mod_Class("Counter Range",function(args){
			},"Can Attack",["attacker","defender"],"Can counter ranged attacks"),
			Air_Raid:new Mod_Class("Air Raid",function(args){
				if(args[1].Unit_Type==1)return true;
			},"Can Attack",["attacker","defender"],"Can attack air units"),
			Bombard:new Mod_Class("Bombard",function(args){
				if(args[1].Unit_Type==2)return true;
			},"Can Attack",["attacker","defender"],"Can attack sea units")
		},
		Damage:{
			Flak:new Mod_Class("Flak",function(args){
				if(args[1].Armor==0)
					return 2;
				return 1;
			},"Damage",["attacker",["attacker","defender"]],"Deals 2x damage to light units"),
			Fast_Attack:new Mod_Class("Fast Attack",function(args){
				if(args[0].Attacking==args[1])
					return 1.2;
				return 1;
			},"Damage",["attacker",["attacker","defender"]],"20% more damage if it initializes attack"),
			Slow_Attack:new Mod_Class("Slow Attack",function(args){
				if(args[0].Attacking!=args[1])
					return 0.85;
				return 1;
			},"Damage",["attacker",["attacker","defender"]],"15% less damage on counter attack")
		},
		Path:{
		}
	},
	Buildings:{
		Capture:{
			Insta_Lose:new Mod_Class("Instant Lose",function(args){
				if(args[0].Owner!=null)
					args[0].Owner.Lose();
			},"Capture",["building","player capturing"],"If this building is lost, the owner automatically loses"),
			Insta_Win:new Mod_Class("Instant Win",function(args){
				args[1].Win();
			},"Capture",["building","player capturing"],"If this building is captured, the capturing team automatically wins"),
			Allow_Ground:new Mod_Class("Allow Ground",function(args){
				if(args[0].Owner!=null)
					args[0].Owner.Add_Control(0,false);
				args[1].Add_Control(0,true);
			},"Capture",["building","player capturing"],"Capturing this building allows for construction of ground units"),
			Allow_Air:new Mod_Class("Allow Air",function(args){
				if(args[0].Owner!=null)
					args[0].Owner.Add_Control(1,false);
				args[1].Add_Control(1,true);
			},"Capture",["building","player capturing"],"Capturing this building allows for construction of air units"),
			Allow_Sea:new Mod_Class("Allow Sea",function(args){
				if(args[0].Owner!=null)
					args[0].Owner.Add_Control(2,false);
				args[1].Add_Control(2,true);
			},"Capture",["building","player capturing"],"Capturing this building allows for construction of sea units")
		},
		Each_Turn:{
			Supply_Income:new Mod_Class("Supply Income",function(args){
				args[1].Income(args[0].Importance*12);
			},"Each Turn",["building","player"],"Gives money to the owned player each turn")
		},
		Start_Turn:{
		
		},
		End_Turn:{
		
		}
	},
	Terrain:{
		Properties:{
			Extra_Sight:new Mod_Class("Extra Sight",function(unit){
				if(unit.Range[1]>1)
				{
					unit.Range[1]++;
					unit.On_Move = function(unit, move){
						unit.Range[1]--;
						unit.On_Move = function(unit, move){};
					};
				}
			},"Properties","unit","Gives ranged units 1 extra sight")
		}
	}
};