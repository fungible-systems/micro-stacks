import 'nextra-theme-docs/style.css';
import '../common/global.css';
import { useFathom } from '../common/use-fathom';

export default function Nextra({ Component, pageProps }) {
  useFathom();
  const getLayout = Component.getLayout || (page => page);
  return getLayout(<Component {...pageProps} />);
}
