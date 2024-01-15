import { check } from "./script/debug";
import { Renderer } from "./script/renderer";

async function start() {
	let cnv: HTMLCanvasElement = document.querySelector("canvas");
	let renderer: Renderer = new Renderer(cnv);
	await renderer.init();
	renderer.resize_to_picture(innerWidth * 0.6);
	window.onresize = () => {
		renderer.resize_to_picture(innerWidth * 0.6);
	};
	renderer.render();

	renderer.isrunning = false;
}
check();

window.onload = start;
