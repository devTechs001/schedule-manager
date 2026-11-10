import React from 'react';
import { FaMagic, FaCheck, FaTimes } from 'react-icons/fa';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';

const AISuggestions = ({ suggestions, onAccept, onReject }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-content flex items-center">
        <FaMagic className="mr-2 text-purple-500" />
        AI Suggestions
      </h3>

      {suggestions.length === 0 ? (
        <Card>
          <p className="text-content-muted text-center py-8">
            No suggestions at the moment
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <Card key={suggestion._id}>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-content">
                      {suggestion.title}
                    </h4>
                    <span className="text-xs text-content-muted">
                      {suggestion.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-content-muted">
                    {suggestion.description}
                  </p>
                </div>

                {suggestion.preview && (
                  <div className="p-3 bg-surface-sunken rounded-lg">
                    <p className="text-sm text-content">
                      {suggestion.preview}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="success"
                    icon={<FaCheck />}
                    onClick={() => onAccept(suggestion)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<FaTimes />}
                    onClick={() => onReject(suggestion._id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISuggestions;