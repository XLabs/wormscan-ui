// Waits for element in DOM
export function waitForElement(selector: string): Promise<Element> {
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        for (const node of Array.from(mutation.addedNodes)) {
          // Ensure the node is an element before proceeding
          if (!(node instanceof HTMLElement)) continue;

          // Check if the node itself matches the selector or contains a descendant that does
          if (node.matches(selector) || node.querySelector(selector)) {
            observer.disconnect(); // Stop observing
            resolve(node.querySelector(selector) || node);
            return;
          }
        }
      }
    });

    // configuration for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // start observing the document
    observer.observe(document.body, config);

    // stop observing and reject the promise after a timeout
    setTimeout(() => {
      observer.disconnect();
      reject(
        new Error(`Element with selector "${selector}" did not appear within the timeout period.`),
      );
    }, 1000); // 1 second timeout
  });
}
