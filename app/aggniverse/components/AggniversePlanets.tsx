"use client";
import React, { useRef, useState, useCallback } from "react";
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Physics } from '@react-three/rapier'

import Scene from './solar-system/components/Scene'
import { SidebarProvider, useSidebar } from './solar-system/context/Sidebar'
import CelestialSidebar from './solar-system/components/CelestialSidebar'
import { CelestialSearchBar, CelestialSuggestion } from './solar-system/components/CelestialSearchBar'


// Inner component that uses the sidebar
const AggniverseContent = ({ isInteractive }: { isInteractive: boolean }) => {
  const { isOpen, selectedBody, isSearchVisible, closeSidebar } = useSidebar();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectPlanetByName, setSelectPlanetByName] = useState<((name: string) => void) | null>(null);
  const [selectSun, setSelectSun] = useState<(() => void) | null>(null);
  const [closeSearchDropdowns, setCloseSearchDropdowns] = useState<(() => void) | null>(null);
  
  // Handle when planet selection functions become available
  const handlePlanetSelectionReady = useCallback((selectPlanet: (name: string) => void, selectSunFn: () => void) => {
    setSelectPlanetByName(() => selectPlanet);
    setSelectSun(() => selectSunFn);
  }, []);
  
  // Handle search suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: CelestialSuggestion) => {
    if (suggestion.type === 'sun') {
      selectSun?.();
    } else {
      selectPlanetByName?.(suggestion.name);
    }
  }, [selectPlanetByName, selectSun]);

  // Handle close dropdowns callback
  const handleCloseDropdowns = useCallback((closeFunction: () => void) => {
    setCloseSearchDropdowns(() => closeFunction);
  }, []);

  // No transform - let camera system handle all positioning

  return (
    <>
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full"
        style={{ 
          pointerEvents: 'auto'
        }}
      >
        {/* <Suspense fallback={<div className="w-full h-full bg-black flex items-center justify-center text-white">Loading...</div>}> */}
          <Canvas 
          className={isOpen ? "pointer-events-none" : "pointer-events-auto"}
          camera={{ position: [0, 50, 150], far: 200000 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl, scene }) => {
            console.log('Canvas created successfully');
            gl.setClearColor('#000000');
            console.log('Scene children:', scene.children.length);
          }}
        >
          <color attach='background' args={['black']} />
          <ambientLight intensity={0.25} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          <OrbitControls maxDistance={450} minDistance={50} makeDefault />

          {/* Debug: Simple box to test if rendering works */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[10, 10, 10]} />
            <meshStandardMaterial color="orange" />
          </mesh>

          <Physics gravity={[0, 0, 0]}>
            <Scene onPlanetSelectionReady={handlePlanetSelectionReady} closeSearchDropdowns={closeSearchDropdowns} />
          </Physics>
          
          <EffectComposer>
            <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
          </EffectComposer>
          </Canvas>
        {/* </Suspense> */}
      </div>
      
      {/* Search bar positioned at top-left, above sidebar - only show when interactive */}
      {isInteractive && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: isOpen ? `${400 + 16}px` : '16px', // sidebar width + padding
            zIndex: 9999,
            pointerEvents: 'auto',
            transition: 'left 0.4s ease-in-out'
          }}
        >
          <CelestialSearchBar 
            isVisible={isSearchVisible} 
            onSuggestionSelect={handleSuggestionSelect}
            onCloseDropdowns={handleCloseDropdowns}
          />
        </div>
      )}

      {/* Sidebar positioned as full height panel - only show when interactive */}
      {isInteractive && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '400px',
            height: '100vh',
            zIndex: 9998,
            pointerEvents: isOpen ? 'auto' : 'none'
          }}
        >
          <CelestialSidebar 
            isOpen={isOpen}
            onClose={closeSidebar}
            celestialBody={selectedBody}
          />
        </div>
      )}
    </>
  );
}

// AggniversePlanets component
interface AggniversePlanetsProps {
  isInteractive?: boolean;
}

const AggniversePlanets = ({ isInteractive = true }: AggniversePlanetsProps) => {
  return (
    <SidebarProvider>
      <AggniverseContent isInteractive={isInteractive} />
    </SidebarProvider>
  );
}

export default AggniversePlanets 