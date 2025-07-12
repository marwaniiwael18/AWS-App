import { XMarkIcon } from '@heroicons/react/24/outline';

const SkillTag = ({ skill, type = 'offered', onRemove, className = '' }) => {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors';
  
  const typeClasses = {
    offered: 'bg-primary-100 text-primary-800 border border-primary-200',
          wanted: 'bg-secondary-100 text-secondary-800 border border-secondary-200',
    matched: 'bg-green-100 text-green-800 border border-green-200',
    neutral: 'bg-gray-100 text-gray-800 border border-gray-200',
  };

  return (
    <span className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      <span>{skill}</span>
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className="ml-2 h-4 w-4 hover:bg-white hover:bg-opacity-30 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${skill}`}
        >
          <XMarkIcon className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

export default SkillTag; 