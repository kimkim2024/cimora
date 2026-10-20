import test from 'node:test';
import assert from 'node:assert/strict';
import { syncLinkedInputs } from './linkedInputs.mjs';

const source = (id='image1',value='old.png') => ({id,type:'imageNode',data:{resultUrl:value}});
const target = formValues => ({id:'video1',type:'videoNode',data:{formValues}});
const edge = (handle='videoInput6',id='e1',source='image1') => ({id,source,target:'video1',sourceHandle:'imageOutput',targetHandle:handle});
const form = nodes => nodes.find(n=>n.id==='video1').data.formValues;
const connect = (nodes,edges) => syncLinkedInputs(nodes,edges,{nodes,edges:[]});
const replace = (nodes,value) => nodes.map(n=>n.id==='image1'?source('image1',value):n);

test('source changes replace references without accumulating old assets',()=>{
 const edges=[edge()];
 let nodes=connect([source(),target({images_list:['manual.png']})],edges);
 nodes=syncLinkedInputs(replace(nodes,'new.png'),edges);
 assert.deepEqual(form(nodes).images_list,['manual.png','new.png']);
 assert.equal(syncLinkedInputs(nodes,edges),nodes);
});
test('disconnect restores manual list, including a manually added identical URL',()=>{
 const edges=[edge()];
 const nodes=connect([source(),target({images_list:['old.png','manual.png']})],edges);
 assert.deepEqual(form(syncLinkedInputs(nodes,[])).images_list,['old.png','manual.png']);
});
test('deleting the source removes its assets even with a transient dangling edge',()=>{
 const edges=[edge()];
 const nodes=connect([source(),target({images_list:['manual.png']})],edges);
 assert.deepEqual(form(syncLinkedInputs(nodes.filter(n=>n.id!=='image1'),edges)).images_list,['manual.png']);
});
test('same source updates both first and last frame',()=>{
 const edges=[edge('videoInput2'),edge('videoInput3','e2')];
 const nodes=connect([source(),target({image_url:'',last_image:''})],edges);
 assert.deepEqual(form(syncLinkedInputs(replace(nodes,'new.png'),edges)),{image_url:'new.png',last_image:'new.png'});
});
test('removing one of two identical linked assets retains the remaining source',()=>{
 const edges=[edge(),edge('videoInput6','e2','image2')];
 const nodes=connect([source(),source('image2'),target({images_list:[]})],edges);
 assert.deepEqual(form(syncLinkedInputs(nodes,[edges[1]])).images_list,['old.png']);
 assert.deepEqual(form(syncLinkedInputs(nodes,[])).images_list,[]);
});
test('new manual uploads survive subsequent output changes and disconnection',()=>{
 const edges=[edge()];
 let nodes=connect([source(),target({images_list:['manual.png']})],edges);
 nodes=nodes.map(n=>n.id==='video1'?{...n,data:{...n.data,formValues:{images_list:['manual.png','old.png','upload.png']}}}:n);
 nodes=syncLinkedInputs(nodes,edges);
 nodes=syncLinkedInputs(replace(nodes,'new.png'),edges);
 assert.deepEqual(form(syncLinkedInputs(nodes,[])).images_list,['manual.png','upload.png']);
});
test('input purpose change clears old role while preserving manual values',()=>{
 let nodes=connect([source(),target({image_url:'manual.png',last_image:''})],[edge('videoInput2')]);
 nodes=syncLinkedInputs(nodes,[edge('videoInput3')]);
 assert.deepEqual(form(nodes),{image_url:'manual.png',last_image:'old.png'});
});
test('serialized metadata preserves manual versus linked ownership',()=>{
 const edges=[edge()];
 const nodes=JSON.parse(JSON.stringify(connect([source(),target({images_list:['manual.png']})],edges)));
 assert.deepEqual(form(syncLinkedInputs(nodes,[])).images_list,['manual.png']);
});
test('legacy references are recognized on initial load',()=>{
 const nodes=syncLinkedInputs([source(),target({images_list:['manual.png','old.png']})],[edge()]);
 assert.deepEqual(form(syncLinkedInputs(nodes,[])).images_list,['manual.png']);
});
test('empty output clears only linked assets',()=>{
 const edges=[edge()];
 const nodes=connect([source(),target({images_list:['manual.png']})],edges);
 assert.deepEqual(form(syncLinkedInputs(replace(nodes,''),edges)).images_list,['manual.png']);
});
test('video and audio list aliases are supported',()=>{
 const edges=[edge('videoInput7'),edge('videoInput8','e2')];
 const nodes=connect([source('image1','asset.mp4'),target({video_files:['manual.mp4'],audio_files:[]})],edges);
 assert.deepEqual(form(syncLinkedInputs(nodes,[])),{video_files:['manual.mp4'],audio_files:[]});
});
