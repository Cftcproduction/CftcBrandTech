/**
 * Swup Content Ready Utility
 * Global solution for handling both initial page load and Swup page transitions
 * 
 * Usage:
 * window.onContentReady(function() {
 *   // Your initialization code here
 *   // This runs on page load AND every time Swup transitions to a new page
 * });
 */

(function () {
  "use strict";

  // Store all registered callbacks
  const callbacks = [];
  let isInitialized = false;

  /**
   * Register a callback to run on content ready
   * Automatically handles both DOMContentLoaded and swup:contentReplaced events
   * 
   * @param {Function} callback - Function to execute
   * @param {Object} options - Optional config
   * @param {Boolean} options.runImmediatelyIfReady - If true and DOM is ready, run immediately (default: true)
   */
  window.onContentReady = function (callback, options = {}) {
    if (typeof callback !== "function") {
      console.warn("[onContentReady] Callback must be a function");
      return;
    }

    callbacks.push(callback);

    // If DOM is already ready, run immediately
    const shouldRunImmediately = options.runImmediatelyIfReady !== false;
    if (shouldRunImmediately && (document.readyState === "interactive" || document.readyState === "complete")) {
      try {
        callback();
      } catch (e) {
        console.error("[onContentReady] Error in callback:", e);
      }
    }
  };

  /**
   * Execute all registered callbacks
   */
  function executeCallbacks() {
    callbacks.forEach((callback) => {
      try {
        callback();
      } catch (e) {
        console.error("[onContentReady] Error executing callback:", e);
      }
    });
  }

  /**
   * Initialize the system
   */
  function initialize() {
    if (isInitialized) return;
    isInitialized = true;

    // Run on initial page load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", executeCallbacks);
    } else {
      // Already loaded, run immediately
      executeCallbacks();
    }

    // Run on every Swup page transition
    document.addEventListener("swup:contentReplaced", executeCallbacks);
  }

  // Auto-initialize when this script loads
  initialize();

  // Also export for manual control if needed
  window.__swupUtils = {
    executeCallbacks,
    initialize,
    getCallbackCount: () => callbacks.length,
  };
})();
