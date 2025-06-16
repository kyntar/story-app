// View Transition API
export function transitionToPage(callback) {
    if ('startViewTransition' in document) {
        document.startViewTransition(callback);
    } else {
        callback();
    }
}