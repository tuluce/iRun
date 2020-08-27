import { useEffect } from 'react';
import ReactGA from 'react-ga';

const AnalyticsWrapper = () => {
  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      ReactGA.initialize('UA-149254800-2');
      ReactGA.pageview(window.location.pathname + window.location.search);
      window.GA_INITIALIZED = true;
    }
  });
  return null;
};

export default AnalyticsWrapper;
