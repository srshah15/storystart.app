import React from 'react';
import { useStoryContext } from '../context/StoryContext';
import { parseStrategicEssaysWithTags, analyzePromptCoverage } from '../utils/tagBasedMatching';
import { PROMPTS_DATA } from '../data/prompts.tsx';

const StoryResults = () => {
  const { essayIdeas, profileData } = useStoryContext();

  if (!essayIdeas || essayIdeas.trim() === '') {
    return (
      <div className="p-6 text-center text-gray-500">
        No essay ideas generated yet.
      </div>
    );
  }

  const essays = parseStrategicEssaysWithTags(essayIdeas);

  const coverage = analyzePromptCoverage(essays, profileData.colleges, PROMPTS_DATA);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
        Essay Ideas
      </h1>

      {essays.length === 0 ? (
        <p className="text-center text-gray-600">No parsed essay ideas found.</p>
      ) : (
        essays.map(({ id, title, storyFocus, keyMessage, tags, coveredPrompts }) => (
          <div key={id} className="mb-10 p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
            <h2 className="text-xl font-bold mb-3 text-indigo-700">{title}</h2>
            <p className="mb-1"><span className="font-semibold">Story Focus:</span> {storyFocus}</p>
            <p className="mb-1"><span className="font-semibold">Key Message:</span> {keyMessage}</p>
            <p className="mb-3">
              <span className="font-semibold">Tags:</span> {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </p>

            <div>
              <h3 className="font-semibold mb-2 text-gray-700">Relevant Schools & Prompts:</h3>
              {coveredPrompts.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No matching prompts found for selected schools.</p>
              ) : (
                <ul className="list-disc list-inside space-y-1 max-h-48 overflow-auto pr-2">
                  {coveredPrompts.map(promptId => {
                    const prompt = PROMPTS_DATA.essays.find(p => p.id === promptId);
                    if (!prompt) return null;
                    if (prompt.school !== 'Common App' && !profileData.colleges.includes(prompt.school)) return null;

                    return (
                      <li key={promptId} className="text-gray-700 text-sm">
                        <span className="font-semibold">{prompt.school}:</span> {prompt.prompt}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        ))
      )}

      {/* Summary Section */}
      <div className="mt-12 p-6 border-t border-gray-300 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Overall Prompt Coverage for Selected Colleges
        </h2>
        <p className="text-gray-700 mb-4">
          Covered prompts: <span className="font-bold">{coverage.coveredPrompts.length}</span> / <span className="font-bold">{coverage.relevantPrompts.length}</span> ({coverage.coveragePercentage}%)
        </p>

        {coverage.uncoveredPrompts.length > 0 && (
          <div className="text-left max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Uncovered Required Prompts:</h3>
            <ul className="list-disc list-inside text-sm text-red-700 max-h-40 overflow-auto pr-2">
              {coverage.uncoveredPrompts.map(prompt => (
                <li key={prompt.id}>
                  <span className="font-semibold">{prompt.school}:</span> {prompt.prompt}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryResults;
