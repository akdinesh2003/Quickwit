export interface PuzzleGenerationConfig {
  count: number;
  difficulty: number;
  types: ('pattern' | 'logic' | 'spatial')[];
  playerCount: number;
}

export interface ValidationResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
}

export function generatePuzzleSet(config: PuzzleGenerationConfig) {
  const puzzles = [];
  
  for (let i = 0; i < config.count; i++) {
    const type = config.types[i % config.types.length];
    const difficulty = Math.min(5, config.difficulty + Math.floor(i / 3));
    
    switch (type) {
      case 'pattern':
        puzzles.push(generatePatternPuzzle(difficulty, i));
        break;
      case 'logic':
        puzzles.push(generateLogicPuzzle(difficulty, i));
        break;
      case 'spatial':
        puzzles.push(generateSpatialPuzzle(difficulty, i));
        break;
    }
  }
  
  return puzzles;
}

function generatePatternPuzzle(difficulty: number, id: number) {
  const gridSize = 16;
  const numHighlighted = Math.min(3 + difficulty, 8);
  
  const solution: number[] = [];
  while (solution.length < numHighlighted) {
    const cell = Math.floor(Math.random() * gridSize);
    if (!solution.includes(cell)) {
      solution.push(cell);
    }
  }

  return {
    id,
    type: 'pattern',
    difficulty,
    solution,
    timeLimit: Math.max(15, 30 - difficulty * 3),
    gridSize,
    description: `Memorize and recreate the pattern of ${numHighlighted} highlighted squares`
  };
}

function generateLogicPuzzle(difficulty: number, id: number) {
  const patterns = [
    // Arithmetic progression
    () => {
      const start = Math.floor(Math.random() * 10) + 1;
      const diff = Math.floor(Math.random() * 5) + 1;
      const length = 3 + Math.floor(difficulty / 2);
      const sequence = Array.from({ length }, (_, i) => start + i * diff);
      return {
        sequence: sequence.slice(0, -1),
        solution: sequence[sequence.length - 1],
        hint: `Add ${diff} to each number`,
        pattern: 'arithmetic'
      };
    },
    // Geometric progression
    () => {
      const start = Math.floor(Math.random() * 5) + 1;
      const ratio = 2;
      const length = 3 + Math.floor(difficulty / 3);
      const sequence = Array.from({ length }, (_, i) => start * Math.pow(ratio, i));
      return {
        sequence: sequence.slice(0, -1),
        solution: sequence[sequence.length - 1],
        hint: `Multiply by ${ratio}`,
        pattern: 'geometric'
      };
    },
    // Square numbers
    () => {
      const start = Math.floor(Math.random() * 3) + 1;
      const length = 3 + Math.floor(difficulty / 2);
      const sequence = Array.from({ length }, (_, i) => Math.pow(start + i, 2));
      return {
        sequence: sequence.slice(0, -1),
        solution: sequence[sequence.length - 1],
        hint: "Square numbers pattern",
        pattern: 'squares'
      };
    }
  ];

  const patternGenerator = patterns[Math.floor(Math.random() * patterns.length)];
  const puzzle = patternGenerator();

  return {
    id,
    type: 'logic',
    difficulty,
    timeLimit: Math.max(20, 45 - difficulty * 5),
    ...puzzle,
    description: `Find the next number in the sequence`
  };
}

function generateSpatialPuzzle(difficulty: number, id: number) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#a8e6cf'];
  const numBlocks = 6 + difficulty * 2;
  
  const blocks = Array.from({ length: numBlocks }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 8,
    y: Math.random() * 4,
    z: (Math.random() - 0.5) * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    isTarget: false,
    size: 1
  }));

  // Create a pattern for targets
  const numTargets = Math.min(2 + Math.floor(difficulty / 2), 6);
  const solution: number[] = [];
  
  // Select blocks based on a pattern (e.g., specific color, position)
  const targetColor = colors[Math.floor(Math.random() * colors.length)];
  const colorTargets = blocks
    .filter(block => block.color === targetColor)
    .slice(0, numTargets);
  
  colorTargets.forEach(block => {
    solution.push(block.id);
    block.isTarget = true;
  });

  // If not enough color matches, add random targets
  while (solution.length < numTargets) {
    const randomIndex = Math.floor(Math.random() * blocks.length);
    if (!solution.includes(randomIndex)) {
      solution.push(randomIndex);
      blocks[randomIndex].isTarget = true;
    }
  }

  return {
    id,
    type: 'spatial',
    difficulty,
    timeLimit: Math.max(30, 60 - difficulty * 5),
    blocks,
    solution,
    targetColor,
    instruction: `Select all blocks with color ${targetColor}`,
    description: `Find and select the ${numTargets} blocks that match the pattern`
  };
}

export function validateAnswer(puzzleType: string, answer: any, solution: any): ValidationResult {
  let isCorrect = false;
  let score = 0;
  let feedback = "";

  switch (puzzleType) {
    case 'pattern':
      isCorrect = Array.isArray(answer) && Array.isArray(solution) &&
        answer.length === solution.length &&
        answer.every((item: any) => solution.includes(item));
      score = isCorrect ? 100 : Math.max(0, 100 - Math.abs(answer.length - solution.length) * 20);
      feedback = isCorrect ? "Perfect pattern match!" : "Pattern doesn't match exactly";
      break;

    case 'logic':
      isCorrect = answer.toString() === solution.toString();
      score = isCorrect ? 100 : 0;
      feedback = isCorrect ? "Correct sequence completion!" : "Wrong number in sequence";
      break;

    case 'spatial':
      if (Array.isArray(answer) && Array.isArray(solution)) {
        const correctSelections = answer.filter((item: any) => solution.includes(item)).length;
        const incorrectSelections = answer.length - correctSelections;
        const missedSelections = solution.length - correctSelections;
        
        isCorrect = correctSelections === solution.length && incorrectSelections === 0;
        score = Math.max(0, (correctSelections * 100 / solution.length) - (incorrectSelections * 20) - (missedSelections * 20));
        
        if (isCorrect) {
          feedback = "Perfect spatial recognition!";
        } else {
          feedback = `${correctSelections}/${solution.length} correct selections`;
        }
      }
      break;

    default:
      feedback = "Unknown puzzle type";
  }

  return { isCorrect, score: Math.round(score), feedback };
}
