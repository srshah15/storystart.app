import React, { useMemo } from 'react';
import { useStoryContext } from '../context/StoryContext';
import { parseStrategicEssaysWithTags, analyzePromptCoverage } from '../utils/tagBasedMatching';
import { PROMPTS_DATA } from '../data/prompts.tsx';

const StoryResults = () => {
  const { essayIdeas, profileData } = useStoryContext();

  // Memoize expensive computations
  const { essays, coverage } = useMemo(() => {
    if (!essayIdeas || essayIdeas.trim() === '') {
      return { essays: [], coverage: null };
    }

    const parsedEssays = parseStrategicEssaysWithTags(essayIdeas);
    const promptCoverage = analyzePromptCoverage(parsedEssays, profileData.colleges, PROMPTS_DATA);
    
    return { essays: parsedEssays, coverage: promptCoverage };
  }, [essayIdeas, profileData.colleges]);

  // Early return for empty state
  if (!essayIdeas || essayIdeas.trim() === '') {
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
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageBadgeColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">
          Essay Ideas
        </h1>
        {coverage && (
          <div className="inline-flex items-center gap-2">
            <span className="text-sm text-gray-600">Coverage:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCoverageBadgeColor(coverage.coveragePercentage)}`}>
              {coverage.coveragePercentage}%
            </span>
          </div>
        )}
      </div>

      {essays.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No parsed essay ideas found.</p>
          <p className="text-sm text-gray-500 mt-2">Check that your essay ideas are properly formatted.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {essays.map(({ id, title, storyFocus, keyMessage, tags, coveredPrompts }) => {
            const relevantPrompts = coveredPrompts
              .map(promptId => PROMPTS_DATA.essays.find(p => p.id === promptId))
              .filter(prompt => 
                prompt && 
                (prompt.school === 'Common App' || profileData.colleges.includes(prompt.school))
              );

            return (
              <article 
                key={id} 
                className="p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white hover:border-indigo-300"
              >
                <header className="mb-4">
                  <h2 className="text-xl font-bold text-indigo-700 mb-2">{title}</h2>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </header>

                <div className="space-y-3 mb-4">
                  <div>
                    <span className="font-semibold text-gray-700">Story Focus:</span>
                    <p className="text-gray-600 mt-1">{storyFocus}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Key Message:</span>
                    <p className="text-gray-600 mt-1">{keyMessage}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                    Relevant Schools & Prompts
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
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
                            <span className="font-semibold text-indigo-700">{prompt.school}:</span>
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
              Prompt Coverage Analysis
            </h2>
            <div className="flex justify-center items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Covered: {coverage.coveredPrompts.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Remaining: {coverage.uncoveredPrompts.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Total: {coverage.relevantPrompts.length}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span className={getCoverageColor(coverage.coveragePercentage)}>
                {coverage.coveragePercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${coverage.coveragePercentage}%` }}
              ></div>
            </div>
          </div>

          {coverage.uncoveredPrompts.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Uncovered Required Prompts
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-2 max-h-40 overflow-auto">
                  {coverage.uncoveredPrompts.map(prompt => (
                    <li key={prompt.id} className="text-sm text-red-700 border-l-2 border-red-300 pl-3">
                      <span className="font-semibold">{prompt.school}:</span>
                      <span className="ml-1">{prompt.prompt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {coverage.coveragePercentage === 100 && (
            <div className="max-w-xl mx-auto text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <svg className="mx-auto h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 font-medium">Perfect Coverage!</p>
                <p className="text-green-600 text-sm mt-1">All required prompts are covered by your essay ideas.</p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default StoryResults;