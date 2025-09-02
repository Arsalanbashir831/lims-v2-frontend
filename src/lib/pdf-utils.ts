export const generatePdf = async (pageUrl: string, documentId?: string, documentType: string = 'DOCUMENT') => {
  try {
    const url = new URL(pageUrl);
    url.searchParams.set('print', '1');
    const printUrl = url.toString();

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');

    const cleanup = () => {
      try {
        window.removeEventListener('message', onMessage as any);
      } catch {}
      try {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      } catch {}
    };

    let printed = false;
    const tryPrint = () => {
      if (printed) return;
      printed = true;
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {}
      // Cleanup after a short delay
      setTimeout(cleanup, 500);
    };

    const onMessage = (event: MessageEvent) => {
      try {
        const data = event.data as any;
        // Support both PQR and generic document ready messages
        if (data && 
            ((data.type === 'PQR_PREVIEW_READY' && data.id === documentId) ||
             (data.type === 'DOCUMENT_READY' && data.id === documentId) ||
             (data.type === 'WELDER_QUALIFICATION_READY' && data.id === documentId))) {
          tryPrint();
        }
      } catch {}
    };

    window.addEventListener('message', onMessage as any);

    // Fallback: if no message arrives in time, attempt to print anyway
    const fallbackTimer = setTimeout(() => {
      tryPrint();
    }, 5000);

    iframe.onload = () => {
      // If the child cannot postMessage for some reason, we still have the fallback
      clearTimeout(fallbackTimer);
      // Give it a small buffer for any late rendering
      setTimeout(() => {
        // We still wait for the READY event; if not received, fallback already handled
      }, 300);
    };

    iframe.src = printUrl;
    document.body.appendChild(iframe);

    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    return false;
  }
};
