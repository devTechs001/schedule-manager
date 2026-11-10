import React from 'react';
import { FaLightbulb, FaChartLine, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import Card from '@components/ui/Card';

/**
 * AIInsights — renders a list of insight objects.
 *
 * Deliberately not mounted: the AI Insights page (pages/AI/AIInsights.jsx)
 * renders its own richer layout from the same data, so mounting this too would
 * show the same insights twice.
 *
 * The `insights` prop is normalised here because it arrived in two different
 * shapes depending on the caller: an array from the protected endpoint, an
 * `{ success, data }` envelope from the public one. The aiAPI service now
 * unwraps, but this guard stays so a bad caller degrades to an empty state
 * rather than throwing on `.map` of a non-array.
 */
const AIInsights = ({ insights }) => {
  const list = Array.isArray(insights) ? insights : Array.isArray(insights?.data) ? insights.data : [];

  const iconMap = {
    productivity: FaChartLine,
    time: FaClock,
    warning: FaExclamationTriangle,
    suggestion: FaLightbulb,
  };

  const colorMap = {
    productivity: 'text-green-600',
    time: 'text-blue-600',
    warning: 'text-yellow-600',
    suggestion: 'text-purple-600',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <FaLightbulb className="mr-2 text-yellow-500" />
        AI Insights
      </h3>

      {list.length === 0 ? (
        <Card>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No insights available yet. Keep using the app to get personalized recommendations!
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((insight, index) => {
            const Icon = iconMap[insight.type] || FaLightbulb;
            const colorClass = colorMap[insight.type] || 'text-gray-600';

            return (
              <Card key={index} hoverable>
                <div className="flex items-start space-x-3">
                  <div className={`mt-1 ${colorClass}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <button className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                        {insight.action}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIInsights;