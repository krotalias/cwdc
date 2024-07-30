/**
 * @file
 *
 * Auxiliary utility functions.
 *
 * @author {@link  https://scholar.google.com/citations?user=uT_WCZ0AAAAJ&hl=en Edward Angel}
 * @since 07/08/2021
 * @see <a href="/cwdc/13-webgl/lib/Common/initShadersES6.js">source</a>
 * @see <a href="https://github.com/jiayaozhang/Interactive-Computer-Graphics-WebGL/blob/master/Code%20update/Code%20update/Common/initShadersES6.js">github</a>
 */

//
//  initShaders.js
//

function initShaders( gl, vertexShaderId, fragmentShaderId )
{
    let vertShdr;
    let fragShdr;

    let vertElem = document.getElementById( vertexShaderId );
    if ( !vertElem ) {
        alert( "Unable to load vertex shader " + vertexShaderId );
        return -1;
    }
    else {
        vertShdr = gl.createShader( gl.VERTEX_SHADER );
        gl.shaderSource( vertShdr, vertElem.textContent.replace(/^\s+|\s+$/g, '' ));
        gl.compileShader( vertShdr );
        if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
            let msg = "Vertex shader '"
                + vertexShaderId
                + "' failed to compile.  The error log is:\n\n"
        	    + gl.getShaderInfoLog( vertShdr );
            alert( msg );
            return -1;
        }
    }

    let fragElem = document.getElementById( fragmentShaderId );
    if ( !fragElem ) {
        alert( "Unable to load vertex shader " + fragmentShaderId );
        return -1;
    }
    else {
        fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
        gl.shaderSource( fragShdr, fragElem.textContent.replace(/^\s+|\s+$/g, '' ) );
        gl.compileShader( fragShdr );
        if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
            let msg = "Fragment shader '"
                + fragmentShaderId
                + "' failed to compile.  The error log is:\n\n"
        	    + gl.getShaderInfoLog( fragShdr );
            alert( msg );
            return -1;
        }
    }

    let program = gl.createProgram();
    gl.attachShader( program, vertShdr );
    gl.attachShader( program, fragShdr );
    gl.linkProgram( program );

    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        let msg = "Shader program failed to link.  The error log is:\n\n"
            + gl.getProgramInfoLog( program );
        alert( msg );
        return -1;
    }

    return program;
}
