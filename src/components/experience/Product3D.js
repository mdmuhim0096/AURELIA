"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Float } from "@react-three/drei";
import { useRef } from "react";
function Object3D() { const group = useRef(); useFrame((_state, delta) => { if (group.current) group.current.rotation.y += delta * .22; }); return <Float speed={1.5} rotationIntensity={.35} floatIntensity={.8}><group ref={group}><mesh castShadow><torusKnotGeometry args={[1.4,.46,180,24]} /><meshStandardMaterial color="#111111" roughness={.22} metalness={.7} /></mesh><mesh scale={.45} position={[0,0,0]}><sphereGeometry args={[1,64,64]} /><meshStandardMaterial color="#b8f34a" roughness={.32} /></mesh></group></Float>; }
export default function Product3D() { return <Canvas camera={{position:[0,0,6],fov:40}} dpr={[1,1.5]} gl={{antialias:true,powerPreference:"high-performance"}}><ambientLight intensity={.8}/><directionalLight position={[5,5,5]} intensity={2}/><Object3D/><OrbitControls enablePan={false} minDistance={4} maxDistance={8}/><Environment preset="studio" /></Canvas>; }
