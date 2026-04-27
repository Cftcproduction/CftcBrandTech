# Swup Content Ready Utility - Global Solution

## Problem Solved
With Swup page transitions, JavaScript that initializes on `DOMContentLoaded` won't reinitialize when users navigate to a new page. This utility automatically handles both scenarios.

## How to Use

### For New Scripts
Instead of this:
```javascript
document.addEventListener("DOMContentLoaded", function() {
  // initialization code
});
```

Use this:
```javascript
window.onContentReady(function() {
  // initialization code
  // Runs on initial page load AND every Swup page transition
});
```

### Example: Adding a New Feature
```javascript
window.onContentReady(function() {
  const buttons = document.querySelectorAll(".my-button");
  
  buttons.forEach(button => {
    button.addEventListener("click", function() {
      console.log("Button clicked!");
    });
  });
});
```

## Key Points

1. **No Manual Swup Events** - You don't need to worry about `swup:contentReplaced` anymore
2. **Works Immediately** - If the page is already loaded when your script runs, it executes immediately
3. **Graceful Fallback** - If `swup-utils.js` fails to load, it falls back to manual event listeners

## Requirements

- `swup-utils.js` must be loaded BEFORE other scripts that use `onContentReady()`
- It's already included in blog.html and should be added to any page with Swup

## Setup Checklist

For each HTML file that needs this functionality:

1. ✅ Load swup-utils.js before other custom scripts
   ```html
   <script src="js/plugins/swup-utils.js" defer></script>
   <script src="js/plugins/my-custom-script.js" defer></script>
   ```

2. ✅ Update any existing scripts to use `window.onContentReady()` instead of `DOMContentLoaded`

3. ✅ All new scripts automatically work with Swup

## Debug

To check how many callbacks are registered:
```javascript
console.log(window.__swupUtils.getCallbackCount());
```
