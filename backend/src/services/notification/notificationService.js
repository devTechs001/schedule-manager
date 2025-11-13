import { sendEmail } from '../email/emailSender.js';
import User from '../../models/User.js';
import { io } from '../../server.js';

export const sendNotification = async (userId, notification) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Send real-time notification via Socket.IO
    io.to(`user-${userId}`).emit('notification', notification);

    // Send email notification if enabled
    if (user.preferences.notifications.email) {
      await sendEmail({
        to: user.email,
        subject: notification.title,
        html: `
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
        `,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Notification Error:', error);
    throw error;
  }
};

export const scheduleTaskReminder = async (task, user, minutesBefore = 15) => {
  const reminderTime = new Date(task.dueDate).getTime() - (minutesBefore * 60 * 1000);
  const now = Date.now();

  if (reminderTime > now) {
    const delay = reminderTime - now;

    setTimeout(async () => {
      await sendNotification(user._id, {
        type: 'task_reminder',
        title: 'Task Reminder',
        message: `Your task "${task.title}" is due soon!`,
        data: { taskId: task._id },
      });
    }, delay);
  }
};