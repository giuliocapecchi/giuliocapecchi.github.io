import type { BufferGeometry, Material, Object3D, Texture } from 'three';

/** Run decorative scenes at 30 fps; stop scheduling work in hidden tabs. */
export function startSceneLoop(render: (frameScale: number) => void): () => void {
    const interval = 1000 / 30;
    let frame = 0;
    let previous: number | null = null;
    let nextFrame = 0;
    let stopped = false;

    const tick = (now: number) => {
        if (stopped || document.hidden) return;
        if (previous === null || now + 0.1 >= nextFrame) {
            const elapsed = previous === null ? interval : Math.min(now - previous, 100);
            nextFrame = previous === null ? now + interval : nextFrame + interval;
            if (nextFrame <= now) nextFrame = now + interval;
            previous = now;
            render(elapsed / (1000 / 60));
        }
        frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
        cancelAnimationFrame(frame);
        previous = null;
        if (!document.hidden && !stopped) frame = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', visibility);
    visibility();
    return () => {
        stopped = true;
        cancelAnimationFrame(frame);
        document.removeEventListener('visibilitychange', visibility);
    };
}

/** Clones share GPU resources, so release each geometry/material/texture once. */
export function disposeScene(root: Object3D): void {
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    const textures = new Set<Texture>();
    root.traverse(object => {
        const mesh = object as Object3D & { geometry?: BufferGeometry; material?: Material | Material[] };
        if (mesh.geometry) geometries.add(mesh.geometry);
        if (mesh.material) {
            for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
                materials.add(material);
                for (const value of Object.values(material)) {
                    if (value && typeof value === 'object' && 'isTexture' in value) textures.add(value as Texture);
                }
            }
        }
    });
    textures.forEach(texture => texture.dispose());
    materials.forEach(material => material.dispose());
    geometries.forEach(geometry => geometry.dispose());
}
