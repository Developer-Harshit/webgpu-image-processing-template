import shader from "../shader/shader.wgsl?raw";

import { Picture } from "./Picture";

export class Renderer {
	cnv: HTMLCanvasElement;

	// Device/Ctx objects
	adapter: GPUAdapter;
	device: GPUDevice;
	ctx: GPUCanvasContext;
	format: GPUTextureFormat;

	// Pipeline objects
	bindGroup: GPUBindGroup;

	pipeline: GPURenderPipeline;

	// assets
	picture: Picture;

	constructor(cnv: HTMLCanvasElement) {
		this.cnv = cnv;
	}
	async setup_device() {
		this.adapter = (await navigator.gpu.requestAdapter()) as GPUAdapter;
		this.device = (await this.adapter.requestDevice()) as GPUDevice;
		this.ctx = this.cnv.getContext("webgpu") as GPUCanvasContext;
		this.format = "bgra8unorm" as GPUTextureFormat;
		this.ctx.configure({
			device: this.device,
			format: this.format,
			alphaMode: "opaque",
		});
	}
	set_picture(pic: Picture) {
		this.picture = pic;
	}

	async make_pipeline() {
		const bindGroupLayout = this.device.createBindGroupLayout({
			entries: [
				// declaring texture
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {},
				},
				// declaring sampler
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: {},
				},
			],
		});

		this.bindGroup = this.device.createBindGroup({
			layout: bindGroupLayout,
			// actually passing buffer
			entries: [
				{
					binding: 0,
					resource: this.picture.get_view(),
				},
				{
					binding: 1,
					resource: this.picture.get_sampler(),
				},
			],
		});

		const pipelineLayout = this.device.createPipelineLayout({
			bindGroupLayouts: [bindGroupLayout],
		});
		this.pipeline = this.device.createRenderPipeline({
			layout: pipelineLayout,
			vertex: {
				module: this.device.createShaderModule({
					code: shader,
				}),
				entryPoint: "vs_main",
				buffers: [this.picture.get_layout()],
			},
			fragment: {
				module: this.device.createShaderModule({
					code: shader,
				}),
				entryPoint: "fs_main",
				targets: [
					{
						format: this.format,
					},
				],
			},
			primitive: {
				topology: "triangle-strip",
			},
		}) as GPURenderPipeline;
	}
	resize_to_picture(size: number) {
		if (size === 0) size = this.picture.dim.width;
		console.log("size", size);
		this.cnv.width = Math.round(size);
		this.cnv.height = Math.round(size / this.picture.get_aspect());
	}

	render() {
		const commandEncoder =
			this.device.createCommandEncoder() as GPUCommandEncoder;

		const textureView = this.ctx
			.getCurrentTexture()
			.createView() as GPUTextureView;
		const renderPass = commandEncoder.beginRenderPass({
			colorAttachments: [
				{
					view: textureView,
					clearValue: { r: 0.11, g: 0.05, b: 0.16, a: 1.0 },
					loadOp: "clear",
					storeOp: "store",
				},
			],
		}) as GPURenderPassEncoder;
		renderPass.setPipeline(this.pipeline);
		renderPass.setBindGroup(0, this.bindGroup);
		renderPass.setVertexBuffer(0, this.picture.get_buffer());
		renderPass.draw(4, 1, 0, 0);
		renderPass.end();
		this.device.queue.submit([commandEncoder.finish()]);
	}
}
