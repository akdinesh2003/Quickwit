export interface PuzzleConfig {
  type: 'pattern' | 'logic' | 'spatial';
  difficulty: number;
}

export function generatePuzzle(type: 'pattern' | 'logic' | 'spatial', difficulty: number) {
  switch (type) {
    case 'pattern':
      return generatePatternPuzzle(difficulty);
    case 'logic':
      return generateLogicPuzzle(difficulty);
    case 'spatial':
      return generateSpatialPuzzle(difficulty);
    default:
      return generatePatternPuzzle(difficulty);
  }
}

function generatePatternPuzzle(difficulty: number) {
  const gridSize = 16; // 4x4 grid
  const numHighlighted = Math.min(3 + difficulty, 8);
  
  const solution: number[] = [];
  while (solution.length < numHighlighted) {
    const cell = Math.floor(Math.random() * gridSize);
    if (!solution.includes(cell)) {
      solution.push(cell);
    }
  }

  return {
    type: 'pattern' as const,
    difficulty,
    solution,
    timeLimit: 30,
    gridSize
  };
}

function generateLogicPuzzle(difficulty: number) {
  const patterns = [
    // Arithmetic sequences
    {
      generate: () => {
        const start = Math.floor(Math.random() * 10) + 1;
        const diff = Math.floor(Math.random() * 5) + 1;
        const length = 3 + difficulty;
        const sequence = Array.from({ length }, (_, i) => start + i * diff);
        return {
          sequence: sequence.slice(0, -1),
          solution: sequence[sequence.length - 1],
          hint: `Add ${diff} each time`
        };
      }
    },
    // Geometric sequences
    {
      generate: () => {
        const start = Math.floor(Math.random() * 5) + 1;
        const ratio = 2;
        const length = 3 + Math.floor(difficulty / 2);
        const sequence = Array.from({ length }, (_, i) => start * Math.pow(ratio, i));
        return {
          sequence: sequence.slice(0, -1),
          solution: sequence[sequence.length - 1],
          hint: `Multiply by ${ratio} each time`
        };
      }
    },
    // Fibonacci-like
    {
      generate: () => {
        const a = Math.floor(Math.random() * 3) + 1;
        const b = Math.floor(Math.random() * 3) + 1;
        const sequence = [a, b];
        for (let i = 2; i < 4 + difficulty; i++) {
          sequence.push(sequence[i-1] + sequence[i-2]);
        }
        return {
          sequence: sequence.slice(0, -1),
          solution: sequence[sequence.length - 1],
          hint: "Each number is the sum of the previous two"
        };
      }
    }
  ];

  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const puzzle = pattern.generate();

  return {
    type: 'logic' as const,
    difficulty,
    timeLimit: 45,
    ...puzzle
  };
}

function generateSpatialPuzzle(difficulty: number) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
  const numBlocks = 8 + difficulty * 2;
  
  const blocks = Array.from({ length: numBlocks }, (_, i) => ({
    x: (Math.random() - 0.5) * 6,
    y: Math.random() * 3,
    z: (Math.random() - 0.5) * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    isTarget: false
  }));

  // Mark some blocks as targets (solution)
  const numTargets = Math.min(2 + difficulty, 6);
  const solution: number[] = [];
  
  while (solution.length < numTargets) {
    const index = Math.floor(Math.random() * blocks.length);
    if (!solution.includes(index)) {
      solution.push(index);
      blocks[index].isTarget = true;
    }
  }

  return {
    type: 'spatial' as const,
    difficulty,
    timeLimit: 60,
    blocks,
    solution,
    instruction: `Find and select the ${numTargets} highlighted blocks`
  };
}
