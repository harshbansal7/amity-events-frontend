import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Copy, Instagram, X, Share2, Check, ExternalLink } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, event }) => {
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState('copy'); // 'copy', 'whatsapp', 'instagram'

  const customShareUrl = event?.custom_slug 
    ? `${window.location.origin}/events/${event.custom_slug}` 
    : `${window.location.origin}/events/${event._id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(customShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const shareToWhatsApp = () => {
    const message = `Check out this event: ${event.name}\n\n${customShareUrl}\n\n${event.description?.substring(0, 100)}${event.description?.length > 100 ? '...' : ''}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const shareToInstagram = () => {
    // First copy the link to clipboard so the user has it ready to paste
    copyToClipboard();
    
    // Try to open Instagram app via URL scheme
    const instagramUrl = 'instagram://camera';
    
    // Create a hidden iframe to attempt opening the app
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    try {
      // Attempt to open Instagram
      iframe.contentWindow.location.href = instagramUrl;
      
      // Set a timeout to display instructions if the app doesn't open
      setTimeout(() => {
        // Show Instagram sharing instructions
        setShareType('instagram');
      }, 500);
    } catch (e) {
      // If there's an error, fall back to instructions
      setShareType('instagram');
    } finally {
      // Clean up the iframe
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  const getImageUrlForSharing = () => {
    return event.image_url || `${window.location.origin}/assets/default-event.jpg`;
  };

  const openInstagramApp = () => {
    // Different approaches for different devices
    const instagramUrl = 'instagram://camera';
    const webFallback = 'https://www.instagram.com/';
    
    // Try to open the app first
    window.location.href = instagramUrl;
    
    // Set a timeout to open web version if app doesn't open
    setTimeout(() => {
      // Check if the page is still visible (app didn't open)
      if (document.visibilityState === 'visible') {
        window.open(webFallback, '_blank');
      }
    }, 2000);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-[300]"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Share Event
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {shareType === 'copy' ? (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Share this event with friends by copying the link or sharing directly to social media.
                </p>

                <div className="p-3 bg-gray-50 rounded-lg flex items-center mb-6">
                  <input 
                    type="text" 
                    value={customShareUrl}
                    readOnly
                    className="bg-transparent flex-1 outline-none text-gray-700 text-sm mr-2"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors flex items-center space-x-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={shareToWhatsApp}
                    className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors"
                  >
                    <div className="p-3 bg-green-100 rounded-full mb-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">WhatsApp</span>
                  </button>

                  <button
                    onClick={shareToInstagram}
                    className="flex flex-col items-center justify-center p-4 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-600 rounded-xl transition-colors"
                  >
                    <div className="p-3 bg-fuchsia-100 rounded-full mb-2">
                      <Instagram className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">Instagram</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <button
                onClick={() => setShareType('copy')}
                className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to sharing options
              </button>

              <div className="bg-fuchsia-50 p-4 rounded-xl mb-6">
                <h3 className="font-medium text-fuchsia-800 mb-2 flex items-center">
                  <Instagram className="w-5 h-5 mr-2" />
                  Share to Instagram
                </h3>
                <p className="text-sm text-fuchsia-700 mb-2">
                  The event link has been copied to your clipboard! Now you can:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-fuchsia-700 mb-4">
                  <li>Use the image below for your Instagram post</li>
                  <li>Open Instagram by tapping the button below</li>
                  <li>Create a new Story or post with the image</li>
                  <li>Paste the link in your story using the "Add link" sticker</li>
                </ol>
                <button
                  onClick={openInstagramApp}
                  className="w-full py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors flex items-center justify-center"
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  Open Instagram
                </button>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg flex flex-col">
                <p className="text-sm text-gray-600 mb-2">Event Image:</p>
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-white">
                  <img 
                    src={getImageUrlForSharing()} 
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => window.open(getImageUrlForSharing(), '_blank')}
                  className="self-start flex items-center text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open image in new tab
                </button>
                <p className="text-xs text-gray-500 mt-4">
                  Link (already copied to clipboard):
                </p>
                <div className="mt-1 p-2 bg-white rounded flex items-center">
                  <input 
                    type="text" 
                    value={customShareUrl}
                    readOnly
                    className="bg-transparent flex-1 outline-none text-gray-700 text-xs mr-2"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ShareModal;