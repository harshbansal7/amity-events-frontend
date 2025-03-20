import { useEffect } from "react";

/**
 * MetaTagsManager - Handles dynamic updating of meta tags for SEO and social sharing
 *
 * @param {Object} props
 * @param {string} props.title - The title to use for meta tags
 * @param {string} props.description - The description to use for meta tags
 * @param {string} props.imageUrl - The image URL to use for og:image
 * @param {string} props.url - The canonical URL of the current page
 * @param {string} props.type - The og:type (default: 'website')
 */
const MetaTagsManager = ({
  title,
  description,
  imageUrl,
  url,
  type = "website",
}) => {
  useEffect(() => {
    // Update only if we have the required properties
    if (!title && !description && !imageUrl && !url) return;

    // Get the current domain
    const domain = window.location.origin;

    // Update page title if provided
    if (title) {
      document.title = title;
      updateMetaTag("meta[property='og:title']", "content", title);
      updateMetaTag("meta[name='twitter:title']", "content", title);
    }

    // Update description if provided
    if (description) {
      updateMetaTag("meta[name='description']", "content", description);
      updateMetaTag("meta[property='og:description']", "content", description);
      updateMetaTag("meta[name='twitter:description']", "content", description);
    }

    // Update URL if provided
    if (url) {
      updateMetaTag("meta[property='og:url']", "content", url);
      updateMetaTag("meta[name='twitter:url']", "content", url);

      // Update canonical link
      let canonicalLink = document.querySelector("link[rel='canonical']");
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = url;
    }

    // Update type if provided
    if (type) {
      updateMetaTag("meta[property='og:type']", "content", type);
    }

    // Update image if provided
    if (imageUrl) {
      // Ensure image URL is absolute
      const absoluteImageUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `${domain}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;

      updateMetaTag("meta[property='og:image']", "content", absoluteImageUrl);
      updateMetaTag("meta[name='twitter:image']", "content", absoluteImageUrl);
    }

    // Return cleanup function to restore default meta tags when component unmounts
    return () => {
      // Set default OG image back to original
      const defaultOgImage = "https://app.aup.events/assets/meta-image.jpeg";
      updateMetaTag("meta[property='og:image']", "content", defaultOgImage);
      updateMetaTag("meta[name='twitter:image']", "content", defaultOgImage);
    };
  }, [title, description, imageUrl, url, type]);

  // Helper function to update or create meta tags
  const updateMetaTag = (selector, attribute, value) => {
    let metaTag = document.querySelector(selector);

    if (!metaTag) {
      metaTag = document.createElement("meta");
      const property =
        selector.match(/property='(.*?)'/)?.[1] ||
        selector.match(/name='(.*?)'/)?.[1];

      if (property) {
        if (selector.includes("property=")) {
          metaTag.setAttribute("property", property);
        } else {
          metaTag.setAttribute("name", property);
        }
      }

      document.head.appendChild(metaTag);
    }

    metaTag.setAttribute(attribute, value);
  };

  // This component doesn't render anything
  return null;
};

export default MetaTagsManager;
