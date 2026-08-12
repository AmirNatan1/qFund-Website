(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,96812,e=>{"use strict";let t=parseInt(e.i(90072).REVISION.replace(/\D+/g,""));e.s(["version",0,t])},79353,e=>{"use strict";var t,r,s,o,i=e.i(31067),a=e.i(71645),n=e.i(90072),l=e.i(51159),u=e.i(5230),d=n,c=e.i(96812);let h=(t={cellSize:.5,sectionSize:1,fadeDistance:100,fadeStrength:1,fadeFrom:1,cellThickness:.5,sectionThickness:1,cellColor:new n.Color,sectionColor:new n.Color,infiniteGrid:!1,followCamera:!1,worldCamProjPosition:new n.Vector3,worldPlanePosition:new n.Vector3},r=`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform vec3 worldPlanePosition;
    uniform float fadeDistance;
    uniform bool infiniteGrid;
    uniform bool followCamera;

    void main() {
      localPosition = position.xzy;
      if (infiniteGrid) localPosition *= 1.0 + fadeDistance;
      
      worldPosition = modelMatrix * vec4(localPosition, 1.0);
      if (followCamera) {
        worldPosition.xyz += (worldCamProjPosition - worldPlanePosition);
        localPosition = (inverse(modelMatrix) * worldPosition).xyz;
      }

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,s=`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform float cellSize;
    uniform float sectionSize;
    uniform vec3 cellColor;
    uniform vec3 sectionColor;
    uniform float fadeDistance;
    uniform float fadeStrength;
    uniform float fadeFrom;
    uniform float cellThickness;
    uniform float sectionThickness;

    float getGrid(float size, float thickness) {
      vec2 r = localPosition.xz / size;
      vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
      float line = min(grid.x, grid.y) + 1.0 - thickness;
      return 1.0 - min(line, 1.0);
    }

    void main() {
      float g1 = getGrid(cellSize, cellThickness);
      float g2 = getGrid(sectionSize, sectionThickness);

      vec3 from = worldCamProjPosition*vec3(fadeFrom);
      float dist = distance(from, worldPosition.xyz);
      float d = 1.0 - min(dist / fadeDistance, 1.0);
      vec3 color = mix(cellColor, sectionColor, min(1.0, sectionThickness * g2));

      gl_FragColor = vec4(color, (g1 + g2) * pow(d, fadeStrength));
      gl_FragColor.a = mix(0.75 * gl_FragColor.a, gl_FragColor.a, g2);
      if (gl_FragColor.a <= 0.0) discard;

      #include <tonemapping_fragment>
      #include <${c.version>=154?"colorspace_fragment":"encodings_fragment"}>
    }
  `,(o=class extends d.ShaderMaterial{constructor(e){for(const o in super({vertexShader:r,fragmentShader:s,...e}),t)this.uniforms[o]=new d.Uniform(t[o]),Object.defineProperty(this,o,{get(){return this.uniforms[o].value},set(e){this.uniforms[o].value=e}});this.uniforms=d.UniformsUtils.clone(this.uniforms)}}).key=d.MathUtils.generateUUID(),o),m=a.forwardRef(({args:e,cellColor:t="#000000",sectionColor:r="#2080ff",cellSize:s=.5,sectionSize:o=1,followCamera:d=!1,infiniteGrid:c=!1,fadeDistance:m=100,fadeStrength:f=1,fadeFrom:x=1,cellThickness:p=.5,sectionThickness:v=1,side:g=n.BackSide,...M},j)=>{(0,l.extend)({GridMaterial:h});let y=a.useRef(null);a.useImperativeHandle(j,()=>y.current,[]);let S=new n.Plane,_=new n.Vector3(0,1,0),b=new n.Vector3(0,0,0);return(0,u.useFrame)(e=>{S.setFromNormalAndCoplanarPoint(_,b).applyMatrix4(y.current.matrixWorld);let t=y.current.material,r=t.uniforms.worldCamProjPosition,s=t.uniforms.worldPlanePosition;S.projectPoint(e.camera.position,r.value),s.value.set(0,0,0).applyMatrix4(y.current.matrixWorld)}),a.createElement("mesh",(0,i.default)({ref:y,frustumCulled:!1},M),a.createElement("gridMaterial",(0,i.default)({transparent:!0,"extensions-derivatives":!0,side:g},{cellSize:s,sectionSize:o,cellColor:t,sectionColor:r,cellThickness:p,sectionThickness:v},{fadeDistance:m,fadeStrength:f,fadeFrom:x,infiniteGrid:c,followCamera:d})),a.createElement("planeGeometry",{args:e}))});e.s(["Grid",0,m],79353)},63219,e=>{"use strict";var t=e.i(31067),r=e.i(71645),s=e.i(90072),o=e.i(68911);let i=r.forwardRef(function({args:[e=1,s=1,o=1]=[],radius:i=.05,steps:n=1,smoothness:l=4,bevelSegments:u=4,creaseAngle:d=.4,children:c,...h},m){return r.createElement("mesh",(0,t.default)({ref:m},h),r.createElement(a,{args:[e,s,o],radius:i,steps:n,smoothness:l,bevelSegments:u,creaseAngle:d}),c)}),a=r.forwardRef(function({args:[e=1,i=1,a=1]=[],radius:n=.05,steps:l=1,smoothness:u=4,bevelSegments:d=4,creaseAngle:c=.4,...h},m){let f=r.useMemo(()=>{let t,r;return t=new s.Shape,r=n-1e-5,t.absarc(1e-5,1e-5,1e-5,-Math.PI/2,-Math.PI,!0),t.absarc(1e-5,i-2*r,1e-5,Math.PI,Math.PI/2,!0),t.absarc(e-2*r,i-2*r,1e-5,Math.PI/2,0,!0),t.absarc(e-2*r,1e-5,1e-5,0,-Math.PI/2,!0),t},[e,i,n]),x=r.useMemo(()=>({depth:a-2*n,bevelEnabled:!0,bevelSegments:2*d,steps:l,bevelSize:n-1e-5,bevelThickness:n,curveSegments:u}),[a,n,u,d,l]),p=r.useRef(null);return r.useLayoutEffect(()=>{p.current&&(p.current.center(),(0,o.toCreasedNormals)(p.current,c))},[f,x,c]),r.useImperativeHandle(m,()=>p.current),r.createElement("extrudeGeometry",(0,t.default)({ref:p,args:[f,x]},h))});e.s(["RoundedBox",0,i])},73245,e=>{"use strict";var t=e.i(43476),r=e.i(71645),s=e.i(90072),o=e.i(75056),i=e.i(5230),a=e.i(30297),n=e.i(43257),l=e.i(48455),u=e.i(79353),d=e.i(31067),c=e.i(51159),h=e.i(16096),m=s,f=e.i(96812);class x extends m.ShaderMaterial{constructor(e=new m.Vector2){super({uniforms:{inputBuffer:new m.Uniform(null),depthBuffer:new m.Uniform(null),resolution:new m.Uniform(new m.Vector2),texelSize:new m.Uniform(new m.Vector2),halfTexelSize:new m.Uniform(new m.Vector2),kernel:new m.Uniform(0),scale:new m.Uniform(1),cameraNear:new m.Uniform(0),cameraFar:new m.Uniform(1),minDepthThreshold:new m.Uniform(0),maxDepthThreshold:new m.Uniform(1),depthScale:new m.Uniform(0),depthToBlurRatioBias:new m.Uniform(.25)},fragmentShader:`#include <common>
        #include <dithering_pars_fragment>      
        uniform sampler2D inputBuffer;
        uniform sampler2D depthBuffer;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float minDepthThreshold;
        uniform float maxDepthThreshold;
        uniform float depthScale;
        uniform float depthToBlurRatioBias;
        varying vec2 vUv;
        varying vec2 vUv0;
        varying vec2 vUv1;
        varying vec2 vUv2;
        varying vec2 vUv3;

        void main() {
          float depthFactor = 0.0;
          
          #ifdef USE_DEPTH
            vec4 depth = texture2D(depthBuffer, vUv);
            depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
            depthFactor *= depthScale;
            depthFactor = max(0.0, min(1.0, depthFactor + 0.25));
          #endif
          
          vec4 sum = texture2D(inputBuffer, mix(vUv0, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv1, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv2, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv3, vUv, depthFactor));
          gl_FragColor = sum * 0.25 ;

          #include <dithering_fragment>
          #include <tonemapping_fragment>
          #include <${f.version>=154?"colorspace_fragment":"encodings_fragment"}>
        }`,vertexShader:`uniform vec2 texelSize;
        uniform vec2 halfTexelSize;
        uniform float kernel;
        uniform float scale;
        varying vec2 vUv;
        varying vec2 vUv0;
        varying vec2 vUv1;
        varying vec2 vUv2;
        varying vec2 vUv3;

        void main() {
          vec2 uv = position.xy * 0.5 + 0.5;
          vUv = uv;

          vec2 dUv = (texelSize * vec2(kernel) + halfTexelSize) * scale;
          vUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);
          vUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);
          vUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);
          vUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);

          gl_Position = vec4(position.xy, 1.0, 1.0);
        }`,blending:m.NoBlending,depthWrite:!1,depthTest:!1}),this.toneMapped=!1,this.setTexelSize(e.x,e.y),this.kernel=new Float32Array([0,1,2,2,3])}setTexelSize(e,t){this.uniforms.texelSize.value.set(e,t),this.uniforms.halfTexelSize.value.set(e,t).multiplyScalar(.5)}setResolution(e){this.uniforms.resolution.value.copy(e)}}class p{constructor({gl:e,resolution:t,width:r=500,height:o=500,minDepthThreshold:i=0,maxDepthThreshold:a=1,depthScale:n=0,depthToBlurRatioBias:l=.25}){this.renderToScreen=!1,this.renderTargetA=new s.WebGLRenderTarget(t,t,{minFilter:s.LinearFilter,magFilter:s.LinearFilter,stencilBuffer:!1,depthBuffer:!1,type:s.HalfFloatType}),this.renderTargetB=this.renderTargetA.clone(),this.convolutionMaterial=new x,this.convolutionMaterial.setTexelSize(1/r,1/o),this.convolutionMaterial.setResolution(new s.Vector2(r,o)),this.scene=new s.Scene,this.camera=new s.Camera,this.convolutionMaterial.uniforms.minDepthThreshold.value=i,this.convolutionMaterial.uniforms.maxDepthThreshold.value=a,this.convolutionMaterial.uniforms.depthScale.value=n,this.convolutionMaterial.uniforms.depthToBlurRatioBias.value=l,this.convolutionMaterial.defines.USE_DEPTH=n>0;const u=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),d=new Float32Array([0,0,2,0,0,2]),c=new s.BufferGeometry;c.setAttribute("position",new s.BufferAttribute(u,3)),c.setAttribute("uv",new s.BufferAttribute(d,2)),this.screen=new s.Mesh(c,this.convolutionMaterial),this.screen.frustumCulled=!1,this.scene.add(this.screen)}render(e,t,r){let s,o,i,a=this.scene,n=this.camera,l=this.renderTargetA,u=this.renderTargetB,d=this.convolutionMaterial,c=d.uniforms;c.depthBuffer.value=t.depthTexture;let h=d.kernel,m=t;for(o=0,i=h.length-1;o<i;++o)s=(1&o)==0?l:u,c.kernel.value=h[o],c.inputBuffer.value=m.texture,e.setRenderTarget(s),e.render(a,n),m=s;c.kernel.value=h[o],c.inputBuffer.value=m.texture,e.setRenderTarget(this.renderToScreen?null:r),e.render(a,n)}}var v=s;class g extends v.MeshStandardMaterial{constructor(e={}){super(e),this._tDepth={value:null},this._distortionMap={value:null},this._tDiffuse={value:null},this._tDiffuseBlur={value:null},this._textureMatrix={value:null},this._hasBlur={value:!1},this._mirror={value:0},this._mixBlur={value:0},this._blurStrength={value:.5},this._minDepthThreshold={value:.9},this._maxDepthThreshold={value:1},this._depthScale={value:0},this._depthToBlurRatioBias={value:.25},this._distortion={value:1},this._mixContrast={value:1},this.setValues(e)}onBeforeCompile(e){var t;null!=(t=e.defines)&&t.USE_UV||(e.defines.USE_UV=""),e.uniforms.hasBlur=this._hasBlur,e.uniforms.tDiffuse=this._tDiffuse,e.uniforms.tDepth=this._tDepth,e.uniforms.distortionMap=this._distortionMap,e.uniforms.tDiffuseBlur=this._tDiffuseBlur,e.uniforms.textureMatrix=this._textureMatrix,e.uniforms.mirror=this._mirror,e.uniforms.mixBlur=this._mixBlur,e.uniforms.mixStrength=this._blurStrength,e.uniforms.minDepthThreshold=this._minDepthThreshold,e.uniforms.maxDepthThreshold=this._maxDepthThreshold,e.uniforms.depthScale=this._depthScale,e.uniforms.depthToBlurRatioBias=this._depthToBlurRatioBias,e.uniforms.distortion=this._distortion,e.uniforms.mixContrast=this._mixContrast,e.vertexShader=`
        uniform mat4 textureMatrix;
        varying vec4 my_vUv;
      ${e.vertexShader}`,e.vertexShader=e.vertexShader.replace("#include <project_vertex>",`#include <project_vertex>
        my_vUv = textureMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );`),e.fragmentShader=`
        uniform sampler2D tDiffuse;
        uniform sampler2D tDiffuseBlur;
        uniform sampler2D tDepth;
        uniform sampler2D distortionMap;
        uniform float distortion;
        uniform float cameraNear;
			  uniform float cameraFar;
        uniform bool hasBlur;
        uniform float mixBlur;
        uniform float mirror;
        uniform float mixStrength;
        uniform float minDepthThreshold;
        uniform float maxDepthThreshold;
        uniform float mixContrast;
        uniform float depthScale;
        uniform float depthToBlurRatioBias;
        varying vec4 my_vUv;
        ${e.fragmentShader}`,e.fragmentShader=e.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>

      float distortionFactor = 0.0;
      #ifdef USE_DISTORTION
        distortionFactor = texture2D(distortionMap, vUv).r * distortion;
      #endif

      vec4 new_vUv = my_vUv;
      new_vUv.x += distortionFactor;
      new_vUv.y += distortionFactor;

      vec4 base = texture2DProj(tDiffuse, new_vUv);
      vec4 blur = texture2DProj(tDiffuseBlur, new_vUv);

      vec4 merge = base;

      #ifdef USE_NORMALMAP
        vec2 normal_uv = vec2(0.0);
        vec4 normalColor = texture2D(normalMap, vUv * normalScale);
        vec3 my_normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
        vec3 coord = new_vUv.xyz / new_vUv.w;
        normal_uv = coord.xy + coord.z * my_normal.xz * 0.05;
        vec4 base_normal = texture2D(tDiffuse, normal_uv);
        vec4 blur_normal = texture2D(tDiffuseBlur, normal_uv);
        merge = base_normal;
        blur = blur_normal;
      #endif

      float depthFactor = 0.0001;
      float blurFactor = 0.0;

      #ifdef USE_DEPTH
        vec4 depth = texture2DProj(tDepth, new_vUv);
        depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
        depthFactor *= depthScale;
        depthFactor = max(0.0001, min(1.0, depthFactor));

        #ifdef USE_BLUR
          blur = blur * min(1.0, depthFactor + depthToBlurRatioBias);
          merge = merge * min(1.0, depthFactor + 0.5);
        #else
          merge = merge * depthFactor;
        #endif

      #endif

      float reflectorRoughnessFactor = roughness;
      #ifdef USE_ROUGHNESSMAP
        vec4 reflectorTexelRoughness = texture2D( roughnessMap, vUv );
        reflectorRoughnessFactor *= reflectorTexelRoughness.g;
      #endif

      #ifdef USE_BLUR
        blurFactor = min(1.0, mixBlur * reflectorRoughnessFactor);
        merge = mix(merge, blur, blurFactor);
      #endif

      vec4 newMerge = vec4(0.0, 0.0, 0.0, 1.0);
      newMerge.r = (merge.r - 0.5) * mixContrast + 0.5;
      newMerge.g = (merge.g - 0.5) * mixContrast + 0.5;
      newMerge.b = (merge.b - 0.5) * mixContrast + 0.5;

      diffuseColor.rgb = diffuseColor.rgb * ((1.0 - min(1.0, mirror)) + newMerge.rgb * mixStrength);
      `)}get tDiffuse(){return this._tDiffuse.value}set tDiffuse(e){this._tDiffuse.value=e}get tDepth(){return this._tDepth.value}set tDepth(e){this._tDepth.value=e}get distortionMap(){return this._distortionMap.value}set distortionMap(e){this._distortionMap.value=e}get tDiffuseBlur(){return this._tDiffuseBlur.value}set tDiffuseBlur(e){this._tDiffuseBlur.value=e}get textureMatrix(){return this._textureMatrix.value}set textureMatrix(e){this._textureMatrix.value=e}get hasBlur(){return this._hasBlur.value}set hasBlur(e){this._hasBlur.value=e}get mirror(){return this._mirror.value}set mirror(e){this._mirror.value=e}get mixBlur(){return this._mixBlur.value}set mixBlur(e){this._mixBlur.value=e}get mixStrength(){return this._blurStrength.value}set mixStrength(e){this._blurStrength.value=e}get minDepthThreshold(){return this._minDepthThreshold.value}set minDepthThreshold(e){this._minDepthThreshold.value=e}get maxDepthThreshold(){return this._maxDepthThreshold.value}set maxDepthThreshold(e){this._maxDepthThreshold.value=e}get depthScale(){return this._depthScale.value}set depthScale(e){this._depthScale.value=e}get depthToBlurRatioBias(){return this._depthToBlurRatioBias.value}set depthToBlurRatioBias(e){this._depthToBlurRatioBias.value=e}get distortion(){return this._distortion.value}set distortion(e){this._distortion.value=e}get mixContrast(){return this._mixContrast.value}set mixContrast(e){this._mixContrast.value=e}}let M=r.forwardRef(({mixBlur:e=0,mixStrength:t=1,resolution:o=256,blur:a=[0,0],minDepthThreshold:n=.9,maxDepthThreshold:l=1,depthScale:u=0,depthToBlurRatioBias:m=.25,mirror:f=0,distortion:x=1,mixContrast:v=1,distortionMap:M,reflectorOffset:j=0,...y},S)=>{(0,c.extend)({MeshReflectorMaterialImpl:g});let _=(0,h.useThree)(({gl:e})=>e),b=(0,h.useThree)(({camera:e})=>e),w=(0,h.useThree)(({scene:e})=>e),C=(a=Array.isArray(a)?a:[a,a])[0]+a[1]>0,D=a[0],B=a[1],U=r.useRef(null);r.useImperativeHandle(S,()=>U.current,[]);let[T]=r.useState(()=>new s.Plane),[F]=r.useState(()=>new s.Vector3),[P]=r.useState(()=>new s.Vector3),[R]=r.useState(()=>new s.Vector3),[E]=r.useState(()=>new s.Matrix4),[A]=r.useState(()=>new s.Vector3(0,0,-1)),[G]=r.useState(()=>new s.Vector4),[I]=r.useState(()=>new s.Vector3),[k]=r.useState(()=>new s.Vector3),[z]=r.useState(()=>new s.Vector4),[L]=r.useState(()=>new s.Matrix4),[V]=r.useState(()=>new s.PerspectiveCamera),O=r.useCallback(()=>{var e;let t=U.current.parent||(null==(e=U.current)||null==(e=e.__r3f.parent)?void 0:e.object);if(!t||(P.setFromMatrixPosition(t.matrixWorld),R.setFromMatrixPosition(b.matrixWorld),E.extractRotation(t.matrixWorld),F.set(0,0,1),F.applyMatrix4(E),P.addScaledVector(F,j),I.subVectors(P,R),I.dot(F)>0))return;I.reflect(F).negate(),I.add(P),E.extractRotation(b.matrixWorld),A.set(0,0,-1),A.applyMatrix4(E),A.add(R),k.subVectors(P,A),k.reflect(F).negate(),k.add(P),V.position.copy(I),V.up.set(0,1,0),V.up.applyMatrix4(E),V.up.reflect(F),V.lookAt(k),V.far=b.far,V.updateMatrixWorld(),V.projectionMatrix.copy(b.projectionMatrix),L.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),L.multiply(V.projectionMatrix),L.multiply(V.matrixWorldInverse),L.multiply(t.matrixWorld),T.setFromNormalAndCoplanarPoint(F,P),T.applyMatrix4(V.matrixWorldInverse),G.set(T.normal.x,T.normal.y,T.normal.z,T.constant);let r=V.projectionMatrix;z.x=(Math.sign(G.x)+r.elements[8])/r.elements[0],z.y=(Math.sign(G.y)+r.elements[9])/r.elements[5],z.z=-1,z.w=(1+r.elements[10])/r.elements[14],G.multiplyScalar(2/G.dot(z)),r.elements[2]=G.x,r.elements[6]=G.y,r.elements[10]=G.z+1,r.elements[14]=G.w},[b,j]),[N,W,H,$]=r.useMemo(()=>{let r={minFilter:s.LinearFilter,magFilter:s.LinearFilter,type:s.HalfFloatType},i=new s.WebGLRenderTarget(o,o,r);i.depthBuffer=!0,i.depthTexture=new s.DepthTexture(o,o),i.depthTexture.format=s.DepthFormat,i.depthTexture.type=s.UnsignedShortType;let a=new s.WebGLRenderTarget(o,o,r),d=new p({gl:_,resolution:o,width:D,height:B,minDepthThreshold:n,maxDepthThreshold:l,depthScale:u,depthToBlurRatioBias:m}),c={mirror:f,textureMatrix:L,mixBlur:e,tDiffuse:i.texture,tDepth:i.depthTexture,tDiffuseBlur:a.texture,hasBlur:C,mixStrength:t,minDepthThreshold:n,maxDepthThreshold:l,depthScale:u,depthToBlurRatioBias:m,distortion:x,distortionMap:M,mixContrast:v,"defines-USE_BLUR":C?"":void 0,"defines-USE_DEPTH":u>0?"":void 0,"defines-USE_DISTORTION":M?"":void 0};return[i,a,d,c]},[_,D,B,L,o,f,C,e,t,n,l,u,m,x,M,v]);return(0,i.useFrame)(()=>{var e;let t=U.current.parent||(null==(e=U.current)||null==(e=e.__r3f.parent)?void 0:e.object);if(!t)return;t.visible=!1;let r=_.xr.enabled,s=_.shadowMap.autoUpdate;O(),_.xr.enabled=!1,_.shadowMap.autoUpdate=!1,_.setRenderTarget(N),_.state.buffers.depth.setMask(!0),_.autoClear||_.clear(),_.render(w,V),C&&H.render(_,N,W),_.xr.enabled=r,_.shadowMap.autoUpdate=s,t.visible=!0,_.setRenderTarget(null)}),r.createElement("meshReflectorMaterialImpl",(0,d.default)({attach:"material",key:"key"+$["defines-USE_BLUR"]+$["defines-USE_DEPTH"]+$["defines-USE_DISTORTION"],ref:U},$,y))});var j=e.i(63219),y=e.i(79877);let S={void:"#04090C",obsidian:"#090C12",charcoal:"#12161E",gunmetal:"#1B212B",steel:"#2A323E",brushed:"#3B4450",cyan:"#00C8E8",blue:"#2F6BFF",green:"#3BE08A",amber:"#FFB020",rose:"#FF4D6A"},_=[-1.42,1.42],b=2*Math.PI,w=Math.PI/180,C=e=>{let t=e%0x7fffffff;return t<=0&&(t+=0x7ffffffe),()=>(t=16807*t%0x7fffffff)/0x7fffffff},D=new s.Object3D,B=new s.Color;function U({seed:e=1,count:o=24}){let a=(0,r.useRef)(),n=(0,r.useRef)(),l=(0,r.useRef)(),u=(0,r.useRef)(),d=(0,r.useRef)(),c=1.76/o,h=(0,r.useMemo)(()=>{let t=C(7919*e+13),r=[S.cyan,S.cyan,S.blue,S.green,S.green,S.amber],i=[],a=[];for(let e=0;e<o;e++){let o=.17+c*(e+.5),n=t()>.08;if(a.push({y:o,populated:n,depth:.5+.12*t()}),n)for(let e=0;e<9;e++){let a,n;0===e?(a=S.green,n=2):1===e?(a=S.cyan,n=1):(a=t()>.965?S.rose:r[r.length*t()|0],n=0),i.push({x:.163+.0122*e,y:o+(0===e?-.011:.009),color:new s.Color(a),mode:n,seed:t(),rate:1.4+16*t()})}}return{blades:a,ledList:i}},[e,o,c]);return(0,r.useLayoutEffect)(()=>{let{blades:e,ledList:t}=h,r=0,s=0,i=0;e.forEach(({y:e,populated:t,depth:o})=>{if(D.position.set(0,e,.42-o/2),D.rotation.set(0,0,0),D.scale.set(1,1,o),D.updateMatrix(),a.current.setMatrixAt(r,D.matrix),D.position.set(0,e,.4305),D.scale.set(1,t?1:1.06,1),D.updateMatrix(),n.current.setMatrixAt(r,D.matrix),r++,t){for(let t=0;t<3;t++)D.position.set(-.052+.072*t,e+.001,.4405),D.scale.set(1,1,1),D.updateMatrix(),l.current.setMatrixAt(s++,D.matrix);for(let t=0;t<2;t++)D.position.set(-.222+.086*t,e,.4395),D.updateMatrix(),u.current.setMatrixAt(i++,D.matrix)}});for(let e=s;e<3*o;e++)D.position.set(0,-9,0),D.updateMatrix(),l.current.setMatrixAt(e,D.matrix);for(let e=i;e<2*o;e++)D.position.set(0,-9,0),D.updateMatrix(),u.current.setMatrixAt(e,D.matrix);t.forEach((e,t)=>{D.position.set(e.x,e.y,.4455),D.rotation.set(0,0,0),D.scale.set(1,1,1),D.updateMatrix(),d.current.setMatrixAt(t,D.matrix),d.current.setColorAt(t,e.color)}),a.current.instanceMatrix.needsUpdate=!0,n.current.instanceMatrix.needsUpdate=!0,l.current.instanceMatrix.needsUpdate=!0,u.current.instanceMatrix.needsUpdate=!0,d.current.instanceMatrix.needsUpdate=!0,d.current.instanceColor&&(d.current.instanceColor.needsUpdate=!0)},[h,o]),(0,i.useFrame)(({clock:e})=>{let t=d.current;if(!t||!t.instanceColor)return;let r=e.elapsedTime,s=h.ledList;for(let e=0;e<s.length;e++){let o,i=s[e];if(2===i.mode)o=1;else if(1===i.mode)o=.28+.72*(.5+.5*Math.sin(2.1*r+40*i.seed));else{let e=Math.sin(.61*r+31*i.seed)>.45?2.9:1;o=Math.sin(r*i.rate*e+97*i.seed)>.12?1:.045}B.copy(i.color).multiplyScalar(.1+4.4*o),t.setColorAt(e,B)}t.instanceColor.needsUpdate=!0}),(0,t.jsxs)("group",{children:[(0,t.jsxs)("instancedMesh",{ref:a,args:[void 0,void 0,o],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[.515,.056,1]}),(0,t.jsx)("meshStandardMaterial",{color:S.charcoal,roughness:.62,metalness:.78})]}),(0,t.jsxs)("instancedMesh",{ref:n,args:[void 0,void 0,o],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[.525,.05,.022]}),(0,t.jsx)("meshStandardMaterial",{color:"#333D4A",roughness:.42,metalness:.72,emissive:"#0A1D28",emissiveIntensity:1})]}),(0,t.jsxs)("instancedMesh",{ref:l,args:[void 0,void 0,3*o],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[.062,.026,.014]}),(0,t.jsx)("meshStandardMaterial",{color:"#05070B",roughness:.95,metalness:.2})]}),(0,t.jsxs)("instancedMesh",{ref:u,args:[void 0,void 0,2*o],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[.074,.036,.016]}),(0,t.jsx)("meshStandardMaterial",{color:"#464F5C",roughness:.33,metalness:.95})]}),(0,t.jsxs)("instancedMesh",{ref:d,args:[void 0,void 0,h.ledList.length],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[.011,.011,.007]}),(0,t.jsx)("meshBasicMaterial",{toneMapped:!1})]})]})}function T({offsets:e=[-.152,.152],radius:o=.14,speed:a=9,...n}){let l=(0,r.useRef)(),u=(0,r.useRef)(),d=(0,r.useRef)(),c=(0,r.useRef)(),h=(0,r.useRef)(),m=(0,r.useRef)(),f=e.length;return(0,r.useLayoutEffect)(()=>{e.forEach((e,t)=>{D.rotation.set(0,0,0),D.scale.set(1,1,1),D.position.set(e,0,0),D.updateMatrix(),u.current.setMatrixAt(t,D.matrix),D.position.set(e,.037,0),D.rotation.set(-Math.PI/2,0,0),D.updateMatrix(),d.current.setMatrixAt(t,D.matrix),D.rotation.set(Math.PI/2,0,0),D.position.set(e,0,0),D.updateMatrix(),h.current.setMatrixAt(t,D.matrix),[.42,.68,.95].forEach((r,s)=>{D.position.set(e,0,.034),D.rotation.set(0,0,0),D.scale.setScalar(o*r),D.updateMatrix(),c.current.setMatrixAt(3*t+s,D.matrix)}),D.scale.set(1,1,1);for(let r=0;r<9;r++){let s=r/9*b;D.position.set(e+Math.cos(s)*o*.55,Math.sin(s)*o*.55,0),D.rotation.set(0,0,s),D.updateMatrix(),D.rotateX(.62),D.updateMatrix(),m.current.setMatrixAt(9*t+r,D.matrix)}}),[u,d,c,h,m].forEach(e=>e.current.instanceMatrix.needsUpdate=!0)},[e,o]),(0,i.useFrame)((e,t)=>{l.current&&(l.current.rotation.z+=t*a)}),(0,t.jsxs)("group",{...n,children:[(0,t.jsxs)("instancedMesh",{ref:u,args:[void 0,void 0,f],frustumCulled:!1,children:[(0,t.jsx)("cylinderGeometry",{args:[1.09*o,1.09*o,.075,26,1,!0]}),(0,t.jsx)("meshStandardMaterial",{color:S.steel,roughness:.42,metalness:.95,side:s.DoubleSide})]}),(0,t.jsxs)("instancedMesh",{ref:d,args:[void 0,void 0,f],frustumCulled:!1,children:[(0,t.jsx)("ringGeometry",{args:[+o,1.09*o,26]}),(0,t.jsx)("meshBasicMaterial",{color:"#0B6E85",toneMapped:!1,side:s.DoubleSide})]}),(0,t.jsxs)("group",{rotation:[-Math.PI/2,0,0],children:[(0,t.jsxs)("instancedMesh",{ref:c,args:[void 0,void 0,3*f],frustumCulled:!1,children:[(0,t.jsx)("torusGeometry",{args:[1,.045,6,26]}),(0,t.jsx)("meshStandardMaterial",{color:S.brushed,roughness:.35,metalness:1})]}),(0,t.jsxs)("group",{ref:l,children:[(0,t.jsxs)("instancedMesh",{ref:h,args:[void 0,void 0,f],frustumCulled:!1,children:[(0,t.jsx)("cylinderGeometry",{args:[.3*o,.3*o,.038,18]}),(0,t.jsx)("meshStandardMaterial",{color:S.gunmetal,roughness:.3,metalness:1})]}),(0,t.jsxs)("instancedMesh",{ref:m,args:[void 0,void 0,9*f],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[.78*o,.011,.5*o]}),(0,t.jsx)("meshStandardMaterial",{color:"#2E3742",roughness:.55,metalness:.7})]})]})]})]})}function F(){let e=(0,r.useRef)(),s=.545,o=2.1-.235,i=.525-.055,a=1.06;return(0,r.useLayoutEffect)(()=>{[[-(s/2+.014),a,.028,o+.028],[s/2+.014,a,.028,o+.028],[0,a-(o/2+.014),s+.056,.028],[0,a+(o/2+.014),s+.056,.028]].forEach(([t,r,s,o],a)=>{D.position.set(t,r,i+.004),D.rotation.set(0,0,0),D.scale.set(s,o,.03),D.updateMatrix(),e.current.setMatrixAt(a,D.matrix)}),e.current.instanceMatrix.needsUpdate=!0},[s,o,a,i]),(0,t.jsxs)("group",{children:[(0,t.jsxs)("mesh",{position:[0,a,i],children:[(0,t.jsx)("boxGeometry",{args:[s,o,.012]}),(0,t.jsx)("meshPhysicalMaterial",{color:"#16303C",transmission:.97,thickness:.07,roughness:.16,metalness:.3,ior:1.45,reflectivity:.72,clearcoat:.6,clearcoatRoughness:.22,attenuationColor:"#1E7E95",attenuationDistance:3.2,transparent:!0,opacity:.9})]}),(0,t.jsxs)("instancedMesh",{ref:e,args:[void 0,void 0,4],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[1,1,1]}),(0,t.jsx)("meshStandardMaterial",{color:S.steel,roughness:.3,metalness:1})]}),(0,t.jsxs)("mesh",{position:[s/2-.045,a-.05,i+.03],children:[(0,t.jsx)("boxGeometry",{args:[.016,.24,.024]}),(0,t.jsx)("meshStandardMaterial",{color:"#4A535F",roughness:.22,metalness:1})]}),(0,t.jsxs)("mesh",{position:[s/2-.045,a+.13,i+.024],children:[(0,t.jsx)("cylinderGeometry",{args:[.011,.011,.014,14]}),(0,t.jsx)("meshStandardMaterial",{color:"#5B6673",roughness:.2,metalness:1})]})]})}function P({seed:e=1}){let o=(0,r.useRef)(),a=(0,r.useRef)(),n=(0,r.useRef)(),l=(0,r.useMemo)(()=>{let t=C(6151*e+7);return Array.from({length:12},(e,r)=>({x:-.2+r%6*.08,y:1.845+.052*Math.floor(r/6),color:new s.Color(t()>.22?S.green:S.amber),rate:2.5+15*t(),seed:t()}))},[e]);return(0,r.useLayoutEffect)(()=>{for(let e=0;e<24;e++)D.position.set(0,.24+.065*e,.008),D.rotation.set(0,0,0),D.scale.set(1,1,1),D.updateMatrix(),o.current.setMatrixAt(e,D.matrix);o.current.instanceMatrix.needsUpdate=!0,[-1,1].forEach((e,t)=>{D.position.set(.282*e,1.05,.006),D.updateMatrix(),n.current.setMatrixAt(t,D.matrix)}),n.current.instanceMatrix.needsUpdate=!0,l.forEach((e,t)=>{D.position.set(e.x,e.y,.018),D.updateMatrix(),a.current.setMatrixAt(t,D.matrix),a.current.setColorAt(t,e.color)}),a.current.instanceMatrix.needsUpdate=!0,a.current.instanceColor&&(a.current.instanceColor.needsUpdate=!0)},[l]),(0,i.useFrame)(({clock:e})=>{let t=a.current;if(!t||!t.instanceColor)return;let r=e.elapsedTime;for(let e=0;e<l.length;e++){let s=l[e],o=Math.sin(r*s.rate+61*s.seed)>-.15?1:.06;B.copy(s.color).multiplyScalar(.1+3.4*o),t.setColorAt(e,B)}t.instanceColor.needsUpdate=!0}),(0,t.jsxs)("group",{position:[0,0,-.541],rotation:[0,Math.PI,0],children:[(0,t.jsxs)("mesh",{position:[0,1.05,0],children:[(0,t.jsx)("boxGeometry",{args:[.57,2.1-.19,.03]}),(0,t.jsx)("meshStandardMaterial",{color:"#141922",roughness:.66,metalness:.74})]}),(0,t.jsxs)("instancedMesh",{ref:o,args:[void 0,void 0,24],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[.62-.17,.03,.02]}),(0,t.jsx)("meshStandardMaterial",{color:"#04070C",roughness:.98,metalness:.15})]}),(0,t.jsxs)("mesh",{position:[0,1.87,.012],children:[(0,t.jsx)("boxGeometry",{args:[.48,.13,.016]}),(0,t.jsx)("meshStandardMaterial",{color:"#1D242E",roughness:.4,metalness:.9})]}),(0,t.jsxs)("instancedMesh",{ref:a,args:[void 0,void 0,12],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[.013,.009,.006]}),(0,t.jsx)("meshBasicMaterial",{toneMapped:!1})]}),(0,t.jsxs)("instancedMesh",{ref:n,args:[void 0,void 0,2],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[.024,2.1-.19,.038]}),(0,t.jsx)("meshStandardMaterial",{color:"#2A323E",roughness:.34,metalness:1})]})]})}function R({seed:e=1}){let o=(0,r.useMemo)(()=>{let t=C(3391*e+5);return[.13,-.14].map(e=>{let r=.07*t();return new s.QuadraticBezierCurve3(new s.Vector3(e,2.04,-.33),new s.Vector3(e,2.7+r,.16),new s.Vector3(.55*e,2.575,1+r))})},[e]),i=["#132534","#0F3040"];return(0,t.jsx)("group",{children:o.map((e,r)=>(0,t.jsxs)("mesh",{children:[(0,t.jsx)("tubeGeometry",{args:[e,24,.03,7,!1]}),(0,t.jsx)("meshStandardMaterial",{color:i[r],roughness:.72,metalness:.32})]},r))})}function E({seed:e=1,...s}){let o=(0,r.useRef)(),a=(0,r.useRef)();return(0,r.useLayoutEffect)(()=>{[-1,1].forEach((e,t)=>{D.position.set(.262*e,1.05,.395),D.rotation.set(0,0,0),D.scale.set(1,1,1),D.updateMatrix(),a.current.setMatrixAt(t,D.matrix)}),a.current.instanceMatrix.needsUpdate=!0},[]),(0,i.useFrame)(({clock:t})=>{if(!o.current)return;let r=Math.sin(1.7*t.elapsedTime+2.4*e)>-.2?1:.18;o.current.color.copy(B.set(S.cyan)).multiplyScalar(1.1+2.2*r)}),(0,t.jsxs)("group",{...s,children:[(0,t.jsxs)("mesh",{position:[0,1.05,-1.05/2+.016],children:[(0,t.jsx)("boxGeometry",{args:[.62,2.1,.032]}),(0,t.jsx)("meshStandardMaterial",{color:S.obsidian,roughness:.7,metalness:.6})]}),[-1,1].map(e=>(0,t.jsx)(j.RoundedBox,{args:[.032,2.1,1.05],radius:.01,smoothness:2,position:[.294*e,1.05,0],children:(0,t.jsx)("meshStandardMaterial",{color:S.charcoal,roughness:.55,metalness:.82})},e)),(0,t.jsx)(j.RoundedBox,{args:[.632,.07,1.062],radius:.012,smoothness:2,position:[0,2.065,0],children:(0,t.jsx)("meshStandardMaterial",{color:S.gunmetal,roughness:.45,metalness:.9})}),(0,t.jsxs)("mesh",{position:[0,.045,0],children:[(0,t.jsx)("boxGeometry",{args:[.57,.09,.99]}),(0,t.jsx)("meshStandardMaterial",{color:"#070A0F",roughness:.9,metalness:.4})]}),(0,t.jsxs)("mesh",{position:[0,1.05,-.06],children:[(0,t.jsx)("boxGeometry",{args:[.55,2.1-.2,.02]}),(0,t.jsx)("meshStandardMaterial",{color:"#03050A",roughness:1,metalness:0})]}),(0,t.jsxs)("instancedMesh",{ref:a,args:[void 0,void 0,2],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[.038,1.86,.09]}),(0,t.jsx)("meshStandardMaterial",{color:"#171C24",roughness:.6,metalness:.85})]}),(0,t.jsx)(U,{seed:e}),(0,t.jsx)(F,{}),(0,t.jsxs)("mesh",{position:[0,1.985,.495],children:[(0,t.jsx)("boxGeometry",{args:[.48,.05,.014]}),(0,t.jsx)("meshStandardMaterial",{color:"#0C1017",roughness:.5,metalness:.7})]}),(0,t.jsxs)("mesh",{position:[-.09,1.985,.504],children:[(0,t.jsx)("boxGeometry",{args:[.2,.008,.006]}),(0,t.jsx)("meshBasicMaterial",{ref:o,toneMapped:!1,color:S.cyan})]}),(0,t.jsx)(T,{position:[0,2.15,-.05],radius:.14,speed:8.6+e%5*.9}),(0,t.jsx)(P,{seed:e}),(0,t.jsx)(R,{seed:e})]})}function A({width:e=5.6,depth:o=5.4,height:i=.3,reflective:a=!0}){let n=(0,r.useMemo)(()=>{let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d"),r=t.createRadialGradient(64,64,0,64,64,64);return r.addColorStop(0,"rgba(255,255,255,0.95)"),r.addColorStop(.45,"rgba(255,255,255,0.28)"),r.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=r,t.fillRect(0,0,128,128),new s.CanvasTexture(e)},[]);return(0,t.jsxs)("group",{children:[(0,t.jsxs)("mesh",{rotation:[-Math.PI/2,0,0],position:[0,.002,0],children:[(0,t.jsx)("planeGeometry",{args:[e,o]}),a?(0,t.jsx)(M,{resolution:512,blur:[240,64],mixBlur:.85,mixStrength:26,depthScale:1.1,minDepthThreshold:.35,maxDepthThreshold:1.35,color:"#070A11",roughness:.8,metalness:.82}):(0,t.jsx)("meshStandardMaterial",{color:"#070A11",roughness:.22,metalness:.95,envMapIntensity:1.7})]}),_.map(r=>(0,t.jsxs)("mesh",{rotation:[-Math.PI/2,0,0],position:[0,.009,r>0?r-.78:r+.78],renderOrder:2,children:[(0,t.jsx)("planeGeometry",{args:[.82*e,1.9]}),(0,t.jsx)("meshBasicMaterial",{map:n,color:"#127C96",transparent:!0,opacity:.75,depthWrite:!1,blending:s.AdditiveBlending,toneMapped:!1})]},r)),(0,t.jsx)(u.Grid,{position:[0,.005,0],args:[e,o],cellSize:.28,cellThickness:.5,cellColor:"#1B2530",sectionSize:1.12,sectionThickness:1,sectionColor:"#0E5A6B",fadeDistance:26,fadeStrength:1.2}),(0,t.jsxs)("mesh",{position:[0,-i/2,0],children:[(0,t.jsx)("boxGeometry",{args:[e,i,o]}),(0,t.jsx)("meshStandardMaterial",{color:"#0A0D13",roughness:.78,metalness:.55})]}),(0,t.jsxs)("mesh",{position:[0,-.022,0],children:[(0,t.jsx)("boxGeometry",{args:[e+.05,.03,o+.05]}),(0,t.jsx)("meshStandardMaterial",{color:S.gunmetal,roughness:.4,metalness:.95})]}),[-1,1].map(r=>(0,t.jsxs)("mesh",{position:[0,-.055,r*(o/2+.012)],children:[(0,t.jsx)("boxGeometry",{args:[e+.05,.012,.012]}),(0,t.jsx)("meshBasicMaterial",{color:"#0090AC",toneMapped:!1})]},`ex${r}`)),[-1,1].map(r=>(0,t.jsxs)("mesh",{position:[r*(e/2+.012),-.055,0],children:[(0,t.jsx)("boxGeometry",{args:[.012,.012,o+.05]}),(0,t.jsx)("meshBasicMaterial",{color:"#0090AC",toneMapped:!1})]},`ez${r}`)),(0,t.jsxs)("mesh",{rotation:[-Math.PI/2,0,0],position:[0,-i-.001,0],children:[(0,t.jsx)("planeGeometry",{args:[70,70]}),(0,t.jsx)("meshStandardMaterial",{color:"#04090C",roughness:1,metalness:0})]})]})}function G({span:e=4.4}){let s=(0,r.useRef)();return(0,r.useLayoutEffect)(()=>{for(let t=0;t<20;t++)D.position.set(-e/2+e/19*t,0,0),D.rotation.set(0,0,0),D.scale.set(1,1,1),D.updateMatrix(),s.current.setMatrixAt(t,D.matrix);s.current.instanceMatrix.needsUpdate=!0},[e]),(0,t.jsxs)("group",{position:[0,2.62,0],children:[[-1,1].map(r=>(0,t.jsxs)("mesh",{position:[0,0,.42*r],children:[(0,t.jsx)("boxGeometry",{args:[e,.055,.035]}),(0,t.jsx)("meshStandardMaterial",{color:S.steel,roughness:.45,metalness:.95})]},r)),(0,t.jsxs)("instancedMesh",{ref:s,args:[void 0,void 0,20],frustumCulled:!1,children:[(0,t.jsx)("boxGeometry",{args:[.022,.014,.86]}),(0,t.jsx)("meshStandardMaterial",{color:"#39424E",roughness:.5,metalness:.9})]}),[[-.24,"#0C1622"],[-.08,"#123246"],[.09,"#0A1A2A"],[.25,"#14202C"]].map(([r,s],o)=>(0,t.jsxs)("mesh",{position:[0,.035,r],rotation:[0,0,Math.PI/2],children:[(0,t.jsx)("cylinderGeometry",{args:[.021,.021,e,10]}),(0,t.jsx)("meshStandardMaterial",{color:s,roughness:.72,metalness:.35})]},o)),[-.66,.66].map(r=>(0,t.jsxs)("group",{position:[0,.12,r],children:[(0,t.jsxs)("mesh",{children:[(0,t.jsx)("boxGeometry",{args:[.92*e,.05,.1]}),(0,t.jsx)("meshStandardMaterial",{color:"#131923",roughness:.5,metalness:.8})]}),(0,t.jsxs)("mesh",{position:[0,-.028,0],children:[(0,t.jsx)("boxGeometry",{args:[.9*e,.008,.07]}),(0,t.jsx)("meshBasicMaterial",{color:"#8FD9EA",toneMapped:!1})]})]},r))]})}function I({spin:e=.075,reflections:s=!0}){let o=(0,r.useRef)(),a=(0,r.useRef)([]),n=(0,r.useMemo)(()=>{let e=[],t=1;return _.forEach((r,s)=>{for(let o=0;o<6;o++)e.push({key:`${s}-${o}`,seed:t++,position:[(o-2.5)*.685,0,r],rotation:[0,0===s?0:Math.PI,0]})}),e},[]);return(0,i.useFrame)(({clock:t})=>{let r=t.elapsedTime;o.current&&(o.current.rotation.y=r*e),a.current.forEach((e,t)=>{e&&(e.intensity=1.9+.55*Math.sin(r*(1.3+.37*t)+t))})}),(0,t.jsxs)("group",{ref:o,children:[(0,t.jsx)(A,{reflective:s}),n.map(e=>(0,t.jsx)(E,{seed:e.seed,position:e.position,rotation:e.rotation},e.key)),(0,t.jsx)(G,{}),_.map((e,r)=>[-1.05,1.05].map((s,o)=>(0,t.jsx)("pointLight",{ref:e=>{a.current[2*r+o]=e},position:[s,1,e],color:S.cyan,intensity:2,distance:3.6,decay:2},`${e}-${s}`))),(0,t.jsx)("pointLight",{position:[-1.5,2.45,0],color:"#BFEAF6",intensity:2.4,distance:7,decay:2}),(0,t.jsx)("pointLight",{position:[1.5,2.45,0],color:"#BFEAF6",intensity:2.4,distance:7,decay:2}),(0,t.jsx)("pointLight",{position:[0,1.6,-4.6],color:S.blue,intensity:6,distance:9,decay:2})]})}function k({spin:e=.075}){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("color",{attach:"background",args:[S.void]}),(0,t.jsx)("fog",{attach:"fog",args:[S.void,13,34]}),(0,t.jsx)("ambientLight",{intensity:.3,color:"#63879F"}),(0,t.jsx)("directionalLight",{position:[4,9,3],intensity:.5,color:"#9FC4D8"}),(0,t.jsxs)(n.Environment,{resolution:256,frames:1,children:[(0,t.jsx)("color",{attach:"background",args:["#04090C"]}),(0,t.jsx)(l.Lightformer,{intensity:4.2,"rotation-x":Math.PI/2,position:[0,6,-2],scale:[12,6,1],color:"#8FC2D8"}),(0,t.jsx)(l.Lightformer,{intensity:6,"rotation-y":Math.PI/2,position:[-7,2,0],scale:[10,3,1],color:"#00C8E8"}),(0,t.jsx)(l.Lightformer,{intensity:3.4,"rotation-y":-Math.PI/2,position:[7,2,0],scale:[10,3,1],color:"#2F6BFF"}),(0,t.jsx)(l.Lightformer,{intensity:1.1,"rotation-x":-Math.PI/2,position:[0,-4,0],scale:[14,14,1],color:"#0A1420"})]}),(0,t.jsx)(I,{spin:e}),(0,t.jsx)(a.OrbitControls,{makeDefault:!0,enablePan:!1,enableZoom:!1,enableDamping:!0,dampingFactor:.06,target:[0,1.06,0],minDistance:3.4,maxDistance:18,minPolarAngle:22*w,maxPolarAngle:86*w}),(0,t.jsxs)(y.EffectComposer,{multisampling:2,disableNormalPass:!0,children:[(0,t.jsx)(y.Bloom,{intensity:2,luminanceThreshold:.6,luminanceSmoothing:.28,mipmapBlur:!0,radius:.75}),(0,t.jsx)(y.Vignette,{offset:.3,darkness:.62,eskil:!1})]})]})}e.s(["CableRiser",0,R,"Datacenter",0,I,"FanBank",0,T,"Floor",0,A,"OverheadRig",0,G,"PALETTE",0,S,"RackDoor",0,F,"RackRear",0,P,"Scene",0,k,"ServerBlades",0,U,"ServerRack",0,E,"default",0,function({className:e,style:r,spin:i=.075,frameloop:a="always"}){return(0,t.jsx)(o.Canvas,{className:e,style:{width:"100%",height:"100%",display:"block",...r},dpr:1,frameloop:a,shadows:!1,gl:{antialias:!1,powerPreference:"high-performance",alpha:!1},camera:{position:[4.5,1.72,5.5],fov:44,near:.1,far:120},onCreated:({gl:e})=>{e.toneMapping=s.ACESFilmicToneMapping,e.toneMappingExposure=1.28,"transmissionResolutionScale"in e&&(e.transmissionResolutionScale=.4)},children:(0,t.jsx)(k,{spin:i})})}],73245)}]);