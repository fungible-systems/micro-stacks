enum WALLET_INSTALL_URLS {
  Chrome = 'https://chrome.google.com/webstore/detail/hiro-wallet/ldinpeekobnhjjdofggfgjlcehhmanlj',
  Firefox = 'https://addons.mozilla.org/en-US/firefox/addon/hiro-wallet/',
  Mobile = 'https://www.xverse.app',
  Browser = 'https://www.hiro.so/wallet/install-web',
}

type Browsers = 'Chrome' | 'Firefox' | 'Mobile' | 'Browser';

function isChrome() {
  if (typeof document === 'undefined') return;
  const isChromium = !!(window as any)['chrome'];
  const winNav = window.navigator;
  const vendorName = winNav.vendor;
  const isOpera = typeof (window as any).opr !== 'undefined';
  const isIEedge = winNav.userAgent.includes('Edge');
  const isIOSChrome = /CriOS/.exec(winNav.userAgent);

  if (isIOSChrome) {
    return false;
  } else
    return (
      isChromium !== null &&
      typeof isChromium !== 'undefined' &&
      vendorName === 'Google Inc.' &&
      !isOpera &&
      !isIEedge
    );
}

function getIsMobileDevice() {
  if (typeof document === undefined) return;
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return true;
  return /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
    ua
  );
}

function getBrowser(): Browsers | null {
  if (typeof document === 'undefined') return null;
  if (getIsMobileDevice()) return 'Mobile';
  if (isChrome()) return 'Chrome';
  if (window.navigator.userAgent.includes('Firefox')) return 'Firefox';
  return 'Browser';
}

function getWalletInstallUrl(browser: Browsers | null) {
  switch (browser) {
    case 'Chrome':
      return WALLET_INSTALL_URLS.Chrome;
    case 'Firefox':
      return WALLET_INSTALL_URLS.Firefox;
    case 'Mobile':
      return WALLET_INSTALL_URLS.Mobile;
    default:
      return WALLET_INSTALL_URLS.Browser;
  }
}

export { getBrowser, getIsMobileDevice, getWalletInstallUrl, WALLET_INSTALL_URLS };
export type { Browsers };
