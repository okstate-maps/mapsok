"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7447],{49828:(e,t,r)=>{r.r(t),r.d(t,{createEngine:()=>y,placement:()=>A});var o=r(69744),a=r(75068),l=r(2603);let n=["KHR_materials_unlit","KHR_materials_ior","KHR_materials_specular","KHR_mesh_quantization"];async function i(e,t,r){let o=new URL(e,t).href,a=o.startsWith("data:")?await fetch(o):await (0,l.kz)(r,o);if(!a.ok)throw Error(`${o} answered ${a.status}`);return a.arrayBuffer()}let u=new WeakMap;async function s(e,t,r){let o=await i(e,location.href,t),{json:a,bin:l}=0x46546c67===new DataView(o).getUint32(0,!0)?function(e){let t,r,o=new DataView(e);if(0x46546c67!==o.getUint32(0,!0))throw Error("This is not a GLB.");if(2!==o.getUint32(4,!0))throw Error("Only glTF 2.0 is drawn.");let a=Math.min(o.getUint32(8,!0),e.byteLength);for(let l=12;l+8<=a;){let a=o.getUint32(l,!0),n=o.getUint32(l+4,!0),i=l+8;0x4e4f534a===n?t=JSON.parse(new TextDecoder().decode(new Uint8Array(e,i,a))):5130562===n&&(r=e.slice(i,i+a)),l=i+a}if(!t)throw Error("The GLB has no JSON chunk.");return{json:t,bin:r}}(o):{json:JSON.parse(new TextDecoder().decode(o))},u=(a.extensionsRequired??[]).filter(e=>!n.includes(e));if(u.length)throw Error(`Clover's renderer cannot draw this model: it requires ${u.join(", ")}.`);let s=await Promise.all((a.buffers??[]).map((r,o)=>{if(void 0!==r.uri)return i(r.uri,e,t);if(0===o&&l)return l;throw Error("A buffer of the model has no data.")})),f=await Promise.all((a.images??[]).map(async o=>{try{let l;if(void 0!==o.bufferView){let e=a.bufferViews[o.bufferView];l=new Blob([new Uint8Array(s[e.buffer],e.byteOffset??0,e.byteLength)],{type:o.mimeType})}else{if(void 0===o.uri)return null;l=new Blob([await i(o.uri,e,t)],{type:o.mimeType})}let n={premultiplyAlpha:"none",colorSpaceConversion:"none"};return await c(await createImageBitmap(l,n),r,n)}catch{return null}}));return{json:a,buffers:s,images:f}}async function c(e,t,r){let o=Math.max(e.width,e.height);if(!t||o<=t)return e;let a=t/o,l=await createImageBitmap(e,{...r,resizeWidth:Math.max(1,Math.floor(e.width*a)),resizeHeight:Math.max(1,Math.floor(e.height*a)),resizeQuality:"high"});return e.close(),l}let f={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},d={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},m=e=>f[e],v=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);function h(e,t){let r=new Float32Array(16);for(let o=0;o<4;o++)for(let a=0;a<4;a++){let l=0;for(let r=0;r<4;r++)l+=e[4*r+a]*t[4*o+r];r[4*o+a]=l}return r}function p([e,t,r],[o,a,l,n],[i,u,s]){let c=o+o,f=a+a,d=l+l,m=o*c,v=o*f,h=o*d,g=a*f,x=a*d,b=l*d,T=n*c,E=n*f,w=n*d;return new Float32Array([(1-(g+b))*i,(v+w)*i,(h-E)*i,0,(v-w)*u,(1-(m+b))*u,(x+T)*u,0,(h+E)*s,(x-T)*s,(1-(m+g))*s,0,e,t,r,1])}let g=e=>p(e,[0,0,0,1],[1,1,1]),x=e=>p([0,0,0],[0,0,0,1],e),b={POSITION:0,NORMAL:1,TEXCOORD_0:2,COLOR_0:3},T=["uBaseTexture","uMetalRoughTexture","uNormalTexture","uOcclusionTexture","uEmissiveTexture"],E=`#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;
layout(location = 3) in vec4 aColor;
uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform mat3 uNormalMatrix;
out vec3 vWorld;
out vec3 vNormal;
out vec2 vUv;
out vec4 vColor;
void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vWorld = world.xyz;
  vNormal = uNormalMatrix * aNormal;
  vUv = aUv;
  vColor = aColor;
  gl_Position = uViewProjection * world;
}`,w=`#version 300 es
precision highp float;
in vec3 vWorld;
in vec3 vNormal;
in vec2 vUv;
in vec4 vColor;
uniform vec3 uCamera;
uniform vec4 uBaseColor;
uniform vec3 uSpecular;
uniform float uMetallic;
uniform float uRoughness;
uniform float uNormalScale;
uniform float uOcclusionStrength;
uniform vec3 uEmissive;
uniform float uAlphaCutoff;
uniform int uFlags;
uniform sampler2D uBaseTexture;
uniform sampler2D uMetalRoughTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uOcclusionTexture;
uniform sampler2D uEmissiveTexture;
out vec4 outColor;

