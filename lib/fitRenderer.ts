import type { PerspectiveCamera, WebGLRenderer } from 'three';

/**
 * Keeps the renderer and camera sized to `container`, which follows the
 * viewport as mobile browser bars show/hide or the device rotates.
 * Returns a cleanup function.
 */
export function fitRenderer(
  container: HTMLElement,
  renderer: WebGLRenderer,
  camera: PerspectiveCamera,
): () => void {
  const resize = () => {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  return () => observer.disconnect();
}
