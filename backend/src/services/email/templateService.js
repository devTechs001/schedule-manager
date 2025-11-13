export const templates = {
    welcome: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #22c55e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to AI Schedule Manager!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.name}!</h2>
            <p>Thank you for joining AI Schedule Manager. We're excited to help you boost your productivity!</p>
            <p>Get started by:</p>
            <ul>
              <li>Creating your first task</li>
              <li>Setting up your calendar</li>
              <li>Connecting with our AI assistant</li>
            </ul>
            <a href="${data.appUrl}" class="button">Get Started</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} AI Schedule Manager. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  
    taskReminder: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .task-card { background: white; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .priority-high { border-left-color: #ef4444; }
          .priority-medium { border-left-color: #f59e0b; }
          .priority-low { border-left-color: #22c55e; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Task Reminder</h2>
          <p>Hi ${data.userName},</p>
          <div class="task-card priority-${data.priority}">
            <h3>${data.taskTitle}</h3>
            <p><strong>Priority:</strong> ${data.priority}</p>
            <p><strong>Due:</strong> ${data.dueDate}</p>
            ${data.description ? `<p>${data.description}</p>` : ''}
          </div>
          <p><a href="${data.taskUrl}">View Task</a></p>
        </div>
      </body>
      </html>
    `,
  
    passwordReset: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>Hi ${data.name},</p>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <a href="${data.resetUrl}" class="button">Reset Password</a>
          <div class="warning">
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  
  export const renderTemplate = (templateName, data) => {
    const template = templates[templateName];
    return template ? template(data) : null;
  };