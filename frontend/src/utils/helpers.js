export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };
  
  export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  export const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };
  
  export const downloadFile = (data, filename, type = 'text/plain') => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  };
  
  export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  };
  
  export const filterBySearch = (array, searchTerm, keys) => {
    const term = searchTerm.toLowerCase();
    return array.filter(item => {
      return keys.some(key => {
        const value = item[key];
        return value && value.toString().toLowerCase().includes(term);
      });
    });
  };
  
  export const truncate = (text, length = 50) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };
  
  export const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  
  export const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };