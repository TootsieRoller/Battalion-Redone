var signupShown = false;
var title = document.getElementById('title');
var data = document.getElementById('data_contents');
var user = document.getElementById('username');
var pass = document.getElementById('pass');
var btn = document.getElementById('btnSignup');
var error = document.getElementById('error');

var report = function(err){
	error.style.display = 'inline';
	error.innerHTML = err;
}

function openSignup(){
	if(signupShown){
		title.innerHTML = 'Logging in...';
		signupShown = false;
		btn.value = 'Sign up';
	}else{
		title.innerHTML = 'Signning up...';
		signupShown = true;
		btn.value = 'Log in';
	}
}

function sendMsgBtn(){
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