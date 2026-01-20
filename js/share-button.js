/**
 * Share Button Module
 * Provides functionality for sharing the profile via
 * the Web Share API or clipboard fallback.
 */

export function initShareButton() {
  const btn = document.getElementById('share-btn');
  const toast = document.getElementById('share-toast');

  if (!btn) return;

  const shareData = {
    title: 'Stuart Neivandt | Software Engineer',
    text: 'Check out Stuart Neivandt\'s profile.',
    url: window.location.href
  };

  btn.addEventListener('click', async () => {
    // Try Native Share API first (Mobile/Supported Browsers)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return; // Success
      } catch (err) {
        // If user cancelled, do nothing. If error, fall through to clipboard
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Clipboard API
    try {
      // Smart Clipboard:
      // 1. Plain Text = URL only (better for address bars)
      // 2. HTML = Rich Link (better for documents/emails)
      if (typeof ClipboardItem !== 'undefined') {
        const textBlob = new Blob([shareData.url], { type: 'text/plain' });
        const htmlBlob = new Blob(
          [`<a href="${shareData.url}">${shareData.title}</a>`],
          { type: 'text/html' }
        );

        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'text/html': htmlBlob
          })
        ]);
      } else {
        // Legacy fallback: Just simple URL
        await navigator.clipboard.writeText(shareData.url);
      }

      showToast();
    } catch (err) {
      console.warn('Rich copy failed, falling back to text', err);
      // Last resort: simple writeText if the complex write failed
      try {
        await navigator.clipboard.writeText(shareData.url);
        showToast();
      } catch (err2) {
        console.error('All copy methods failed', err2);
      }
    }
  });

  function showToast() {
    if (!toast) return;

    // Reset animation if needed
    toast.classList.remove('visible');

    // Force reflow
    void toast.offsetWidth;

    toast.classList.add('visible');

    // Auto hide
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3000);
  }
}
