import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  MapPinIcon, 
  PencilIcon, 
  PlusIcon, 
  StarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useSkill } from '../contexts/SkillContext';
import { useAuth } from '../contexts/AuthContext';
import SkillTag from '../components/SkillTag';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { userProfile, updateUserProfile, loading, popularSkills } = useSkill();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    skillsOffered: [],
    skillsWanted: [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [skillType, setSkillType] = useState('offered');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Safely get skills with fallbacks
  const skillsOffered = userProfile?.skillsOffered || [];
  const skillsWanted = userProfile?.skillsWanted || [];

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        skillsOffered: userProfile.skillsOffered || [],
        skillsWanted: userProfile.skillsWanted || [],
      });
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillInput = (e) => {
    const value = e.target.value;
    setNewSkill(value);
    
    if (value.length > 0) {
      const filtered = popularSkills.filter(skill =>
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !formData.skillsOffered.includes(skill) &&
        !formData.skillsWanted.includes(skill)
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addSkill = (skill = newSkill) => {
    if (!skill.trim()) return;
    
    const skillToAdd = skill.trim();
    if (skillType === 'offered' && !formData.skillsOffered.includes(skillToAdd)) {
      setFormData(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, skillToAdd]
      }));
    } else if (skillType === 'wanted' && !formData.skillsWanted.includes(skillToAdd)) {
      setFormData(prev => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, skillToAdd]
      }));
    }
    
    setNewSkill('');
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove, type) => {
    if (type === 'offered') {
      setFormData(prev => ({
        ...prev,
        skillsOffered: prev.skillsOffered.filter(skill => skill !== skillToRemove)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        skillsWanted: prev.skillsWanted.filter(skill => skill !== skillToRemove)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        skillsOffered: userProfile.skillsOffered || [],
        skillsWanted: userProfile.skillsWanted || [],
      });
    }
    setIsEditing(false);
  };

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="card-gradient mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center avatar floating-element">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center shadow-glow-accent">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {userProfile?.name || 'Complete Your Profile'}
                </h1>
                <p className="text-white/90 mb-3">
                  {userProfile?.email}
                </p>
                {userProfile?.location && (
                  <div className="flex items-center justify-center md:justify-start mb-3">
                    <MapPinIcon className="h-4 w-4 text-white/80 mr-2" />
                    <span className="text-white/90">{userProfile.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-center md:justify-start space-x-4">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-white/90">4.8</span>
                  </div>
                  <div className="text-white/90">
                    {skillsOffered.length + skillsWanted.length} Skills
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary"
              >
                <PencilIcon className="h-4 w-4 inline mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-8">
            {isEditing ? (
              <div className="card animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-neutral-800">Edit Profile</h2>
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow-primary">
                    <PencilIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="City, State/Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="input-field"
                      placeholder="Tell others about yourself, your interests, and what you're passionate about..."
                    />
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Add Skills
                      </label>
                      <div className="flex gap-2 mb-4">
                        <select
                          value={skillType}
                          onChange={(e) => setSkillType(e.target.value)}
                          className="input-field w-32"
                        >
                          <option value="offered">I Offer</option>
                          <option value="wanted">I Want</option>
                        </select>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={handleSkillInput}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            onFocus={() => newSkill && setShowSuggestions(true)}
                            className="input-field"
                            placeholder="Type a skill..."
                          />
                          {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white/90 backdrop-blur-md border border-neutral-200 rounded-lg shadow-strong mt-1">
                              {suggestions.map((skill, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => addSkill(skill)}
                                  className="w-full text-left px-3 py-2 hover:bg-primary-50 hover:text-primary-700 first:rounded-t-lg last:rounded-b-lg transition-colors duration-200"
                                >
                                  {skill}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => addSkill()}
                          className="btn-primary"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-neutral-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                        Skills You Offer
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.skillsOffered.map((skill, index) => (
                          <SkillTag
                            key={index}
                            skill={skill}
                            type="offered"
                            onRemove={(skill) => removeSkill(skill, 'offered')}
                          />
                        ))}
                        {formData.skillsOffered.length === 0 && (
                          <p className="text-neutral-500 text-sm italic">No skills added yet</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-neutral-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></span>
                        Skills You Want to Learn
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.skillsWanted.map((skill, index) => (
                          <SkillTag
                            key={index}
                            skill={skill}
                            type="wanted"
                            onRemove={(skill) => removeSkill(skill, 'wanted')}
                          />
                        ))}
                        {formData.skillsWanted.length === 0 && (
                          <p className="text-neutral-500 text-sm italic">No skills added yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-ghost"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <CheckIcon className="h-4 w-4 mr-2" />
                      )}
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Profile Info */}
                <div className="card animate-slide-up">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-neutral-800">About Me</h2>
                    <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center shadow-glow-secondary">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    {userProfile?.bio || 'No bio added yet. Click "Edit Profile" to add one.'}
                  </p>
                </div>

                {/* Rating */}
                <div className="card animate-slide-up animation-delay-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-neutral-800">Rating & Reviews</h2>
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center shadow-glow-accent">
                      <StarIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`h-6 w-6 ${
                            i < Math.floor(userProfile?.rating || 4.8)
                              ? 'text-yellow-400'
                              : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-3 text-2xl font-bold text-neutral-800">
                      {userProfile?.rating || '4.8'}
                    </span>
                    <span className="ml-3 text-neutral-600">
                      ({userProfile?.totalRatings || '24'} reviews)
                    </span>
                  </div>
                </div>

                {/* Skills */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="card animate-slide-up animation-delay-300">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-neutral-800 flex items-center">
                        <span className="w-3 h-3 bg-primary-500 rounded-full mr-2"></span>
                        Skills I Offer
                      </h2>
                      <div className="text-sm text-neutral-600 bg-primary-50 px-3 py-1 rounded-full">
                        {skillsOffered.length} skills
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillsOffered.map((skill, index) => (
                        <SkillTag key={index} skill={skill} type="offered" />
                      ))}
                      {skillsOffered.length === 0 && (
                        <p className="text-neutral-500 italic">No skills added yet</p>
                      )}
                    </div>
                  </div>

                  <div className="card animate-slide-up animation-delay-400">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-neutral-800 flex items-center">
                        <span className="w-3 h-3 bg-secondary-500 rounded-full mr-2"></span>
                        Skills I Want to Learn
                      </h2>
                      <div className="text-sm text-neutral-600 bg-secondary-50 px-3 py-1 rounded-full">
                        {skillsWanted.length} skills
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillsWanted.map((skill, index) => (
                        <SkillTag key={index} skill={skill} type="wanted" />
                      ))}
                      {skillsWanted.length === 0 && (
                        <p className="text-neutral-500 italic">No skills added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 