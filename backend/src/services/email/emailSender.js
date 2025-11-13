import nodemailer from 'nodemailer';
import emailConfig from '../../config/email.js';

const transporter = nodemailer.createTransport(emailConfig);

export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'AI Schedule Manager'} <${emailConfig.auth.user}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

export const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to AI Schedule Manager!',
    html: `
      <h1>Welcome ${user.name}!</h1>
      <p>Thank you for joining AI Schedule Manager. We're excited to help you boost your productivity!</p>
      <p>Get started by:</p>
      <ul>
        <li>Creating your first task</li>
        <li>Setting up your calendar</li>
        <li>Connecting with our AI assistant</li>
      </ul>
      <p>Best regards,<br>The AI Schedule Manager Team</p>
    `,
  });
};

export const sendTaskReminder = async (user, task) => {
  await sendEmail({
    to: user.email,
    subject: `Reminder: ${task.title}`,
    html: `
      <h2>Task Reminder</h2>
      <p>Hi ${user.name},</p>
      <p>This is a reminder about your task:</p>
      <h3>${task.title}</h3>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
      ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
      <p><a href="${process.env.CLIENT_URL}/tasks">View Task</a></p>
    `,
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};