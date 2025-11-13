import React from 'react';
import { FaStar } from 'react-icons/fa';

const RatingSystem = ({ rating, onRate, readonly = false }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRate(star)}
          disabled={readonly}
          className={`focus:outline-none ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <FaStar
            size={20}
            className={
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }
          />
        </button>
      ))}
    </div>
  );
};

export default RatingSystem;