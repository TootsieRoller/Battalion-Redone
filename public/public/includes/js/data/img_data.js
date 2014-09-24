var _IMAGE_LIST = [];
var BLANKIMG = Images.Declare("Misc/empty.png","empty");
Images.Declare("Misc/idle_overlay.png","Idle Overlay");
Images.Declare("Misc/lock_icon.png","Locked");
Images.Declare("Icons/flag_base.png","Flag Base");
Images.Declare("Icons/white flag.png","White Flag");
Images.Declare("Icons/red flag.png","Red Flag");
Images.Declare("Icons/blue flag.png","Blue Flag");
Images.Declare("Icons/green flag.png","Green Flag");
Images.Declare("Icons/yellow flag.png","Yellow Flag");
var ERRORIMG = Images.Declare("Misc/ERROR.png","ERROR");
var temp = Images.Declare("Misc/fireball.png","Explosion");
temp.Stretch(true);

Images.Declare("Icons/heart.png","Heart");

_IMAGE_LIST[0] = Images.Declare("Misc/SelectAni0.png","SELECT0");
_IMAGE_LIST[1] = Images.Declare("Misc/SelectAni1.png","SELECT1");
var Select_Animation = Animations.Declare(_IMAGE_LIST, "Select", 30, true);

Canvas.Add_Ticker(function(){
	Animations.Increment();
});