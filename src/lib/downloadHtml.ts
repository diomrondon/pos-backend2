import { STANDALONE_HTML_SOURCE } from '../data/standaloneHtmlSource';

export function downloadStandaloneHtmlFile(filename = 'pos_multisucursal.html') {
  try {
    const blob = new Blob([STANDALONE_HTML_SOURCE], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    console.error('Error al descargar archivo HTML:', e);
  }
}
