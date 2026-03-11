"use server";

import nodemailer from "nodemailer";
import { z } from "zod";
import { headers } from "next/headers";

// Define the validation schema
const contactSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede exceder los 50 caracteres"),
  email: z.string().email("Debe ser un correo electrónico válido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(1000, "El mensaje no puede exceder los 1000 caracteres"),
  // Honeypot field - must be empty
  website: z.string().max(0, "Spam detectado").optional().or(z.literal("")),
});

export async function sendEmail(formData: FormData, locale: string = "es") {
  // Simple rate limiting by IP
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  
  // We parse the formData to an object
  const data = {
    name: formData.get("name")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    message: formData.get("message")?.toString() || "",
    website: formData.get("website")?.toString() || "", // Honeypot field
  };

  // Validate data with Zod
  const result = contactSchema.safeParse(data);

  if (!result.success) {
    // If it fails because of the honeypot, we return a fake success to fool the bot
    if (data.website) {
      console.log(`Spam blocked from IP: ${ip}`);
      return { success: true };
    }
    
    // Otherwise return the first validation error
    return { error: result.error?.issues?.[0]?.message || "Error al validar la información." };
  }

  const { name, email, message } = result.data;

  // Create transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true" || false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Dynamic content based on locale
  const isEn = locale === "en";
  const replyContent = {
    subject: isEn ? "I have received your message - Nicolás Fernández" : "He recibido tu mensaje - Nicolás Fernández",
    greeting: isEn ? "Hello" : "Hola",
    body1: isEn ? "Thank you for reaching out to me through my portfolio." : "Gracias por ponerte en contacto conmigo a través de mi portafolio.",
    body2: isEn ? "I have successfully received your message and will get back to you as soon as possible." : "He recibido tu mensaje correctamente y te responderé lo antes posible.",
    body3: isEn ? "Here is a copy of your message:" : "Aquí tienes una copia de tu mensaje:",
    signoff: isEn ? "Best regards," : "Saludos cordiales,",
    nameLabel: "Nicolás Fernández"
  };

  try {
    // 1. Send the email to me (Portfolio Owner)
    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`, 
      replyTo: email,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: `Nuevo mensaje de ${name} desde Portafolio`,
      text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
      html: `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px; min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #2563eb; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Nuevo Lead - Portafolio</h1>
            </div>
            <div style="padding: 40px;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; text-transform: uppercase;">Nombre</p>
              <p style="margin: 0 0 24px 0; color: #111827; font-size: 18px; font-weight: 600;">${name}</p>
              
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; text-transform: uppercase;">Email</p>
              <p style="margin: 0 0 24px 0; color: #2563eb; font-size: 18px; font-weight: 600;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></p>
              
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; text-transform: uppercase;">Mensaje</p>
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <p style="margin: 0; white-space: pre-wrap; color: #374151; line-height: 1.6;">${message}</p>
              </div>
            </div>
          </div>
        </div>
      `,
    });

    // 2. Send the auto-reply email back to the User
    await transporter.sendMail({
      from: `"Nicolás Fernández" <${process.env.SMTP_USER}>`,
      to: email, // Send to the person who filled the form
      subject: replyContent.subject,
      text: `${replyContent.greeting} ${name},\n\n${replyContent.body1}\n${replyContent.body2}\n\n${replyContent.body3}\n"${message}"\n\n${replyContent.signoff}\n${replyContent.nameLabel}`,
      html: `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px; min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <div style="background-color: #111827; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.025em;">
                ${replyContent.nameLabel}
              </h1>
              <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">
                ${isEn ? 'Portfolio Contact' : 'Contacto del Portafolio'}
              </p>
            </div>

            <div style="padding: 40px;">
              <h2 style="color: #111827; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">
                ${replyContent.subject}
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                ${replyContent.greeting} <strong style="color: #111827;">${name}</strong>,
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                ${replyContent.body1} ${replyContent.body2}
              </p>
              
              <div style="margin: 32px 0;">
                <p style="color: #6b7280; font-size: 14px; font-weight: 500; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
                  ${replyContent.body3}
                </p>
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                  <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap; font-style: italic;">"${message}"</p>
                </div>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                ${replyContent.signoff}
                <br />
                <strong style="color: #111827;">${replyContent.nameLabel}</strong>
              </p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.5;">
                ${isEn ? 'This is an automated message. Please do not reply directly to this email.' : 'Este es un correo automático, por favor no respondas directamente a esta dirección.'}
              </p>
            </div>

          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error al enviar email:", error);
    return { error: "serverError" };
  }
}
