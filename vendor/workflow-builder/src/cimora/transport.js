// Frontend-only adapter. No API credentials or external generation calls.
import { getCanvasContext } from './navigation';

export function loadWorkflow(id, name) {
  const raw = localStorage.getItem(`cimora.canvas.v1:${id}`);
  if (!raw) return { workflow_id: id, name, is_owner: true, data: { nodes: [] }, edges: [] };
  const value = JSON.parse(raw);
  if (!Array.isArray(value?.data?.nodes) || !Array.isArray(value.edges)) throw new Error('Saved canvas could not be read.');
  return { ...value, is_owner: true };
}

function unavailable() {
  const error = new Error('Generation backend is not connected yet. Your canvas can still be edited and saved.');
  error.response = { data: { detail: error.message } };
  throw error;
}

const transport = {
  async get() { return unavailable(); },
  async post(url, payload) {
    if (url === '/api/workflow/create') {
      const id = getCanvasContext().id;
      localStorage.setItem(`cimora.canvas.v1:${id}`, JSON.stringify({ ...payload, workflow_id: id, is_owner: true, version: 1 }));
      window.dispatchEvent(new Event('cimora:canvas-saved'));
      return { data: { workflow_id: id } };
    }
    if (url === '/api/app/calculate_dynamic_cost') return { data: { cost: null } };
    return unavailable();
  },
  async put() { return unavailable(); },
  async delete() { return unavailable(); },
};
export default transport;

export async function uploadAsset(file) {
  if (!/^(image|video|audio)\//.test(file.type)) throw new Error('Choose an image, video or audio file.');
  if (file.size > 2 * 1024 * 1024) throw new Error('Local preview supports files up to 2 MB.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read this file.'));
    reader.readAsDataURL(file);
  });
}
