// FIXED: Enhanced system with better tag matching and coverage

import { PROMPTS_DATA } from '../data/prompts.tsx';

const ALL_TAGS = [
  "academic", "activities", "background", "balance", "challenge-belief", 
  "collaboration", "communication", "community", "contribution", "curiosity", 
  "dialogue", "diversity", "equity", "experience", "fit", "future", "goals", 
  "gratitude", "growth", "history", "identity", "impact", "influence", 
  "initiative", "innovation", "leadership", "open", "passion", "personal", 
  "reflection", "relationships", "resilience", "self-awareness", "service", 
  "society", "values", "vision", "why_this_school", "culture", "engagement",
  "self-discovery", "motivation", "challenge"
];

// School name normalization to handle variations
const normalizeSchoolName = (schoolName) => {
  const normalizations = {
    'ucla': 'UCLA',
    'uc berkeley': 'UC Berkeley',
    'berkeley': 'UC Berkeley',
    'usc': 'USC',
    'nyu': 'NYU',
    'northwestern': 'Northwestern',
    'unc chapel-hill': 'UNC Chapel-Hill',
    'unc': 'UNC Chapel-Hill',
    'cornell': 'Cornell',
    'dartmouth': 'Dartmouth',
    'brown': 'Brown'
  };
  
  const lower = schoolName.toLowerCase().trim();
  return normalizations[lower] || schoolName;
};

