import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoryContext } from '../context/StoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, GraduationCap, GripVertical, X, Plus, Heart, Loader2, Zap } from 'lucide-react';

// All your existing constants
const COLLEGES = [
  'Harvard', 'Stanford', 'MIT', 'Yale', 'Princeton', 'Columbia', 'UPenn', 'Brown',
  'Dartmouth', 'Cornell', 'UC Berkeley', 'UCLA', 'USC', 'NYU', 'Northwestern', 'UNC Chapel-Hill'
];

const MAJORS = [
  'Computer Science', 'Pre-med', 'Business', 'Engineering', 'Psychology', 
  'English', 'Political Science', 'Economics', 'Biology', 'Chemistry'
];

const BACKGROUND_OPTIONS = [
  'First-generation college student', 'Rural background', 'Urban background', 
  'Low-income family', 'Immigrant family', 'Military family'
];

const COMMON_ACTIVITIES = [
  'Soccer captain', 'Debate team', 'Coding club', 'Student government', 
  'Drama club', 'Band/Orchestra', 'Volunteer work', 'Part-time job',
  'National Honor Society', 'Key Club', 'Chess club', 'Yearbook committee'
];

const COMMON_AWARDS = [
  'National Honor Society', 'Principal\'s List', 'Dean\'s List', 'Perfect Attendance',
  'Academic Excellence Award', 'Student of the Month', 'Valedictorian', 'Salutatorian',
  'National Merit Scholar', 'AP Scholar', 'Honor Roll', 'Presidential Award'
];

const COMMON_HOBBIES = [
  'Reading', 'Photography', 'Cooking', 'Gaming', 'Drawing/Art', 'Writing',
  'Hiking', 'Gardening', 'Collecting', 'Board games', 'Music listening', 'Movies/TV'
];

const AWARD_LEVELS = ['School', 'Regional', 'State', 'National', 'International'];

const PERSONAL_VALUES = [
  'Innovation', 'Justice', 'Family', 'Excellence', 'Authenticity', 'Service', 
  'Leadership', 'Creativity', 'Independence', 'Community', 'Growth', 'Integrity', 
  'Adventure', 'Stability', 'Collaboration', 'Compassion', 'Achievement', 'Learning'
];

const PERSONALITY_TRAITS = [
  'Analytical', 'Empathetic', 'Persistent', 'Creative', 'Practical', 'Optimistic', 
  'Detail-oriented', 'Big-picture thinker', 'Collaborative', 'Independent', 
  'Risk-taker', 'Methodical', 'Spontaneous', 'Diplomatic', 'Competitive', 'Patient'
];

const LEARNING_STYLES = [
  'Visual learner', 'Hands-on experimenter', 'Analytical thinker', 
  'Collaborative brainstormer', 'Independent researcher', 'Trial-and-error approach', 
  'Step-by-step planner', 'Intuitive decision-maker'
];

const LEADERSHIP_STYLES = [
  'Lead by example', 'Motivational speaker', 'Behind-the-scenes organizer', 
  'Collaborative facilitator', 'Innovative visionary', 'Supportive mentor', 
  'Strategic planner', "I don't see myself as a leader"
];

const MOTIVATIONS = [
  'Solving complex problems', 'Helping others succeed', 'Creating something new', 
  'Making a positive impact', 'Competing and winning', 'Learning new things', 
  'Building relationships', 'Achieving personal goals', 'Recognition and praise', 'Financial security'
];

const SOCIAL_IMPACT_AREAS = [
  'Education access', 'Environmental sustainability', 'Social justice', 'Healthcare', 
  'Technology ethics', 'Economic inequality', 'Mental health', 'Community development', 
  'Arts/culture', 'Scientific research', 'Animal welfare', 'Global poverty'
];

const GROUP_ROLES = [
  'The idea generator', 'The organizer/planner', 'The researcher/analyst', 
  'The presenter/communicator', 'The problem-solver', 'The mediator/diplomat', 
  'The quality checker', 'The motivator/cheerleader'
];

