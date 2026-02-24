export interface ScoreResult {
  overallScore: number;
  grade: string;
  summary: string;
  metrics: {
    depth: number;
    friction: number;
    vocabulary: number;
  };
}

export function calculateEffortScore(belief: string, counter: string): ScoreResult {
  // A simulated AI scoring mechanism based on text analysis heuristics
  
  const counterWords = counter.trim().split(/\s+/);
  const wordCount = counterWords.length;
  
  // 1. Structural Depth (based on length and sentence structure)
  // Longer arguments generally show more effort in a mockup scenario
  let depthScore = Math.min(100, Math.floor((wordCount / 150) * 100));
  if (wordCount < 20) depthScore = Math.max(10, depthScore - 20);

  // 2. Rhetorical Range (Vocabulary complexity heuristic)
  // Check for unique words vs total words
  const uniqueWords = new Set(counterWords.map(w => w.toLowerCase())).size;
  const lexicalRichness = wordCount > 0 ? uniqueWords / wordCount : 0;
  let vocabScore = Math.min(100, Math.floor(lexicalRichness * 100 * 1.5));
  
  // Add points for complex transition words/phrases indicating structured thought
  const analyticalKeywords = ['however', 'furthermore', 'nevertheless', 'conversely', 'paradigm', 'empirical', 'inherent', 'bias', 'dichotomy', 'mitigate', 'variable', 'contingent', 'fallacy', 'implies', 'assumes', 'consequently'];
  let keywordBonus = 0;
  analyticalKeywords.forEach(keyword => {
    if (counter.toLowerCase().includes(keyword)) {
      keywordBonus += 5;
    }
  });
  vocabScore = Math.min(100, vocabScore + keywordBonus);

  // 3. Intellectual Friction (Did they just restate the belief with a "not"?)
  // Compare words in belief vs counter
  const beliefWords = new Set(belief.toLowerCase().split(/\s+/));
  let overlapCount = 0;
  counterWords.forEach(word => {
    if (beliefWords.has(word.toLowerCase()) && word.length > 4) {
      overlapCount++;
    }
  });
  
  // High overlap might mean lazy contradiction instead of new argument
  const overlapRatio = wordCount > 0 ? overlapCount / wordCount : 0;
  let frictionScore = 100 - Math.min(100, Math.floor(overlapRatio * 200));
  
  // Bonus for substantial new length
  if (wordCount > belief.split(/\s+/).length * 1.5) {
    frictionScore = Math.min(100, frictionScore + 15);
  }

  // Calculate overall and grade
  const overall = Math.floor((depthScore * 0.4) + (vocabScore * 0.3) + (frictionScore * 0.3));
  
  let grade = 'F';
  let summary = "Superficial attempt. Minimal intellectual rigor detected.";
  
  if (overall >= 90) {
    grade = 'S';
    summary = "Exceptional cognitive friction. A masterclass in intellectual honesty.";
  } else if (overall >= 80) {
    grade = 'A';
    summary = "Strong structural teardown. You challenged your own premises effectively.";
  } else if (overall >= 70) {
    grade = 'B';
    summary = "Solid effort. You found the surface cracks, but avoided striking the core.";
  } else if (overall >= 60) {
    grade = 'C';
    summary = "Adequate. You went through the motions of contradiction without deep conviction.";
  } else if (overall >= 50) {
    grade = 'D';
    summary = "Weak. A reluctant defense of the opposition.";
  }

  // Edge cases for absolute minimum effort
  if (wordCount < 10) {
    grade = 'F-';
    summary = "Refusal to engage with the exercise.";
    depthScore = Math.min(10, depthScore);
    frictionScore = Math.min(10, frictionScore);
    vocabScore = Math.min(10, vocabScore);
  }

  return {
    overallScore: overall,
    grade,
    summary,
    metrics: {
      depth: depthScore,
      friction: frictionScore,
      vocabulary: vocabScore
    }
  };
}