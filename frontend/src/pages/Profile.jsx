import { useState, useEffect, useRef } from 'react';
import { 
  UserIcon, 
  MapPinIcon, 
  PencilIcon, 
  PlusIcon, 
  StarIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useSkill } from '../contexts/SkillContext';
import { useAuth } from '../contexts/AuthContext';
import SkillTag from '../components/SkillTag';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { userProfile, updateUserProfile, uploadProfilePhoto, deleteProfilePhoto, loading, popularSkills } = useSkill();
  const { user } = useAuth();
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef(null);

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
        !formData[skillType === 'offered' ? 'skillsOffered' : 'skillsWanted'].includes(skill)
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addSkill = (skill = newSkill) => {
    if (!skill.trim()) return;
    
    const skillKey = skillType === 'offered' ? 'skillsOffered' : 'skillsWanted';
    if (!formData[skillKey].includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        [skillKey]: [...prev[skillKey], skill.trim()]
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
    setError('');
    setSuccess('');
    
    try {
      await updateUserProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
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
    setError('');
    setSuccess('');
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      setPhotoLoading(true);
      setError('');
      await uploadProfilePhoto(file);
      setSuccess('Profile photo updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(error.message || 'Failed to upload photo. Please try again.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handlePhotoDelete = async () => {
    try {
      setPhotoLoading(true);
      setError('');
      await deleteProfilePhoto();
      setSuccess('Profile photo removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError(error.message || 'Failed to remove photo. Please try again.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Profile Header */}
          <div className="card-gradient mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center avatar floating-element overflow-hidden">
                  {userProfile?.profilePhoto ? (
                    <img 
                      src={userProfile.profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-white" />
                  )}
                </div>
                
                {/* Photo Upload/Delete Buttons */}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={triggerFileInput}
                      disabled={photoLoading}
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                      title="Upload photo"
                    >
                      {photoLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CameraIcon className="w-4 h-4 text-white" />
                      )}
                    </button>
                    {userProfile?.profilePhoto && (
                      <button
                        onClick={handlePhotoDelete}
                        disabled={photoLoading}
                        className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors"
                        title="Remove photo"
                      >
                        <TrashIcon className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center shadow-glow-accent">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {userProfile?.name || user?.attributes?.name || 'Complete Your Profile'}
                </h1>
                <p className="text-white/90 mb-3">
                  {userProfile?.email || user?.attributes?.email}
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
                    <span className="text-white/90">{userProfile?.rating || 4.8}</span>
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
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="input-field resize-none"
                      placeholder="Tell others about yourself, your interests, and what you're passionate about..."
                    />
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-neutral-800">Skills</h3>
                    
                    {/* Add New Skill */}
                    <div className="relative">
                      <div className="flex space-x-2 mb-2">
                        <select
                          value={skillType}
                          onChange={(e) => setSkillType(e.target.value)}
                          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                        >
                          <option value="offered">Skills I Offer</option>
                          <option value="wanted">Skills I Want</option>
                        </select>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={handleSkillInput}
                            placeholder="Add a skill..."
                            className="input-field pr-10"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          />
                          <button
                            type="button"
                            onClick={() => addSkill()}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700"
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Skill Suggestions */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-neutral-200 rounded-lg shadow-lg mt-1">
                          {suggestions.map((skill, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => addSkill(skill)}
                              className="w-full text-left px-4 py-2 hover:bg-neutral-50 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Skills I Offer */}
                    <div>
                      <h4 className="font-medium text-neutral-700 mb-3 flex items-center">
                        Skills I Offer
                        <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                          {formData.skillsOffered.length}
                        </span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.skillsOffered.map((skill, index) => (
                          <SkillTag
                            key={index}
                            skill={skill}
                            variant="offered"
                            onRemove={() => removeSkill(skill, 'offered')}
                            removable
                          />
                        ))}
                        {formData.skillsOffered.length === 0 && (
                          <p className="text-neutral-500 text-sm">No skills added yet</p>
                        )}
                      </div>
                    </div>

                    {/* Skills I Want */}
                    <div>
                      <h4 className="font-medium text-neutral-700 mb-3 flex items-center">
                        Skills I Want to Learn
                        <span className="ml-2 bg-secondary-100 text-secondary-800 text-xs px-2 py-1 rounded-full">
                          {formData.skillsWanted.length}
                        </span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.skillsWanted.map((skill, index) => (
                          <SkillTag
                            key={index}
                            skill={skill}
                            variant="wanted"
                            onRemove={() => removeSkill(skill, 'wanted')}
                            removable
                          />
                        ))}
                        {formData.skillsWanted.length === 0 && (
                          <p className="text-neutral-500 text-sm">No skills added yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4 inline mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Profile View */
              <div className="space-y-8">
                {/* Bio Section */}
                {userProfile?.bio && (
                  <div className="card animate-slide-up">
                    <h3 className="text-xl font-semibold text-neutral-800 mb-4">About Me</h3>
                    <p className="text-neutral-600 leading-relaxed">{userProfile.bio}</p>
                  </div>
                )}

                {/* Skills Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Skills I Offer */}
                  <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-neutral-800 flex items-center">
                        Skills I Offer
                        <span className="ml-3 bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full">
                          {skillsOffered.length}
                        </span>
                      </h3>
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow-primary">
                        <StarIconSolid className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {skillsOffered.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skillsOffered.map((skill, index) => (
                            <SkillTag key={index} skill={skill} variant="offered" />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PlusIcon className="w-8 h-8 text-neutral-400" />
                          </div>
                          <p className="text-neutral-500 mb-4">No skills offered yet</p>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="btn-primary-outline"
                          >
                            Add Skills
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills I Want */}
                  <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-neutral-800 flex items-center">
                        Skills I Want to Learn
                        <span className="ml-3 bg-secondary-100 text-secondary-800 text-sm px-3 py-1 rounded-full">
                          {skillsWanted.length}
                        </span>
                      </h3>
                      <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center shadow-glow-secondary">
                        <StarIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {skillsWanted.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skillsWanted.map((skill, index) => (
                            <SkillTag key={index} skill={skill} variant="wanted" />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PlusIcon className="w-8 h-8 text-neutral-400" />
                          </div>
                          <p className="text-neutral-500 mb-4">No learning goals set</p>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="btn-secondary-outline"
                          >
                            Add Learning Goals
                          </button>
                        </div>
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