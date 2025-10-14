import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function Cube() {
  
  const meshRef = useRef(0 as any);

  // Rotate every frame
  useFrame(() => {
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.01;
  });
   return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
  
}
export default function ThreeScene() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [3,3,3] }}>
        <ambientLight />
        <directionalLight position={[5, 5, 5]} />
        <Cube />
        <OrbitControls />
      </Canvas>
    </div>
  );
}