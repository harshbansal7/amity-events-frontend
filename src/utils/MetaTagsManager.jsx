import { useEffect } from "react";

/**
 * A utility component that updates the document's meta tags
 * especially for Open Graph and Twitter metadata.
 */
const MetaTagsManager = ({ title, description, imageUrl, url }) => {
  useEffect(() => {
    // Store original values to restore later
    const originalMeta = {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      ogTitle: document.querySelector('meta[property="og:title"]')?.content,
      ogDescription: document.querySelector('meta[property="og:description"]')
        ?.content,
      ogImage: document.querySelector('meta[property="og:image"]')?.content,
      ogUrl: document.querySelector('meta[property="og:url"]')?.content,
      twitterTitle: document.querySelector('meta[property="twitter:title"]')
        ?.content,
      twitterDescription: document.querySelector(
        'meta[property="twitter:description"]',
      )?.content,
      twitterImage: document.querySelector('meta[property="twitter:image"]')
        ?.content,
      twitterUrl: document.querySelector('meta[property="twitter:url"]')
        ?.content,
    };

    // Only update if values are provided
    if (title) {
      document.title = title;
      updateMetaTag('meta[property="og:title"]', title);
      updateMetaTag('meta[property="twitter:title"]', title);
    }

    if (description) {
      updateMetaTag('meta[name="description"]', description);
      updateMetaTag('meta[property="og:description"]', description);
      updateMetaTag('meta[property="twitter:description"]', description);
    }

    if (imageUrl) {
      updateMetaTag('meta[property="og:image"]', imageUrl);
      updateMetaTag('meta[property="twitter:image"]', imageUrl);
    }

    if (url) {
      updateMetaTag('meta[property="og:url"]', url);
      updateMetaTag('meta[property="twitter:url"]', url);
    }

    // Cleanup function to restore original values when component unmounts
    return () => {
      if (originalMeta.title) document.title = originalMeta.title;
      if (originalMeta.description)
        updateMetaTag('meta[name="description"]', originalMeta.description);
      if (originalMeta.ogTitle)
        updateMetaTag('meta[property="og:title"]', originalMeta.ogTitle);
      if (originalMeta.ogDescription)
        updateMetaTag(
          'meta[property="og:description"]',
          originalMeta.ogDescription,
        );
      if (originalMeta.ogImage)
        updateMetaTag('meta[property="og:image"]', originalMeta.ogImage);
      if (originalMeta.ogUrl)
        updateMetaTag('meta[property="og:url"]', originalMeta.ogUrl);
      if (originalMeta.twitterTitle)
        updateMetaTag(
          'meta[property="twitter:title"]',
          originalMeta.twitterTitle,
        );
      if (originalMeta.twitterDescription)
        updateMetaTag(
          'meta[property="twitter:description"]',
          originalMeta.twitterDescription,
        );
      if (originalMeta.twitterImage)
        updateMetaTag(
          'meta[property="twitter:image"]',
          originalMeta.twitterImage,
        );
      if (originalMeta.twitterUrl)
        updateMetaTag('meta[property="twitter:url"]', originalMeta.twitterUrl);
    };
  }, [title, description, imageUrl, url]);

  // Helper function to update or create meta tags
  const updateMetaTag = (selector, content) => {
    let element = document.querySelector(selector);
    if (element) {
      element.content = content;
    } else {
      // If the element doesn't exist, create it
      element = document.createElement("meta");
      const propertyName = selector.includes("property=") ? "property" : "name";
      const propertyValue = selector.match(/["'](.*?)["']/)[1];
      element.setAttribute(propertyName, propertyValue);
      element.content = content;
      document.head.appendChild(element);
    }
  };

  // This component doesn't render anything
  return null;
};

export default MetaTagsManager;
