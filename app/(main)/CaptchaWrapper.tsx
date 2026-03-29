"use client";

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export default function CaptchaWrapper({ children }: { children: React.ReactNode }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.error("Falta la variable NEXT_PUBLIC_RECAPTCHA_SITE_KEY en el .env.local");
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}