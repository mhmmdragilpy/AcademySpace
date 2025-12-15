import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Check if environment variables exist and create a transporter
const transporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS ?
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // generated ethereal user
      pass: process.env.SMTP_PASS, // generated ethereal password
    },
  }) : null;

export const emailService = {
  async sendReservationStatusEmail(
    userEmail: string,
    userName: string,
    facilityName: string,
    date: string,
    startTime: string,
    endTime: string,
    status: string,
    purpose: string
  ) {
    if (!transporter) {
      logger.warn('Email service not configured. Missing SMTP environment variables.');
      return;
    }

    try {
      const subject = `Reservation ${status.charAt(0).toUpperCase() + status.slice(1)} - ${facilityName}`;

      const html = `
        <h1>Reservation Status Update</h1>
        <p>Dear ${userName},</p>
        <p>Your reservation for ${facilityName} on ${date} from ${startTime} to ${endTime} has been <strong>${status}</strong>.</p>
        <p><strong>Reservation Details:</strong></p>
        <ul>
          <li><strong>Facility:</strong> ${facilityName}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
          <li><strong>Purpose:</strong> ${purpose}</li>
          <li><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</li>
        </ul>
        <p>Thank you for using Academy Space.</p>
      `;

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@academyspace.com',
        to: userEmail,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info('Email sent: ' + info.response);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  },

  async sendReservationCreatedEmail(
    userEmail: string,
    userName: string,
    facilityName: string,
    date: string,
    startTime: string,
    endTime: string,
    purpose: string
  ) {
    if (!transporter) {
      logger.warn('Email service not configured. Missing SMTP environment variables.');
      return;
    }

    try {
      const subject = `Reservation Request Submitted - ${facilityName}`;

      const html = `
        <h1>Reservation Request Submitted</h1>
        <p>Dear ${userName},</p>
        <p>Your reservation request for ${facilityName} on ${date} from ${startTime} to ${endTime} has been received and is pending approval.</p>
        <p><strong>Reservation Details:</strong></p>
        <ul>
          <li><strong>Facility:</strong> ${facilityName}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
          <li><strong>Purpose:</strong> ${purpose}</li>
          <li><strong>Status:</strong> Pending</li>
        </ul>
        <p>You will receive another email once your reservation has been reviewed by an administrator.</p>
        <p>Thank you for using Academy Space.</p>
      `;

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@academyspace.com',
        to: userEmail,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info('Email sent: ' + info.response);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }
};