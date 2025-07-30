import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoryContext } from '../context/StoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, MessageCircle, Lightbulb, Loader2, CheckCircle, SkipForward, AlertCircle } from 'lucide-react';

const StoryDiscovery = () => {
  const navigate = useNavigate();
  const { 
    generatedQuestions, 
    questionResponses, 
    updateQuestionResponses,
    generateEssayIdeas,
    completeDiscovery
  } = useStoryContext();

  // State management
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const WORD_LIMIT = 150;

  // Enhanced error handling
  const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    setError({
      message: error.message || 'An unexpected error occurred',
      context,
      timestamp: new Date().toISOString()
    });
  };

  const clearError = () => setError(null);

  // Safe word counting with error handling
  const countWords = (text) => {
    try {
      if (!text || typeof text !== 'string') return 0;
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    } catch (error) {
      handleError(error, 'countWords');
      return 0;
    }
  };

  // Enhanced question parsing with validation
  useEffect(() => {
    try {
      setIsLoading(true);
      
      if (!generatedQuestions) {
        setIsLoading(false);
        return;
      }

      // Parse questions with better error handling
      const questionLines = generatedQuestions
        .split('\n')
        .filter(line => line && line.trim())
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(question => question.length > 0);
      
      if (questionLines.length === 0) {
        throw new Error('No valid questions found in generated content');
      }

      setQuestions(questionLines);
      
      // Initialize arrays with proper length
      const initialResponses = new Array(questionLines.length).fill('');
      const initialSkipped = new Array(questionLines.length).fill(false);
      
      // Restore previous responses if they exist
      if (questionResponses && questionResponses.length > 0) {
        for (let i = 0; i < Math.min(questionResponses.length, questionLines.length); i++) {
          initialResponses[i] = questionResponses[i] || '';
        }
      }
      
      setResponses(initialResponses);
      setSkippedQuestions(initialSkipped);
      setIsLoading(false);
      clearError();
      
    } catch (error) {
      handleError(error, 'question parsing');
      setIsLoading(false);
    }
  }, [generatedQuestions]);

  // Fixed context update with proper dependency management
  const updateContextResponses = useCallback((newResponses, newSkipped) => {
    try {
      if (!newResponses || newResponses.length === 0) return;
      
      // Create a combined data structure that includes skip status
      const responseData = {
        responses: newResponses,
        skipped: newSkipped || skippedQuestions,
        timestamp: Date.now()
      };
      
      updateQuestionResponses(newResponses);
      
      // Store skip data separately if your context supports it
      // If not, you might need to encode skip status in the response
      
    } catch (error) {
      handleError(error, 'updating context responses');
    }
  }, [updateQuestionResponses, skippedQuestions]);

  // Debounced context update
  useEffect(() => {
    if (questions.length > 0 && responses.length === questions.length) {
      const timeoutId = setTimeout(() => {
        updateContextResponses(responses, skippedQuestions);
      }, 500); // Increased debounce time

      return () => clearTimeout(timeoutId);
    }
  }, [responses, skippedQuestions, questions.length, updateContextResponses]);

  // Enhanced response change handler
  const handleResponseChange = (index, value) => {
    try {
      if (index < 0 || index >= questions.length) {
        throw new Error(`Invalid question index: ${index}`);
      }

      const wordCount = countWords(value);
      
      if (wordCount > WORD_LIMIT) {
        return; // Don't update if over limit
      }

      setResponses(prev => {
        const newResponses = [...prev];
        newResponses[index] = value;
        return newResponses;
      });

      // If user starts typing, automatically un-skip
      if (value.trim().length > 0) {
        setSkippedQuestions(prev => {
          const newSkipped = [...prev];
          newSkipped[index] = false;
          return newSkipped;
        });
      }

      clearError();
    } catch (error) {
      handleError(error, 'handling response change');
    }
  };

  // Fixed skip question handler
  const handleSkipQuestion = (index) => {
    try {
      if (index < 0 || index >= questions.length) {
        throw new Error(`Invalid question index: ${index}`);
      }

      setSkippedQuestions(prev => {
        const newSkipped = [...prev];
        newSkipped[index] = !newSkipped[index]; // Toggle skip status
        return newSkipped;
      });

      // If skipping, clear the response
      if (!skippedQuestions[index]) {
        setResponses(prev => {
          const newResponses = [...prev];
          newResponses[index] = '';
          return newResponses;
        });
      }

      clearError();
    } catch (error) {
      handleError(error, 'skipping question');
    }
  };

  // Safe navigation handlers
  const goToQuestion = (index) => {
    try {
      if (index >= 0 && index < questions.length) {
        setCurrentQuestionIndex(index);
        clearError();
      }
    } catch (error) {
      handleError(error, 'navigating to question');
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  // Enhanced progress calculation
  const calculateProgress = () => {
    try {
      if (questions.length === 0) return 0;
      const completedCount = questions.filter((_, index) => isQuestionProcessed(index)).length;
      return Math.round((completedCount / questions.length) * 100);
    } catch (error) {
      handleError(error, 'calculating progress');
      return 0;
    }
  };

  const getAnsweredCount = () => {
    try {
      return responses.filter(response => response && response.trim().length > 0).length;
    } catch (error) {
      handleError(error, 'counting answered questions');
      return 0;
    }
  };

  const getSkippedCount = () => {
    try {
      return skippedQuestions.filter(skipped => skipped === true).length;
    } catch (error) {
      handleError(error, 'counting skipped questions');
      return 0;
    }
  };

  const isQuestionProcessed = (index) => {
    try {
      return (responses[index] && responses[index].trim().length > 0) || skippedQuestions[index];
    } catch (error) {
      handleError(error, 'checking question status');
      return false;
    }
  };

  const canGenerateIdeas = () => {
    try {
      const answeredCount = getAnsweredCount();
      const totalProcessed = questions.filter((_, index) => isQuestionProcessed(index)).length;
      return answeredCount > 0 || totalProcessed === questions.length;
    } catch (error) {
      handleError(error, 'checking generation eligibility');
      return false;
    }
  };

  // Enhanced idea generation with better error handling
  const handleGenerateIdeas = async () => {
    try {
      setIsGeneratingIdeas(true);
      clearError();

      const success = await generateEssayIdeas();
      
      if (success) {
        completeDiscovery();
        navigate('/results');
      } else {
        throw new Error('Failed to generate essay ideas - please try again');
      }
    } catch (error) {
      handleError(error, 'generating essay ideas');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // Error display component
  const ErrorDisplay = ({ error, onDismiss }) => (
    <Card className="p-4 mb-6 bg-red-50 border-red-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-red-800 font-medium">Something went wrong</h4>
          <p className="text-red-700 text-sm mt-1">{error.message}</p>
          <p className="text-red-600 text-xs mt-2">Context: {error.context}</p>
        </div>
        <Button
          onClick={onDismiss}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-800"
        >
          ×
        </Button>
      </div>
    </Card>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized questions...</p>
        </div>
      </div>
    );
  }

  // Error state - no questions loaded
  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 text-center bg-red-50 border-red-200">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">No Questions Available</h2>
          <p className="text-red-700 mb-4">
            We couldn't load your personalized questions. This might be due to a connection issue or invalid question format.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            ← Back to Profile
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = responses[currentQuestionIndex] || '';
  const currentWordCount = countWords(currentResponse);
  const isAtWordLimit = currentWordCount >= WORD_LIMIT;
  const isCurrentSkipped = skippedQuestions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Error Display */}
      {error && <ErrorDisplay error={error} onDismiss={clearError} />}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MessageCircle className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Story Discovery
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-2">Reflect on your experiences to uncover your unique stories</p>
        <p className="text-sm text-gray-500">
          Answer the questions that resonate with you. You can skip questions that don't apply or feel free to come back to them later.
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {getAnsweredCount()} answered, {getSkippedCount()} skipped of {questions.length} total
          </span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </Card>

      {/* Question Navigator */}
      <Card className="p-4 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex flex-wrap gap-2">
          {questions.map((_, index) => (
            <Button
              key={index}
              variant={index === currentQuestionIndex ? "default" : "outline"}
              size="sm"
              onClick={() => goToQuestion(index)}
              className={`w-10 h-10 p-0 relative ${
                index === currentQuestionIndex 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                  : isQuestionProcessed(index)
                    ? responses[index]?.trim() 
                      ? 'border-green-500 text-green-600 hover:bg-green-50' 
                      : 'border-orange-500 text-orange-600 hover:bg-orange-50'
                    : 'hover:bg-purple-50'
              }`}
            >
              {responses[index]?.trim() ? (
                <CheckCircle className="w-4 h-4" />
              ) : skippedQuestions[index] ? (
                <SkipForward className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </Button>
          ))}
        </div>
      </Card>

      {/* Current Question */}
      <Card className="p-8 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {currentQuestionIndex + 1}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {currentQuestion}
              </h2>
            </div>
          </div>

          <div className="ml-11">
            {!isCurrentSkipped ? (
              <>
                <textarea
                  value={currentResponse}
                  onChange={(e) => handleResponseChange(currentQuestionIndex, e.target.value)}
                  placeholder="Share your story here... Be specific and concise."
                  className="w-full h-40 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
                  rows={6}
                />
                
                {/* Word Count Display */}
                <div className="flex justify-between items-center mt-2 mb-4">
                  <div className={`text-sm font-medium ${
                    isAtWordLimit ? 'text-red-600' : currentWordCount > WORD_LIMIT * 0.8 ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {currentWordCount} / {WORD_LIMIT} words
                  </div>
                  {isAtWordLimit && (
                    <div className="text-sm text-red-600 font-medium">
                      Word limit reached
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <SkipForward className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Question skipped</p>
                <p className="text-sm text-gray-400 mt-1">Click "Un-skip" below to answer this question</p>
              </div>
            )}
            
            {/* Skip/Un-skip Button */}
            <div className="flex justify-center mb-4">
              <Button
                onClick={() => handleSkipQuestion(currentQuestionIndex)}
                variant="outline"
                className={`${
                  isCurrentSkipped 
                    ? 'border-purple-500 text-purple-600 hover:bg-purple-50' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {isCurrentSkipped ? (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Un-skip Question
                  </>
                ) : (
                  <>
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip Question
                  </>
                )}
              </Button>
            </div>
            
            {/* Writing Tips */}
            {!isCurrentSkipped && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Writing Tips:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Be specific and concrete - avoid general statements</li>
                      <li>• Focus on one key moment or experience</li>
                      <li>• Include your emotions and what you learned</li>
                      <li>• Keep it focused - quality over quantity</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={goToPrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Question
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <Button
          onClick={goToNext}
          disabled={currentQuestionIndex === questions.length - 1}
          variant="outline"
          className="flex items-center gap-2"
        >
          Next Question
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Generate Essay Ideas Button */}
      {canGenerateIdeas() && (
        <Card className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            {calculateProgress() === 100 ? (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Ready to generate your essay ideas!
                </h3>
                <p className="text-gray-600 mb-6">
                  You've processed all {questions.length} questions ({getAnsweredCount()} answered, {getSkippedCount()} skipped). 
                  Let's turn your reflections into compelling essay ideas.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Generate ideas with your current responses
                </h3>
                <p className="text-gray-600 mb-6">
                  You've answered {getAnsweredCount()} question{getAnsweredCount() !== 1 ? 's' : ''}. 
                  You can generate essay ideas now or continue answering more questions for richer results.
                </p>
              </>
            )}
            
            <Button
              onClick={handleGenerateIdeas}
              disabled={isGeneratingIdeas}
              className="px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              {isGeneratingIdeas ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Essay Ideas...
                </>
              ) : (
                'Generate My Essay Ideas →'
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Progress Encouragement */}
      {!canGenerateIdeas() && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <p className="text-yellow-800">
              <strong>Get started!</strong> Answer at least one question to unlock your personalized essay ideas. 
              You can always skip questions that don't apply to you.
            </p>
          </div>
        </Card>
      )}

      {/* Back to Profile Button */}
      <div className="text-center mt-8">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Profile
        </Button>
      </div>
    </div>
  );
};

export default StoryDiscovery;