import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { usePuzzleGame } from "@/lib/stores/usePuzzleGame";
import PatternPuzzle from "@/components/game/PatternPuzzle";
import LogicPuzzle from "@/components/game/LogicPuzzle";
import SpatialPuzzle from "@/components/game/SpatialPuzzle";
import GameUI from "@/components/game/GameUI";
import ScoreBoard from "@/components/game/ScoreBoard";

export default function GameBoard() {
  const { currentPuzzle, gamePhase } = usePuzzleGame();

  const renderPuzzle = () => {
    if (!currentPuzzle) return null;

    switch (currentPuzzle.type) {
      case 'pattern':
        return <PatternPuzzle puzzle={currentPuzzle} />;
      case 'logic':
        return <LogicPuzzle puzzle={currentPuzzle} />;
      case 'spatial':
        return (
          <Canvas camera={{ position: [0, 5, 8], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <SpatialPuzzle puzzle={currentPuzzle} />
            <OrbitControls enablePan={false} maxDistance={15} minDistance={5} />
          </Canvas>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 left-0 right-0 z-10">
        <GameUI />
      </div>
      
      <div className="w-full h-full">
        {renderPuzzle()}
      </div>

      {gamePhase === 'gameOver' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <ScoreBoard />
        </div>
      )}
    </div>
  );
}
