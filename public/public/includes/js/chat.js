document.getElementById('inputMessage').onkeypress = function(event){
	if(event.keyCode==13&&this.value!='')
	{
		window.parent.send_chat(this.value);
		this.value = "";
	}
};

function add_msg(sender, text)
{
	var output = document.getElementById('chat'),
		msg_node = document.createElement('div'),
		txt_node = document.createElement('div'),
		name_node = document.createElement('div');
	name_node.innerHTML = sender;
	txt_node.innerHTML = ': '+text;
	msg_node.setAttribute('class','messageContainer');
	name_node.setAttribute('class','username');
	txt_node.setAttribute('class','msgContent');
	msg_node.appendChild(name_node);
	msg_node.appendChild(txt_node);
	output.appendChild(msg_node);
}