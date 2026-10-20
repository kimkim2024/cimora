import UnifiedInput from "../cimora/UnifiedInput";
import EditableNodeName from "../cimora/EditableNodeName";
import { createPortal } from "react-dom";
import { FiTag, FiCopy, FiFolderPlus, FiMaximize2, FiX, FiCheck, FiAlignLeft } from '../../../../src/components/meika/CanvasIcons';
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Handle, Position, useReactFlow, useStore, useUpdateNodeInternals } from "reactflow";
import { FaAngleLeft, FaAngleRight } from '../../../../src/components/meika/CanvasIcons';
import { textModels } from "./utility";
import axios from "../cimora/transport";
import { getRunId, getWorkflowId } from "./WorkflowStore";
import { toast } from "react-hot-toast";
import { IoClose, IoTrashOutline } from '../../../../src/components/meika/CanvasIcons';
import UploadNode from "./UploadNode"
import { TfiText } from '../../../../src/components/meika/CanvasIcons';
import NodeSendButton from "./NodeSendButton";
import NodeOptionsMenu from "./NodeOptionsMenu";
import { useGenerationCost } from "./useGenerationCost";

const inputHandles = [
  "textInput",
  "textInput2",
  "textInput3",
  "textInput4",
];

const outputHandles = [
  "textOutput",
];

