import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useSkill } from '../contexts/SkillContext';
import { useAuth } from '../contexts/AuthContext';
import MatchCard from '../components/MatchCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Matches = () => {
  const { user } = useAuth();
  const { potentialMatches, loading, findMatches, userProfile } = useSkill();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState('compatibility');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (userProfile) {
      findMatches();
    }
  }, [userProfile]);

  const filteredMatches = potentialMatches.filter(match => {
    const matchesSearch = match.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.user.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.matchingSkills.some(skill => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => 
                           match.matchingSkills.includes(skill)
                         );
    
    return matchesSearch && matchesSkills;
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    switch (sortBy) {
      case 'compatibility':
        return b.compatibility - a.compatibility;
      case 'rating':
        return b.user.rating - a.user.rating;
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      default:
        return 0;
    }
  });

  const availableSkills = [...new Set(potentialMatches.flatMap(match => match.matchingSkills))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Perfect Match
          </h1>
          <p className="text-gray-600">
            Discover people who can teach you new skills and learn from what you offer.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, bio, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="compatibility">Sort by Compatibility</option>
                <option value="rating">Sort by Rating</option>
                <option value="distance">Sort by Distance</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        setSelectedSkills(prev => 
                          prev.includes(skill) 
                            ? prev.filter(s => s !== skill)
                            : [...prev, skill]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {sortedMatches.length} {sortedMatches.length === 1 ? 'Match' : 'Matches'} Found
          </h2>
          {selectedSkills.length > 0 && (
            <button
              onClick={() => setSelectedSkills([])}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Match Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {sortedMatches.length === 0 && (
          <div className="text-center py-12">
            <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No matches found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or add more skills to your profile.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSkills([]);
              }}
              className="btn-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches; 