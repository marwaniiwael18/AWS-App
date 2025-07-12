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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-primary-600 to-secondary-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {userProfile?.name || 'Complete Your Profile'}
                  </h1>
                  <p className="text-primary-100 mt-2">
                    {userProfile?.email}
                  </p>
                  {userProfile?.location && (
                    <div className="flex items-center mt-2">
                      <MapPinIcon className="h-4 w-4 text-primary-200 mr-1" />
                      <span className="text-primary-100">{userProfile.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-primary-600 hover:bg-primary-50 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <PencilIcon className="h-4 w-4 inline mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="px-6 py-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
                            {suggestions.map((skill, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => addSkill(skill)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
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
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Skills You Offer</h3>
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
                        <p className="text-gray-500 text-sm">No skills added yet</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Skills You Want to Learn</h3>
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
                        <p className="text-gray-500 text-sm">No skills added yet</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
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
            ) : (
              <div className="space-y-6">
                {/* Profile Info */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About Me</h2>
                  <p className="text-gray-600">
                    {userProfile?.bio || 'No bio added yet. Click "Edit Profile" to add one.'}
                  </p>
                </div>

                {/* Rating */}
                {userProfile?.rating && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Rating</h2>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(userProfile.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-lg font-medium text-gray-900">
                        {userProfile.rating}
                      </span>
                      <span className="ml-2 text-gray-600">
                        ({userProfile.totalRatings} reviews)
                      </span>
                    </div>
                  </div>
                )}

                {/* Skills */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills I Offer</h2>
                    <div className="flex flex-wrap gap-2">
                      {userProfile?.skillsOffered?.map((skill, index) => (
                        <SkillTag key={index} skill={skill} type="offered" />
                      ))}
                      {(!userProfile?.skillsOffered || userProfile.skillsOffered.length === 0) && (
                        <p className="text-gray-500">No skills added yet</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills I Want to Learn</h2>
                    <div className="flex flex-wrap gap-2">
                      {userProfile?.skillsWanted?.map((skill, index) => (
                        <SkillTag key={index} skill={skill} type="wanted" />
                      ))}
                      {(!userProfile?.skillsWanted || userProfile.skillsWanted.length === 0) && (
                        <p className="text-gray-500">No skills added yet</p>
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