// src/useTranslation.js

import { useEffect, useState } from "react";
import { translations } from "./translations";

export function getLanguage() {
  const saved = localStorage.getItem("voilier_lang");

  if (["fr", "en", "ar"].includes(saved)) {
    return saved;
  }

  return "fr";
}

export function setLanguage(lang) {
  if (!["fr", "en", "ar"].includes(lang)) {
    lang = "fr";
  }

  localStorage.setItem("voilier_lang", lang);

  window.dispatchEvent(
    new CustomEvent("voilier-language-changed", {
      detail: lang,
    })
  );
}

export function useTranslation() {
  const [lang, setLang] = useState(getLanguage);

  useEffect(() => {
    const updateLanguage = (event) => {
      const newLang = event.detail || getLanguage();
      setLang(newLang);
    };

    window.addEventListener("voilier-language-changed", updateLanguage);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", lang === "ar");

    return () => {
      window.removeEventListener("voilier-language-changed", updateLanguage);
    };
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] ?? translations.fr?.[key] ?? key;
  };

  return {
    lang,
    t,
    setLanguage,
  };
}
