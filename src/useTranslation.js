import { useEffect, useState } from "react";
import { translations } from "./translations";

const LANGUAGE_KEY = "voilier_lang";
const LANGUAGE_EVENT = "voilier-language-changed";

const SUPPORTED_LANGUAGES = ["fr", "en", "ar"];

// ======================================================
// GET CURRENT LANGUAGE
// ======================================================

export function getLanguage() {
  const saved = localStorage.getItem(LANGUAGE_KEY);

  if (SUPPORTED_LANGUAGES.includes(saved)) {
    return saved;
  }

  return "fr";
}

// ======================================================
// SET LANGUAGE
// ======================================================

export function setLanguage(lang) {
  const newLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : "fr";

  // Sauvegarder la langue
  localStorage.setItem(LANGUAGE_KEY, newLang);

  // Langue HTML
  document.documentElement.lang = newLang;

  // Direction
  document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";

  // Classe RTL
  document.body.classList.toggle("rtl", newLang === "ar");

  // Prévenir tous les composants React
  window.dispatchEvent(
    new CustomEvent(LANGUAGE_EVENT, {
      detail: newLang,
    })
  );
}

// ======================================================
// TRANSLATION HOOK
// ======================================================

export function useTranslation() {
  const [lang, setLang] = useState(getLanguage);

  useEffect(() => {
    // Appliquer la langue actuelle
    document.documentElement.lang = lang;

    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.body.classList.toggle("rtl", lang === "ar");

    // Écouter les changements de langue
    const updateLanguage = (event) => {
      const newLang = event.detail;

      if (SUPPORTED_LANGUAGES.includes(newLang)) {
        setLang(newLang);
      }
    };

    window.addEventListener(LANGUAGE_EVENT, updateLanguage);

    return () => {
      window.removeEventListener(LANGUAGE_EVENT, updateLanguage);
    };
  }, [lang]);

  // ====================================================
  // TRANSLATE
  // ====================================================

  const t = (key) => {
    // Traduction dans la langue actuelle
    const currentTranslation = translations[lang]?.[key];

    if (currentTranslation !== undefined) {
      return currentTranslation;
    }
    return key;
  };

  return {
    lang,
    t,
    setLanguage,
  };
}
