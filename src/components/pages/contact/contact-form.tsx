"use client";

import { Reveal } from "@/components/ui/reveal";
import { useState } from "react";
import { sendEmail } from "@/actions/sendEmail";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type ContactFormValues = {
  name: string;
  email: string;
  message: string;
  website?: string;
};

export default function ContactForm() {
  const t = useTranslations("Contact");
  const locale = useLocale();
  
  const contactSchema = z.object({
    name: z.string().min(2, t("validation.nameMin")).max(50, t("validation.nameMax")),
    email: z.string().email(t("validation.emailInvalid")),
    message: z.string().min(10, t("validation.messageMin")).max(1000, t("validation.messageMax")),
    website: z.string().max(0).optional().or(z.literal("")), // Honeypot
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      website: "",
    },
  });

  async function onSubmitForm(data: ContactFormValues) {
    setStatus("loading");
    setServerError("");

    // Convert to FormData to send to Server Action
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("message", data.message);
    if (data.website) formData.append("website", data.website);

    const result = await sendEmail(formData, locale);

    if (result?.error) {
      setStatus("error");
      setServerError(result.error === "serverError" ? t("validation.serverError") : result.error);
    } else {
      setStatus("success");
      reset();
    }
  }

  return (
    <Reveal
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-card p-8 rounded-2xl border border-border shadow-sm"
    >
      {status === "success" ? (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-5 px-4 h-full min-h-[400px]">
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-24 h-24 bg-gradient-to-tr from-accent to-accent/60 text-accent-foreground rounded-full flex items-center justify-center shadow-xl transform transition-all duration-500 hover:scale-105 border-4 border-background">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <h3 className="font-display font-bold text-3xl text-foreground tracking-tight">{t("success.title")}</h3>
            <p className="text-muted-foreground text-base max-w-[320px] mx-auto leading-relaxed">
              {t("success.desc")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-6 px-6 py-3 bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium rounded-full shadow-sm transition-all duration-200 hover:shadow flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            {t("success.button")}
          </button>
        </div>
      ) : (
        <form id="contact-form" onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-2">
          {/* Honeypot field - invisible to real users but filled by bots */}
          <div style={{ display: "none" }} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              tabIndex={-1}
              autoComplete="off"
              {...register("website")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              {t("form.name")}
            </label>
            <input
              type="text"
              id="name"
              disabled={status === "loading"}
              placeholder={t("form.namePlaceholder")}
              className={`w-full px-4 py-3 rounded-xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : "border-border"
                }`}
              {...register("name")}
            />
            {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              {t("form.email")}
            </label>
            <input
              type="email"
              id="email"
              disabled={status === "loading"}
              placeholder={t("form.emailPlaceholder")}
              className={`w-full px-4 py-3 rounded-xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : "border-border"
                }`}
              {...register("email")}
            />
            {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-medium text-foreground">
              {t("form.message")}
            </label>
            <textarea
              id="message"
              rows={4}
              disabled={status === "loading"}
              placeholder={t("form.messagePlaceholder")}
              className={`w-full px-4 py-3 rounded-xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all resize-none ${errors.message ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : "border-border"
                }`}
              {...register("message")}
            ></textarea>
            {errors.message && <span className="text-red-500 text-xs mt-1">{errors.message.message}</span>}
          </div>

          {status === "error" && (
            <p className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-3 px-6 rounded-xl transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {status === "loading" ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-accent-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("form.sending")}
              </>
            ) : t("form.submit")}
          </button>
        </form>
      )}
    </Reveal>
  );
}
