function Sound_list_class(LOCATION)
{
	var SND_LOC = "./sounds/"+LOCATION;
	var muted = false;
	function Sound_Class(src,name,loop,buff,auto,callback)
	{
		var snd;
		var _onplay = function(){};
		var _onend = function(){};
		if(src.Play)
		{
			snd = new Howl({
				urls:[src.Source()],
				buffer:buff,
				autoplay:auto,
				loop:loop,
				onplay:function(){
					_onplay();
				},
				onend:function(){
					_onend();
				},
				onload:function(){
					callback();
				}
			});
		}
		else
		{
			snd = new Howl({
				urls:[SND_LOC+src+'.wav', SND_LOC+src+'.ogg'],
				buffer:buff,
				autoplay:auto,
				loop:loop,
				onplay:function(){
					_onplay();
				},
				onend:function(){
					_onend();
				},
				onload:function(){
					callback();
				}
			});
		}
		this.Play = function(time, sprite, loop)
		{
			if(muted)return;
			snd.play(sprite, loop);
			if(time)setTimeout(function(){
				snd.stop();
			}, time);
		};
		this.Stop = function()
		{
			snd.stop();
		};
		this.Pause = function()
		{
			snd.pause();
		};
		this.On_Play = function(fnc)
		{
			_onplay = fnc;
		};
		this.On_End = function(fnc)
		{
			_onend = fnc;
		};
		this.Loaded = function()
		{
			return snd._loaded;
		};
		this.Howl = function()
		{
			return snd;
		};
		this.Source = function()
		{
			return snd._src;
		};
		this.Name = function()
		{
			return name;
		};
	}

	var Sounds = [];
	var total_snds=0,loaded_snds=0;
	this.Declare = function(src,name,buff,loop,auto)
	{
		for(var i in Sounds)
		{
			if(name==i)
			{
				console.error("Sound already declared with the name "+name);
				return;
			}
		}
		total_snds++;
		Sounds[name] = new Sound_Class(src,name,loop,buff,auto,function(){
			loaded_snds++;
		});
		return Sounds[name];
	};
	this.Delete = function(name)
	{
		return Core.Remove_Array_Index(Sounds,name);
	};
	this.Retrieve = function(name)
	{
		for(var i in Sounds)
		{
			if(name==i)
			{
				return Sounds[name];
			}
		}
		return null;
	};

	this.Mute = function(input)
	{
		if(input==null)
			muted = true;
		else muted = input;
	};

	this.Done = function()
	{
		return (total_snds==loaded_snds);
	};
	this.Progress = function()
	{
		return loaded_snds/total_snds;
	};
	this.Empty = function()
	{
		total_snds = 0;
		loaded_snds = 0;
		Sounds = [];
	};
};

var SFXs = new Sound_list_class('sfx/');
var Music = new Sound_list_class('music/');