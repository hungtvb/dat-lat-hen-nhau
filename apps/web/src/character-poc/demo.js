import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import {createDaLatMale} from './DaLatMale.js';

const canvas=document.getElementById('scene');
const status=document.getElementById('status');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#79978d');
scene.fog=new THREE.Fog('#79978d',10,25);
const camera=new THREE.PerspectiveCamera(35,1,.1,50);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
scene.add(new THREE.HemisphereLight('#f7efd9','#637d74',2.0));
const key=new THREE.DirectionalLight('#ffe0b7',2.75);
key.position.set(2.8,6,4.5);key.castShadow=true;
key.shadow.mapSize.set(1024,1024);
key.shadow.camera.left=-3;key.shadow.camera.right=3;
key.shadow.camera.top=5;key.shadow.camera.bottom=-3;
key.shadow.normalBias=.016;scene.add(key);
const fill=new THREE.DirectionalLight('#b8d5cb',.75);fill.position.set(-3,2.5,-2.5);scene.add(fill);
const ground=new THREE.Mesh(new THREE.CircleGeometry(2.3,64),new THREE.MeshStandardMaterial({color:'#c2bc9f',roughness:.99}));
ground.rotation.x=-Math.PI/2;ground.position.y=-.022;ground.receiveShadow=true;scene.add(ground);
const ring=new THREE.Mesh(new THREE.RingGeometry(1.72,1.745,72),
  new THREE.MeshBasicMaterial({color:'#f5e1b4',side:THREE.DoubleSide,transparent:true,opacity:.55}));
ring.rotation.x=-Math.PI/2;ring.position.y=.001;scene.add(ring);
const walker=createDaLatMale();
scene.add(walker.group);
let active='idle', angle=0, distance=3.6, elevation=.19;
let dragging=false,lastX=0,lastY=0;
function setPose(mode){
  active=mode;
  if(mode==='idle'){
    Object.assign(walker.state,{moving:false,route:null,phase:.04,speed:0,
      position:[0,0,0],heading:0});
    walker.animate(1/60,0);
  } else {
    walker.setRoute([[0,-.7],[0,.7]],true);
    walker.state.speed=.65;
  }
  document.getElementById('idle').classList.toggle('active',mode==='idle');
  document.getElementById('walk').classList.toggle('active',mode==='walk');
}
function setView(a,id){
  angle=a;
  for(const k of ['front','side','back'])document.getElementById(k).classList.toggle('active',k===id);
}
document.getElementById('idle').onclick=()=>setPose('idle');
document.getElementById('walk').onclick=()=>setPose('walk');
document.getElementById('front').onclick=()=>setView(0,'front');
document.getElementById('side').onclick=()=>setView(Math.PI/2,'side');
document.getElementById('back').onclick=()=>setView(Math.PI,'back');
function resize(){
  const w=window.innerWidth,h=window.innerHeight;
  camera.aspect=w/h;camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
}
window.addEventListener('resize',resize);resize();
canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;angle+=(e.clientX-lastX)*.008;
  elevation=Math.max(-.28,Math.min(.57,elevation+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;});
canvas.addEventListener('pointerup',()=>dragging=false);
canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(2.4,Math.min(6,distance+e.deltaY*.004));},{passive:false});
document.getElementById('export').onclick=async()=>{
  try{
    setPose('idle');
    walker.group.updateMatrixWorld(true);
    const exporter=new GLTFExporter();
    const bytes=await exporter.parseAsync(walker.group,{binary:true,onlyVisible:true});
    if(!(bytes instanceof ArrayBuffer))throw new Error('GLTFExporter did not return GLB bytes');
    const url=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'}));
    const a=document.createElement('a');a.href=url;a.download='da-lat-nam02-3dviz-biped.glb';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent='Đã xuất file GLB tĩnh; chuyển động procedural nằm trong mã nguồn.';
  }catch(err){console.error('GLB export failure',err);status.textContent='Xuất GLB thất bại: '+String(err);}
};
function render(t){
  const dt=Math.min(.045,(t-lastT)/1000||0);lastT=t;
  if(active==='walk')walker.animate(dt,.65);
  const focus=new THREE.Vector3(0,.91,0);
  camera.position.set(Math.sin(angle)*distance,1.48+Math.sin(elevation)*.7,Math.cos(angle)*distance);
  camera.lookAt(focus);
  renderer.render(scene,camera);requestAnimationFrame(render);
}
let lastT=performance.now();
setPose('idle');requestAnimationFrame(render);
window.__characterProof={
  model:walker.group,
  source:walker.sourceBlueprint,
  get mode(){return active},
  get phase(){return walker.state.phase},
  get triangles(){return walker.triangleCount},
  get rigType(){return walker.rigType},
  setPose,setView,
  get renderer(){return renderer.getContext().getParameter(renderer.getContext().RENDERER)},
};
