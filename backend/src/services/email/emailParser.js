export const parseEmailAddress = (email) => {
    const match = email.match(/^(.+?)\s*<(.+?)>$/);
    if (match) {
      return {
        name: match[1].trim(),
        email: match[2].trim(),
      };
    }
    return {
      name: '',
      email: email.trim(),
    };
  };
  
  export const extractEmailDomain = (email) => {
    return email.split('@')[1];
  };
  
  export const sanitizeEmailContent = (content) => {
    // Remove potentially harmful content
    return content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  };
  
  export const extractPlainText = (html) => {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .trim();
  };