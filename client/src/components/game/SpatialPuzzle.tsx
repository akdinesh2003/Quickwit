import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import { usePuzzleGame } from '@/lib/stores/usePuzzleGame';
import { useAudio } from '@/lib/stores/useAudio';

interface SpatialPuzzleProps {
  puzzle: any;
}

export default function SpatialPuzzle({ puzzle }: SpatialPuzzleProps) {
  const { submitAnswer } = usePuzzleGame();
  const { playHit, playSuccess } = useAudio();
  const [selectedBlocks, setSelectedBlocks] = useState<number[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const handleBlockClick = (index: number) => {
    playHit();
    setSelectedBlocks(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSubmit = () => {
    const isCorrect = selectedBlocks.length === puzzle.solution.length &&
      selectedBlocks.every(block => puzzle.solution.includes(block));
    
    if (isCorrect) {
      playSuccess();
    } else {
      playHit();
    }
    
    submitAnswer(selectedBlocks, isCorrect);
  };

  return (
    <group ref={groupRef}>
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {puzzle.instruction || "Select the blocks that complete the pattern"}
      </Text>
      
      {puzzle.blocks.map((block: any, index: number) => (
        <Box
          key={index}
          position={[block.x, block.y, block.z]}
          args={[1, 1, 1]}
          onClick={() => handleBlockClick(index)}
        >
          <meshStandardMaterial 
            color={selectedBlocks.includes(index) ? '#22c55e' : block.color}
            transparent
            opacity={block.isTarget ? 0.5 : 1}
          />
        </Box>
      ))}
      
      <Text
        position={[0, -3, 0]}
        fontSize={0.3}
        color="gray"
        anchorX="center"
        anchorY="middle"
        onClick={handleSubmit}
        onPointerOver={(e) => { e.stopPropagation(); }}
      >
        Click here to submit
      </Text>
    </group>
  );
}
