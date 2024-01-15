const msgDiv = document.getElementById("msg");
const textDiv = document.getElementById("msg");
export function msg(text: any) {
	if (!msgDiv) return console.log("Message div not defined");
	textDiv.innerHTML = `<p id="msg">${text}</p>` + textDiv.innerHTML;
}

export function check() {
	if (navigator.gpu) msg("supported");
	else msg("not supported");
}
