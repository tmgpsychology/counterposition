export interface MetricDetail {
  grade: string;
  desc: string;
  found: string[];
  tips: string[];
}

export interface ScoreResult {
  grade: string;
  summary: string;
  metrics: {
    depth: MetricDetail;
    friction: MetricDetail;
    vocabulary: MetricDetail;
    research: MetricDetail;
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

function isWeakGrade(grade: string): boolean {
  return grade.startsWith('C') || grade.startsWith('D') || grade.startsWith('F');
}

export function calculateEffortScore(belief: string, counter: string): ScoreResult {
  const counterWords = counter.trim().split(/\s+/);
  const wordCount = counterWords.length;

  let depthScore = Math.min(100, Math.floor((wordCount / 150) * 100));
  if (wordCount < 20) depthScore = Math.max(10, depthScore - 20);

  const depthFound: string[] = [];
  if (wordCount >= 100) depthFound.push(`Strong length: ${wordCount} words`);
  else if (wordCount >= 50) depthFound.push(`Moderate length: ${wordCount} words`);
  else depthFound.push(`Short response: only ${wordCount} words`);

  const sentences = counter.split(/[.!?]+/).filter(s => s.trim().length > 0);
  depthFound.push(`${sentences.length} sentence${sentences.length !== 1 ? 's' : ''} identified`);
  if (sentences.length >= 5) depthFound.push("Multiple distinct points made");

  const depthTips: string[] = [];
  if (isWeakGrade(numberToGrade(depthScore))) {
    depthTips.push("Aim for at least 100–150 words to develop your argument fully");
    depthTips.push("Break your argument into 3–4 distinct points, each with its own reasoning");
    depthTips.push("Consider addressing different angles: practical, ethical, economic, social");
    if (sentences.length < 4) depthTips.push("Try structuring with clear topic sentences for each paragraph");
  }

  const uniqueWords = new Set(counterWords.map(w => w.toLowerCase())).size;
  const lexicalRichness = wordCount > 0 ? uniqueWords / wordCount : 0;
  let vocabScore = Math.min(100, Math.floor(lexicalRichness * 100 * 1.5));

  const analyticalKeywords = ['however', 'furthermore', 'nevertheless', 'conversely', 'paradigm', 'empirical', 'inherent', 'bias', 'dichotomy', 'mitigate', 'variable', 'contingent', 'fallacy', 'implies', 'assumes', 'consequently'];
  const foundKeywords: string[] = [];
  const missingKeywords: string[] = [];
  let keywordBonus = 0;
  analyticalKeywords.forEach(keyword => {
    if (counter.toLowerCase().includes(keyword)) {
      keywordBonus += 5;
      foundKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });
  vocabScore = Math.min(100, vocabScore + keywordBonus);

  const vocabFound: string[] = [];
  if (foundKeywords.length > 0) vocabFound.push(`Analytical terms used: ${foundKeywords.join(', ')}`);
  vocabFound.push(`Lexical diversity: ${Math.round(lexicalRichness * 100)}% unique words`);

  const vocabTips: string[] = [];
  if (isWeakGrade(numberToGrade(vocabScore))) {
    vocabTips.push("Use transition words like 'however', 'furthermore', 'nevertheless' to connect ideas");
    vocabTips.push("Introduce analytical language: 'inherent bias', 'false dichotomy', 'assumes that...'");
    if (missingKeywords.length > 3) {
      const suggestions = missingKeywords.slice(0, 4);
      vocabTips.push(`Try incorporating words like: ${suggestions.join(', ')}`);
    }
    vocabTips.push("Vary your sentence structure — mix short declarative statements with longer analytical ones");
  }

  const beliefWords = new Set(belief.toLowerCase().split(/\s+/));
  let overlapCount = 0;
  const overlappingWords: string[] = [];
  counterWords.forEach(word => {
    const lower = word.toLowerCase();
    if (beliefWords.has(lower) && word.length > 4) {
      overlapCount++;
      if (!overlappingWords.includes(lower)) overlappingWords.push(lower);
    }
  });

  const overlapRatio = wordCount > 0 ? overlapCount / wordCount : 0;
  let frictionScore = 100 - Math.min(100, Math.floor(overlapRatio * 200));

  if (wordCount > belief.split(/\s+/).length * 1.5) {
    frictionScore = Math.min(100, frictionScore + 15);
  }

  const frictionFound: string[] = [];
  if (overlapRatio < 0.1) frictionFound.push("Low overlap with original belief — strong independent reasoning");
  else if (overlapRatio < 0.2) frictionFound.push("Moderate overlap with original belief");
  else frictionFound.push(`High overlap: reused words like "${overlappingWords.slice(0, 3).join('", "')}"`);

  if (wordCount > belief.split(/\s+/).length * 1.5) frictionFound.push("Counter-argument substantially longer than belief — good expansion");

  const frictionTips: string[] = [];
  if (isWeakGrade(numberToGrade(frictionScore))) {
    frictionTips.push("Avoid repeating the same words from your original belief — reframe the concepts");
    frictionTips.push("Introduce new frameworks or perspectives not present in your thesis");
    frictionTips.push("Challenge the underlying assumptions, not just the surface claim");
    frictionTips.push("Consider: what would someone with the opposite life experience say?");
  }

  const researchPatterns: [RegExp, string][] = [
    [/\b(study|studies)\b/i, "Referenced studies"],
    [/\b(research\s+(shows?|suggests?|indicates?|demonstrates?|found))\b/i, "Cited research findings"],
    [/\b(according\s+to)\b/i, "Used 'according to' attribution"],
    [/\b(peer[- ]reviewed)\b/i, "Mentioned peer review"],
    [/\b(meta[- ]analy(sis|ses|tic))\b/i, "Referenced meta-analysis"],
    [/\b(journal|published)\b/i, "Referenced publication/journal"],
    [/\b(university|professor|researcher)\b/i, "Cited academic sources"],
    [/\b(data\s+(shows?|suggests?|indicates?))\b/i, "Referenced data"],
    [/\b(evidence\s+(shows?|suggests?|indicates?))\b/i, "Appealed to evidence"],
    [/\b(experiment(s|al)?)\b/i, "Referenced experiments"],
    [/\b(statistic(s|al|ally)?)\b/i, "Used statistical language"],
    [/\b(survey(s|ed)?)\b/i, "Referenced surveys"],
    [/\b(findings?)\b/i, "Cited findings"],
    [/\b(sample\s+size)\b/i, "Mentioned sample size"],
    [/\b(control\s+group)\b/i, "Referenced control groups"],
    [/\b(correlation|causation)\b/i, "Discussed correlation/causation"],
    [/\(\d{4}\)/i, "Included year citation"],
    [/et\s+al\./i, "Used academic citation style (et al.)"],
  ];

  let researchHits = 0;
  const researchFound: string[] = [];
  researchPatterns.forEach(([pattern, label]) => {
    if (pattern.test(counter)) {
      researchHits++;
      researchFound.push(label);
    }
  });

  let researchScore = Math.min(100, researchHits * 15);
  if (researchHits === 0) researchScore = 20;

  const researchTips: string[] = [];
  if (isWeakGrade(numberToGrade(researchScore))) {
    researchTips.push("Reference specific studies: 'Research from [field] suggests that...'");
    researchTips.push("Mention data or statistics: 'Studies show that X% of...'");
    researchTips.push("Appeal to evidence: 'Evidence indicates...', 'Data suggests...'");
    researchTips.push("Distinguish correlation from causation when making claims");
    if (researchHits === 0) researchTips.push("Even general references to research strengthen your argument significantly");
  }

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
      depth: { grade: depthGrade, desc: "Complexity and length of arguments presented.", found: depthFound, tips: depthTips },
      friction: { grade: frictionGrade, desc: "Evidence of genuinely struggling against your own bias.", found: frictionFound, tips: frictionTips },
      vocabulary: { grade: vocabGrade, desc: "Diversity of conceptual vocabulary and analytical language.", found: vocabFound, tips: vocabTips },
      research: { grade: researchGrade, desc: "References to studies, data, peer-reviewed sources, or empirical evidence.", found: researchFound, tips: researchTips },
    }
  };
}