const TextGeneration = ({ id, data, selected }) => {
  const models = useMemo(() => {
    return data.nodeSchemas?.categories?.text?.models 
      ? Object.values(data.nodeSchemas.categories.text.models) 
      : [];
  }, [data.nodeSchemas]);
  const [selectedModel, setSelectedModel] = useState(data.selectedModel || models[1] || models[0] || {});
  const [connectedInputs, setConnectedInputs] = useState({});
  const [connectedOutputs, setConnectedOutputs] = useState({});
  const [formValues, setFormValues] = useState(data.formValues || {});
  const [dropDown, setDropDown] = useState(0);
  const [loading, setLoading] = useState(0);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [currentOutputIndex, setCurrentOutputIndex] = useState(0);
  const outputHistory = data.outputHistory || [];
  const prevHistoryLengthRef = useRef(outputHistory.length);
  const workflowId = getWorkflowId();
  const runId = data.runId ?? getRunId();
  const nodeSchemas = data.nodeSchemas || {};
  const { setNodes, setEdges } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const edges = useStore((state) => state.edges);
  const properties = nodeSchemas?.categories?.text?.models?.[selectedModel.id]?.input_schema?.schemas?.input_data?.properties;
  const { generationCost, isRefreshingCost } = useGenerationCost(selectedModel, formValues);
  
  useEffect(() => {
    if (data.cost !== generationCost) {
      data.onDataChange?.(id, { cost: generationCost });
    }
  }, [id, generationCost, data.cost]);

  const textareaRef = useRef(null);
  const editorDialog = useRef(null);
  const toolbarRef = useRef(null);
  const [editing,setEditing] = useState(false);
  const [expanded,setExpanded] = useState(false);
  const [palette,setPalette] = useState(null);
  useEffect(()=>{
    if(editing)textareaRef.current?.focus();
  },[editing]);
  useEffect(()=>{
    if(expanded)editorDialog.current?.showModal();
  },[expanded]);
  useEffect(()=>{
    if(!selected){setEditing(false);setPalette(null);}
  },[selected]);
  useEffect(()=>{
    if(!palette)return;
    const close=e=>{if(!toolbarRef.current?.contains(e.target))setPalette(null);};
    document.addEventListener('pointerdown',close,true);
    return()=>document.removeEventListener('pointerdown',close,true);
  },[palette]);

  const initializeFormData = (schemaProperties) => {
    const initialData = {};
    const fieldEntries = Object.entries(schemaProperties || {});

    fieldEntries.forEach(([fieldName, fieldSchema]) => {
      if (fieldSchema.type === "array") {
        if (fieldSchema.items?.type === "object") {
          const examples = fieldSchema.examples;
          if (Array.isArray(examples) && examples.length > 0) {
            initialData[fieldName] = examples.map((ex) => ({ ...ex }));
          } else {
            initialData[fieldName] = [];
          }
        } else {
          initialData[fieldName] = fieldSchema.examples || [];
        }

      } else if (fieldSchema.type === "object") {
        const nestedProps = fieldSchema.properties || {};
        initialData[fieldName] = initializeFormData(nestedProps);

      } else if (fieldSchema.default !== undefined) {
        initialData[fieldName] = fieldSchema.default;

      } else if (fieldSchema.examples && fieldSchema.examples.length > 0) {
        initialData[fieldName] = fieldSchema.examples[0];

      } else {
        switch (fieldSchema.type) {
          case "boolean":
            initialData[fieldName] = false;
            break;
          case "int":
          case "number":
            initialData[fieldName] = 0;
            break;
          default:
            initialData[fieldName] = "";
        }
      }
    });

    return initialData;
  };

  const addFormValuesInTaskData = (properties) => {
    const defaults = initializeFormData(properties);

    const validKeys = Object.keys(properties);
    const filteredFormValues = Object.entries(data.formValues || {}).reduce((acc, [key, val]) => {
      if (validKeys.includes(key)) acc[key] = val;
      return acc;
    }, {});

    const merged = Object.entries({ ...defaults, ...filteredFormValues }).reduce(
      (acc, [key, val]) => {
        const meta = properties[key];
        if (meta?.enum && !meta.enum.includes(val)) {
          acc[key] = meta.default ?? meta.enum[0] ?? "";
        } else {
          acc[key] = val;
        }
        return acc;
      },
      {}
    );

    // Preserve UI-only flags that are not part of the model schema
    const UI_KEYS = ["make_output", "make_input", "card_color", "tag_color"];
    UI_KEYS.forEach((k) => {
      if (data.formValues?.[k] !== undefined) merged[k] = data.formValues[k];
    });

    setFormValues(merged);
  }
  useEffect(() => {
    setLoading(1);
    if (properties) {
      addFormValuesInTaskData(properties);
    }
    setLoading(0);
  }, [selectedModel]);

  useEffect(() => {
    if (data.selectedModel) {
      setSelectedModel(data.selectedModel);
    }

    if (data.triggerRun) {
      handleRunSingleNode();

      data.onDataChange(id, { triggerRun: false });
    }

    if (data.outputHistory && data.outputHistory.length > 0) {
      if (currentHistoryIndex === -1) {
        setCurrentHistoryIndex(data.outputHistory.length - 1);
        setCurrentOutputIndex(0);
      } else if (data.outputHistory.length > prevHistoryLengthRef.current) {
        setCurrentHistoryIndex(data.outputHistory.length - 1);
        setCurrentOutputIndex(0);
      }
    }
    prevHistoryLengthRef.current = data.outputHistory ? data.outputHistory.length : 0;
  }, [data.selectedModel, data.triggerRun, data.outputHistory]);

  useEffect(() => {
    updateNodeInternals(id);
  }, [formValues, id]);

  useEffect(() => {
    if (!data.formValues) return;
    const incoming = JSON.stringify(data.formValues);
    const current = JSON.stringify(formValues);
    if (incoming === current) return;
    
    const timer = setTimeout(() => {
      if (Object.entries(data.formValues || {}).length > 0) {
        setFormValues(data.formValues);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [data.formValues]);

  useEffect(() => {
    if (data?.onDataChange && data?.selectedModel?.id !== "text-passthrough") {
      data.onDataChange(id, { selectedModel, formValues, loading });
    }
  }, [selectedModel, formValues, loading]);

  const handleChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    setDropDown(-1);
  };

  const pollNodeStatus = (run_id) => {
    const interval = setInterval(() => {
      axios.get(`/api/workflow/run/${run_id}/status`)
      .then((response) => {
        const nodesInRes = response.data.nodes || {};
        const nodeData = nodesInRes[id] || Object.entries(nodesInRes).find(([key]) => 
          key.toLowerCase().replace(/\s+/g, '') === id.toLowerCase().replace(/\s+/g, '')
        )?.[1];

        if (!nodeData || nodeData.length === 0) return;
        const latest = nodeData[nodeData.length - 1];
        if (latest.status === "succeeded" || latest.status === "completed") {
          const output = latest.result.outputs;
          const val = output[0]?.value || "";
          
          const currentHistory = data.outputHistory || [];
          const result = latest.result;
          const isAlreadyInHistory = currentHistory.some(h => h.result?.id === result.id);
          const newHistory = isAlreadyInHistory 
            ? currentHistory.map(h => h.result?.id === result.id ? latest : h)
            : [...currentHistory, latest];

          data?.onDataChange?.(id, { outputs: output, resultUrl: val, isLoading: false, errorMsg: null, outputHistory: newHistory });
          setCurrentHistoryIndex(newHistory.length - 1);
          setCurrentOutputIndex(0);
          clearInterval(interval);
        }

        if (latest.status === "failed") {
          const outputs = latest?.result?.outputs;
          let errorMsg = "Generation failed";

          if (outputs && outputs[0]?.value?.error) {
            errorMsg = outputs[0].value.error; 
          }
          toast.error(`Node ${id} failed`);
          
          const currentHistory = data.outputHistory || [];
          data.onDataChange(id, { isLoading: false, errorMsg, outputHistory: currentHistory });
          clearInterval(interval);
        }
      })
      .catch((error) => {
        console.log(error);
        clearInterval(interval);
        data.onDataChange(id, { isLoading: false });
        toast.error(`Failed to get workflow status Text ${id.replace(/^\D+/g, "")}`);
      });
    }, 3000);
  };

  const handleRunSingleNode = async () => {
    if (!runId) {
      toast.error("No run_id available!. Click 'Run All' button");
      return;
    }

    try {
      data.onDataChange(id, { isLoading: true });
      const workflow_id = await data.handleSaveWorkFlow();

      if (!workflow_id) {
        toast.error("Failed to save workflow before running node");
        data.onDataChange(id, { isLoading: false });
        return;
      }

      const modelSchema = nodeSchemas?.categories?.text?.models[selectedModel.id]?.input_schema?.schemas?.input_data;
      if (!modelSchema || !modelSchema.properties) {
        toast.error("No input schema found for this model");
        data.onDataChange(id, { isLoading: false });
        return;
      }
      const params = {};
      const inputSchema = modelSchema.properties;
      const localSources = formValues || {};
      for (const [key, meta] of Object.entries(inputSchema)) {
        if (localSources.hasOwnProperty(key)) {
          params[key] = localSources[key];
        } else {
          params[key] = meta.default ?? null;
        }
      }

      const response = await axios.post(`/api/workflow/${workflow_id}/node/${id}/run`, {
        run_id: runId,
        model: selectedModel.id,
        params: {...params, reference_assets:[...(formValues.reference_assets || []).filter(ref=>!ref.linked), ...(data.groupReferences || [])]},
        cost: generationCost,
        node_id: "AI Text"
      });
      pollNodeStatus(response.data.run_id);
    } catch(error) {
      data.onDataChange(id, { isLoading: false });
      toast.error(error.response?.data?.detail || "Error running node");
      console.error(error);
    };
  };

  const handleDeleteNode = () => {
    if (window.confirm(`Are you sure you want to delete this ${id} node?`)) {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      toast.success(`Deleted node ${id}`);
    };
  };

  const hasPrompt = data.selectedModel?.id === 'text-passthrough' || (properties && "prompt" in properties);
  const hasImagesList = properties && "images_list" in properties && !data.selectedModel?.id?.includes("passthrough");
  const hasImageUrl = properties && "image_url" in properties && !data.selectedModel?.id?.includes("passthrough");
  const hasSystemPrompt = properties && "system_prompt" in properties && !data.selectedModel?.id?.includes("passthrough");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const validHandles = [
        hasPrompt && "textInput",
        hasImageUrl && "textInput2",
        hasImagesList && "textInput3",
        hasSystemPrompt && "textInput4",
      ].filter(Boolean);

      setEdges((prevEdges) =>
        prevEdges.filter((edge) => {
          if (edge.target !== id) return true;
          return edge.targetHandle === 'groupReferenceInput' || validHandles.includes(edge.targetHandle);
        })
      );
      }, 2000);
    return () => clearTimeout(timeout);
  }, [hasPrompt, hasImageUrl, hasImagesList, hasSystemPrompt, id, setEdges]);

  useEffect(() => {
    const connectedInputs = {};
    inputHandles.forEach((h) => {
      connectedInputs[h] = edges.some(
        (e) => e.target === id && e.targetHandle === h
      );
    });

    const connectedOutputs = {};
    outputHandles.forEach((h) => {
      connectedOutputs[h] = edges.some(
        (e) => e.source === id && e.sourceHandle === h
      );
    });

    setConnectedInputs(connectedInputs);
    setConnectedOutputs(connectedOutputs);
  }, [edges, id]);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setCurrentOutputIndex(0);
      
      const viewing = outputHistory[newIndex]?.result?.outputs?.[0]?.value;
      setNodes((nds) => nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, viewingOutput: viewing } };
        }
        return n;
      }));
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentHistoryIndex < outputHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setCurrentOutputIndex(0);
      
      const viewing = outputHistory[newIndex]?.result?.outputs?.[0]?.value;
      setNodes((nds) => nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, viewingOutput: viewing } };
        }
        return n;
      }));
    }
  };

  const handleDeleteHistory = async (e) => {
    e.stopPropagation();
    const currentHistory = outputHistory[currentHistoryIndex];
    if (!currentHistory || !currentHistory.node_run_id) return;

    if (window.confirm("Are you sure you want to delete this history entry?")) {
      try {
        await axios.delete(`/api/workflow/node-run/${currentHistory.node_run_id}`);
        const newHistory = outputHistory.filter((_, i) => i !== currentHistoryIndex);
        
        data?.onDataChange?.(id, { 
          outputHistory: newHistory,
          ...(newHistory.length === 0 ? { outputs: [], resultUrl: null } : {})
        });

        if (newHistory.length === 0) {
          setCurrentHistoryIndex(-1);
        } else {
          setCurrentHistoryIndex(Math.max(0, currentHistoryIndex - 1));
        }
        toast.success("History entry deleted");
      } catch (error) {
        toast.error(error.response?.data?.detail || "Failed to delete history entry");
        console.error(error);
      }
    }
  };

  const visibleInputPorts = [hasPrompt && "textInput", hasImageUrl && "textInput2", hasImagesList && "textInput3", hasSystemPrompt && "textInput4"].filter(Boolean);
  const inputPortTop = handle => `${50 + (visibleInputPorts.indexOf(handle) - (visibleInputPorts.length - 1) / 2) * 12}%`;

  const currentOutputList = currentHistoryIndex !== -1 && outputHistory[currentHistoryIndex]
    ? outputHistory[currentHistoryIndex]?.result?.outputs || []
    : (data.outputs || []);

  const currentOutput = currentOutputList.length > 0
    ? currentOutputList[currentOutputIndex]?.value || currentOutputList[0]?.value || data.resultUrl
    : data.resultUrl;

  const isInput = selectedModel.id === 'text-passthrough';
  const textContent = isInput ? formValues.prompt || '' : currentOutput || formValues.prompt || '';
  useEffect(()=>{
    if(!isInput)return;
    const value=formValues.prompt || '';
    if(data.resultUrl!==value || data.outputs?.[0]?.value!==value)data.onDataChange(id,{outputs:[{type:'text',value}],resultUrl:value});
  },[isInput,formValues.prompt,id,data.resultUrl,data.outputs]);
  function changeText(value) {
    const next={...formValues,prompt:value};
    setFormValues(next);setCurrentHistoryIndex(-1);setCurrentOutputIndex(0);
    data.onDataChange(id,{formValues:next,...((isInput||currentOutput)?{outputs:[{type:'text',value}],resultUrl:value,outputHistory:[],viewingOutput:value}:{})});
  }
  function changeColor(key,value) {
    const next={...formValues,[key]:value};
    setFormValues(next);data.onDataChange(id,{formValues:next});setPalette(null);
  }
  const colors = [['Red','#f05f70'],['Orange','#f8a54a'],['Yellow','#f4d34f'],['Green','#4ec77b'],['Blue','#4ba6f6'],['Purple','#a65be8']];
  const background = formValues.card_color;
  const tagColor = formValues.tag_color;
  function saveTextAsset() {
    if(!textContent.trim())return;
    try {
      const stored=JSON.parse(localStorage.getItem('cimora.text-assets.v1')||'[]');
      const assets=Array.isArray(stored)?stored:[];
      const asset={id:crypto.randomUUID(),title:data.label||textContent.trim().slice(0,48),body:textContent};
      localStorage.setItem('cimora.text-assets.v1',JSON.stringify([...assets,asset]));
      window.dispatchEvent(new Event('cimora:text-assets'));
      toast.success('Text saved to Assets');
    } catch {toast.error('Unable to save text asset.');}
  }
  const textArea = label => <textarea ref={label==='Text content'?textareaRef:undefined} className="nodrag nowheel" aria-label={label} value={textContent} onChange={e=>changeText(e.target.value)} onBlur={()=>{if(!expanded)setEditing(false);}} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape')setEditing(false);}}/>;
  return (
    <div className={`text-node-clean nowheel ${selected?'is-selected':''}`} style={background?{background,color:background==='#252525'?'#eee':'#292929'}:undefined}>
      <div className="text-node-caption"><FiAlignLeft/><EditableNodeName id={id} data={data} fallback={`Text ${id.replace(/^\D+/g, "")}`}/>{tagColor&&<i style={{background:tagColor}}/>}</div>
      <div className="text-node-toolbar-bridge nodrag nopan" ref={toolbarRef} onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
       <div className="text-node-toolbar" role="toolbar" aria-label="Text node tools">
        <button type="button" title="Background color" aria-label="Background color" aria-expanded={palette==='background'} onClick={()=>setPalette(palette==='background'?null:'background')}><i className="text-color-swatch" style={{background:background||'#f8f8f8'}}/></button>
        <span className="text-toolbar-divider"/>
        <button type="button" title="Tag color" aria-label="Tag color" aria-expanded={palette==='tag'} onClick={()=>setPalette(palette==='tag'?null:'tag')}><FiTag/>{tagColor&&<i className="text-tag-dot" style={{background:tagColor}}/>}</button>
        <button type="button" title="Duplicate node" aria-label="Duplicate text node" onClick={()=>data.duplicateNode?.(id)}><FiCopy/></button>
        <button type="button" title="Save to Assets" aria-label="Save text to assets" disabled={!textContent.trim()} onClick={saveTextAsset}><FiFolderPlus/></button>
        <button type="button" title="Expand editor" aria-label="Expand text editor" onClick={()=>setExpanded(true)}><FiMaximize2/></button>
       </div>
       {palette&&<div className="text-node-palette" role="group" aria-label={palette==='tag'?'Tag colors':'Background colors'}>{(palette==='tag'?colors:[['Default',null],['White','#faf9f6'],['Charcoal','#252525'],['Sand','#eee5d4'],['Rose','#efd8db'],['Mint','#d7e8de']]).map(([name,color])=><button type="button" key={name} title={name} aria-label={name} aria-pressed={(palette==='tag'?tagColor:background)===color} style={{background:color||'#aaa'}} onClick={()=>changeColor(palette==='tag'?'tag_color':'card_color',color)}>{(palette==='tag'?tagColor:background)===color&&<FiCheck/>}</button>)}</div>}
      </div>
      <div className="text-node-body" onDoubleClick={e=>{e.stopPropagation();setEditing(true);}}>
       {data.isLoading?<span className="text-node-placeholder">Generating…</span>:data.errorMsg?<span role="alert">{data.errorMsg}</span>:editing?textArea('Text content'):<div className="text-node-copy" tabIndex={0} role="button" aria-label="Edit text" onKeyDown={e=>{if(e.key==='Enter'){e.stopPropagation();setEditing(true);}}}>{textContent||<span className="text-node-placeholder">Double-click to edit…</span>}</div>}
      </div>
      {expanded&&createPortal(<dialog ref={editorDialog} className="text-node-editor nodrag nowheel" onCancel={()=>setExpanded(false)} onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()} onKeyDown={e=>e.stopPropagation()}><header><strong>{data.label||'Text'}</strong><button type="button" aria-label="Close text editor" onClick={()=>setExpanded(false)}><FiX/></button></header>{textArea('Expanded text content')}</dialog>,document.getElementById('cimora-canvas'))}
      <UnifiedInput id={id} data={data} nodeType="textNode"/>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="textOutput" 
        onClick={event=>data.onTextOutputClick?.(event)}
        style={{ 
          top: "50%",
          width: 14,
          height: 14,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }} 
        className={`
          !rounded-full !border-[3px] !right-[-8px] transition-all
          ${connectedOutputs.textOutput 
            ? '!bg-blue-500 !border-zinc-900 shadow-[0_0_15px_rgba(59,130,246,0.8)]' 
            : '!bg-zinc-900 !border-blue-500/50 hover:!border-blue-500 shadow-sm'
          }
        `}
        data-type="blue"
      />
      <p 
        style={{top: "50%", transform: "translateY(-50%)"}}
          className={`absolute -right-9 text-[10px] font-bold tracking-tight text-blue-500 transition-all duration-300 ${
          data.activeHandleColor === "blue" 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
        }`}
      > 
        TEXT 
      </p>
    </div>
  );
};

export default TextGeneration;
