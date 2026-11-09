import React, { useState } from 'react';
import { format, addHours, startOfDay } from 'date-fns';
import { FaPlus } from 'react-icons/fa';
import Button from '@components/ui/Button';

const TimeBlocking = ({ date, blocks, onAddBlock, onEditBlock, onDeleteBlock }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const getBlocksForHour = (hour) => {
    return blocks.filter(block => {
      const blockStart = new Date(block.start);
      return blockStart.getHours() === hour;
    });
  };

  const handleSlotClick = (hour) => {
    setSelectedSlot(hour);
    const start = addHours(startOfDay(date), hour);
    const end = addHours(start, 1);
    onAddBlock({ start, end });
  };

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-line p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-content">
          Time Blocking - {format(date, 'EEEE, MMMM d')}
        </h3>
      </div>

      <div className="space-y-1">
        {hours.map((hour) => {
          const hourBlocks = getBlocksForHour(hour);
          const isOccupied = hourBlocks.length > 0;

          return (
            <div
              key={hour}
              className={`
                flex items-center space-x-4 p-3 rounded-lg border-2 transition-all cursor-pointer
                ${isOccupied
                  ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-line hover:border-primary-200 hover:bg-surface-sunken'
                }
              `}
              onClick={() => !isOccupied && handleSlotClick(hour)}
            >
              <div className="w-20 text-sm font-medium text-content-muted">
                {format(addHours(startOfDay(date), hour), 'h:mm a')}
              </div>

              <div className="flex-1">
                {isOccupied ? (
                  <div className="space-y-2">
                    {hourBlocks.map((block) => (
                      <div
                        key={block._id}
                        className="flex items-center justify-between p-2 bg-surface rounded"
                      >
                        <div>
                          <p className="font-medium text-content">
                            {block.title}
                          </p>
                          <p className="text-xs text-content-muted">
                            {format(new Date(block.start), 'h:mm a')} - {format(new Date(block.end), 'h:mm a')}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBlock(block._id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center text-content-subtle text-sm">
                    <FaPlus className="mr-2" size={12} />
                    Click to add block
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeBlocking;