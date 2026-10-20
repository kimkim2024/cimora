// Editable preview schemas. Backend developers should replace these with the model catalog.
const prompt = { type: 'string', title: 'Prompt', field: 'textarea', default: '' };
function model(id, properties) {
  return { id, name: id.replaceAll('-', ' '), input_schema: { schemas: { input_data: { type: 'object', properties, required: [] } } } };
}
function category(type) {
  const input = type === 'text' ? { prompt } : { [`${type}_url`]: { type: 'string', title: 'Reference', field: type, default: '' } };
  const props = { prompt, ...input };
  if (type === 'image' || type === 'video') props.aspect_ratio = { type: 'string', title: 'Aspect ratio', enum: ['16:9', '9:16', '1:1'], default: '16:9' };
  if (type === 'image') props.aspect_ratio = { type: 'string', title: 'Aspect ratio', enum: ['1:1','2:3','3:2','4:3','3:4','16:9','9:16','21:9','9:21','Auto'], default: 'Auto' };
  if (type === 'video') {
    props.aspect_ratio = { type: 'string', title: 'Aspect ratio', enum: ['1:1','3:4','4:3','16:9','9:16','21:9','Auto'], default: '16:9' };
    props.reference_mode = { type: 'string', title: 'Mode', enum: ['first_last_frame','general_reference'], default: 'general_reference' };
    props.images_list = { type: 'array', title: 'Reference images', field: 'images_list', items: { type: 'string' }, default: [] };
    props.last_image = { type: 'string', title: 'Last frame', field: 'image', default: '' };
    props.resolution = { type: 'string', title: 'Resolution', enum: ['480p', '720p', '1080p'], default: '720p' };
    props.image_url = { type: 'string', title: 'Start frame', field: 'image', default: '' };
    props.duration = { type: 'integer', title: 'Duration (seconds)', default: 5, minimum: 1, maximum: 30 };
  }
  return { models: { [`${type}-passthrough`]: model(`${type}-passthrough`, input), [`${type}-generation-preview`]: model(`${type}-generation-preview`, props) } };
}
export const previewSchemas = { categories: { text: category('text'), image: category('image'), video: category('video'), audio: category('audio'), api: { models: {} }, utility: { models: { 'video-combiner': model('video-combiner', {videos_list:{type:'array',title:'Video clips',field:'videos_list',items:{type:'string'},default:[]},aspect_ratio:{type:'string',title:'Aspect ratio',enum:['auto','16:9','9:16','1:1'],default:'auto'}}) } } } };

