// https://r3f.docs.pmnd.rs/getting-started/installation

import ReactDOM from "https://esm.sh/react-dom@18.2.0"
import React, { useRef, useState } from "https://esm.sh/react@18.2.0"
import { Canvas, useFrame } from "https://esm.sh/@react-three/fiber@8.15.9"
import htm from "https://esm.sh/htm"

const html = htm.bind(React.createElement)

function Box(props) {
  const meshRef = useRef()
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  useFrame(() => (meshRef.current.rotation.x = meshRef.current.rotation.y += 0.01))
  return html` <mesh
    ...${props}
    ref=${meshRef}
    scale=${active ? 1.5 : 1}
    onClick=${() => setActive(!active)}
    onPointerOver=${() => setHover(true)}
    onPointerOut=${() => setHover(false)}
  >
    <boxGeometry args=${[1, 1, 1]} />
    <meshStandardMaterial color=${hovered ? "hotpink" : "orange"} />
  </mesh>`
}

ReactDOM.render(
  html` <${Canvas}>
    <ambientLight />
    <pointLight position=${[10, 10, 10]} />
    <${Box} position=${[-1.2, 0, 0]} />
    <${Box} position=${[1.2, 0, 0]} />
  <//>`,
  document.getElementById("root"),
)
