import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const dictionary: Translations = {
  app_name: {
    en: 'Environmental Intelligence Network',
    hi: 'पर्यावरण बुद्धिमत्ता नेटवर्क (EIN)'
  },
  tagline: {
    en: 'National Disaster Early-Warning Command Platform',
    hi: 'राष्ट्रीय आपदा पूर्व-चेतावनी कमान मंच'
  },
  live_dashboard: {
    en: 'Live Dashboard',
    hi: 'लाइव डैशबोर्ड'
  },
  regional_map: {
    en: 'Regional Risk Map',
    hi: 'क्षेत्रीय जोखिम मानचित्र'
  },
  alerts_center: {
    en: 'Alerts & SOS Center',
    hi: 'अलर्ट एवं आपातकालीन केंद्र'
  },
  analytics: {
    en: 'Analytics & Trends',
    hi: 'विश्लेषण एवं रुझान'
  },
  reports: {
    en: 'Reports & Downloads',
    hi: 'रिपोर्ट और डाउनलोड'
  },
  admin_panel: {
    en: 'Node Management',
    hi: 'नोड प्रबंधन'
  },
  report_incident: {
    en: 'Report Incident',
    hi: 'घटना की रिपोर्ट करें'
  },
  about: {
    en: 'Architecture & Tech',
    hi: 'तकनीक और वास्तुकला'
  },
  settings: {
    en: 'Settings',
    hi: 'सेटिंग्स'
  },
  total_poles: {
    en: 'Total Active Poles',
    hi: 'कुल सक्रिय पोल'
  },
  critical_alerts: {
    en: 'Critical Emergencies',
    hi: 'गंभीर आपात स्थिति'
  },
  offline_poles: {
    en: 'Offline Poles',
    hi: 'ऑफलाइन पोल'
  },
  avg_water_level: {
    en: 'Avg Water Discharge',
    hi: 'औसत जल स्तर'
  },
  sos_active: {
    en: 'ACTIVE SOS EMERGENCY ALARM',
    hi: 'सक्रिय आपातकालीन चेतावनी अलार्म'
  },
  simulate_sos: {
    en: 'Test SOS Siren',
    hi: 'साइरन का परीक्षण करें'
  },
  mute_sound: {
    en: 'Mute Siren',
    hi: 'साइरन बंद करें'
  },
  unmute_sound: {
    en: 'Enable Siren',
    hi: 'साइरन चालू करें'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    if (dictionary[key]) {
      return dictionary[key][language] || dictionary[key]['en'];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