const COMMUNICATION_PREFERENCES = [
  'Public speaking', 'One-on-one conversations', 'Written communication', 
  'Visual presentations', 'Leading discussions', 'Listening and supporting others'
];

const ProfileForm = () => {
  const navigate = useNavigate();
  const { 
    profileData, 
    updateProfileData, 
    isProfileComplete, 
    generateQuestions,
    skipToDiscovery,
    skipToResults
  } = useStoryContext();
  
  // Local state for form handling
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Initialize local state from context
  const [selectedColleges, setSelectedColleges] = useState(profileData.colleges);
  const [major, setMajor] = useState(profileData.major);
  const [background, setBackground] = useState(profileData.background);
  const [activities, setActivities] = useState(profileData.activities);
  const [awards, setAwards] = useState(profileData.awards);
  const [hobbies, setHobbies] = useState(profileData.hobbies);
  const [personalValues, setPersonalValues] = useState(profileData.personalValues);
  const [personalityTraits, setPersonalityTraits] = useState(profileData.personalityTraits);
  const [learningStyle, setLearningStyle] = useState(profileData.learningStyle);
  const [leadershipStyle, setLeadershipStyle] = useState(profileData.leadershipStyle);
  const [motivations, setMotivations] = useState(profileData.motivations);
  const [socialImpactAreas, setSocialImpactAreas] = useState(profileData.socialImpactAreas);
  const [groupRole, setGroupRole] = useState(profileData.groupRole);
  const [communicationPreference, setCommunicationPreference] = useState(profileData.communicationPreference);

  // Update context whenever local state changes
  useEffect(() => {
    updateProfileData({
      colleges: selectedColleges,
      major,
      background,
      activities,
      awards,
      hobbies,
      personalValues,
      personalityTraits,
      learningStyle,
      leadershipStyle,
      motivations,
      socialImpactAreas,
      groupRole,
      communicationPreference
    });
  }, [selectedColleges, major, background, activities, awards, hobbies, personalValues, personalityTraits, learningStyle, leadershipStyle, motivations, socialImpactAreas, groupRole, communicationPreference]);

  // Helper functions
  const toggleSelection = (item, list, setter, maxItems) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else if (!maxItems || list.length < maxItems) {
      setter([...list, item]);
    }
  };

  const addActivity = (activityName) => {
    if (activities.length < 10) {
      const newActivity = {
        id: Date.now().toString(),
        name: activityName,
        hours: '',
        description: ''
      };
      setActivities([...activities, newActivity]);
    }
  };

  const updateActivityHours = (id, hours) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, hours } : activity
    ));
  };

  const removeActivity = (id) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const addAward = (awardName) => {
    if (awards.length < 5) {
      const newAward = {
        id: Date.now().toString(),
        name: awardName,
        level: 'School',
        description: ''
      };
      setAwards([...awards, newAward]);
    }
  };

  const updateAward = (id, field, value) => {
    setAwards(awards.map(award => 
      award.id === id ? { ...award, [field]: value } : award
    ));
  };

  const removeAward = (id) => {
    setAwards(awards.filter(award => award.id !== id));
  };

  const addHobby = (hobbyName) => {
    const newHobby = {
      id: Date.now().toString(),
      name: hobbyName,
      description: ''
    };
    setHobbies([...hobbies, newHobby]);
  };

  const updateHobby = (id, field, value) => {
    setHobbies(hobbies.map(hobby => 
      hobby.id === id ? { ...hobby, [field]: value } : hobby
    ));
  };

  const removeHobby = (id) => {
    setHobbies(hobbies.filter(hobby => hobby.id !== id));
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newActivities = [...activities];
    const draggedActivity = newActivities[draggedIndex];
    
    newActivities.splice(draggedIndex, 1);
    newActivities.splice(dropIndex, 0, draggedActivity);
    
    setActivities(newActivities);
    setDraggedIndex(null);
  };

  const handleNext = async () => {
    if (!isProfileComplete) {
      console.log('Please fill in required fields first');
      return;
    }

    setIsGenerating(true);
    
    try {
      const success = await generateQuestions();
      if (success) {
        navigate('/discovery');
      } else {
        console.error('Failed to generate questions');
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error during question generation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSkipToDiscovery = () => {
    skipToDiscovery();
    navigate('/discovery');
  };

  const handleSkipToResults = () => {
    skipToResults();
    navigate('/results');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Testing Skip Controls */}
      {/*
      <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Development Mode</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipToDiscovery}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            >
              Skip to Discovery
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipToResults}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            >
              Skip to Results
            </Button>
          </div>
        </div>
        <p className="text-sm text-yellow-700 mt-2">
          Use these buttons to test navigation without using API tokens
        </p>
      </Card>
      */}
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            StoryStart
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-2">Find your story. Write your future.</p>
        <p className="text-sm text-gray-500">This should take about 3-4 minutes</p>
      </div>

      <div className="space-y-8">
        {/* Tell us about yourself */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Tell us about yourself</h2>
          
          {/* Target Colleges */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Target colleges <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {COLLEGES.map(college => (
                <Badge
                  key={college}
                  variant={selectedColleges.includes(college) ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedColleges.includes(college) 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                      : 'hover:bg-purple-50'
                  }`}
                  onClick={() => toggleSelection(college, selectedColleges, setSelectedColleges, null)}
                >
                  {college}
                </Badge>
              ))}
            </div>
          </div>

          {/* Intended Major */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Intended major <span className="text-red-500">*</span>
            </label>
            
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-600 mb-2">Quick select common majors:</p>
              <div className="flex flex-wrap gap-2">
                {MAJORS.map(majorOption => (
                  <Badge
                    key={majorOption}
                    variant="outline"
                    className="cursor-pointer transition-all hover:scale-105 hover:bg-purple-50"
                    onClick={() => setMajor(majorOption)}
                  >
                    {majorOption}
                  </Badge>
                ))}
              </div>
            </div>

            <Input
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Type your intended major (e.g., Biomedical Engineering, International Relations, Undecided)..."
              className="w-full font-medium"
            />
          </div>

          {/* Background */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Background (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {BACKGROUND_OPTIONS.map(option => (
                <Badge
                  key={option}
                  variant={background.includes(option) ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    background.includes(option) 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'hover:bg-purple-50'
                  }`}
                  onClick={() => toggleSelection(option, background, setBackground, null)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Personal Insights */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Your Personal Insights</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Help us understand who you are beyond your achievements. This helps create more authentic, personal stories.
          </p>

          {/* Personal Values */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your core values (select up to 5)
            </label>
            <p className="text-xs text-gray-500 mb-3">What principles guide your decisions and actions?</p>
            <div className="flex flex-wrap gap-2">
              {PERSONAL_VALUES.map(value => (
                <Badge
                  key={value}
                  variant={personalValues.includes(value) ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    personalValues.includes(value) 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'hover:bg-purple-50'
                  } ${personalValues.length >= 5 && !personalValues.includes(value) ? 'opacity-50' : ''}`}
                  onClick={() => toggleSelection(value, personalValues, setPersonalValues, 5)}
                >
                  {value}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{personalValues.length}/5 selected</p>
          </div>

          {/* Personality Traits */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would others describe you? (select up to 4)
            </label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TRAITS.map(trait => (
                <Badge
                  key={trait}
                  variant={personalityTraits.includes(trait) ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    personalityTraits.includes(trait) 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'hover:bg-purple-50'
                  } ${personalityTraits.length >= 4 && !personalityTraits.includes(trait) ? 'opacity-50' : ''}`}
                  onClick={() => toggleSelection(trait, personalityTraits, setPersonalityTraits, 4)}
                >
                  {trait}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{personalityTraits.length}/4 selected</p>
          </div>

          {/* Learning Style */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your learning/problem-solving style
            </label>
            <div className="flex flex-wrap gap-2">
              {LEARNING_STYLES.map(style => (
                <Badge
                  key={style}
                  variant={learningStyle === style ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    learningStyle === style 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'hover:bg-purple-50'
                  }`}
                  onClick={() => setLearningStyle(learningStyle === style ? '' : style)}
                >
                  {style}
                </Badge>
              ))}
            </div>
          </div>

          {/* Leadership Style */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your leadership style
            </label>
            <div className="flex flex-wrap gap-2">
              {LEADERSHIP_STYLES.map(style => (
                <Badge
                  key={style}
                  variant={leadershipStyle === style ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    leadershipStyle === style 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'hover:bg-purple-50'
                  }`}
                  onClick={() => setLeadershipStyle(leadershipStyle === style ? '' : style)}
                >
                  {style}
                </Badge>
              ))}
            </div>
          </div>

          {/* Motivations */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What motivates you most? (select up to 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {MOTIVATIONS.map(motivation => (
                <Badge
                  key={motivation}
                  variant={motivations.includes(motivation) ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    motivations.includes(motivation) 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'hover:bg-purple-50'
                  } ${motivations.length >= 3 && !motivations.includes(motivation) ? 'opacity-50' : ''}`}
                  onClick={() => toggleSelection(motivation, motivations, setMotivations, 3)}
                >
                  {motivation}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{motivations.length}/3 selected</p>
          </div>

          {/* Social Impact Areas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Issues you care about (select up to 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_IMPACT_AREAS.map(area => (
                <Badge
                  key={area}
                  variant={socialImpactAreas.includes(area) ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    socialImpactAreas.includes(area) 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'hover:bg-purple-50'
                  } ${socialImpactAreas.length >= 3 && !socialImpactAreas.includes(area) ? 'opacity-50' : ''}`}
                  onClick={() => toggleSelection(area, socialImpactAreas, setSocialImpactAreas, 3)}
                >
                  {area}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{socialImpactAreas.length}/3 selected</p>
          </div>

          {/* Group Role */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your typical role in group projects
            </label>
            <div className="flex flex-wrap gap-2">
              {GROUP_ROLES.map(role => (
                <Badge
                  key={role}
                  variant={groupRole === role ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    groupRole === role 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'hover:bg-purple-50'
                  }`}
                  onClick={() => setGroupRole(groupRole === role ? '' : role)}
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          {/* Communication Preference */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How do you prefer to communicate?
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMUNICATION_PREFERENCES.map(pref => (
                <Badge
                  key={pref}
                  variant={communicationPreference === pref ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    communicationPreference === pref 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'hover:bg-purple-50'
                  }`}
                  onClick={() => setCommunicationPreference(communicationPreference === pref ? '' : pref)}
                >
                  {pref}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Your extracurricular activities */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your extracurricular activities</h2>
          
          {/* Activities with drag and drop */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Activities (up to 10) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Order matters - drag to reorder by importance. Most important at the top.
            </p>

            {/* Quick add buttons */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-600 mb-2">Quick add common activities:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_ACTIVITIES.map(activity => (
                  <Badge
                    key={activity}
                    variant="outline"
                    className={`cursor-pointer transition-all hover:scale-105 hover:bg-purple-50 ${
                      activities.some(a => a.name === activity) ? 'opacity-50' : ''
                    }`}
                    onClick={() => {
                      if (!activities.some(a => a.name === activity)) {
                        addActivity(activity);
                      }
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Activity list */}
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`p-4 bg-white rounded-lg border-2 transition-all cursor-move hover:shadow-md ${
                    draggedIndex === index ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          value={activity.name}
                          onChange={(e) => {
                            const newActivities = [...activities];
                            newActivities[index].name = e.target.value;
                            setActivities(newActivities);
                          }}
                          placeholder="Activity name..."
                          className="flex-1 font-medium"
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={activity.hours}
                            onChange={(e) => updateActivityHours(activity.id, e.target.value)}
                            placeholder="hrs/wk"
                            className="w-20 text-center text-sm"
                            min="0"
                            max="168"
                          />
                          <span className="text-xs text-gray-500">hrs/wk</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActivity(activity.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <textarea
                        value={activity.description || ''}
                        onChange={(e) => {
                          const newActivities = [...activities];
                          newActivities[index].description = e.target.value;
                          setActivities(newActivities);
                        }}
                        placeholder="Describe your role, achievements, and impact in this activity..."
                        className="w-full p-2 text-sm border border-gray-200 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add new activity */}
              {activities.length < 10 && (
                <Button
                  variant="outline"
                  onClick={() => addActivity('')}
                  className="w-full border-dashed border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity ({activities.length}/10)
                </Button>
              )}
            </div>
          </div>

          {/* Awards */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Awards/Recognition (up to 5) <span className="text-red-500">*</span>
            </label>

            {/* Quick add buttons */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-600 mb-2">Quick add common awards:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_AWARDS.map(award => (
                  <Badge
                    key={award}
                    variant="outline"
                    className={`cursor-pointer transition-all hover:scale-105 hover:bg-purple-50 ${
                      awards.some(a => a.name === award) ? 'opacity-50' : ''
                    } ${awards.length >= 5 && !awards.some(a => a.name === award) ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (!awards.some(a => a.name === award) && awards.length < 5) {
                        addAward(award);
                      }
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {award}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Awards list */}
            <div className="space-y-3">
              {awards.map((award) => (
                <div
                  key={award.id}
                  className="p-4 bg-white rounded-lg border-2 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          value={award.name}
                          onChange={(e) => updateAward(award.id, 'name', e.target.value)}
                          placeholder="Award name..."
                          className="flex-1 font-medium"
                        />
                        <select
                          value={award.level}
                          onChange={(e) => updateAward(award.id, 'level', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          {AWARD_LEVELS.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAward(award.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <textarea
                        value={award.description}
                        onChange={(e) => updateAward(award.id, 'description', e.target.value)}
                        placeholder="Describe what you achieved, the competition details, and the significance of this award..."
                        className="w-full p-2 text-sm border border-gray-200 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add new award */}
              {awards.length < 5 && (
                <Button
                  variant="outline"
                  onClick={() => addAward('')}
                  className="w-full border-dashed border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Award ({awards.length}/5)
                </Button>
              )}
            </div>
          </div>

          {/* Hobbies */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Personal Hobbies (optional)
            </label>

            {/* Quick add buttons */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-600 mb-2">Quick add common hobbies:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_HOBBIES.map(hobby => (
                  <Badge
                    key={hobby}
                    variant="outline"
                    className={`cursor-pointer transition-all hover:scale-105 hover:bg-purple-50 ${
                      hobbies.some(h => h.name === hobby) ? 'opacity-50' : ''
                    }`}
                    onClick={() => {
                      if (!hobbies.some(h => h.name === hobby)) {
                        addHobby(hobby);
                      }
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {hobby}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Hobbies list */}
            <div className="space-y-3">
              {hobbies.map((hobby) => (
                <div
                  key={hobby.id}
                  className="p-4 bg-white rounded-lg border-2 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          value={hobby.name}
                          onChange={(e) => updateHobby(hobby.id, 'name', e.target.value)}
                          placeholder="Hobby name..."
                          className="flex-1 font-medium"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHobby(hobby.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <textarea
                        value={hobby.description}
                        onChange={(e) => updateHobby(hobby.id, 'description', e.target.value)}
                        placeholder="Describe what you enjoy about this hobby and how it reflects your personality..."
                        className="w-full p-2 text-sm border border-gray-200 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add new hobby */}
              <Button
                variant="outline"
                onClick={() => addHobby('')}
                className="w-full border-dashed border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Hobby
              </Button>
            </div>
          </div>
        </Card>

        {/* Next Button */}
        <div className="text-center">
          <Button
            onClick={handleNext}
            disabled={!isProfileComplete || isGenerating}
            className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all ${
              isProfileComplete && !isGenerating
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Your Questions...
              </>
            ) : (
              'Let\'s Find Your Stories →'
            )}
          </Button>
          {!isProfileComplete && (
            <p className="text-sm text-red-500 mt-2">
              Please fill in all required fields (colleges, major, activities, and awards)
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;