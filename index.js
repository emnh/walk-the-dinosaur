var frame = 0;
var time;
var simplex = new SimplexNoise('seed');
var camera, scene, renderer;
var roots = [];
var updaters = [];
var PI = Math.PI;
var dragons = [];
var ground;
var updateSkin = [];
var rotateCamera = true;
var grassZoom = 2.0;
var skinMaterial;

var pmdragons = [];

init();
animate();

function plane(sz) {
  var geometry = new THREE.PlaneBufferGeometry(sz, sz);
  var material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
  var mesh = new THREE.Mesh(geometry, material);
  material.metalness = 0.0;
  return mesh;
}

function box(sz) {
  var geometry = new THREE.BoxBufferGeometry(sz, sz, sz);
  var material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

var detail = 10;

function getSphere(width, material) {
  var geometry = new THREE.SphereBufferGeometry(width, detail, detail);
  var mesh = new THREE.Mesh( geometry, material );
  material.metalness = 0.1;
  updateSkin.push(function(stexture) {
    material.map = stexture;
  });
  return mesh;
}

function getCylinder(top, bottom, height, material) {
  var geometry = new THREE.CylinderBufferGeometry(top, bottom, height, detail, detail);
  var mesh = new THREE.Mesh( geometry, material );
  material.metalness = 0.1;
  updateSkin.push(function(stexture) {
    material.map = stexture;
  });
  return mesh;
}

function dinosaur(skin, skinMaterial) {

  var cylinder = function(top, bottom, height) {
    return getCylinder(top, bottom, height, skinMaterial);
  };

  var cylinder2 = function(top, bottom, height) {
    var material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
    return getCylinder(top, bottom, height, material);
  };

  var sphere = function(width) {
    return getSphere(width, skinMaterial);
  };

  var sphere2 = function(width) {
    var material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
    return getSphere(width, material);
  };

  var dragon = {};
  dragons.push(dragon);
  dragon.rand = Math.random();

  var root = new THREE.Object3D();
  scene.add(root);
  root.rotation.y = PI / 1.0;

  var body = new THREE.Object3D();
  body.rotation.set(0.0, 0.0, PI / 2.0);
  dragon.body = body;
  root.add(body);
  var fat = 0.05;
  var mid = fat * 2.0;
  var bodyLength = 0.5;

  var front = cylinder(fat, mid, bodyLength / 2.0);
  var back = cylinder(mid, fat, bodyLength / 2.0);
  dragon.front = front;
  dragon.back = back;
  var tail = cylinder(0.05, 0.01, 0.3);
  var tailPoint = new THREE.Object3D();
  body.add(front);
  body.add(back);
  back.position.y = -bodyLength / 4.0;
  front.position.y = bodyLength / 4.0;

  var single1 = new THREE.Geometry();
  var single2 = new THREE.Geometry();
  for (var i = 0; i < 15; i++) {
    var c = cylinder(0.02, 0.005, 0.05);
    c.position.y = -0.07;
    var hairPoint = new THREE.Object3D();
    hairPoint.position.x = 0.01 + i / 250.0;
    hairPoint.position.y = (i - 5.0) / 100.0;
    hairPoint.rotation.z = PI / 2.0 + (i - 5.0) / 20.0;
    hairPoint.add(c);

    c.updateMatrixWorld();
    hairPoint.updateMatrixWorld();
    c.geometry.applyMatrix(c.matrixWorld);
    var c2 = new THREE.Geometry();
    c2.fromBufferGeometry(c.geometry);
    single1.merge(c2);

    c = cylinder(0.02, 0.005, 0.05);
    c.position.y = -0.07;
    hairPoint = new THREE.Object3D();
    hairPoint.position.x = 0.05 - i / 250.0;
    hairPoint.position.y = (i - 5.0) / 100.0 - 0.05;
    hairPoint.rotation.z = PI / 2.0 + (i - 5.0) / 20.0;
    hairPoint.add(c);

    c.updateMatrixWorld();
    hairPoint.updateMatrixWorld();
    c.geometry.applyMatrix(c.matrixWorld);
    var c2 = new THREE.Geometry();
    c2.fromBufferGeometry(c.geometry);
    single2.merge(c2);
  }
  var single1g = new THREE.BufferGeometry();
  single1g.fromGeometry(single1);
  var single1mesh = new THREE.Mesh(single1g, skinMaterial);
  back.add(single1mesh);
  var single2g = new THREE.BufferGeometry();
  single2g.fromGeometry(single2);
  var single2mesh = new THREE.Mesh(single2g, skinMaterial);
  front.add(single2mesh);

  tailPoint.add(tail);
  body.add(tailPoint);
  tailPoint.position.y = -0.2;
  tail.position.y = -0.2;
  dragon.tail = tail;
  dragon.tailPoint = tailPoint;

  var neck = cylinder(0.01, 0.05, 0.2);
  body.add(neck);
  dragon.neck = neck;
  neck.position.y = bodyLength / 2.0 + 0.04;
  neck.position.x = 0.065;
  neck.rotation.z = -PI / 4.0 - 0.2;

  var headSize = 0.05;
  var head = sphere(headSize, headSize);
  body.add(head);
  dragon.head = head;
  head.position.x = 0.15;
  head.position.y = 0.35;

  var eyeSize = 0.02;
  var pupilSize = 0.01;
  var eyes = [
    sphere2(eyeSize), sphere2(eyeSize)
  ];
  var pupils = [
    sphere2(pupilSize), sphere2(pupilSize)
  ];
  head.add(eyes[0]);
  head.add(eyes[1]);
  eyes[0].position.z = -0.04;
  eyes[0].position.y = 0.01;
  eyes[0].add(pupils[0]);
  pupils[0].position.z = -0.015;
  eyes[1].position.z = 0.04;
  eyes[1].position.y = 0.01;
  eyes[1].add(pupils[1]);
  pupils[1].position.z = 0.015;

  var single = new THREE.Geometry();
  for (var i = 0; i < 10; i++) {
    var c = cylinder(0.005, 0.005, 0.1);
    c.position.y = -0.05;
    var hairPoint = new THREE.Object3D();
    hairPoint.position.x = 0.05 - Math.abs(i - 5.0) / 200.0;
    hairPoint.position.y = (i - 5.0) / 200.0;
    hairPoint.rotation.z = PI / 2.0 + (i - 5.0) / 5.0;
    hairPoint.add(c);
    //head.add(hairPoint);
    c.updateMatrixWorld();
    hairPoint.updateMatrixWorld();
    c.geometry.applyMatrix(c.matrixWorld);
    var c2 = new THREE.Geometry();
    c2.fromBufferGeometry(c.geometry);
    single.merge(c2);
  }
  var singleg = new THREE.BufferGeometry();
  singleg.fromGeometry(single);
  var singlemesh = new THREE.Mesh(singleg, skinMaterial);
  head.add(singlemesh);

  var nose = cylinder(0.005, 0.02, 0.03);
  head.add(nose);
  nose.position.y = 0.05;
  dragon.nose = nose;

  var tongue = cylinder2(0.005, 0.02, 0.02);
  head.add(tongue);
  dragon.tongue = tongue;
  tongue.position.x = -0.03;
  tongue.position.y = 0.03;
  tongue.rotation.z = PI / 4.0;

  var legs = [
    cylinder(0.025, 0.02, 0.2),
    cylinder(0.025, 0.02, 0.2),
    cylinder(0.025, 0.02, 0.2),
    cylinder(0.025, 0.02, 0.2)
  ];
  dragon.legs = legs;
  for (i = 0; i < legs.length; i++) {
    root.add(legs[i]);
  }
  var d = 0.1;
  var dd2 = d / 2.0;
  legs[0].position.set(d, -d, dd2);
  legs[1].position.set(-d, -d, dd2);
  legs[2].position.set(-d, -d, -dd2);
  legs[3].position.set(d, -d, -dd2);
  //leg1.rotation.set(0.0, 0.0, 0.0);

  //skin.minFilter = THREE.LinearFilter;
  //skin.magFilter = THREE.LinearFilter;
  for (i = 0; i < updateSkin.length; i++) {
    //updateSkin[i](skin);
  }
  for (i = 0; i < 2; i++) {
    eyes[i].material.map = null;
    //eyes[i].material.emissive.set(0xFF0000);
    eyes[i].material.color.set(0xFFFFFF);
    pupils[i].material.map = null;
    //eyes[i].material.emissive.set(0xFF0000);
    pupils[i].material.color.set(0x0);
  }
  tongue.material.map = null;
  //eyes[i].material.emissive.set(0xFF0000);
  tongue.material.color.set(0xFF0000);

  return root;
}

/*
function mergeHierarchy(points, obj) {
  if (obj.hasOwnProperty('seen')) {
    return;
  }
  if (obj.hasOwnProperty('geometry') && obj.geometry !== undefined) {
    var geo = new THREE.Geometry();
    geo.fromBufferGeometry(obj.geometry);
    //obj.updateMatrixWorld();
    geo.applyMatrix(obj.matrixWorld);
    console.log(geo);
    for (var i = 0; i < geo.vertices.length; i++) {
      //console.log()
      points.push(geo.vertices[i]);
    }
  }

  obj.seen = true;

  if (obj.hasOwnProperty('children')) {
    for (var i = 0; i < obj.children.length; i++) {
        mergeHierarchy(points, obj.children[i]);
    }
  }
}
*/

function cf(x) {
  return Math.cos(2 * PI * x - PI / 2.0);
}

function sf(x) {
  return Math.sin(2 * PI * x - PI / 2.0);
}

function smoothstep (min, max, value) {
  var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
  return x*x*(3 - 2*x);
};

function lerp(a, b, f) {
    return a + f * (b - a);
}

function smoothThick(thick, v) {
  var ow = thick[0][0];
  var ol = thick[0][1];

  for (var i = 1; i < thick.length; i++) {
    var w = thick[i][0];
    var l = thick[i][1];
    if (v <= l) {
      var mixer = 1.0 - (l - v) / (l - ol);
      mixer = smoothstep(0, 1, mixer);
      var val = lerp(ow, w, mixer);
      t = val;
      break;
    }
    ow = w;
    ol = l;
  }

  return t;
}

function headBob(f, v) {
  return 0.1 * (f + 1.0) * (v - 0.75);
}

function surf(u, v, p0) {
  var f = Math.sin(time / 1.0);

  var t = 0.2;

  var thick = [
    [0.02, 0.0],
    [0.2, 0.2],
    [0.6, 0.4],
    [0.6, 0.5],
    [0.2, 0.8],
    [0.4, 0.96],
    [0.1, 1.0]
  ];

  t *= smoothThick(thick, v);

  fac = 20.0;
  t += t * 0.05 * simplex.noise3D(fac * u, fac * v, 0.0);

  var ox = 0.0;
  var oy = 0.0;
  if (v < 0.25) {
    ox += 0.5 * f * (0.25 - v);
  } else if (v < 0.5) {
    oy += 0.02 * f * (1.0 - (0.5 - v) / 0.25);
  } else if (v < 0.75) {
    oy += 0.02 * f * (0.75 - v) / 0.25;
  } else if (v > 0.75) {
    // neck
    oy += headBob(f, v);
  }

  // whole dino walking upright, like T-rex
  var upr = 0.4 * v;

  // calves
  if (0.3 < v && v < 0.45 && -0.6 < sf(u) && sf(u) < 0.4) {
    var dx = Math.min(v - 0.3, 0.45 - v);
    var dy = Math.min(sf(u) + 0.6, 0.4 - sf(u));
    var d = Math.sqrt(dx * dx + dy * dy);
    t += 0.1 * d;
  }

  p0.x = ox + t * cf(u); //Math.cos(2 * PI * u);
  p0.y = upr + oy + t * sf(u); //Math.sin(2 * PI * v);
  p0.z = v;

  // calves

}

function leg(u, v, p0) {
  var f = Math.sin(time / 1.0);

  var t = 0.07;

  var thick = [
    [0.0, 0.0],
    [1.0, 0.2],
    [0.5, 0.5],
    [0.4, 1.0]
  ];

  t *= smoothThick(thick, v);

  fac = 20.0;
  t += t * 0.05 * simplex.noise3D(fac * u, fac * v, 0.0);

  var crank = v > 0.8 ? v - 0.8 : 0.0;
  p0.x = crank + 0.2 * (0.5 - Math.abs(v - 0.5)) + t * cf(u);
  p0.y = t * sf(u);
  p0.z = v;
}

function headUp(u, v, p0) {
  var f = Math.sin(time / 1.0);

  var t = 0.07;

  var thick = [
    [0.0, 0.0],
    [0.8, 0.05],
    [1.0, 0.25],
    [0.8, 0.6],
    [0.8, 0.8],
    [0.4, 0.85],
    [0.0, 1.0]
  ];

  t *= smoothThick(thick, v);

  fac = 20.0;
  t += t * 0.1 * simplex.noise3D(fac * u, fac * v, 0.0);

  p0.x = 1.5 * t * cf(u);
  var sfu = sf(u);
  var bite = 0.05 * (1.0 + f) * v;
  var shape =
      sfu > 0.0 ?
        2.0 * t * sfu:
        -0.5 * t * sfu;
  p0.y = bite + shape + headBob(f, 1.0);
  p0.z = v;
}

function headDown(u, v, p0) {
  var f = Math.sin(time / 1.0);

  var t = 0.07;

  var thick = [
    [0.0, 0.0],
    [0.9, 0.05],
    [0.6, 0.3],
    [0.4, 0.9],
    [0.0, 1.0]
  ];

  t *= smoothThick(thick, v);

  fac = 20.0;
  t += t * 0.05 * simplex.noise3D(fac * u, fac * v, 0.0);

  p0.x = 1.5 * t * cf(u);
  var sfu = sf(u);
  var bite = 0.05 * (1.0 + f) * v;
  var shape =
      sfu > 0.0 ?
        2.0 * t * sfu:
        -0.5 * t * sfu;
  p0.y = bite + shape - headBob(f, 1.0);
  p0.z = v;
}

function dinosaur2(skinMaterial) {
  var geometry = new THREE.ParametricBufferGeometry(surf, 50, 100);
  var material = skinMaterial;
  var r = 4.0;
  material.map.repeat.set(r, r);
  material.side = THREE.DoubleSide;

  var legGeometry = new THREE.ParametricBufferGeometry(leg, 20, 20);
  var legMesh = [
    new THREE.Mesh(legGeometry, material),
    new THREE.Mesh(legGeometry, material),
    new THREE.Mesh(legGeometry, material),
    new THREE.Mesh(legGeometry, material)
  ];

  var pmdragon = new THREE.Object3D();

  var body = new THREE.Mesh(geometry, material);
  pmdragon.add(body);
  //body.rotation.x = PI / 4.0;
  //body.rotation.z = PI / 4.0;
  body.rotation.y = PI / 2.0;
  body.position.x = -0.5;
  body.position.y = 0.0;
  body.scale.z = 1.0;
  body.scale.y = 1.25;

  for (var i = 0; i < 2; i++) {
    pmdragon.add(legMesh[i]);
    var s = (i === 0 ? -1.0 : 1.0);
    legMesh[i].rotation.x = PI / 2.0;
    legMesh[i].rotation.y = 0.5 * Math.sin(time) * s;
    legMesh[i].position.x = -0.15;
    legMesh[i].position.y = 0.2;
    legMesh[i].position.z = s * 0.1;
    legMesh[i].scale.z = 0.3;
  }
  for (i = 2; i < 4; i++) {
    s = (i === 2 ? -1.0 : 1.0);
    pmdragon.add(legMesh[i]);
    legMesh[i].rotation.x = PI / 2.0;
    legMesh[i].rotation.y = PI / 4.0 + 0.5 * Math.sin(time) * s;
    legMesh[i].position.x = 0.1;
    legMesh[i].position.y = 0.22;
    legMesh[i].position.z = s * 0.05;
    var sc = 0.25;
    legMesh[i].scale.set(sc, sc, 0.5 * sc);
  }

  var headUpGeo = new THREE.ParametricBufferGeometry(headUp, 20, 20);
  var headDownGeo = new THREE.ParametricBufferGeometry(headDown, 20, 20);
  var headMesh = [
    new THREE.Mesh(headUpGeo, material),
    new THREE.Mesh(headDownGeo, material)
  ];
  for (var i = 0; i < 2; i++) {
    pmdragon.add(headMesh[i]);
    headMesh[i].position.x = 0.45;
    headMesh[i].position.y = 0.5;
    headMesh[i].rotation.y = PI / 2.0;
    headMesh[i].scale.set(1.0, 0.8, 0.2);
    //console.log(headMesh[i]);
    for (var j = 0; j < headMesh[i].geometry.attributes.uv.array.length; j++) {
      headMesh[i].geometry.attributes.uv.array[j] /= 2.0;
    }
  }
  headMesh[1].rotation.x = PI / 2.0;
  headMesh[1].rotation.z = PI / 2.0;



  /*
  var singleBody = new THREE.Geometry();

  function mergeMesh(single, mesh) {
    var c = mesh;
    c.updateMatrix();
    c.geometry.applyMatrix(c.matrix);
    var c2 = new THREE.Geometry();
    c2.fromBufferGeometry(c.geometry);
    single.merge(c2);
  }

  mergeMesh(singleBody, body);
  mergeMesh(singleBody, headMesh[0]);
  mergeMesh(singleBody, headMesh[1]);

  var singleBodyGeo = new THREE.BufferGeometry();
  singleBodyGeo.fromGeometry(singleBody);
  pmdragon.add(new THREE.Mesh(singleBodyGeo, material))
  */

  pmdragon.position.y = -0.1;
  pmdragon.position.x = -0.5;

  scene.add(pmdragon);
  pmdragons.push(pmdragon);
}

function init() {
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.0001, 1000 );
  camera.position.z = 1;
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor(0x000080, 1.0);
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  var light = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  light.position.set(0, 10, 0);
  scene.add(light);

  var ambient = new THREE.AmbientLight(0xFFFFFF, 0.6);
  scene.add(ambient);

  ground = plane(10.0);
  scene.add(ground);
  ground.material.side = THREE.DoubleSide;
  //ground.position.x = -0.1;
  ground.rotation.x = PI / 2.0;
  ground.rotation.y = 0.0;
  ground.rotation.z = 0.0;
  ground.position.y = -0.2;
  /*
  $("#grass").on("load", function() {
    return;
    var texture = new THREE.Texture();
    texture.minFilter = THREE.LinearMipMapFilter;
    texture.magFilter = THREE.LinearMipMapFilter;
    texture.image = this;
    texture.needsUpdate = true;
    texture.anisotropy = renderer.getMaxAnisotropy();
    ground.material.map = texture;
    ground.material.needsUpdate = true;
  });
  */
  var texture = new THREE.TextureLoader().load( "https://cdn.rawgit.com/alexmackey/threeJsFrogger/ba6222a9/content/grass.png" );
  texture.minFilter = THREE.LinearMipMapFilter;
  texture.magFilter = THREE.LinearMipMapFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.x = 20.0 / grassZoom;
  texture.repeat.y = 20.0 / grassZoom;
  texture.anisotropy = renderer.getMaxAnisotropy();
  ground.material.map = texture;
  ground.material.needsUpdate = true;
  //$("#grass")[0].src = "https://cdn.rawgit.com/alexmackey/threeJsFrogger/ba6222a9/content/grass.png";

  var url = "data:image/jpeg;base64,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";
  var skin = new THREE.TextureLoader().load(url);
  skin.minFilter = THREE.LinearFilter;
  skin.magFilter = THREE.LinearFilter;
  skin.wrapS = THREE.RepeatWrapping;
  skin.wrapT = THREE.RepeatWrapping;
  skinMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff, map: skin } );
  var num = 0;
  for (var ja = -num; ja <= num; ja++) {
    for (var ka = -num; ka <= num; ka++) {
      var root = dinosaur(skin, skinMaterial);
      root.position.x = ja / 2.0;
      root.position.z = ka / 5.0 + 0.5;
      var s = 1.0;
      root.scale.set(s, s, s);
    }
  }

  for (time = 0.0; time <= 2.0 * PI; time += 2.0 * PI / 60.0) {
    var root2 = dinosaur2(skinMaterial);
  }

  window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  time = new Date().getTime() / 1000.0;
  requestAnimationFrame( animate );
  //root.rotation.x += 0.005;
  //root.rotation.y += 0.01;

  for (var di = 0; di < dragons.length; di++) {
    var dragon = dragons[di];

    var d = 0.01;
    var f = Math.sin(8.0 * (time + dragon.rand));

    dragon.back.position.x = d * f;
    dragon.front.position.x = d * f;
    var d2 = 0.05;
    dragon.back.rotation.z = -d2 * f;
    dragon.front.rotation.z = d2 * f;

    dragon.neck.rotation.z = -PI / 4.0 - 0.2 + d2 * f;
    dragon.head.position.x = 0.15 - d * f;

    for (var i = 0; i < dragon.legs.length; i++) {
      var s = (i % 2 === 0) ? 1 : -1;
      dragon.legs[i].rotation.z = s * 0.5 * f;
    }

    var center = dragon.tail.height;
    var rot = 0.5 * f;
    //dragon.tail.position.x -= center;
    dragon.tailPoint.rotation.x = rot;
    //dragon.tail.position.x += center;
    //ground.rotation.x = 4.0 * rot;

    dragon.tongue.scale.y = (2.0 + f) * 2.0;
  }

  frame = (frame + 1) % pmdragons.length;
  for (di = 0; di < pmdragons.length; di++) {
    var dragon = pmdragons[di];
    dragon.visible = di == frame;
  }
  //var geometry = new THREE.ParametricBufferGeometry(surf, 50, 50);
  //pmdragon.geometry = geometry;
  //skinMaterial.map.offset.y =  (time / 2.5) % 1.0;

  ground.material.map.offset.x = (time / 2.5) % 1.0;
  //ground.material.map.needsUpdate = true;
  //ground.material.needsUpdate = true;
  camera.position.x = 1.0;
  camera.position.y = 0.25;
  camera.position.z = 1.0;
  camera.lookAt(scene.position);
  if (rotateCamera) {
    var t = time / 2.0;
    camera.position.x = Math.cos(t);
    camera.position.z = Math.sin(t);
    camera.lookAt(scene.position);
  }

  renderer.render(scene, camera);
}
