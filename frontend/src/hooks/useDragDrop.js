import { useState, useCallback, useRef } from 'react';

const useDragDrop = (options = {}) => {
  const {
    onDragStart,
    onDragEnd,
    onDrop,
    onReorder,
    axis = 'vertical', // 'vertical', 'horizontal', 'both'
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const dragImageRef = useRef(null);

  // Start dragging
  const handleDragStart = useCallback((e, item, index) => {
    setIsDragging(true);
    setDraggedItem({ item, index });
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ item, index }));
    
    // Set drag image if available
    if (dragImageRef.current) {
      e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
    }

    onDragStart?.(item, index);
  }, [onDragStart]);

  // During drag
  const handleDragOver = useCallback((e, targetItem, targetIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItem && targetIndex !== draggedItem.index) {
      setDropTarget({ item: targetItem, index: targetIndex });
    }
  }, [draggedItem]);

  // End dragging
  const handleDragEnd = useCallback((e) => {
    setIsDragging(false);
    setDraggedItem(null);
    setDropTarget(null);
    onDragEnd?.();
  }, [onDragEnd]);

  // Drop handler
  const handleDrop = useCallback((e, targetItem, targetIndex) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.index !== targetIndex) {
        onDrop?.(data.item, data.index, targetItem, targetIndex);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }

    setIsDragging(false);
    setDraggedItem(null);
    setDropTarget(null);
  }, [onDrop]);

  // Reorder items in an array
  const reorder = useCallback((list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    onReorder?.(result);
    return result;
  }, [onReorder]);

  // Get drag props for an item
  const getDragProps = useCallback((item, index) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, item, index),
    onDragEnd: handleDragEnd,
    onDragOver: (e) => handleDragOver(e, item, index),
    onDrop: (e) => handleDrop(e, item, index),
    'data-dragging': isDragging && draggedItem?.index === index,
    'data-drop-target': dropTarget?.index === index,
  }), [handleDragStart, handleDragEnd, handleDragOver, handleDrop, isDragging, draggedItem, dropTarget]);

  // Get drop zone props
  const getDropZoneProps = useCallback((id) => ({
    onDragOver: (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    onDrop: (e) => {
      e.preventDefault();
      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        onDrop?.(data.item, data.index, null, null, id);
      } catch (err) {
        console.error('Drop zone error:', err);
      }
    },
  }), [onDrop]);

  // Touch support for mobile
  const getTouchProps = useCallback((item, index) => {
    let touchStartY = 0;
    let touchStartX = 0;

    return {
      onTouchStart: (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        setDraggedItem({ item, index });
        onDragStart?.(item, index);
      },
      onTouchMove: (e) => {
        if (!draggedItem) return;
        
        const touch = e.touches[0];
        const deltaY = touch.clientY - touchStartY;
        const deltaX = touch.clientX - touchStartX;

        // Could implement visual feedback here
        if (axis === 'vertical' || axis === 'both') {
          // Handle vertical movement
        }
        if (axis === 'horizontal' || axis === 'both') {
          // Handle horizontal movement
        }
      },
      onTouchEnd: (e) => {
        setIsDragging(false);
        setDraggedItem(null);
        onDragEnd?.();
      },
    };
  }, [draggedItem, axis, onDragStart, onDragEnd]);

  return {
    isDragging,
    draggedItem,
    dropTarget,
    dragImageRef,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    reorder,
    getDragProps,
    getDropZoneProps,
    getTouchProps,
  };
};

export default useDragDrop;

