import { previewSchemas } from './schemas';
function node(type, x, y, input = false) {
  const id = `${type}-${input ? 'passthrough' : 'generation-preview'}`;
  return { id: `${type}1`, type: `${type}Node`, position: { x, y }, data: { selectedModel: previewSchemas.categories[type].models[id], formValues: {} } };
}
export const presets = [{ id: 'empty-workflow', name: 'Empty canvas', description: 'Start with your own nodes.', icon: 'plus', nodes: [], edges: [] }, {
  id: 'anime-shot', name: 'Anime shot', title: 'Anime shot', description: 'Plan a prompt, create an image, then animate your shot.', icon: 'video',
  nodes: [node('text', 0, 50, true), node('image', 460, 50), node('video', 920, 50)],
  edges: [
    { id: 'prompt-image', source: 'text1', target: 'image1', sourceHandle: 'textOutput', targetHandle: 'imageInput' },
    { id: 'image-video', source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput2' },
  ],
}];
