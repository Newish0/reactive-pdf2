/**
 * Sets the global theme used by DaisyUI
 * @param theme
 */
export function setGlobalTheme(theme: string) {
    document.getElementsByTagName("html")[0].setAttribute("data-theme", theme);
}
