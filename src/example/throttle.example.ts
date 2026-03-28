import { throttle } from 'kk-debounce/throttle';

const throttledScrollLogger = throttle(
  (scrollY: number) => {
    console.log('throttled scrollY:', scrollY);
  },
  { ms: 300 }
);

const onScroll = () => {
  throttledScrollLogger(window.scrollY);
};

window.addEventListener('scroll', onScroll);

// Optional teardown in app unmount/destroy lifecycle.
setTimeout(() => {
  window.removeEventListener('scroll', onScroll);
  throttledScrollLogger.cancel();
}, 10000);
