sed -i '' 's#/cwdc/13-webgl/lib/three.r163/examples/jsm/libs/draco#https://unpkg.com/three@latest/examples/jsm/libs/draco#g' stl.js
sed -i '' 's#/cwdc/13\-webgl/lib/three.r163/examples/jsm#three/addons#g' stl.js
sed -i '' 's#/cwdc/13\-webgl/lib/three.r163/build/three.module.js#three#g' stl.js