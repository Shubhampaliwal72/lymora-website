"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { BufferGeometry, CubicBezierCurve3, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, SRGBColorSpace, TextureLoader, TubeGeometry, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { devices, connections, routeBetween, arrivalPulse, sceneMaterials, smooth, storyAt, type Endpoint, type NetworkCanvasProps } from "./scene";

function Computers({ theme, endpoint, clock, onSelect }: Pick<NetworkCanvasProps, "theme" | "endpoint" | "clock" | "onSelect">) {
  const {gl} = useThree();
  const source = useLoader(TextureLoader, ["/media/product/chats-" + theme + ".png", "/brand/mark-" + theme + ".png"]);
  const textures = useMemo(() => source.map(image => {const texture = image.clone(); texture.colorSpace = SRGBColorSpace; texture.needsUpdate = true; return texture;}), [source]);
  const geometry = useMemo(() => ({
    case: new RoundedBoxGeometry(3.35, 2.27, .14, 2, .07),
    screen: new RoundedBoxGeometry(3.22, 2.14, .025, 1, .03),
    foot: new RoundedBoxGeometry(1.12, .075, .58, 1, .035),
    neck: new RoundedBoxGeometry(.19, .55, .13, 1, .035),
  }), []);
  const groups = useRef<(Group | null)[]>([]);
  const indicators = useRef<(Mesh | null)[]>([]);
  const bezels = useRef<(MeshStandardMaterial | null)[]>([]);
  useEffect(() => () => { textures.forEach(texture => texture.dispose()); }, [textures]);
  useEffect(() => () => { Object.values(geometry).forEach(shape => shape.dispose()); gl.domElement.style.cursor = ""; }, [geometry, gl]);
  const dark = theme === "dark", materials = sceneMaterials[theme];
  useFrame(() => {
    const story = storyAt(clock.current.progress);
    devices.forEach((device, index) => {
      const group = groups.current[index], indicator = indicators.current[index];
      if(group) {group.position.y = device.position[1]; const size = device.scale * (device.id === "you" ? 1 : .97 + .03 * story.discover); group.scale.setScalar(size);}
      const pulse=device.id===endpoint?arrivalPulse(clock.current.progress):0;
      if(bezels.current[index]) bezels.current[index]!.emissiveIntensity=pulse*.1;
      if(indicator) indicator.scale.setScalar(1+pulse*.65);
    });
  });
  return <>{devices.map((device, index) => <group key={device.id} ref={value => {groups.current[index] = value;}} position={device.position} rotation={device.rotation} scale={device.scale}
    onClick={event => {if(device.id !== "you") {event.stopPropagation(); onSelect(device.id);}}}
    onPointerOver={event => {if(device.id !== "you") {event.stopPropagation(); gl.domElement.style.cursor = "pointer";}}}
    onPointerOut={() => {gl.domElement.style.cursor = "";}}>
    <mesh geometry={geometry.case}><meshStandardMaterial ref={value=>{bezels.current[index]=value;}} emissive={materials.accent} emissiveIntensity={0} color={materials.bezel} metalness={dark ? .55 : .2} roughness={.38} /></mesh>
    <mesh geometry={geometry.screen} position={[0, 0, .086]}><meshBasicMaterial color={materials.screen} toneMapped={false} /></mesh>
    {device.app ? <mesh position={[0, 0, .105]}><planeGeometry args={[3.14, 3.14 * 1020 / 1800]} /><meshBasicMaterial map={textures[0]} toneMapped={false} /></mesh> : <mesh position={[0, 0, .105]}><planeGeometry args={[1.02, 1.02]} /><meshBasicMaterial map={textures[1]} transparent toneMapped={false} /></mesh>}
    <mesh geometry={geometry.neck} position={[0, -1.35, -.03]} rotation={[-.12, 0, 0]}><meshStandardMaterial color={materials.neck} metalness={.5} roughness={.5} /></mesh>
    <mesh geometry={geometry.foot} position={[0, -1.61, .12]}><meshStandardMaterial color={materials.foot} metalness={.5} roughness={.5} /></mesh>
    <mesh ref={value => {indicators.current[index] = value;}} position={[1.47, -.99, .108]}><sphereGeometry args={[.015, 8, 8]} /><meshBasicMaterial color={materials.status} toneMapped={false} /></mesh>
  </group>)}</>;
}
function Connection({pair, ...props}: NetworkCanvasProps & {pair: [Endpoint,Endpoint]}) {
  const [a,b]=pair;
  const geometry=useMemo(()=>new TubeGeometry(new CubicBezierCurve3(...routeBetween(a,b).map(point=>new Vector3(...point)) as [Vector3,Vector3,Vector3,Vector3]),64,.007,5,false),[a,b]);
  const material=useRef<MeshBasicMaterial>(null);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  useFrame(()=>{if(material.current)material.current.opacity=((props.source===a&&props.endpoint===b)||(props.source===b&&props.endpoint===a)) ? .72 : .23;});
  return <mesh geometry={geometry}><meshBasicMaterial ref={material} color={sceneMaterials[props.theme].accent} transparent opacity={.23} toneMapped={false} depthWrite={false}/></mesh>;
}
function World(props: NetworkCanvasProps) {
  const { theme, endpoint, source, transfer, clock, pointer, invalidateRef, onReady, onUnavailable } = props;
  const { invalidate, gl } = useThree();
  const materials = sceneMaterials[theme];
  const rig = useRef<Group>(null), packet = useRef<Group>(null), receipt = useRef<Mesh>(null), sweep = useRef<Mesh>(null), sweepMaterial = useRef<MeshBasicMaterial>(null);
  const started = useRef<string | null>(null);
  const route = useMemo(() => new CubicBezierCurve3(...routeBetween(source,endpoint).map(point => new Vector3(...point)) as [Vector3, Vector3, Vector3, Vector3]), [source,endpoint]);
  const position = useMemo(() => new Vector3(), []);
  const packetGeometry = useMemo(() => new RoundedBoxGeometry(transfer === "message" ? .19 : .14, transfer === "message" ? .13 : .21, .025, 1, .018), [transfer]);
  const markings = useMemo(() => {
    const vertices = transfer === "message" ? [-.075,.04,.016, 0,-.01,.016, 0,-.01,.016, .075,.04,.016] : [-.035,.015,.016, .035,.015,.016, -.035,-.03,.016, .035,-.03,.016, .018,.085,.016, .05,.05,.016];
    const geometry = new BufferGeometry(); geometry.setAttribute("position", new Float32BufferAttribute(vertices,3)); return geometry;
  }, [transfer]);
  useEffect(() => () => {packetGeometry.dispose(); markings.dispose();}, [packetGeometry, markings]);
  useEffect(() => {
    invalidateRef.current = invalidate;
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onUnavailable(); };
    canvas.addEventListener("webglcontextlost", lost); invalidate();
    return () => { invalidateRef.current = null; canvas.removeEventListener("webglcontextlost", lost); };
  }, [gl, invalidate, invalidateRef, onUnavailable]);
  useFrame(({ camera }) => {
    if (started.current !== theme) { started.current = theme; onReady(); }
    const progress = clock.current.progress, story = storyAt(progress);
    if (rig.current) {
      const x = pointer.current.y * .026, y = pointer.current.x * .035;
      rig.current.rotation.x += (x - rig.current.rotation.x) * .12;
      rig.current.rotation.y += (y - rig.current.rotation.y) * .12;
      if (Math.abs(rig.current.rotation.x - x) + Math.abs(rig.current.rotation.y - y) > .0002) invalidate();
    }
    camera.position.z = 10.8 - .16 * smooth(story.connect);
    camera.position.y = .35;
    camera.position.x = .35;
    if (packet.current) {route.getPoint(story.travel, position); packet.current.position.copy(position); packet.current.quaternion.copy(camera.quaternion); packet.current.visible = story.packet;}
    if (receipt.current) {route.getPoint(1 - story.receipt, position); receipt.current.position.copy(position); receipt.current.visible = story.returning;}
    if (sweep.current && sweepMaterial.current) {sweep.current.visible = progress < .18; sweep.current.scale.setScalar(.2 + 2.8 * story.discover); sweepMaterial.current.opacity = .18 * Math.sin(Math.PI * story.discover);}
  });
  return <>
    <ambientLight intensity={theme === "dark" ? 1.8 : 2.1} />
    <directionalLight position={[-3, 6, 6]} intensity={theme === "dark" ? 3 : 2.4} color={materials.keyLight} />
    <group ref={rig}>
      <mesh ref={sweep} position={[-1.05, -.75, -.8]}><ringGeometry args={[.98, 1, 64]}/><meshBasicMaterial ref={sweepMaterial} color={materials.accent} transparent opacity={0} depthWrite={false} toneMapped={false}/></mesh>
      <Computers theme={theme} endpoint={endpoint} clock={clock} onSelect={props.onSelect}/>
      {connections.map(pair => <Connection key={pair.join("-")} pair={pair} {...props}/>)}
      <group ref={packet} visible={false}><mesh geometry={packetGeometry}><meshBasicMaterial color={materials.signal} toneMapped={false}/></mesh><lineSegments geometry={markings}><lineBasicMaterial color={materials.screen} toneMapped={false}/></lineSegments></group>
      <mesh ref={receipt} visible={false}><sphereGeometry args={[.026, 8, 8]} /><meshBasicMaterial color={materials.status} toneMapped={false} /></mesh>
    </group>
  </>;
}
export default function NetworkCanvas(props: NetworkCanvasProps) {
  return <Canvas className="network-canvas" frameloop="demand" dpr={[1, 1.5]} camera={{position: [.35, .35, 10.8], fov: 35.5}} gl={{alpha: true, antialias: true, powerPreference: "low-power"}} fallback={null} aria-hidden="true">
    <Suspense fallback={null}><World {...props} /></Suspense>
  </Canvas>;
}