const float PI = 3.14159265;
const float LAMP = 3.0;
// The room: a sky and a ground for the light all around, and three lights in it.
const vec3 SKY = vec3(0.73);
const vec3 GROUND = vec3(0.58);
const vec3 LIGHTS[3] = vec3[3](
  normalize(vec3(0.3, 0.7, 0.9)),
  normalize(vec3(-0.8, 0.35, 0.5)),
  normalize(vec3(0.2, 0.4, -1.0))
);
const vec3 RADIANCE[3] = vec3[3](vec3(1.2), vec3(0.3), vec3(0.4));

vec3 room(vec3 direction) {
  return mix(GROUND, SKY, direction.y * 0.5 + 0.5);
}

// What a surface reflects of the room: its sky and ground, and its lamps, soft panels a
// glossy surface mirrors and a rough one only glows with.
const vec3 LAMPS[3] = vec3[3](
  normalize(vec3(0.0, 1.0, 0.3)),
  normalize(vec3(-1.0, 0.5, 0.4)),
  normalize(vec3(1.0, 0.35, -0.3))
);
vec3 reflected(vec3 direction, float roughness) {
  vec3 color = room(direction);
  float spread = mix(0.04, 0.9, roughness);
  for (int i = 0; i < 3; i++) {
    float c = dot(direction, LAMPS[i]);
    color += vec3(LAMP) * smoothstep(1.0 - spread, 1.0 - spread * 0.35, c) * (1.0 - 0.85 * roughness);
  }
  return color;
}

// A normal map's normal, in the frame its texture coordinates make (no tangents read).
vec3 mapped(vec3 n) {
  vec3 tangentNormal = texture(uNormalTexture, vUv).xyz * 2.0 - 1.0;
  tangentNormal.xy *= vec2(uNormalScale, -uNormalScale);
  vec3 dp1 = dFdx(vWorld);
  vec3 dp2 = dFdy(vWorld);
  vec2 duv1 = dFdx(vUv);
  vec2 duv2 = dFdy(vUv);
  vec3 dp2perp = cross(dp2, n);
  vec3 dp1perp = cross(n, dp1);
  vec3 t = dp2perp * duv1.x + dp1perp * duv2.x;
  vec3 b = dp2perp * duv1.y + dp1perp * duv2.y;
  float scale = inversesqrt(max(dot(t, t), dot(b, b)) + 1e-12);
  return normalize(mat3(t * scale, b * scale, n) * tangentNormal);
}

