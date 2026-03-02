export interface ScoreResult {
  grade: string;
  summary: string;
  metrics: {
    depth: { grade: string; desc: string };
    friction: { grade: string; desc: string };
    vocabulary: { grade: string; desc: string };
    research: { grade: string; desc: string };
  };
}

function numberToGrade(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  if (score >= 50) return 'F+';
  if (score >= 40) return 'F';
  return 'F-';
}

function gradeToNumber(grade: string): number {
  const map: Record<string, number> = {
    'A+': 98, 'A': 95, 'A-': 91,
    'B+': 88, 'B': 85, 'B-': 81,
    'C+': 78, 'C': 75, 'C-': 71,
    'D+': 68, 'D': 65, 'D-': 61,
    'F+': 55, 'F': 45, 'F-': 30,
  };
  return map[grade] ?? 45;
}

export function calculateEffortScore(belief: string, counter: string): ScoreResult {
  const counterWords = counter.trim().split(/\s+/);
  const wordCount = counterWords.length;

  let depthScore = Math.min(100, Math.floor((wordCount / 150) * 100));
  if (wordCount < 20) depthScore = Math.max(10, depthScore - 20);

  const uniqueWords = new Set(counterWords.map(w => w.toLowerCase())).size;
  const lexicalRichness = wordCount > 0 ? uniqueWords / wordCount : 0;
  let vocabScore = Math.min(100, Math.floor(lexicalRichness * 100 * 1.5));

  const analyticalKeywords = ['however', 'furthermore', 'nevertheless', 'conversely', 'paradigm', 'empirical', 'inherent', 'bias', 'dichotomy', 'mitigate', 'variable', 'contingent', 'fallacy', 'implies', 'assumes', 'consequently'];
  let keywordBonus = 0;
  analyticalKeywords.forEach(keyword => {
    if (counter.toLowerCase().includes(keyword)) {
      keywordBonus += 5;
    }
  });
  vocabScore = Math.min(100, vocabScore + keywordBonus);

  const beliefWords = new Set(belief.toLowerCase().split(/\s+/));
  let overlapCount = 0;
  counterWords.forEach(word => {
    if (beliefWords.has(word.toLowerCase()) && word.length > 4) {
      overlapCount++;
    }
  });

  const overlapRatio = wordCount > 0 ? overlapCount / wordCount : 0;
  let frictionScore = 100 - Math.min(100, Math.floor(overlapRatio * 200));

  if (wordCount > belief.split(/\s+/).length * 1.5) {
    frictionScore = Math.min(100, frictionScore + 15);
  }

  const researchPatterns = [
    /\b(study|studies)\b/i,
    /\b(research\s+(shows?|suggests?|indicates?|demonstrates?|found))\b/i,
    /\b(according\s+to)\b/i,
    /\b(peer[- ]reviewed)\b/i,
    /\b(meta[- ]analy(sis|ses|tic))\b/i,
    /\b(journal|published)\b/i,
    /\b(university|professor|researcher)\b/i,
    /\b(data\s+(shows?|suggests?|indicates?))\b/i,
    /\b(evidence\s+(shows?|suggests?|indicates?))\b/i,
    /\b(experiment(s|al)?)\b/i,
    /\b(statistic(s|al|ally)?)\b/i,
    /\b(survey(s|ed)?)\b/i,
    /\b(findings?)\b/i,
    /\b(sample\s+size)\b/i,
    /\b(control\s+group)\b/i,
    /\b(correlation|causation)\b/i,
    /\(\d{4}\)/,
    /et\s+al\./i,
  ];

  let researchHits = 0;
  researchPatterns.forEach(pattern => {
    if (pattern.test(counter)) {
      researchHits++;
    }
  });

  let researchScore = Math.min(100, researchHits * 15);
  if (researchHits === 0) researchScore = 20;

  if (wordCount < 10) {
    depthScore = Math.min(10, depthScore);
    frictionScore = Math.min(10, frictionScore);
    vocabScore = Math.min(10, vocabScore);
    researchScore = Math.min(10, researchScore);
  }

  if (wordCount < 20) {
    vocabScore = Math.min(40, vocabScore);
  }

  const depthGrade = numberToGrade(depthScore);
  const frictionGrade = numberToGrade(frictionScore);
  const vocabGrade = numberToGrade(vocabScore);
  const researchGrade = numberToGrade(researchScore);

  const overallNum = Math.floor(
    (gradeToNumber(depthGrade) * 0.3) +
    (gradeToNumber(vocabGrade) * 0.25) +
    (gradeToNumber(frictionGrade) * 0.25) +
    (gradeToNumber(researchGrade) * 0.2)
  );
  const grade = numberToGrade(overallNum);

  let summary = '';
  if (grade.startsWith('A')) {
    summary = "Strong structural teardown. You challenged your own premises effectively.";
  } else if (grade.startsWith('B')) {
    summary = "Solid effort. You found the surface cracks, but avoided striking the core.";
  } else if (grade.startsWith('C')) {
    summary = "Adequate. You went through the motions of contradiction without deep conviction.";
  } else if (grade.startsWith('D')) {
    summary = "Weak. A reluctant defence of the opposition.";
  } else {
    summary = "Superficial attempt. Minimal intellectual rigor detected.";
  }

  return {
    grade,
    summary,
    metrics: {
      depth: { grade: depthGrade, desc: "Complexity and length of arguments presented." },
      friction: { grade: frictionGrade, desc: "Evidence of genuinely struggling against your own bias." },
      vocabulary: { grade: vocabGrade, desc: "Diversity of conceptual vocabulary and analytical language." },
      research: { grade: researchGrade, desc: "References to studies, data, peer-reviewed sources, or empirical evidence." },
    }
  };
}
