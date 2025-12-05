
import React, { useRef } from 'react';
import { Environment, OrbitControls, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useFrame } from '@react-three/fiber';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Polaroids } from './Polaroids';
import { TreeStar } from './TreeStar';
import { TreeMode } from '../types';

interface ExperienceProps {
  mode: TreeMode;
  handPosition: { x: number; y: number; detected: boolean };
  handScale: number;
  uploadedPhotos: string[];
}

export const Experience: React.FC<ExperienceProps> = ({ mode, handPosition, handScale, uploadedPhotos }) => {
  const controlsRef = useRef<any>(null);
  const baseDistanceRef = useRef<number>(20); // Store base camera distance

  // Initialize base distance
  React.useEffect(() => {
    if (controlsRef.current) {
      baseDistanceRef.current = controlsRef.current.getDistance();
    }
  }, []);

  // Update camera rotation and zoom based on hand position and scale
  useFrame((_, delta) => {
    if (controlsRef.current && handPosition.detected) {
      const controls = controlsRef.current;
      
      // Map hand position to spherical coordinates
      // x: 0 (left) to 1 (right) -> azimuthal angle (horizontal rotation)
      // y: 0 (top) to 1 (bottom) -> polar angle (vertical tilt)
      
      // Target azimuthal angle: increased range for larger rotation
      const targetAzimuth = (handPosition.x - 0.5) * Math.PI * 3; // Increased from 2 to 3
      
      // Adjust Y mapping so natural hand position gives best view
      // Offset Y so hand at 0.4-0.5 range gives centered view
      const adjustedY = (handPosition.y - 0.2) * 2.0; // Increased sensitivity from 1.5 to 2.0
      const clampedY = Math.max(0, Math.min(1, adjustedY)); // Clamp to 0-1
      
      // Target polar angle: PI/4 to PI/1.8 (constrained vertical angle)
      const minPolar = Math.PI / 4;
      const maxPolar = Math.PI / 1.8;
      const targetPolar = minPolar + clampedY * (maxPolar - minPolar);
      
      // Get current angles
      const currentAzimuth = controls.getAzimuthalAngle();
      const currentPolar = controls.getPolarAngle();
      
      // Calculate angle differences (handle wrapping for azimuth)
      let azimuthDiff = targetAzimuth - currentAzimuth;
      if (azimuthDiff > Math.PI) azimuthDiff -= Math.PI * 2;
      if (azimuthDiff < -Math.PI) azimuthDiff += Math.PI * 2;
      
      // Smoothly interpolate angles
      const lerpSpeed = 8; // Increased from 5 to 8 for faster response
      const newAzimuth = currentAzimuth + azimuthDiff * delta * lerpSpeed;
      const newPolar = currentPolar + (targetPolar - currentPolar) * delta * lerpSpeed;
      
      // Calculate camera distance based on hand scale
      // handScale: 0.3-2.5, where larger = fingers spread wider = zoom in (closer)
      // Invert: larger scale should mean smaller distance (closer to tree)
      // Map scale 0.3-2.5 to distance range 30-10 (closer when scale is larger)
      const minDistance = 8; // Closest zoom
      const maxDistance = 30; // Farthest zoom
      const normalizedScale = Math.max(0.3, Math.min(2.5, handScale));
      // Invert: scale 0.3 -> maxDistance, scale 2.5 -> minDistance
      const targetDistance = maxDistance - (normalizedScale - 0.3) / (2.5 - 0.3) * (maxDistance - minDistance);
      
      // Smoothly interpolate distance
      const currentDistance = controls.getDistance();
      const distanceLerpSpeed = 5;
      const newDistance = currentDistance + (targetDistance - currentDistance) * delta * distanceLerpSpeed;
      
      // Calculate new camera position in spherical coordinates
      const targetY = 4; // Tree center height
      
      const x = newDistance * Math.sin(newPolar) * Math.sin(newAzimuth);
      const y = targetY + newDistance * Math.cos(newPolar);
      const z = newDistance * Math.sin(newPolar) * Math.cos(newAzimuth);
      
      // Update camera position and target
      controls.object.position.set(x, y, z);
      controls.target.set(0, targetY, 0);
      controls.update();
    }
  });
  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={8}
        maxDistance={30}
        enableDamping
        dampingFactor={0.05}
        enabled={true}
      />

      {/* Lighting Setup for Maximum Luxury */}
      <Environment preset="lobby" background={false} blur={0.8} />
      
      <ambientLight intensity={0.2} color="#004422" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.2} 
        penumbra={1} 
        intensity={2} 
        color="#fff5cc" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#D4AF37" />

      <group position={[0, -4, 0]}>
        <Foliage mode={mode} count={12000} />
        <Ornaments mode={mode} count={600} />
        <Polaroids mode={mode} uploadedPhotos={uploadedPhotos} handScale={handScale} />
        <TreeStar mode={mode} />
        
        {/* Floor Reflections */}
        <ContactShadows 
          opacity={0.7} 
          scale={30} 
          blur={2} 
          far={4.5} 
          color="#000000" 
        />
      </group>

      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
        <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </>
  );
};
