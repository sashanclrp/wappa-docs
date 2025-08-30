// Custom JavaScript for Wappa documentation

document.addEventListener('DOMContentLoaded', function() {
  // Add copy button functionality for code blocks
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(function(block) {
    const button = document.createElement('button');
    button.className = 'md-clipboard md-icon';
    button.title = 'Copy to clipboard';
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/></svg>';
    
    button.addEventListener('click', function() {
      const text = block.innerText;
      navigator.clipboard.writeText(text).then(function() {
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>';
        setTimeout(function() {
          button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/></svg>';
        }, 2000);
      });
    });
    
    block.parentNode.appendChild(button);
  });

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

// Theme-aware Mermaid configuration
window.mermaidConfig = {
  theme: document.querySelector('[data-md-color-scheme]').getAttribute('data-md-color-scheme') === 'slate' ? 'dark' : 'default',
  themeVariables: {
    primaryColor: '#4caf50',
    primaryTextColor: '#fff',
    primaryBorderColor: '#2e7d32',
    lineColor: '#4caf50',
    secondaryColor: '#81c784',
    tertiaryColor: '#c8e6c9'
  }
};