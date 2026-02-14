'use client';

import { useEffect } from 'react';

export default function MatomoTagManager() {
  useEffect(() => {
    // Inicializar Matomo Tag Manager
    window._mtm = window._mtm || [];
    window._mtm.push({ 'mtm.startTime': new Date().getTime(), 'event': 'mtm.Start' });

    // Cargar el script del contenedor
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cdn.matomo.cloud/optimiseo.matomo.cloud/container_seVuGRtt.js';

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }, []);

  return null;
}

// Extender el tipo Window para incluir _mtm
declare global {
  interface Window {
    _mtm: any[];
  }
}
