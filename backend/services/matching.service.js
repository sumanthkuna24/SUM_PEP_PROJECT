const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'in', 'at', 'of', 'on', 'and', 'or', 'for',
  'with', 'to', 'from', 'my', 'i', 'it', 'was', 'this', 'that', 'near',
  'some', 'has', 'have', 'had', 'by', 'be', 'are', 'were'
]);

/**
 * Tokenizes text into a set of unique lowercased keywords excluding stop words
 */
const extractKeywords = (text) => {
  if (!text) return new Set();
  const cleaned = text.toLowerCase().replace(/[^\w\s]/g, '');
  const tokens = cleaned.split(/\s+/).filter(word => word.length > 1 && !STOP_WORDS.has(word));
  return new Set(tokens);
};

/**
 * Calculates match score between two item documents
 * @param {Object} targetItem - The base item (Lost or Found)
 * @param {Object} candidateItem - The item of opposite type to compare against
 * @returns {Object} score details and totalScore
 */
const calculateMatchScore = (targetItem, candidateItem) => {
  // 1. Category Match (40 Points)
  let categoryScore = 0;
  if (
    targetItem.category &&
    candidateItem.category &&
    targetItem.category.trim().toLowerCase() === candidateItem.category.trim().toLowerCase()
  ) {
    categoryScore = 40;
  }

  // 2. Keyword Similarity (30 Points)
  let keywordScore = 0;
  const text1 = `${targetItem.title} ${targetItem.description}`;
  const text2 = `${candidateItem.title} ${candidateItem.description}`;
  
  const keywords1 = extractKeywords(text1);
  const keywords2 = extractKeywords(text2);

  if (keywords1.size > 0 && keywords2.size > 0) {
    const commonWords = [...keywords1].filter(word => keywords2.has(word));
    // Overlap ratio based on the smaller set size or average
    const denominator = Math.min(keywords1.size, keywords2.size);
    const overlapRatio = denominator > 0 ? commonWords.length / denominator : 0;
    keywordScore = Math.min(30, Math.round(overlapRatio * 30));
  }

  // 3. Location Match (20 Points)
  let locationScore = 0;
  if (targetItem.location && candidateItem.location) {
    const loc1 = targetItem.location.trim().toLowerCase();
    const loc2 = candidateItem.location.trim().toLowerCase();
    if (loc1 === loc2 || loc1.includes(loc2) || loc2.includes(loc1)) {
      locationScore = 20;
    }
  }

  // 4. Date Proximity (10 Points)
  let dateScore = 0;
  if (targetItem.date && candidateItem.date) {
    const time1 = new Date(targetItem.date).getTime();
    const time2 = new Date(candidateItem.date).getTime();
    const diffDays = Math.floor(Math.abs(time1 - time2) / (1000 * 60 * 60 * 24));

    if (diffDays <= 2) {
      dateScore = 10;
    } else if (diffDays <= 5) {
      dateScore = 5;
    }
  }

  const totalScore = categoryScore + keywordScore + locationScore + dateScore;

  return {
    item: candidateItem,
    totalScore,
    scoreBreakdown: {
      categoryScore,
      keywordScore,
      locationScore,
      dateScore
    }
  };
};

/**
 * Finds and ranks suggestions for a given target item against candidate items
 * @param {Object} targetItem - Base item
 * @param {Array} candidateItems - Array of opposite type items
 * @param {Number} threshold - Minimum score threshold (default: 70)
 * @returns {Array} Sorted list of items exceeding threshold
 */
const findMatches = (targetItem, candidateItems, threshold = 70) => {
  const matches = candidateItems
    .map(candidate => calculateMatchScore(targetItem, candidate))
    .filter(match => match.totalScore >= threshold)
    .sort((a, b) => b.totalScore - a.totalScore);

  return matches;
};

module.exports = {
  calculateMatchScore,
  findMatches
};
