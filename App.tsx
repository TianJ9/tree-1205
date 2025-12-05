
import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';
import { GestureController } from './components/GestureController';
import { TreeMode } from './types';

// Simple Error Boundary to catch 3D resource loading errors (like textures)
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error loading 3D scene:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can customize this fallback UI
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 text-[#D4AF37] font-serif p-8 text-center">
          <div>
            <h2 className="text-2xl mb-2">Something went wrong</h2>
            <p className="opacity-70">A resource failed to load (likely a missing image). Check the console for details.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [mode, setMode] = useState<TreeMode>(TreeMode.FORMED);
  const [handPosition, setHandPosition] = useState<{ x: number; y: number; detected: boolean }>({ x: 0.5, y: 0.5, detected: false });
  const [handScale, setHandScale] = useState<number>(1.0);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Load predefined photos from public/photos folder on component mount
  useEffect(() => {
    const loadPredefinedPhotos = async () => {
      const photoUrls: string[] = [];
      const maxPhotos = 32; // Maximum number of photos to try loading
      
      // Try to load photos named 1.jpg, 2.jpg, 3.jpg, etc.
      const loadPromises: Promise<void>[] = [];
      
      for (let i = 1; i <= maxPhotos; i++) {
        const photoPath = `/photos/${i}.jpg`;
        
        const promise = new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            photoUrls.push(photoPath);
            resolve();
          };
          img.onerror = () => {
            // Photo doesn't exist, skip it
            resolve();
          };
          img.src = photoPath;
        });
        
        loadPromises.push(promise);
      }
      
      await Promise.all(loadPromises);
      
      // Sort photos by number to ensure correct order
      photoUrls.sort((a, b) => {
        const numA = parseInt(a.match(/\/(\d+)\.jpg$/)?.[1] || '0');
        const numB = parseInt(b.match(/\/(\d+)\.jpg$/)?.[1] || '0');
        return numA - numB;
      });
      
      if (photoUrls.length > 0) {
        setUploadedPhotos(photoUrls);
      }
    };
    
    loadPredefinedPhotos();
  }, []);

  const toggleMode = () => {
    setMode((prev) => (prev === TreeMode.FORMED ? TreeMode.CHAOS : TreeMode.FORMED));
  };

  const handleHandPosition = (x: number, y: number, detected: boolean) => {
    setHandPosition({ x, y, detected });
  };

  const handleHandScale = (scale: number) => {
    setHandScale(scale);
  };

  const handlePhotosUpload = (photos: string[]) => {
    setUploadedPhotos(photos);
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-black via-[#001a0d] to-[#0a2f1e]">
      <ErrorBoundary>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 4, 20], fov: 45 }}
          gl={{ antialias: false, stencil: false, alpha: false }}
          shadows
        >
          <Suspense fallback={null}>
            <Experience mode={mode} handPosition={handPosition} handScale={handScale} uploadedPhotos={uploadedPhotos} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      
      <Loader 
        containerStyles={{ background: '#000' }} 
        innerStyles={{ width: '300px', height: '10px', background: '#333' }}
        barStyles={{ background: '#D4AF37', height: '10px' }}
        dataStyles={{ color: '#D4AF37', fontFamily: 'Cinzel' }}
      />
      
      <UIOverlay mode={mode} onToggle={toggleMode} onPhotosUpload={handlePhotosUpload} hasPhotos={uploadedPhotos.length > 0} />
      
      {/* Gesture Control Module */}
      <GestureController currentMode={mode} onModeChange={setMode} onHandPosition={handleHandPosition} onHandScale={handleHandScale} />
    </div>
  );
}
