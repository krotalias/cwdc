/**
 * @file
 *
 * Summary.
 *
 * <p>WebGPU API.</p>
 *
 * @see {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html#a-drawing-triangles-to-textures Drawing triangles to textures}
 */

/**
 * WebGPU is an asynchronous API so it’s easiest to use in an async function.
 * We start off by requesting an adapter, and then requesting a device from the adapter.
 */
async function main() {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    fail("need a browser that supports WebGPU");
    return;
  }

  // Get a WebGPU context from the canvas and configure it
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("webgpu");
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
  });

  /**
   * Create a shader module.
   * A shader module contains one or more shader functions.
   * In our case, we’ll make one vertex shader function and one fragment shader function.
   *
   * <p>Shaders are written in a language called WebGPU Shading Language (WGSL).</p>
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#create_shader_modules Create shader modules}
   */
  const module = device.createShaderModule({
    label: "our hardcoded red triangle shaders",
    code: `
      @vertex fn vs(
        @builtin(vertex_index) vertexIndex : u32
      ) -> @builtin(position) vec4f {
        let pos = array(
          vec2f( 0.0,  0.5),  // top center
          vec2f(-0.5, -0.5),  // bottom left
          vec2f( 0.5, -0.5)   // bottom right
        );

        return vec4f(pos[vertexIndex], 0.0, 1.0);
      }

      @fragment fn fs() -> @location(0) vec4f {
        return vec4f(1, 0, 0, 1);
      }
    `,
  });

  const pipeline = device.createRenderPipeline({
    label: "our hardcoded red triangle pipeline",
    layout: "auto",
    vertex: {
      module,
    },
    fragment: {
      module,
      targets: [{ format: presentationFormat }],
    },
  });

  const renderPassDescriptor = {
    label: "our basic canvas renderPass",
    colorAttachments: [
      {
        // view: <- to be filled out when we render
        clearValue: [0.3, 0.3, 0.3, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  function render() {
    // Get the current texture from the canvas context and
    // set it as the texture to render to.
    renderPassDescriptor.colorAttachments[0].view = context
      .getCurrentTexture()
      .createView();

    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: "our encoder" });

    // make a render pass encoder to encode render specific commands
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.draw(3); // call our vertex shader 3 times.
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }

  render();
}

function fail(msg) {
  // eslint-disable-next-line no-alert
  alert(msg);
}

window.addEventListener("load", main);
