// Custom JavaScript for Wappa documentation

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scroll for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add external link indicators
  const externalLinks = document.querySelectorAll('a[href^="http"]');
  externalLinks.forEach(function(link) {
    if (!link.hostname === window.location.hostname) {
      link.classList.add('external-link');
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
});

// Theme-aware Mermaid configuration with Wappa branding
window.mermaidConfig = {
  theme: document.querySelector('[data-md-color-scheme]') && 
         document.querySelector('[data-md-color-scheme]').getAttribute('data-md-color-scheme') === 'slate' ? 'dark' : 'base',
  themeVariables: {
    // Wappa brand colors for both modes
    primaryColor: '#333481',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#242359',
    lineColor: '#333481',
    secondaryColor: '#4A90E2',
    tertiaryColor: '#25D366', // WhatsApp green
    background: '#ffffff',
    mainBkg: '#333481',
    secondBkg: '#4A90E2',
    tertiaryBkg: '#25D366',
    nodeBorder: '#333481',
    nodeTextColor: '#ffffff',
    clusterBkg: '#f8f9fa',
    edgeLabelBackground: '#ffffff'
  }
};