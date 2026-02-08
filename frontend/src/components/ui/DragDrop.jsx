import React, { useState, useRef } from 'react';
import { FaGripVertical, FaArrowsAlt } from 'react-icons/fa';

// Draggable Item Component
export const DraggableItem = ({
  children,
  id,
  index,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  showHandle = true,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, index }));
    onDragStart?.(id, index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.(id, index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    onDragOver?.(id, index);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    onDrop?.(data.id, data.index, id, index);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isDragOver ? 'border-2 border-dashed border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}
        ${className}
      `}
    >
      {showHandle && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <FaGripVertical />
        </div>
      )}
      {children}
    </div>
  );
};

// Droppable Zone Component
export const DroppableZone = ({
  children,
  id,
  onDrop,
  accept = [],
  className = '',
  emptyMessage = 'Drop items here',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const isEmpty = React.Children.count(children) === 0;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (accept.length === 0 || accept.includes(data.type)) {
        onDrop?.(data, id);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        min-h-[100px] rounded-lg border-2 transition-all duration-200
        ${isDragOver
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 border-dashed'
          : 'border-gray-200 dark:border-gray-700 border-solid'
        }
        ${className}
      `}
    >
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-gray-400">
          <FaArrowsAlt className="text-2xl mb-2" />
          <span className="text-sm">{emptyMessage}</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

// Sortable List Component
const DragDropList = ({ items = [], renderItem, onReorder, className = '' }) => {
  const [localItems, setLocalItems] = useState(items);

  const handleDrop = (fromId, fromIndex, toId, toIndex) => {
    const newItems = [...localItems];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    setLocalItems(newItems);
    onReorder?.(newItems);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {localItems.map((item, index) => (
        <DraggableItem
          key={item.id}
          id={item.id}
          index={index}
          onDrop={handleDrop}
          className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm pl-10"
        >
          {renderItem ? renderItem(item, index) : <span>{item.label || item.id}</span>}
        </DraggableItem>
      ))}
    </div>
  );
};

export default DragDropList;