// 1. Enhanced prompt analysis with tag prioritization
const analyzeRequiredPrompts = (targetColleges, promptsData = PROMPTS_DATA) => {
  console.log('Analyzing required prompts for:', targetColleges);
  
  const normalizedTargets = targetColleges.map(normalizeSchoolName);
  console.log('Normalized targets:', normalizedTargets);
  
  const requiredPrompts = promptsData.essays.filter(prompt => {
    if (prompt.school === 'Common App') return prompt.required;
    
    const isTargetSchool = normalizedTargets.some(target => {
      const targetLower = target.toLowerCase();
      const schoolLower = prompt.school.toLowerCase();
      
      return targetLower === schoolLower || 
             targetLower.includes(schoolLower) || 
             schoolLower.includes(targetLower);
    });
    
    return isTargetSchool && prompt.required;
  });

  console.log(`Found ${requiredPrompts.length} required prompts`);
  
  // Extract all unique tags from required prompts
  const allRequiredTags = [...new Set(requiredPrompts.flatMap(p => p.tags))];
  console.log('Required tags to cover:', allRequiredTags);

  // Create tag priority map based on frequency
  const tagFrequency = {};
  requiredPrompts.forEach(prompt => {
    prompt.tags.forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  // Sort tags by frequency (more common = higher priority)
  const prioritizedTags = allRequiredTags.sort((a, b) => tagFrequency[b] - tagFrequency[a]);
  
  return {
    requiredPrompts,
    allRequiredTags,
    prioritizedTags,
    tagFrequency,
    minEssaysNeeded: Math.max(12, Math.ceil(requiredPrompts.length * 0.8))
  };
};

// 2. FIXED: Create targeted prompts that ensure strong tag matching
const createTagFocusedPrompt = (profileData, questionResponses, requiredPrompts, iteration = 1) => {
  const uncoveredPrompts = requiredPrompts.filter(p => !p.covered);
  const priorityTags = [...new Set(uncoveredPrompts.flatMap(p => p.tags))];
  
  // Separate school-specific and Common App prompts
  const schoolSpecificPrompts = uncoveredPrompts.filter(p => p.school !== 'Common App');
  const commonAppPrompts = uncoveredPrompts.filter(p => p.school === 'Common App');
  
  console.log(`Uncovered: ${schoolSpecificPrompts.length} school-specific, ${commonAppPrompts.length} Common App`);
  
  // Prioritize school-specific prompts if they exist
  const targetPrompts = schoolSpecificPrompts.length > 0 ? schoolSpecificPrompts : uncoveredPrompts;
  
  // Group uncovered prompts by their primary tags for targeted generation
  const tagGroups = {};
  targetPrompts.forEach(prompt => {
    prompt.tags.forEach(tag => {
      if (!tagGroups[tag]) tagGroups[tag] = [];
      tagGroups[tag].push(prompt);
    });
  });

  // Sort tags by how many uncovered prompts they could help with
  const sortedTags = Object.keys(tagGroups).sort((a, b) => tagGroups[b].length - tagGroups[a].length);
  const topPriorityTags = sortedTags.slice(0, Math.min(8, sortedTags.length));

  const systemPrompt = `You are an expert college admissions counselor creating essay ideas with MANDATORY TAG COVERAGE.

CRITICAL MISSION: Create essays that match SCHOOL-SPECIFIC supplemental prompts, not just Common App essays.

${schoolSpecificPrompts.length > 0 ? `
🎯 PRIORITY: Focus on these SCHOOL-SPECIFIC prompts:
${schoolSpecificPrompts.slice(0, 6).map(p => `${p.school}: "${p.prompt}" (Tags: ${p.tags.join(', ')})`).join('\n')}

These school-specific essays should demonstrate clear fit and knowledge of the specific institution.
` : ''}

REQUIREMENTS:
1. Every essay MUST target 2-4 specific tags from this list: ${priorityTags.join(', ')}
2. Essays MUST strongly demonstrate their assigned tags through specific actions
3. NO generic essays - each must connect to specific prompts
4. For school-specific prompts, show knowledge of that particular institution

${iteration > 1 ? `
ITERATION ${iteration} - FILLING GAPS
Still need to cover: ${targetPrompts.slice(0, 5).map(p => `${p.school}: ${p.tags.join(', ')}`).join(' | ')}
` : ''}

STORY REQUIREMENTS:
- Specific moment in time with clear setting
- Concrete challenge/conflict and actions taken  
- Measurable outcomes and personal growth
- Authentic demonstration of assigned tags

Format each essay as:

## Essay Idea: [Specific Action-Based Title]
**Target Tags:** [2-4 tags that match uncovered prompts]
**Story Outline:** [Detailed story: moment, challenge, actions, outcome]
**Tag Connection:** [How this story specifically demonstrates each tag]
**Key Insight:** [Personal growth/learning]

Generate ${Math.min(6, Math.max(3, Math.ceil(targetPrompts.length / 2)))} essays prioritizing school-specific prompt coverage.`;

  const userPrompt = `STUDENT PROFILE:
Target Colleges: ${profileData.colleges.join(', ')}
Major: ${profileData.major}
Background: ${profileData.background?.join(', ') || 'Not specified'}
Activities: ${profileData.activities?.map(a => `${a.name}: ${a.description}`).join(' | ') || 'Not specified'}
Values: ${profileData.personalValues?.join(', ') || 'Not specified'}

HIGHEST PRIORITY - SCHOOL-SPECIFIC PROMPTS TO COVER:
${schoolSpecificPrompts.slice(0, 8).map(p => `${p.school}: "${p.prompt}" (Needs tags: ${p.tags.join(', ')})`).join('\n')}

${commonAppPrompts.length > 0 ? `
ALSO COVER - COMMON APP PROMPTS:
${commonAppPrompts.slice(0, 4).map(p => `"${p.prompt}" (Needs tags: ${p.tags.join(', ')})`).join('\n')}
` : ''}

FOCUS TAGS: ${topPriorityTags.join(', ')}

Create essays that specifically address the school supplemental prompts above. Show genuine interest in each specific institution.`;

  return { systemPrompt, userPrompt };
};

// 3. ENHANCED: Better parsing with asterisk removal and stricter tag validation
const parseTagFocusedEssays = (essayText, targetColleges = []) => {
  if (!essayText) return [];
  
  console.log('Parsing essay text length:', essayText.length);

  // Multiple regex patterns to catch different formats
  const essayMatches = essayText.match(/## Essay Idea:.*?(?=## Essay Idea:|$)/gs) ||
                      essayText.match(/##\s*Essay Idea.*?(?=##\s*Essay Idea|$)/gs) ||
                      essayText.match(/Essay Idea:.*?(?=Essay Idea:|$)/gs);
  
  if (!essayMatches) {
    console.log('No essay matches found');
    return [];
  }

  console.log(`Found ${essayMatches.length} essay matches`);

  const parsedEssays = essayMatches.map((section, index) => {
    // FIXED: Remove asterisks and clean title
    const titleMatch = section.match(/(?:## )?Essay Idea:?\s*(.+?)(?=\n|$)/);
    const rawTitle = titleMatch ? titleMatch[1].trim() : `Essay Idea ${index + 1}`;
    const cleanTitle = rawTitle.replace(/\*+/g, '').replace(/[""]/g, '').trim();
    
    const storyMatch = section.match(/\*\*Story Outline:\*\*\s*(.+?)(?=\n\*\*|$)/s);
    const storyFocus = storyMatch ? storyMatch[1].trim() : '';
    
    const connectionMatch = section.match(/\*\*Tag Connection:\*\*\s*(.+?)(?=\n\*\*|$)/s);
    const tagConnection = connectionMatch ? connectionMatch[1].trim() : '';
    
    const insightMatch = section.match(/\*\*Key Insight:\*\*\s*(.+?)(?=\n\*\*|$)/s);
    const keyMessage = insightMatch ? insightMatch[1].trim() : '';
    
    // ENHANCED: Better tag extraction and validation
    const tagsMatch = section.match(/\*\*Target Tags:\*\*\s*(.+?)(?=\n|$)/);
    const essayTags = tagsMatch ? 
      tagsMatch[1].split(/[,;]/).map(tag => tag.trim().toLowerCase().replace(/[^\w-_]/g, '')) : [];
    
    // STRICT: Only include tags that exist in our master list
    const validTags = essayTags.filter(tag => {
      const normalizedTag = tag.replace(/[^\w-_]/g, '');
      return ALL_TAGS.map(t => t.toLowerCase()).includes(normalizedTag);
    });

    console.log(`Essay "${cleanTitle}": raw_tags=[${essayTags.join(', ')}] valid_tags=[${validTags.join(', ')}]`);

    // CRITICAL: Only return essays with valid tag connections
    if (validTags.length === 0) {
      console.log(`REJECTED: "${cleanTitle}" - no valid tags`);
      return null;
    }

    const coveredPrompts = findMatchingPrompts(validTags, targetColleges);
    
    // ENHANCED: Require at least one prompt match
    if (coveredPrompts.length === 0) {
      console.log(`REJECTED: "${cleanTitle}" - no matching prompts`);
      return null;
    }

    return {
      id: `essay_${index + 1}`,
      title: cleanTitle,
      storyFocus,
      tagConnection,
      keyMessage,
      tags: validTags,
      coveredPrompts,
      fullContent: section
    };
  }).filter(essay => essay !== null);

  console.log(`Successfully parsed ${parsedEssays.length} essays with valid tags`);
  return parsedEssays;
};

// 4. ENHANCED: Improved iterative generation with coverage tracking
const generateEssayIdeasWithGuaranteedCoverage = async (profileData, questionResponses, generatedQuestions) => {
  console.log('=== STARTING TAG-FOCUSED GENERATION ===');
  console.log('Target colleges:', profileData.colleges);
  
  const { requiredPrompts, prioritizedTags, minEssaysNeeded } = analyzeRequiredPrompts(profileData.colleges);
  console.log(`Target: ${requiredPrompts.length} required prompts, generating ${minEssaysNeeded}+ essays`);
  console.log('Priority tags:', prioritizedTags.slice(0, 10));

  let allEssays = [];
  let iteration = 1;
  const maxIterations = 5;
  let promptsCovered = new Set();

  while (iteration <= maxIterations) {
    console.log(`\n--- ITERATION ${iteration} ---`);
    
    // Mark which prompts are already covered
    const updatedPrompts = requiredPrompts.map(prompt => ({
      ...prompt,
      covered: promptsCovered.has(prompt.id)
    }));
    
    const uncoveredCount = updatedPrompts.filter(p => !p.covered).length;
    const coveragePercent = Math.round(((requiredPrompts.length - uncoveredCount) / requiredPrompts.length) * 100);
    
    console.log(`Coverage: ${coveragePercent}% (${uncoveredCount} prompts remaining)`);
    
    if (uncoveredCount === 0) {
      console.log('✅ 100% COVERAGE ACHIEVED!');
      break;
    }

    // Generate essays targeting uncovered prompts
    const { systemPrompt, userPrompt } = createTagFocusedPrompt(
      profileData, 
      questionResponses, 
      updatedPrompts,
      iteration
    );

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7 + (iteration * 0.05), // Slightly more creative each iteration
          max_tokens: 2500
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newIdeas = data.choices[0].message.content;
      
      // Parse with enhanced validation
      const newEssays = parseTagFocusedEssays(newIdeas, profileData.colleges);
      console.log(`Generated ${newEssays.length} valid essays`);
      
      // Add essays and track new coverage
      newEssays.forEach((newEssay, index) => {
        // Check for duplicates
        const isDuplicate = allEssays.some(existing => 
          similarity(existing.title.toLowerCase(), newEssay.title.toLowerCase()) > 0.75
        );
        
        if (!isDuplicate) {
          newEssay.id = `essay_${allEssays.length + 1}_i${iteration}`;
          allEssays.push(newEssay);
          
          // Track newly covered prompts
          newEssay.coveredPrompts.forEach(promptId => promptsCovered.add(promptId));
          
          console.log(`✓ Added: "${newEssay.title}" (tags: ${newEssay.tags.join(', ')}, covers: ${newEssay.coveredPrompts.length} prompts)`);
        } else {
          console.log(`⚠ Skipped duplicate: "${newEssay.title}"`);
        }
      });

    } catch (error) {
      console.error(`Iteration ${iteration} failed:`, error);
      break;
    }

    iteration++;
  }

  // Final coverage analysis
  const finalCoverage = analyzePromptCoverage(allEssays, profileData.colleges);
  
  console.log('=== FINAL RESULTS ===');
  console.log(`Generated: ${allEssays.length} essays`);
  console.log(`Coverage: ${finalCoverage.coveragePercentage}%`);
  console.log(`Strong tag connections: ${allEssays.every(e => e.tags.length > 0)}`);

  return {
    success: true,
    essays: allEssays,
    coverage: finalCoverage,
    iterations: iteration - 1,
    guaranteedCoverage: finalCoverage.coveragePercentage >= 85
  };
};

// Helper functions (keeping existing ones)
const similarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(0));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

const findMatchingPrompts = (essayTags, targetColleges = [], promptsData = PROMPTS_DATA) => {
  if (!essayTags || essayTags.length === 0) {
    console.log('No essay tags provided');
    return [];
  }
  
  const normalizedTargets = targetColleges.map(normalizeSchoolName);
  console.log('🔍 Finding matches for tags:', essayTags);
  console.log('🎓 Target colleges:', normalizedTargets);
  console.log('📝 Total prompts in database:', promptsData.essays.length);
  
  // First, let's see what schools are actually in the database
  const allSchools = [...new Set(promptsData.essays.map(p => p.school))];
  console.log('🏫 Schools in database:', allSchools);
  
  const matchingPrompts = promptsData.essays.filter(prompt => {
    // Always include Common App prompts for required essays
    if (prompt.school === 'Common App' && prompt.required) {
      // Check tag match for Common App
      const normalizedEssayTags = essayTags.map(tag => tag.toLowerCase().trim());
      const normalizedPromptTags = prompt.tags.map(tag => tag.toLowerCase().trim());
      
      const hasMatchingTags = normalizedPromptTags.some(promptTag => 
        normalizedEssayTags.includes(promptTag)
      );
      
      if (hasMatchingTags) {
        console.log(`✅ Common App match: ${prompt.prompt.substring(0, 50)}... | Tags: [${normalizedPromptTags.join(', ')}]`);
      }
      
      return hasMatchingTags;
    }
    
    // For school-specific prompts, check if school matches
    const isTargetSchool = normalizedTargets.some(target => {
      const targetLower = target.toLowerCase().trim();
      const schoolLower = prompt.school.toLowerCase().trim();
      
      // Try multiple matching strategies
      const exactMatch = targetLower === schoolLower;
      const targetContainsSchool = targetLower.includes(schoolLower);
      const schoolContainsTarget = schoolLower.includes(targetLower);
      
      // Special handling for common abbreviations
      const abbreviationMatch = (
        (targetLower === 'nyu' && schoolLower === 'new york university') ||
        (targetLower === 'new york university' && schoolLower === 'nyu') ||
        (targetLower === 'usc' && schoolLower === 'university of southern california') ||
        (targetLower === 'ucla' && schoolLower === 'university of california los angeles') ||
        (targetLower === 'uc berkeley' && schoolLower === 'university of california berkeley') ||
        (targetLower === 'northwestern' && schoolLower.includes('northwestern')) ||
        (targetLower.includes('northwestern') && schoolLower === 'northwestern')
      );
      
      const isMatch = exactMatch || targetContainsSchool || schoolContainsTarget || abbreviationMatch;
      
      if (isMatch) {
        console.log(`🏫 School match found: "${target}" <-> "${prompt.school}"`);
      }
      
      return isMatch;
    });
    
    if (!isTargetSchool) {
      return false;
    }
    
    // Check for tag matches (case-insensitive) for school-specific prompts
    const normalizedEssayTags = essayTags.map(tag => tag.toLowerCase().trim());
    const normalizedPromptTags = prompt.tags.map(tag => tag.toLowerCase().trim());
    
    const hasMatchingTags = normalizedPromptTags.some(promptTag => 
      normalizedEssayTags.includes(promptTag)
    );
    
    if (hasMatchingTags) {
      console.log(`✅ ${prompt.school} match: ${prompt.prompt.substring(0, 50)}... | Essay tags: [${normalizedEssayTags.join(', ')}] | Prompt tags: [${normalizedPromptTags.join(', ')}]`);
    } else {
      console.log(`❌ ${prompt.school} NO match: Essay tags: [${normalizedEssayTags.join(', ')}] | Prompt tags: [${normalizedPromptTags.join(', ')}]`);
    }
    
    return hasMatchingTags;
  });
  
  console.log(`🎯 Found ${matchingPrompts.length} total matching prompts`);
  matchingPrompts.forEach(prompt => {
    console.log(`   - ${prompt.school}: ${prompt.prompt.substring(0, 50)}...`);
  });
  
  return matchingPrompts.map(prompt => prompt.id);
};

const analyzePromptCoverage = (essays, targetColleges, promptsData = PROMPTS_DATA) => {
  const normalizedTargets = targetColleges.map(normalizeSchoolName);
  
  const relevantPrompts = promptsData.essays.filter(prompt => {
    if (prompt.school === 'Common App') return prompt.required;
    
    const isTargetSchool = normalizedTargets.some(target => {
      const targetLower = target.toLowerCase();
      const schoolLower = prompt.school.toLowerCase();
      
      return targetLower === schoolLower || 
             targetLower.includes(schoolLower) || 
             schoolLower.includes(targetLower);
    });
    
    return isTargetSchool && prompt.required;
  });
  
  const coveredPromptIds = new Set();
  essays.forEach(essay => {
    if (essay.coveredPrompts) {
      essay.coveredPrompts.forEach(promptId => coveredPromptIds.add(promptId));
    }
  });
  
  const uncoveredPrompts = relevantPrompts.filter(prompt => 
    !coveredPromptIds.has(prompt.id)
  );
  
  const coveragePercentage = relevantPrompts.length > 0 ? 
    Math.round(((relevantPrompts.length - uncoveredPrompts.length) / relevantPrompts.length) * 100) : 100;
  
  return {
    relevantPrompts,
    coveredPrompts: Array.from(coveredPromptIds),
    uncoveredPrompts,
    coveragePercentage
  };
};

export {
  ALL_TAGS,
  analyzeRequiredPrompts,
  generateEssayIdeasWithGuaranteedCoverage,
  parseTagFocusedEssays as parseStrategicEssaysWithTags,
  findMatchingPrompts,
  analyzePromptCoverage
};