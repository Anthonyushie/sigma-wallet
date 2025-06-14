
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LightningProtocolHandler } from '../utils/protocolHandler';

export const useProtocolHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Register Lightning protocol handler
    LightningProtocolHandler.register();

    // Handle Lightning URI from URL params (when app is opened via lightning: link)
    const handleLightningFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const lightningParam = urlParams.get('lightning');
      
      if (lightningParam) {
        const decoded = decodeURIComponent(lightningParam);
        const parsed = LightningProtocolHandler.handleLightningUri(decoded);
        
        if (parsed && parsed.type === 'invoice') {
          // Navigate to send page with the invoice pre-filled
          navigate('/send', { state: { invoice: parsed.value } });
        }
      }
    };

    handleLightningFromURL();

    // Listen for protocol handler events
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'lightning-protocol') {
        const parsed = LightningProtocolHandler.handleLightningUri(event.data.uri);
        if (parsed && parsed.type === 'invoice') {
          navigate('/send', { state: { invoice: parsed.value } });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate]);
};
