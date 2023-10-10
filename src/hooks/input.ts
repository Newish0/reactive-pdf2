import { useEffect, useState } from "react";

/**
 * A React hook for monitoring which keys are being held.
 */
export function useKeysHeld() {
    const [heldKeys, setHeldKeys] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const handleKeyDown = (evt: KeyboardEvent) => {
            if (heldKeys[evt.key]) return;

            setHeldKeys((lastHeldKeys) => {
                lastHeldKeys[evt.key] = true;
                return { ...lastHeldKeys };
            });
        };

        const handleKeyUp = (evt: KeyboardEvent) => {
            if (!heldKeys[evt.key]) return;

            setHeldKeys((lastHeldKeys) => {
                lastHeldKeys[evt.key] = false;
                return { ...lastHeldKeys };
            });
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [heldKeys]);

    return heldKeys;
}
