/**
 * @file
 *
 * Summary.
 *
 * <p>Our first WebGPU program draws a red square on the canvas.</p>
 *
 * @author {@link https://github.com/diskhkme Hyungki Kim}
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @since 19/04/2025
 *
 * @see <a href="/cwdc/15-webgpu/examples/GPU_example1.html">link</a>
 * @see <a href="/cwdc/15-webgpu/examples/GPU_example1.js">source</a>
 * @see {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html#a-drawing-triangles-to-textures Drawing triangles to textures}
 */

/**
 * WebGPU is an asynchronous API so it’s easiest to use in an async function.
 * We start off by requesting an adapter, and then requesting a device from the adapter.
 */
async function mainEntrance() {
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
   * @type {String}
   * @global
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#create_shader_modules Create shader modules}
   */
  const module = device.createShaderModule({
    label: "our hardcoded red triangle shaders",
    code: `
      @vertex fn vs(
        @builtin(vertex_index) vertexIndex : u32
      ) -> @builtin(position) vec4f {
        let pos = array(
          vec2f( -0.5,  -0.5 ), // bottom left
          vec2f( 0.5, -0.5 ),   // bottom right
          vec2f( 0.5, 0.5 ),    // top right
          vec2f( -0.5,  -0.5 ), // bottm left
          vec2f( 0.5, 0.5 ),    // top right
          vec2f( -0.5, 0.5 ),   // top left
        );

        return vec4f(pos[vertexIndex], 0.0, 1.0);
      }

      @fragment fn fs() -> @location(0) vec4f {
        return vec4f(1, 0, 0, 1);
      }
    `,
  });

  /**
   * <p>Pipeline contains the vertex shader and fragment shader the GPU will run.
   * You could also have a pipeline with a compute shader.</p>
   *
   * We set layout to 'auto' which means to ask WebGPU to derive the layout of data from the shaders.
   * We’re not using any data though.
   * We then tell the render pipeline to use the vs function from our shader module
   * for a vertex shader and the fs function for our fragment shader.
   * @global
   */
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

  /**
   * <p>A RenderPass descriptor has an array for colorAttachments which lists
   * the textures we will render to and how to treat them.</p>
   * We’ll wait to fill in which texture we actually want to render to.
   * For now, we set up a clear value of a teal color, and a loadOp and storeOp.
   * <ul>
   *  <li>loadOp: 'clear' specifies to clear the texture to the clear value before drawing.</li>
   *  <li>The other option is 'load' which means load the existing contents of the texture
   *    into the GPU so we can draw over what’s already there.</li>
   *  <li>storeOp: 'store' means store the result of what we draw.</li>
   * </ul>
   * We could also pass 'discard' which would throw away what we draw.
   * @global
   * @type {Object}
   * @property {String} label - The label for the render pass.
   * @property {Array} colorAttachments - The color attachments for the render pass.
   * @property {Object} colorAttachments[].view - The view for the color attachment.
   * @property {Array} colorAttachments[].clearValue - The clear value for the color attachment.
   * @property {String} colorAttachments[].loadOp - The load operation for the color attachment.
   * @property {String} colorAttachments[].storeOp - The store operation for the color attachment.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass#descriptor descriptor}
   */
  const renderPassDescriptor = {
    label: "our basic canvas renderPass",
    colorAttachments: [
      {
        // view: <- to be filled out when we render
        clearValue: [0.0, 0.8, 0.8, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  /**
   * <p>Render function.</p>
   * Call {@link https://developer.mozilla.org/en-US/docs/Web/API/GPUCanvasContext/getCurrentTexture context.getCurrentTexture()}
   * to get a texture that will appear in the canvas.
   * Calling {@link https://developer.mozilla.org/en-US/docs/Web/API/GPUTexture/createView createView}
   * gets a view into a specific part of a texture but with no parameters,
   * it will return the default part which is what we want in this case.
   * For now, our only colorAttachment is a texture view from our canvas which we get via the context we created at the start.
   * Again, element 0 of the colorAttachments array corresponds to @location(0) as we specified for the return value of the fragment shader.
   *
   * <p>Next, we create a command encoder.
   * A {@link https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder command encoder}
   * is used to create a command buffer.
   * We use it to encode commands and then “submit” the command buffer it created to have the commands executed.</p>
   *
   * <p>We then use the command encoder to create a render pass encoder by calling
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass beginRenderPass}.
   * A render pass encoder is a specific encoder for creating commands related to rendering.
   * We pass it our {@link renderPassDescriptor} to tell it which texture we want to render to.</p>
   *
   * <p>We encode the command, setPipeline, to set our
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPipeline pipeline}
   * and then tell it to execute our vertex shader 6 times by calling draw with 6.
   * By default, every 3 times our vertex shader is executed a triangle will be drawn
   * by connecting the 3 values just returned from the vertex shader.</p>
   *
   * <p>We end the render pass, and then finish the encoder.
   * This gives us a command buffer that represents the steps we just specified.
   * Finally, we submit the command buffer to be executed.</p>
   *
   * When the draw command is executed, this will be our state.
   *
   * @global
   */
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
    pass.draw(6); // call our vertex shader 6 times.
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }

  render();
}

/**
 * Calls {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/alert alert} with the error message.
 * @param {String} msg error message.
 */
function fail(msg) {
  // eslint-disable-next-line no-alert
  alert(msg);
}

/**
 * <p>Load event handler.</p>
 * This function is called when the window has finished loading.
 * It calls the {@link mainEntrance} function to start the WebGPU example.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event load event}
 * @event load
 */
window.addEventListener("load", mainEntrance);
