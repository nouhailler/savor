import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

window.scrollTo = () => undefined;
Element.prototype.scrollIntoView = () => undefined;
