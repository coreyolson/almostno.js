import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Always included (Minimal Core)
global.FEATURE_DOM = true;         // Essential DOM manipulation
global.FEATURE_EVENTS = true;      // Event handling system
global.FEATURE_ATTRIBUTES = true;  // Attribute manipulation
global.FEATURE_HTTP = true;        // Fetch/AJAX utilities
global.FEATURE_ANIMATE = true;     // CSS animations

// Optional features (Advanced selection)
global.FEATURE_SELECTION = true;   // Includes both filtering & traversal

// Toggle these for testing state & components
global.FEATURE_STATE = true;       // Reactive state management
global.FEATURE_COMPONENTS = true;  // Client-side components
global.FEATURE_ELEMENTS = true;    // SSR components (server-side elements)

// Mock `customElements` for Jest
global.customElements = {
    define: jest.fn()
};