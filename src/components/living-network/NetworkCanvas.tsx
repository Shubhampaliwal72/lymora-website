"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { CubicBezierCurve3, Group, Mesh, SRGBColorSpace, TextureLoader, TubeGeometry, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { sceneMaterials, type NetworkCanvasProps } from "./scene";

function Computers({ theme }: Pick<NetworkCanvasProps, "theme">) {
  const source = useLoader(TextureLoader, ["/media/living-network/chat-demo-" + theme + ".png", "/brand/mark-" + theme + ".png"]);
  const textures = useMemo(() => source.map(image => {
    const texture = image.clone();
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }), [source]);
  const geometry = useMemo(() => ({
    case: new RoundedBoxGeometry(3.35, 2.27, .14, 2, .07),
    screen: new RoundedBoxGeometry(3.17, 2.1, .025, 1, .03),
    foot: new RoundedBoxGeometry(1.12, .075, .58, 1, .035),
    neck: new RoundedBoxGeometry(.19, .55, .13, 1, .035),
  }), []);
  useEffect(() => () => { textures.forEach(texture => texture.dispose()); }, [textures]);
  useEffect(() => () => { Object.values(geometry).forEach(shape => shape.dispose()); }, [geometry]);
  const dark = theme === "dark";
  const materials = sceneMaterials[theme];
  const devices: {position: [number, number, number]; rotation: [number, number, number]; scale: number; app: boolean}[] = [
    {position: [.58, 1.27, -.9], rotation: [-.035, -.22, -.1], scale: .83, app: false},
    {position: [2.4, -.58, -.35], rotation: [.015, -.35, .1], scale: .64, app: false},
    {position: [-1.05, -.75, 1.05], rotation: [.015, .12, -.035], scale: 1.03, app: true},
  ];
  return <>{devices.map((device, index) => <group key={index} position={device.position} rotation={device.rotation} scale={device.scale}>
    <mesh geometry={geometry.case}><meshStandardMaterial color={materials.bezel} metalness={dark ? .55 : .2} roughness={.38} /></mesh>
    <mesh geometry={geometry.screen} position={[0, 0, .086]}><meshBasicMaterial color={materials.screen} toneMapped={false} /></mesh>
    {device.app ? <mesh position={[0, 0, .105]}><planeGeometry args={[3.14, 2.0933]} /><meshBasicMaterial map={textures[0]} toneMapped={false} /></mesh> : <mesh position={[0, 0, .105]}><planeGeometry args={[1.02, 1.02]} /><meshBasicMaterial map={textures[1]} transparent toneMapped={false} /></mesh>}
    <mesh geometry={geometry.neck} position={[0, -1.35, -.03]} rotation={[-.12, 0, 0]}><meshStandardMaterial color={materials.neck} metalness={.5} roughness={.5} /></mesh>
    <mesh geometry={geometry.foot} position={[0, -1.61, .12]}><meshStandardMaterial color={materials.foot} metalness={.5} roughness={.5} /></mesh>
    <mesh position={[1.47, -.99, .108]}><sphereGeometry args={[.015, 8, 8]} /><meshBasicMaterial color={materials.status} toneMapped={false} /></mesh>
  </group>)}</>;
}
function World(props: NetworkCanvasProps) {
  const { theme, clock, pointer, invalidateRef, onReady, onUnavailable } = props;
  const { invalidate, gl } = useThree();
  const materials = sceneMaterials[theme];
  const rig = useRef<Group>(null);
  const signal = useRef<Mesh>(null);
  const started = useRef<string | null>(null);
  const route = useMemo(() => new CubicBezierCurve3(new Vector3(-.9, -.24, .9), new Vector3(-2.15, 2.5, -1.8), new Vector3(2.5, 2.2, -1.8), new Vector3(2.4, -.5, -.3)), []);
  const geometry = useMemo(() => new TubeGeometry(route, 64, .012, 5, false), [route]);
  const position = useMemo(() => new Vector3(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    invalidateRef.current = invalidate;
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onUnavailable(); };
    canvas.addEventListener("webglcontextlost", lost);
    invalidate();
    return () => { invalidateRef.current = null; canvas.removeEventListener("webglcontextlost", lost); };
  }, [gl, invalidate, invalidateRef, onUnavailable]);
  useFrame(({ camera }) => {
    if (started.current !== theme) { started.current = theme; onReady(); }
    const progress = clock.current.progress;
    if (rig.current) {
      const x = pointer.current.y * .026;
      const y = pointer.current.x * .035;
      rig.current.rotation.x += (x - rig.current.rotation.x) * .12;
      rig.current.rotation.y += (y - rig.current.rotation.y) * .12;
      if (Math.abs(rig.current.rotation.x - x) + Math.abs(rig.current.rotation.y - y) > .0002) invalidate();
    }
    camera.position.z = 9.8 - Math.sin(progress * Math.PI) * .32;
    if (signal.current) {
      const travel = Math.min(1, Math.max(0, (progress - .16) / .6));
      route.getPoint(travel, position);
      signal.current.position.copy(position);
      signal.current.visible = progress > .16 && progress < .8;
    }
  });
  return <>
    <ambientLight intensity={theme === "dark" ? 1.8 : 2.1} />
    <directionalLight position={[-3, 6, 6]} intensity={theme === "dark" ? 3 : 2.4} color={materials.keyLight} />
    <group ref={rig}>
      <Computers theme={theme} />
      <mesh geometry={geometry}><meshBasicMaterial color={materials.accent} transparent opacity={.8} toneMapped={false} /></mesh>
      <mesh ref={signal} visible={false}><sphereGeometry args={[.045, 12, 8]} /><meshBasicMaterial color={materials.signal} toneMapped={false} /></mesh>
    </group>
  </>;
}
export default function NetworkCanvas(props: NetworkCanvasProps) {
  return <Canvas className="network-canvas" frameloop="demand" dpr={[1, 1.5]} camera={{position: [.25, .05, 9.8], fov: 35.5}} gl={{alpha: true, antialias: true, powerPreference: "low-power"}} fallback={null} aria-hidden="true">
    <Suspense fallback={null}><World {...props} /></Suspense>
  </Canvas>;
}
