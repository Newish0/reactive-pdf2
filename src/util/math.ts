export function clamp(value: number, min: number, max: number) {
    return Math.max(Math.min(max, value), min);
}
