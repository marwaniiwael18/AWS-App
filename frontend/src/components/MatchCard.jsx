import { 
  StarIcon, 
  MapPinIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  UserIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useSkill } from '../contexts/SkillContext';
import SkillTag from './SkillTag';

const MatchCard = ({ match, compact = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const { sendMatchRequest, loading } = useSkill();
  
  const handleLike = async () => {
    if (loading) return;
    
    try {
      await sendMatchRequest(match.user.id, `Hi ${match.user.name}! I'd love to learn ${match.matchingSkills.join(', ')} from you.`);
      setIsLiked(true);
    } catch (error) {
      console.error('Error sending match request:', error);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex-shrink-0">
          {match.user.avatar ? (
            <img
              src={match.user.avatar}
              alt={match.user.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{match.user.name}</p>
          <p className="text-sm text-gray-500 truncate">
            {match.matchingSkills.join(', ')}
          </p>
        </div>
        <div className="flex items-center">
          <StarIconSolid className="h-4 w-4 text-yellow-400" />
          <span className="ml-1 text-sm text-gray-600">{match.user.rating}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {match.user.avatar ? (
              <img
                src={match.user.avatar}
                alt={match.user.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-primary-600" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{match.user.name}</h3>
            <div className="flex items-center mt-1">
              <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">{match.user.location}</span>
            </div>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIconSolid
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(match.user.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {match.user.rating}
                </span>
              </div>
              <span className="ml-3 text-sm text-gray-500">
                {match.distance}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-primary-600">
            {Math.round(match.compatibility * 100)}% Match
          </div>
          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${match.compatibility * 100}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{match.user.bio}</p>

      <div className="space-y-3 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Offers</h4>
          <div className="flex flex-wrap gap-2">
            {match.user.skillsOffered.map((skill, index) => (
              <SkillTag
                key={index}
                skill={skill}
                type={match.matchingSkills.includes(skill) ? 'matched' : 'offered'}
              />
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Wants to learn</h4>
          <div className="flex flex-wrap gap-2">
            {match.user.skillsWanted.map((skill, index) => (
              <SkillTag
                key={index}
                skill={skill}
                type={match.matchingSkills.includes(skill) ? 'matched' : 'wanted'}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Matching skills:</span>
          <div className="flex flex-wrap gap-1">
            {match.matchingSkills.map((skill, index) => (
              <SkillTag key={index} skill={skill} type="matched" />
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLike}
            disabled={loading || isLiked}
            className={`p-2 rounded-full transition-colors ${
              isLiked
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600'
            }`}
          >
            <HeartIcon className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => window.location.href = `/chat/${match.id}`}
            className="btn-primary text-sm"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchCard; 