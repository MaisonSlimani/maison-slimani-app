/**
 * Spam detection utility for comments
 * Checks for common spam patterns and flags suspicious content
 */

const SPAM_KEYWORDS = [
  'viagra', 'cialis', 'casino', 'poker', 'lottery', 'winner', 'prize',
  'click here', 'buy now', 'limited time', 'act now', 'urgent',
  'make money', 'work from home', 'get rich', 'free money',
  'weight loss', 'diet pills', 'miracle', 'guaranteed',
  'http://', 'https://', 'www.', '.com', '.net', '.org'
]

/**
 * Check if a comment contains spam keywords
 */
export function containsSpamKeywords(text: string): boolean {
  const lowerText = text.toLowerCase()
  return SPAM_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()))
}

/**
 * Check if text has excessive capitalization (>50% caps)
 */
export function hasExcessiveCaps(text: string): boolean {
  if (text.length < 10) return false // Ignore short texts
  
  const capsCount = (text.match(/[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ]/g) || []).length
  const totalLetters = (text.match(/[A-Za-zÀ-ÿ]/g) || []).length
  
  if (totalLetters === 0) return false
  
  const capsPercentage = (capsCount / totalLetters) * 100
  return capsPercentage > 50
}

/**
 * Count number of links in text
 */
export function countLinks(text: string): number {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/gi
  const matches = text.match(urlRegex)
  return matches ? matches.length : 0
}

/**
 * Check if comment should be flagged as spam
 * Returns true if comment should be flagged
 */
export function shouldFlagAsSpam(comment: string): boolean {
  // Check for spam keywords
  if (containsSpamKeywords(comment)) {
    return true
  }
  
  // Check for excessive capitalization
  if (hasExcessiveCaps(comment)) {
    return true
  }
  
  // Check for excessive links (>3 links)
  if (countLinks(comment) > 3) {
    return true
  }
  
  return false
}

