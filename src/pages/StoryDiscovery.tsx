import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoryContext } from '../context/StoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, MessageCircle, Lightbulb, Loader2, CheckCircle } from 'lucide-react';

const StoryDiscovery = () => {
  const navigate = useNavigate();
  const { 
    generatedQuestions, 
    questionResponses, 
    updateQuestionResponses,
    generateEssayIdeas,
    completeDiscovery
  } = useStoryContext();

  // Parse questions from the generated text
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  // Parse questions when component mounts
  useEffect(() => {
    if (generatedQuestions) {
      // Split by lines and filter for numbered questions
      const questionLines = generatedQuestions
        .split('\n')
        .filter(line => line.trim())
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      setQuestions(questionLines);
      
      // Initialize responses array if not already done
      if (questionResponses.length === 0) {
        setResponses(new Array(questionLines.length).fill(''));
      } else {
        setResponses(questionResponses);
      }
    }
  }, [generatedQuestions, questionResponses]);

  // Update context when responses change
  useEffect(() => {
    updateQuestionResponses(responses);
  }, [responses, updateQuestionResponses]);

  const handleResponseChange = (index: number, value: string) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const calculateProgress = () => {
    const answeredQuestions = responses.filter(response => response.trim().length > 0).length;
    return (answeredQuestions / questions.length) * 100;
  };

  const isAllAnswered = () => {
    return responses.every(response => response.trim().length > 0);
  };

  const handleGenerateIdeas = async () => {
    if (!isAllAnswered()) return;

    setIsGeneratingIdeas(true);

    try {
      const success = await generateEssayIdeas();
      if (success) {
        completeDiscovery();
        navigate('/results');
      } else {
        console.error('Failed to generate essay ideas');
        // You could add error handling/toast here
      }
    } catch (error) {
      console.error('Error generating essay ideas:', error);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = responses[currentQuestionIndex] || '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          Take your time with each question. The more thoughtful your responses, the better your essay ideas will be.
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {responses.filter(r => r.trim()).length} of {questions.length} answered
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
                  : responses[index]?.trim() 
                    ? 'border-green-500 text-green-600 hover:bg-green-50' 
                    : 'hover:bg-purple-50'
              }`}
            >
              {responses[index]?.trim() ? (
                <CheckCircle className="w-4 h-4" />
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
            <textarea
              value={currentResponse}
              onChange={(e) => handleResponseChange(currentQuestionIndex, e.target.value)}
              placeholder="Share your story here... Be specific about what happened, how you felt, what you learned, and how it changed you."
              className="w-full h-40 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
              rows={6}
            />
            
            {/* Writing Tips */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Writing Tips:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be specific - use concrete details, names, and examples</li>
                    <li>• Focus on your emotions and thoughts in the moment</li>
                    <li>• Explain what you learned and how you grew from the experience</li>
                    <li>• Don't worry about perfect writing - focus on authentic storytelling</li>
                  </ul>
                </div>
              </div>
            </div>
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
      {calculateProgress() === 100 && (
        <Card className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Great job! All questions answered.
            </h3>
            <p className="text-gray-600 mb-6">
              You've shared {responses.filter(r => r.trim()).length} thoughtful responses. 
              Now let's turn these reflections into compelling essay ideas.
            </p>
            
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

      {/* Partial Progress Encouragement */}
      {calculateProgress() > 0 && calculateProgress() < 100 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <p className="text-yellow-800">
              <strong>Keep going!</strong> You've answered {responses.filter(r => r.trim()).length} out of {questions.length} questions. 
              Complete all questions to unlock your personalized essay ideas.
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