vec3 neutral(vec3 color) {
  const float start = 0.8 - 0.04;
  const float desaturation = 0.15;
  float x = min(color.r, min(color.g, color.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;
  float peak = max(color.r, max(color.g, color.b));
  if (peak < start) return color;
  float d = 1.0 - start;
  float newPeak = 1.0 - d * d / (peak + d - start);
  color *= newPeak / peak;
  float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
  return mix(color, vec3(newPeak), g);
}

vec3 srgb(vec3 linear) {
  return mix(
    linear * 12.92,
    1.055 * pow(linear, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, linear)
  );
}

void main() {
  vec4 base = uBaseColor * texture(uBaseTexture, vUv) * vColor;
  if ((uFlags & 8) != 0 && base.a < uAlphaCutoff) discard;
  if ((uFlags & 4) != 0) {
    outColor = vec4(srgb(base.rgb) * base.a, base.a);
    return;
  }
  // No normals given: the face's own, as glTF asks.
  vec3 n = (uFlags & 1) != 0
    ? normalize(vNormal)
    : normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (!gl_FrontFacing) n = -n;
  if ((uFlags & 2) != 0) n = mapped(n);
  vec3 v = normalize(uCamera - vWorld);
  vec4 metalRough = texture(uMetalRoughTexture, vUv);
  float roughness = clamp(uRoughness * metalRough.g, 0.045, 1.0);
  float metallic = clamp(uMetallic * metalRough.b, 0.0, 1.0);
  vec3 diffuse = base.rgb * (1.0 - metallic);
  vec3 f0 = mix(uSpecular, base.rgb, metallic);
  float a = roughness * roughness;
  float nv = clamp(dot(n, v), 1e-4, 1.0);
  vec3 color = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    vec3 l = LIGHTS[i];
    float nl = clamp(dot(n, l), 0.0, 1.0);
    if (nl <= 0.0) continue;
    vec3 h = normalize(l + v);
    float nh = clamp(dot(n, h), 0.0, 1.0);
    float vh = clamp(dot(v, h), 0.0, 1.0);
    float a2 = a * a;
    float dd = nh * nh * (a2 - 1.0) + 1.0;
    float distribution = a2 / (PI * dd * dd);
    float viewed = nl * sqrt(nv * nv * (1.0 - a2) + a2);
    float lit = nv * sqrt(nl * nl * (1.0 - a2) + a2);
    float visibility = 0.5 / (viewed + lit + 1e-5);
    vec3 fresnel = f0 + (1.0 - f0) * pow(1.0 - vh, 5.0);
    vec3 specular = fresnel * distribution * visibility;
    color += ((1.0 - fresnel) * diffuse + PI * specular) * RADIANCE[i] * nl;
  }
  // The room's light all around: diffuse, and what a rough or smooth surface reflects of it.
  vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
  vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
  vec4 r = roughness * c0 + c1;
  float a004 = min(r.x * r.x, exp2(-9.28 * nv)) * r.x + r.y;
  vec2 ab = vec2(-1.04, 1.04) * a004 + r.zw;
  float occlusion = mix(1.0, texture(uOcclusionTexture, vUv).r, uOcclusionStrength);
  color += (diffuse * room(n) + (f0 * ab.x + ab.y) * reflected(reflect(-v, n), roughness)) * occlusion;
  color += uEmissive * texture(uEmissiveTexture, vUv).rgb;
  outColor = vec4(srgb(neutral(color)) * base.a, base.a);
}`,R=new Set([9984,9985,9986,9987]);function A({position:e,transforms:t}){let r=v();for(let{type:e,x:o,y:a,z:l}of t){let t="scale"===e?x([o,a,l]):"translate"===e?g([o,a,l]):function([e,t,r]){let o=(e,t)=>{let r=t*Math.PI/180,o=Math.cos(r),a=Math.sin(r),l=v(),[n,i]=0===e?[1,2]:1===e?[2,0]:[0,1];return l[4*n+n]=o,l[4*n+i]=a,l[4*i+n]=-a,l[4*i+i]=o,l};return h(o(2,r),h(o(1,t),o(0,e)))}([o,a,l]);r=h(t,r)}return h(g(e),r)}function y(e,{onLost:t}){let r,n,i,c,f,v,g,x=document.createElement("canvas");x.className="clover-canvas-surface",x.setAttribute("aria-hidden","true"),x.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none";let _=x.getContext("webgl2",{antialias:!0,alpha:!0});if(!_)throw Error("This browser cannot draw 3D: it offers no WebGL2.");let M=e=>{e.preventDefault(),t()};x.addEventListener("webglcontextlost",M),e.prepend(x);let N=(r=function(e){let t=e.createProgram();for(let[r,o]of[[e.VERTEX_SHADER,E],[e.FRAGMENT_SHADER,w]]){let a=e.createShader(r);e.shaderSource(a,o),e.compileShader(a),e.attachShader(t,a),e.deleteShader(a)}if(e.linkProgram(t),!e.getProgramParameter(t,e.LINK_STATUS))throw Error(`The 3D view's shaders would not build: ${e.getProgramInfoLog(t)}`);return t}(_),n=Object.fromEntries(["uModel","uViewProjection","uNormalMatrix","uCamera","uBaseColor","uSpecular","uMetallic","uRoughness","uNormalScale","uOcclusionStrength","uEmissive","uAlphaCutoff","uFlags",...T].map(e=>[e,_.getUniformLocation(r,e)])),_.useProgram(r),T.forEach((e,t)=>_.uniform1i(n[e],t)),i=[],c=[],f=[],v={min:[1/0,1/0,1/0],max:[-1/0,-1/0,-1/0]},g=_.createTexture(),_.bindTexture(_.TEXTURE_2D,g),_.texImage2D(_.TEXTURE_2D,0,_.RGBA8,1,1,0,_.RGBA,_.UNSIGNED_BYTE,new Uint8Array([255,255,255,255])),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_MIN_FILTER,_.NEAREST),c.push(g),_.vertexAttrib4f(b.COLOR_0,1,1,1,1),{add:function(e,t){var r;let{json:o}=e,a=new Map,l=new Map,n=new Map,u=(t,r)=>{let l=`${t}|${r}`,n=a.get(l);if(!n){let u=o.bufferViews[t];n=_.createBuffer(),_.bindBuffer(r,n),_.bufferData(r,new Uint8Array(e.buffers[u.buffer],u.byteOffset??0,u.byteLength),_.STATIC_DRAW),a.set(l,n),i.push(n)}return n},s=(t,r)=>{var a,n;let i=t?null==(a=o.textures)?void 0:a[t.index]:void 0,u=(null==i?void 0:i.source)!==void 0?e.images[i.source]:null;if(!t||!u)return null;let s=`${t.index}|${r}`,f=l.get(s);if(!f){f=_.createTexture(),_.bindTexture(_.TEXTURE_2D,f),_.pixelStorei(_.UNPACK_COLORSPACE_CONVERSION_WEBGL,_.NONE),_.texImage2D(_.TEXTURE_2D,0,r?_.SRGB8_ALPHA8:_.RGBA8,_.RGBA,_.UNSIGNED_BYTE,u);let e=(null==i?void 0:i.sampler)!==void 0?null==(n=o.samplers)?void 0:n[i.sampler]:void 0,t=(null==e?void 0:e.minFilter)??_.LINEAR_MIPMAP_LINEAR;_.texParameteri(_.TEXTURE_2D,_.TEXTURE_MIN_FILTER,t),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_MAG_FILTER,(null==e?void 0:e.magFilter)??9729),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_WRAP_S,(null==e?void 0:e.wrapS)??10497),_.texParameteri(_.TEXTURE_2D,_.TEXTURE_WRAP_T,(null==e?void 0:e.wrapT)??10497),R.has(t)&&_.generateMipmap(_.TEXTURE_2D),l.set(s,f),c.push(f)}return f},g=e=>{var t,r,a,l,i,u;let c=e??-1,f=n.get(c);if(f)return f;let d=void 0!==e?(null==(t=o.materials)?void 0:t[e])??{}:{},m=d.pbrMetallicRoughness??{},v=s(d.normalTexture,!1),h=Number((null==(a=null==(r=d.extensions)?void 0:r.KHR_materials_ior)?void 0:a.ior)??1.5),p=null==(l=d.extensions)?void 0:l.KHR_materials_specular,g=((h-1)/(h+1))**2;return f={base:m.baseColorFactor??[1,1,1,1],specular:((null==p?void 0:p.specularColorFactor)??[1,1,1]).map(e=>Math.min(g*e,1)*((null==p?void 0:p.specularFactor)??1)),metallic:m.metallicFactor??1,roughness:m.roughnessFactor??1,normalScale:(null==(i=d.normalTexture)?void 0:i.scale)??1,occlusion:d.occlusionTexture?d.occlusionTexture.strength??1:0,emissive:d.emissiveFactor??[0,0,0],cutoff:d.alphaCutoff??.5,flags:2*!!v|4*(null==(u=d.extensions)?!!void 0:!!u.KHR_materials_unlit)|8*("MASK"===d.alphaMode),doubleSided:!!d.doubleSided,blend:"BLEND"===d.alphaMode,textures:[s(m.baseColorTexture,!0),s(m.metallicRoughnessTexture,!1),v,s(d.occlusionTexture,!1),s(d.emissiveTexture,!0)]},n.set(c,f),f},x=(r,a)=>{var l,n,i,s,c;let T=null==(l=o.nodes)?void 0:l[r];if(!T)return;let E=h(a,T.matrix?new Float32Array(T.matrix):p(T.translation??[0,0,0],T.rotation??[0,0,0,1],T.scale??[1,1,1])),w=void 0!==T.mesh?null==(n=o.meshes)?void 0:n[T.mesh]:void 0;for(let r of(null==w?void 0:w.primitives)??[]){let a=r.attributes.POSITION;if(void 0===a)continue;let l=_.createVertexArray();_.bindVertexArray(l);let n=0;for(let[e,t]of Object.entries(b)){let a=r.attributes[e],l=void 0!==a?null==(i=o.accessors)?void 0:i[a]:void 0;if(!l||void 0===l.bufferView||l.sparse)continue;let s=o.bufferViews[l.bufferView];_.bindBuffer(_.ARRAY_BUFFER,u(l.bufferView,_.ARRAY_BUFFER)),_.enableVertexAttribArray(t),_.vertexAttribPointer(t,m(l.type),l.componentType,!!l.normalized,s.byteStride??0,l.byteOffset??0),"NORMAL"===e&&(n|=1)}let p=void 0!==r.indices?null==(s=o.accessors)?void 0:s[r.indices]:void 0;(null==p?void 0:p.bufferView)!==void 0&&_.bindBuffer(_.ELEMENT_ARRAY_BUFFER,u(p.bufferView,_.ELEMENT_ARRAY_BUFFER)),_.bindVertexArray(null);let x=h(t,E),T=g(r.material);f.push({vao:l,mode:r.mode??_.TRIANGLES,count:p?p.count:o.accessors[a].count,...(null==p?void 0:p.bufferView)!==void 0?{index:{type:p.componentType,offset:p.byteOffset??0}}:{},model:x,normal:function(e){let[t,r,o,,a,l,n,,i,u,s]=e,c=l*s-n*u,f=n*i-a*s,d=a*u-l*i,m=t*c+r*f+o*d||1;return new Float32Array([c/m,f/m,d/m,(o*u-r*s)/m,(t*s-o*i)/m,(r*i-t*u)/m,(r*n-o*l)/m,(o*a-t*n)/m,(t*l-r*a)/m])}(x),mirrored:0>(c=x)[0]*(c[5]*c[10]-c[6]*c[9])-c[4]*(c[1]*c[10]-c[2]*c[9])+c[8]*(c[1]*c[6]-c[2]*c[5]),material:{...T,flags:T.flags|n}}),function(e,t,r,o){let a,l=t.json.accessors[r];if(function(e){for(let t=0;t<3;t++){let r=0;for(let o=0;o<3;o++)Math.abs(e[4*t+o])>1e-6&&r++;if(r>1)return!1}return!0}(o)&&l.min&&l.max&&!l.normalized){let[e,t]=[l.min,l.max];a=Array.from({length:8},(r,o)=>[1&o?t[0]:e[0],2&o?t[1]:e[1],4&o?t[2]:e[2]]).flat()}else a=function(e,t){let r=e.json.accessors[t],o=m(r.type),a=new Float32Array(r.count*o);if(void 0===r.bufferView)return a;let l=e.json.bufferViews[r.bufferView],n=d[r.componentType],i=l.byteStride||n*o,u=new DataView(e.buffers[l.buffer],(l.byteOffset??0)+(r.byteOffset??0)),s={5120:e=>u.getInt8(e),5121:e=>u.getUint8(e),5122:e=>u.getInt16(e,!0),5123:e=>u.getUint16(e,!0),5125:e=>u.getUint32(e,!0),5126:e=>u.getFloat32(e,!0)}[r.componentType]??(()=>0),c=r.normalized?({5120:127,5121:255,5122:32767,5123:65535})[r.componentType]:void 0;for(let e=0;e<r.count;e++)for(let t=0;t<o;t++){let r=s(e*i+t*n);a[e*o+t]=c?Math.max(r/c,-1):r}return a}(t,r);for(let t=0;t+2<a.length;t+=3){let r=a[t],l=a[t+1],n=a[t+2];for(let t=0;t<3;t++){let a=o[t]*r+o[4+t]*l+o[8+t]*n+o[12+t];a<e.min[t]&&(e.min[t]=a),a>e.max[t]&&(e.max[t]=a)}}}(v,e,a,x)}for(let e of T.children??[])x(e,E)},T=null==(r=o.scenes)?void 0:r[o.scene??0],E=(null==T?void 0:T.nodes)??(o.nodes??[]).map((e,t)=>t).filter(e=>!o.nodes.some(t=>{var r;return null==(r=t.children)?void 0:r.includes(e)})),w=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);E.forEach(e=>x(e,w)),f.sort((e,t)=>Number(e.material.blend)-Number(t.material.blend))},bounds:()=>f.length?v:null,draw:function(e,t,o,a){for(let l of(_.viewport(0,0,o,a),_.clearColor(0,0,0,0),_.clear(_.COLOR_BUFFER_BIT|_.DEPTH_BUFFER_BIT),_.enable(_.DEPTH_TEST),_.useProgram(r),_.uniformMatrix4fv(n.uViewProjection,!1,e),_.uniform3fv(n.uCamera,t),f)){let{material:e}=l;e.doubleSided?_.disable(_.CULL_FACE):_.enable(_.CULL_FACE),_.frontFace(l.mirrored?_.CW:_.CCW),e.blend?(_.enable(_.BLEND),_.blendFunc(_.ONE,_.ONE_MINUS_SRC_ALPHA),_.depthMask(!1)):(_.disable(_.BLEND),_.depthMask(!0)),e.textures.forEach((e,t)=>{_.activeTexture(_.TEXTURE0+t),_.bindTexture(_.TEXTURE_2D,e??g)}),_.uniformMatrix4fv(n.uModel,!1,l.model),_.uniformMatrix3fv(n.uNormalMatrix,!1,l.normal),_.uniform4fv(n.uBaseColor,e.base),_.uniform3fv(n.uSpecular,e.specular),_.uniform1f(n.uMetallic,e.metallic),_.uniform1f(n.uRoughness,e.roughness),_.uniform1f(n.uNormalScale,e.normalScale),_.uniform1f(n.uOcclusionStrength,e.occlusion),_.uniform3fv(n.uEmissive,e.emissive),_.uniform1f(n.uAlphaCutoff,e.cutoff),_.uniform1i(n.uFlags,e.flags),_.bindVertexArray(l.vao),l.index?_.drawElements(l.mode,l.count,l.index.type,l.index.offset):_.drawArrays(l.mode,0,l.count)}_.bindVertexArray(null),_.depthMask(!0)},dispose(){f.forEach(e=>_.deleteVertexArray(e.vao)),i.forEach(e=>_.deleteBuffer(e)),c.forEach(e=>_.deleteTexture(e)),_.deleteProgram(r),f.length=0}}),S={center:[0,0,0],radius:1},U=!1,C=()=>{let t=Math.min(globalThis.devicePixelRatio||1,2),r=Math.round(e.clientWidth*t),o=Math.round(e.clientHeight*t);r&&o&&(x.width=r,x.height=o)};return C(),{async load(e,t){let r=e.filter(o.HA);if(!r.length){let t=[...new Set(e.map(e=>e.format??e.src))];throw Error(e.length?`Clover draws glTF models (${o.ZO.join(", ")}), not ${t.join(", ")}.`:"The Scene paints no model.")}let a=_.getParameter(_.MAX_TEXTURE_SIZE),n=await Promise.all(r.map(e=>{var r;let o,n,i,c;return r=e.src,o=(null==t?void 0:t.fetch)??globalThis.fetch,n=u.get(o)??new Map,u.set(o,n),i=`${(0,l.lq)(t)} ${a??""} ${r}`,(c=n.get(i))||(c=s(r,t,a).finally(()=>n.delete(i)),n.set(i,c)),c}));if(U)return S;n.forEach((e,t)=>N.add(e,A(r[t])));let i=N.bounds();return i&&(S={center:i.min.map((e,t)=>(e+i.max[t])/2),radius:Math.hypot(...i.max.map((e,t)=>e-i.min[t]))/2||1}),S},draw(e){var t,r,o;let l,n,i,u,s,c,f,d;if(U||!x.width||!x.height)return;let m=(0,a.fr)(e,S.center),v=Math.max(S.radius/1e3,e.distance-2*S.radius),p=e.distance+4*S.radius,g=(t=a.tT*Math.PI/180,r=x.width/x.height,l=1/Math.tan(t/2),n=1/(v-p),new Float32Array([l/r,0,0,0,0,l,0,0,0,0,(p+v)*n,-1,0,0,2*p*v*n,0]));N.draw(h(g,(o=S.center,i=e=>{let t=Math.hypot(...e)||1;return[e[0]/t,e[1]/t,e[2]/t]},u=(e,t)=>[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]],s=(e,t)=>e[0]*t[0]+e[1]*t[1]+e[2]*t[2],c=i([m[0]-o[0],m[1]-o[1],m[2]-o[2]]),f=i(u([0,1,0],c)),d=u(c,f),new Float32Array([f[0],d[0],c[0],0,f[1],d[1],c[1],0,f[2],d[2],c[2],0,-s(f,m),-s(d,m),-s(c,m),1]))),m,x.width,x.height)},resize:C,dispose(){var e;U||(U=!0,x.removeEventListener("webglcontextlost",M),N.dispose(),null==(e=_.getExtension("WEBGL_lose_context"))||e.loseContext(),x.remove())}}}}}]);