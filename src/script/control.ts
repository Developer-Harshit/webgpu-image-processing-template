import { Picture } from "./Picture";
import { msg } from "./debug";
import { Renderer } from "./renderer";

const my_selectors = {
	file: document.querySelector("input") as HTMLInputElement,
	link: document.querySelector("a") as HTMLAnchorElement,
	start: document.querySelector("button") as HTMLButtonElement,
	input: document.querySelector("#input-image") as HTMLImageElement,
	output: document.querySelector("#output-image") as HTMLImageElement,
};

export class App {
	img: HTMLImageElement;
	cnv: HTMLCanvasElement;
	renderer: Renderer;
	pic: Picture;
	constructor() {
		this.cnv = document.createElement("canvas");
		this.img = document.createElement("img");
		this.renderer = new Renderer(this.cnv);
		this.pic = new Picture();
	}

	async run() {
		my_selectors.start.disabled = true;
		this.renderer.set_picture(this.pic);
		msg("got input image");
		await this.pic.init(this.renderer.device, my_selectors.input.src);
		this.renderer.resize_to_picture(Math.max(innerHeight, innerWidth) * 0.8);
		msg("got assets");
		await this.renderer.make_pipeline();
		this.set_output();
		this.renderer.render();
		msg("Rendered");
		this.display_output();
	}
	set_output(url = "") {
		my_selectors.output.src = url;
		my_selectors.link.href = url;
	}
	handle_start() {
		my_selectors.start.addEventListener("click", () => {
			this.run().then(() => {
				msg("Displaying output");
				this.display_output();
			});
		});
	}

	handle_upload() {
		my_selectors.input.addEventListener("load", () => {
			my_selectors.start.disabled = false;
			msg("loaded image");
		});

		my_selectors.file.addEventListener("input", () => {
			const file = my_selectors.file.files[0];
			if (!file) return msg("file not valid");
			const url = URL.createObjectURL(file);
			my_selectors.input.src = url;
			my_selectors.file.value = null;
			console.dir(my_selectors.file);
		});
	}
	display_output() {
		this.cnv.toBlob(
			(blob) => {
				if (!blob) return msg("Failed to convert into blob");
				const url = URL.createObjectURL(blob);
				this.set_output(url);
			},
			"image/png",
			1.0
		);
	}

	async init() {
		my_selectors.start.disabled = true;
		msg("loading");
		await this.renderer.setup_device();
		msg("setted device");
		this.handle_start();
		this.handle_upload();
		msg("initilized");
		my_selectors.start.disabled = false;
	}
}
