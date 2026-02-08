import React, { useState } from 'react';
import { FaGripVertical, FaPlus, FaTimes, FaCog, FaExpand, FaCompress, FaTasks, FaCalendarAlt, FaChartLine, FaClock, FaEnvelope, FaStar } from 'react-icons/fa';

const CustomDashboard = ({ widgets: initialWidgets = [], onLayoutChange, onAddWidget }) => {
  const [editMode, setEditMode] = useState(false);

  const defaultWidgets = [
    { id: 1, type: 'tasks', title: 'My Tasks', icon: FaTasks, size: 'medium', position: { x: 0, y: 0 } },
    { id: 2, type: 'calendar', title: 'Calendar', icon: FaCalendarAlt, size: 'large', position: { x: 1, y: 0 } },
    { id: 3, type: 'stats', title: 'Statistics', icon: FaChartLine, size: 'small', position: { x: 0, y: 1 } },
    { id: 4, type: 'focus', title: 'Focus Timer', icon: FaClock, size: 'small', position: { x: 1, y: 1 } },
    { id: 5, type: 'emails', title: 'Unread Emails', icon: FaEnvelope, size: 'medium', position: { x: 0, y: 2 } },
    { id: 6, type: 'favorites', title: 'Favorites', icon: FaStar, size: 'small', position: { x: 1, y: 2 } },
  ];

  const [widgets, setWidgets] = useState(initialWidgets.length > 0 ? initialWidgets : defaultWidgets);

  const availableWidgets = [
    { type: 'tasks', title: 'Tasks', icon: FaTasks },
    { type: 'calendar', title: 'Calendar', icon: FaCalendarAlt },
    { type: 'stats', title: 'Statistics', icon: FaChartLine },
    { type: 'focus', title: 'Focus Timer', icon: FaClock },
    { type: 'emails', title: 'Emails', icon: FaEnvelope },
    { type: 'favorites', title: 'Favorites', icon: FaStar },
  ];

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-2',
    large: 'col-span-2 row-span-2',
  };

  const handleRemoveWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
    onLayoutChange?.(widgets.filter(w => w.id !== id));
  };

  const handleAddWidget = (type) => {
    const template = availableWidgets.find(w => w.type === type);
    const newWidget = {
      id: Date.now(),
      ...template,
      size: 'small',
      position: { x: 0, y: widgets.length },
    };
    setWidgets([...widgets, newWidget]);
    onAddWidget?.(newWidget);
  };

  const cycleSize = (id) => {
    const sizes = ['small', 'medium', 'large'];
    setWidgets(widgets.map(w => {
      if (w.id === id) {
        const currentIndex = sizes.indexOf(w.size);
        const newSize = sizes[(currentIndex + 1) % sizes.length];
        return { ...w, size: newSize };
      }
      return w;
    }));
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              editMode
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <FaCog /> {editMode ? 'Done' : 'Customize'}
          </button>
        </div>
      </div>

      {/* Add Widget Panel */}
      {editMode && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add Widget</p>
          <div className="flex flex-wrap gap-2">
            {availableWidgets.map((w) => (
              <button
                key={w.type}
                onClick={() => handleAddWidget(w.type)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm"
              >
                <FaPlus className="text-xs" />
                <w.icon />
                {w.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Widget Grid */}
      <div className="grid grid-cols-3 gap-4 auto-rows-fr" style={{ gridAutoRows: '200px' }}>
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${sizeClasses[widget.size]} ${
              editMode ? 'ring-2 ring-dashed ring-primary-300 dark:ring-primary-700' : ''
            }`}
          >
            {/* Widget Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {editMode && (
                  <FaGripVertical className="text-gray-400 cursor-move" />
                )}
                <widget.icon className="text-primary-600" />
                <h3 className="font-medium text-gray-900 dark:text-white">{widget.title}</h3>
              </div>
              {editMode && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => cycleSize(widget.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Change size"
                  >
                    {widget.size === 'large' ? <FaCompress /> : <FaExpand />}
                  </button>
                  <button
                    onClick={() => handleRemoveWidget(widget.id)}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>

            {/* Widget Content Placeholder */}
            <div className="p-4 h-full">
              <div className="h-full bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                <span className="text-sm">{widget.title} Content</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {widgets.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No widgets added yet</p>
          <button
            onClick={() => setEditMode(true)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg"
          >
            Customize Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomDashboard;

