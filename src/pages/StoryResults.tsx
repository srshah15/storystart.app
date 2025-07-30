import React, { useMemo } from 'react';
import { useStoryContext } from '../context/StoryContext';
import { PROMPTS_DATA } from '../data/prompts.tsx';

const StoryResults = () => {
  const { essayIdeas, profileData, generationMetadata } = useStoryContext();

  // Parse the new structured story format
  const { stories, coverage } = useMemo(() => {
    if (!essayIdeas || !generationMetadata) {
      return { stories: [], coverage: null };
    }

    // The new system returns structured data, so we parse it differently
    try {
      // If essayIdeas is a string (legacy), try to parse it
      let parsedStories = [];
      if (typeof essayIdeas === 'string') {
        // Legacy format - fallback parsing
        parsedStories = parseLegacyFormat(essayIdeas);
      } else {
        // New structured format
        parsedStories = essayIdeas.stories || [];
      }

      // Calculate coverage based on the new system
      const coverageData = calculateNewCoverage(parsedStories, profileData.colleges);
      
      return { stories: parsedStories, coverage: coverageData };
    } catch (error) {
      console.error('Error parsing stories:', error);
      return { stories: [], coverage: null };
    }
  }, [essayIdeas, profileData.colleges, generationMetadata]);

  // Early return for empty state
  if (!essayIdeas || (!stories.length && !generationMetadata)) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="max-w-md mx-auto">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Essay Ideas Yet</h3>
          <p className="text-gray-500">Generate some essay ideas to see your strategic options here.</p>
        </div>
      </div>
    );
  }

  const getCoverageColor = (percentage) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageBadgeColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getEfficiencyBadgeColor = (efficiency) => {
    if (efficiency >= 4) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (efficiency >= 3) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (efficiency >= 2) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">
          Strategic Essay Ideas
        </h1>
        
        {/* Enhanced header with generation info */}
        <div className="flex flex-col items-center gap-3">
          {coverage && (
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="inline-flex items-center gap-2">
                <span className="text-sm text-gray-600">Coverage:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCoverageBadgeColor(coverage.coveragePercentage)}`}>
                  {coverage.coveragePercentage === 100 && (
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {coverage.coveragePercentage}% Complete
                </span>
              </div>
              
              {generationMetadata?.efficiency && (
                <div className="inline-flex items-center gap-2">
                  <span className="text-sm text-gray-600">Efficiency:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEfficiencyBadgeColor(generationMetadata.efficiency)}`}>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    {generationMetadata.efficiency.toFixed(1)} prompts per story
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Generation metadata */}
          {generationMetadata && (
            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap justify-center">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {stories.length} strategic stories
              </span>
              {generationMetadata.totalGroups && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  {generationMetadata.totalGroups} prompt groups
                </span>
              )}
              <span className="flex items-center gap-1 text-green-600">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Optimized for efficiency
              </span>
            </div>
          )}
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No strategic essay ideas found.</p>
          <p className="text-sm text-gray-500 mt-2">Try regenerating or check your profile data.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {stories.map((story, index) => {
            const relevantPrompts = getRelevantPromptsForStory(story, profileData.colleges);
            const schoolsCount = story.schools?.length || [...new Set(relevantPrompts.map(p => p.school))].length;
            const promptsCount = story.promptsCovered || relevantPrompts.length;

            return (
              <article 
                key={story.id || index} 
                className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white border-gray-200 hover:border-indigo-300"
              >
                <header className="mb-6">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-bold text-indigo-700 flex-1">
                      {story.title}
                    </h2>
                    <div className="flex gap-2 ml-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {promptsCount} prompts
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        {schoolsCount} schools
                      </span>
                    </div>
                  </div>
                  
                  {/* Category indicator if available */}
                  {story.category && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        {story.category.name}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{story.category.description}</p>
                    </div>
                  )}
                </header>

                <div className="space-y-4 mb-6">
                  {story.coreExperience && (
                    <div>
                      <span className="font-semibold text-gray-700">Core Experience:</span>
                      <p className="text-gray-600 mt-1">{story.coreExperience}</p>
                    </div>
                  )}
                  
                  {story.keyActions && (
                    <div>
                      <span className="font-semibold text-gray-700">Key Actions:</span>
                      <p className="text-gray-600 mt-1">{story.keyActions}</p>
                    </div>
                  )}
                  
                  {story.outcomesAndGrowth && (
                    <div>
                      <span className="font-semibold text-gray-700">Outcomes & Growth:</span>
                      <p className="text-gray-600 mt-1">{story.outcomesAndGrowth}</p>
                    </div>
                  )}
                  
                  {story.universalThemes && (
                    <div>
                      <span className="font-semibold text-gray-700">Universal Themes:</span>
                      <p className="text-gray-600 mt-1">{story.universalThemes}</p>
                    </div>
                  )}
                  
                  {story.adaptationNotes && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <span className="font-semibold text-blue-700">Adaptation Notes:</span>
                      <p className="text-blue-600 mt-1 text-sm">{story.adaptationNotes}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                    Covered Schools & Prompts
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                      {relevantPrompts.length} match{relevantPrompts.length !== 1 ? 'es' : ''}
                    </span>
                  </h3>
                  
                  {relevantPrompts.length === 0 ? (
                    <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded">
                      No matching prompts found for your selected schools.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-auto">
                      <ul className="space-y-2">
                        {relevantPrompts.map(prompt => (
                          <li key={prompt.id} className="text-sm border-l-2 border-indigo-200 pl-3">
                            <span className="font-semibold text-indigo-700">
                              {prompt.school}:
                            </span>
                            <span className="text-gray-700 ml-1">{prompt.prompt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Enhanced Summary Section */}
      {coverage && (
        <section className="mt-12 p-6 border-t border-gray-300">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Strategic Coverage Analysis
            </h2>
            <div className="flex justify-center items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Covered: {coverage.coveredPrompts}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Remaining: {coverage.uncoveredPrompts?.length || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Total Required: {coverage.relevantPrompts}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Coverage Progress</span>
              <span className={getCoverageColor(coverage.coveragePercentage)}>
                {coverage.coveragePercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  coverage.coveragePercentage === 100 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : coverage.coveragePercentage >= 80
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                }`}
                style={{ width: `${coverage.coveragePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Success Message for High Coverage */}
          {coverage.coveragePercentage >= 90 && (
            <div className="max-w-xl mx-auto text-center mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <svg className="mx-auto h-12 w-12 text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Excellent Strategic Coverage!</h3>
                <p className="text-green-700 mb-2">Your {stories.length} strategic stories cover {coverage.coveragePercentage}% of required prompts.</p>
                <p className="text-green-600 text-sm">Each story addresses multiple prompts efficiently, reducing your writing workload significantly.</p>
              </div>
            </div>
          )}

          {/* Efficiency Highlight */}
          {generationMetadata?.efficiency >= 3 && (
            <div className="max-w-xl mx-auto text-center mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-md font-semibold text-blue-800 mb-2">High Efficiency Achieved</h3>
                <p className="text-blue-700 text-sm">
                  Each story covers an average of {generationMetadata.efficiency.toFixed(1)} prompts, 
                  making your application process much more streamlined.
                </p>
              </div>
            </div>
          )}

          {/* Remaining Gaps (if any) */}
          {coverage.uncoveredPrompts && coverage.uncoveredPrompts.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold mb-4 text-orange-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Additional Prompts to Consider ({coverage.uncoveredPrompts.length})
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-700 text-sm mb-3">
                  These prompts may need separate essays or could potentially be addressed by adapting your existing stories:
                </p>
                <ul className="space-y-2 max-h-40 overflow-auto">
                  {coverage.uncoveredPrompts.map(prompt => (
                    <li key={prompt.id} className="text-sm text-orange-700 border-l-2 border-orange-300 pl-3">
                      <span className="font-semibold">{prompt.school}:</span>
                      <span className="ml-1">{prompt.prompt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Generation Statistics */}
          {generationMetadata && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-center text-sm font-medium text-gray-600 mb-4">Strategic Generation Results</h3>
              <div className="flex justify-center gap-6 text-xs text-gray-500 flex-wrap">
                <div className="text-center">
                  <div className="font-semibold text-gray-700">{stories.length}</div>
                  <div>Strategic Stories</div>
                </div>
                {generationMetadata.totalGroups && (
                  <div className="text-center">
                    <div className="font-semibold text-gray-700">{generationMetadata.totalGroups}</div>
                    <div>Prompt Groups</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="font-semibold text-gray-700">{coverage.relevantPrompts}</div>
                  <div>Target Prompts</div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${coverage.coveragePercentage >= 90 ? 'text-green-600' : 'text-gray-700'}`}>
                    {coverage.coveragePercentage}%
                  </div>
                  <div>Coverage Rate</div>
                </div>
                {generationMetadata.efficiency && (
                  <div className="text-center">
                    <div className={`font-semibold ${generationMetadata.efficiency >= 3 ? 'text-emerald-600' : 'text-gray-700'}`}>
                      {generationMetadata.efficiency.toFixed(1)}x
                    </div>
                    <div>Efficiency Ratio</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

// Helper functions
const parseLegacyFormat = (essayText) => {
  // Fallback parser for old format - simplified
  const essayMatches = essayText.match(/## Essay Idea.*?(?=## Essay Idea|$)/gs) || [];
  return essayMatches.map((section, index) => {
    const titleMatch = section.match(/Essay Idea.*?:(.+?)(?=\n|$)/);
    return {
      id: `legacy_${index}`,
      title: titleMatch ? titleMatch[1].trim() : `Essay ${index + 1}`,
      coreExperience: 'Legacy format - please regenerate for full details',
      schools: [],
      coveredPrompts: []
    };
  });
};

const calculateNewCoverage = (stories, targetColleges) => {
  const normalizedTargets = targetColleges.map(college => college.toLowerCase());
  
  // Get relevant prompts
  const relevantPrompts = PROMPTS_DATA.essays.filter(prompt => {
    if (prompt.school === 'Common App' && prompt.required) return true;
    
    return normalizedTargets.some(target => {
      const schoolLower = prompt.school.toLowerCase();
      return target === schoolLower || 
             target.includes(schoolLower) || 
             schoolLower.includes(target);
    }) && prompt.required;
  });
  
  // Calculate coverage from stories
  const allCoveredPrompts = new Set();
  stories.forEach(story => {
    if (story.coveredPrompts) {
      story.coveredPrompts.forEach(id => allCoveredPrompts.add(id));
    }
  });
  
  const coveragePercentage = relevantPrompts.length > 0 ? 
    Math.round((allCoveredPrompts.size / relevantPrompts.length) * 100) : 100;
  
  return {
    relevantPrompts: relevantPrompts.length,
    coveredPrompts: allCoveredPrompts.size,
    uncoveredPrompts: relevantPrompts.filter(p => !allCoveredPrompts.has(p.id)),
    coveragePercentage
  };
};

const getRelevantPromptsForStory = (story, targetColleges) => {
  if (!story.coveredPrompts) return [];
  
  return story.coveredPrompts
    .map(promptId => PROMPTS_DATA.essays.find(p => p.id === promptId))
    .filter(prompt => prompt && (
      prompt.school === 'Common App' || 
      targetColleges.some(college => 
        college.toLowerCase().includes(prompt.school.toLowerCase()) ||
        prompt.school.toLowerCase().includes(college.toLowerCase())
      )
    ));
};

export default StoryResults;