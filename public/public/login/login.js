var signupShown = false;
var title = document.getElementById('title');
var data = document.getElementById('data_contents');
var user = document.getElementById('username');
var pass = document.getElementById('pass');
var btn = document.getElementById('btnSignup');
var error = document.getElementById('error');
var stayCheck = document.getElementById('staySignedOn');

var report = function(err){
	error.style.display = 'inline';
	error.innerHTML = err;
}

function eraseCookie(){
	document.cookie = "user;expires=-1";
	document.cookie = "pass;expires=-1";
}

window.parent.onFinishedLoading(function(){
	if(document.cookie){
		var cookies = document.cookie.split("; ");
		var cookUser,cookPass;
		for(var i in cookies){
			if(cookUser&&cookPass)break;
			var curCookie = cookies[i];
			if(curCookie.substr(0,4)=="user"){
				var equals = curCookie.indexOf('=');
				if(~equals){
					cookUser = curCookie.substr(equals+1);
				}
				continue;
			}
			if(curCookie.substr(0,4)=="pass"){
				var equals = curCookie.indexOf('=');
				if(~equals){
					cookPass = curCookie.substr(equals+1);
				}
				continue;
			}
		}
		if(cookUser&&cookPass){
			user.value = cookUser;
			pass.value = cookPass;
			login();
		}
	}
});

function openSignup(){
	if(signupShown){
		title.innerHTML = 'Logging in...';
		signupShown = false;
		btn.value = 'Sign up instead...';
	}else{
		title.innerHTML = 'Signning up...';
		signupShown = true;
		btn.value = 'Log in instead...';
	}
}

function sendMsgBtn(){
	if(stayCheck.checked){
		var date = new Date();
		date.setTime(date.getTime()+604800000);
		var expires = date.toGMTString();
		document.cookie = "user="+user.value+";expires="+expires+";path=/";
		document.cookie = "pass="+pass.value+";expires="+expires+";path=/";
	}
	if(signupShown)
		signup();
	else login();
}

function login(){
	if(!window.parent.validateSignup(user.value, pass.value)){
		report("invalid user info");
	}
	else window.parent.reportLoggedIn(user.value, pass.value, report);
}

function signup(){
	if(!window.parent.validateSignup(user.value, pass.value)){
		report("invalid user info");
	}
	else window.parent.reportNewUser(user.value, pass.value, report);
}