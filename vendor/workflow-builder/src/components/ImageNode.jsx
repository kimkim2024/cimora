import UnifiedInput from "../cimora/UnifiedInput";
import EditableNodeName from "../cimora/EditableNodeName";
import { FiInfo, FiTrash2, FiUpload, FiX } from '../../../../src/components/meika/CanvasIcons';
import { uploadAsset } from "../cimora/transport";
import ImagePreview from "../cimora/ImagePreview";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Handle, Position, useReactFlow, useStore, useUpdateNodeInternals } from "reactflow";
import { FaAngleLeft, FaAngleRight } from '../../../../src/components/meika/CanvasIcons';
import { downloadFile, imageModels } from "./utility";
import { getRunId, getWorkflowId } from "./WorkflowStore";
import axios from "../cimora/transport";
import { toast } from "react-hot-toast";
import { IoClose, IoImageOutline, IoTrashOutline } from '../../../../src/components/meika/CanvasIcons';
import UploadNode from "./UploadNode";
import { SlOptions } from '../../../../src/components/meika/CanvasIcons';
import { MdOutlineFileDownload } from '../../../../src/components/meika/CanvasIcons';
import { HiOutlineViewGrid } from '../../../../src/components/meika/CanvasIcons';
import NodeSendButton from "./NodeSendButton";
import NodeOptionsMenu from "./NodeOptionsMenu";
import { useGenerationCost } from "./useGenerationCost";

const inputHandles = [
  "imageInput",
  "imageInput2",
  "imageInput3"
];

const outputHandles = [
  "imageOutput",
];

const ImageGeneration = ({ id, data, selected }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInput = useRef(null);
  const models = useMemo(() => {
    return data.nodeSchemas?.categories?.image?.models 
      ? Object.values(data.nodeSchemas.categories.image.models) 
      : [];
  }, [data.nodeSchemas]);
  
  const [selectedModel, setSelectedModel] = useState(data.selectedModel || models[1] || models[0] || {});
  const [connectedInputs, setConnectedInputs] = useState({});
  const [connectedOutputs, setConnectedOutputs] = useState({});
  const [formValues, setFormValues] = useState(data.formValues || {});
  const [dropDown, setDropDown] = useState(0);
  const [loading, setLoading] = useState(0);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageMetadata, setImageMetadata] = useState({ width: 0, height: 0, size: null });
  const outputHistory = data.outputHistory || [];
  const prevHistoryLengthRef = useRef(outputHistory.length);
  const workflowId = getWorkflowId();
  const runId = data.runId ?? getRunId();
  const nodeSchemas = data.nodeSchemas || {};
  const { setNodes, setEdges } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const edges = useStore((state) => state.edges);
  const properties = nodeSchemas?.categories?.image?.models?.[selectedModel.id]?.input_schema?.schemas?.input_data?.properties;
  const { generationCost, isRefreshingCost } = useGenerationCost(selectedModel, formValues);
  
  useEffect(() => {
    if (data.cost !== generationCost) {
      data.onDataChange?.(id, { cost: generationCost });
    }
  }, [id, generationCost, data.cost]);

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
    const UI_KEYS = ["make_output", "make_input", "width", "height", "resolution", "align_to_16", "aspect_ratio"];
    UI_KEYS.forEach((k) => {
      if (data.formValues?.[k] !== undefined) merged[k] = data.formValues[k];
    });

    setFormValues(merged);
  };

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
        setCurrentImageIndex(0);
      } else if (data.outputHistory.length > prevHistoryLengthRef.current) {
        setCurrentHistoryIndex(data.outputHistory.length - 1);
        setCurrentImageIndex(0);
      }
    }
    prevHistoryLengthRef.current = data.outputHistory ? data.outputHistory.length : 0;
  }, [data.selectedModel, data.triggerRun, data.outputHistory]);

  useEffect(() => {
    updateNodeInternals(id);
  }, [formValues, id]);

  const handleChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    setDropDown(-1);
  };

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
    if (data?.onDataChange && data?.selectedModel?.id !== "image-passthrough") {
      data.onDataChange(id, { selectedModel, formValues, loading });
    }
  }, [selectedModel, formValues, loading]);
  
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
          setCurrentImageIndex(0);
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
        toast.error(`Failed to get workflow status Image ${id.replace(/^\D+/g, "")}`);
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

      const modelSchema = nodeSchemas?.categories?.image?.models[selectedModel.id]?.input_schema?.schemas?.input_data;
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
        node_id: "AI Image"
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

  const hasPrompt = properties && "prompt" in properties && !data.selectedModel?.id.includes("passthrough");
  const hasImagesList = properties && "images_list" in properties && !data.selectedModel?.id.includes("passthrough");
  const hasImageUrl = properties && "image_url" in properties && !data.selectedModel?.id.includes("passthrough");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const validHandles = [
        hasPrompt && "imageInput",
        hasImageUrl && "imageInput3",
        hasImagesList && "imageInput2",
      ].filter(Boolean);

      setEdges((prevEdges) =>
        prevEdges.filter((edge) => {
          if (edge.target !== id) return true;
          return edge.targetHandle === 'groupReferenceInput' || validHandles.includes(edge.targetHandle);
        })
      );
    }, 2000);
    return () => clearTimeout(timeout);
  }, [hasPrompt, hasImageUrl, hasImagesList, id, setEdges]);

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
      setCurrentImageIndex(0);
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
      setCurrentImageIndex(0);
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

  const visibleInputPorts = [hasPrompt && "imageInput", hasImagesList && "imageInput2", hasImageUrl && "imageInput3"].filter(Boolean);
  const inputPortTop = handle => `${50 + (visibleInputPorts.indexOf(handle) - (visibleInputPorts.length - 1) / 2) * 12}%`;

  const currentOutputList = currentHistoryIndex !== -1 && outputHistory[currentHistoryIndex]
    ? outputHistory[currentHistoryIndex]?.result?.outputs || []
    : (data.outputs || []);

  const currentOutput = currentOutputList.length > 0
    ? currentOutputList[currentImageIndex]?.value || currentOutputList[0]?.value || data.resultUrl
    : data.resultUrl;

  useEffect(() => {
    if (currentOutput) {
      const img = new Image();
      img.onload = () => {
        setImageMetadata(prev => ({ 
          ...prev, 
          width: img.naturalWidth, 
          height: img.naturalHeight 
        }));
      };
      img.src = currentOutput;
      
      fetch(currentOutput, { method: 'HEAD' })
        .then(res => {
          const size = res.headers.get('content-length');
          if (size) {
            const sizeInMB = (parseInt(size) / (1024 * 1024)).toFixed(2);
            setImageMetadata(prev => ({ ...prev, size: sizeInMB + ' MB' }));
          } else {
            setImageMetadata(prev => ({ ...prev, size: null }));
          }
        })
        .catch(() => {
          setImageMetadata(prev => ({ ...prev, size: null }));
        });
    } else {
      setImageMetadata({ width: 0, height: 0, size: null });
    }
  }, [currentOutput]);

  const updateWorkflowThumbnail = async (thumbnail) => {
    const workflow_id = await data.handleSaveWorkFlow();
    if (!workflow_id) {
      toast.error("Workflow id not found");
      return;
    }

    if (!thumbnail) {
      toast.error("Thumbnail URL is required");
      return;
    }
    try { 
      const response = await axios.post(`/api/workflow/${workflow_id}/thumbnail`, { 
        thumbnail 
      });
      if (response.data.success) toast.success("Cover image updated successfully");
    } catch(error) {
      toast.error(error.response?.data?.detail || "Failed to save thumbnail");
      console.error(error);
    };
  };

  const displayImage = currentOutput || data.formValues?.image_url || formValues.image_url;
  const uploadNodeImage = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Choose an image file.'); return; }
    setUploadingImage(true);
    try {
      const url = await uploadAsset(file);
      setFormValues(prev => ({...prev, image_url: url}));
      setCurrentHistoryIndex(-1);
      setCurrentImageIndex(0);
      data.onDataChange?.(id, {formValues: {...formValues, image_url: url}, resultUrl: url, outputs: [{type: 'image_url', value: url}]});
    } catch (error) { toast.error(error.message || 'Could not upload image.'); }
    finally {setUploadingImage(false);event.target.value = '';}
  };
  return (
    <div className={`image-node-clean nowheel ${selected ? 'is-selected' : ''}`}>
      <div className="image-node-caption"><EditableNodeName id={id} data={data} fallback={`Image ${id.replace(/^\D+/g, "")}`}/></div>
      <div className="image-node-hover-bridge">
        <div className="image-node-hover-tools nodrag nopan" role="toolbar" aria-label="Image node tools" onClick={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()}>
          <button type="button" aria-label="Node information" title="Node information" aria-expanded={showInfo} onClick={()=>setShowInfo(!showInfo)}><FiInfo/></button>
          <button type="button" className="image-node-delete" aria-label="Delete image node" title="Delete image node" onClick={handleDeleteNode}><FiTrash2/></button>
          <button type="button" aria-label="Upload image" title="Upload image" disabled={uploadingImage} onClick={()=>imageFileInput.current?.click()}><FiUpload/></button>
        </div>
      </div>
      <input className="nodrag" hidden ref={imageFileInput} type="file" accept="image/*" onChange={uploadNodeImage}/>
      {showInfo && <div className="image-node-info nodrag nopan" role="dialog" aria-label="Image node information" onClick={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()}>
        <header><strong>Node information</strong><button type="button" aria-label="Close node information" onClick={()=>setShowInfo(false)}><FiX/></button></header>
        <dl><dt>Name</dt><dd><EditableNodeName id={id} data={data} fallback={`Image ${id.replace(/^\D+/g, "")}`}/></dd><dt>Model</dt><dd>{selectedModel.name || 'Not selected'}</dd><dt>Dimensions</dt><dd>{imageMetadata.width ? `${imageMetadata.width} × ${imageMetadata.height}` : 'No image loaded'}</dd></dl>
      </div>}
      {showPreview && displayImage && <ImagePreview src={displayImage} name={`Image ${id.replace(/^\D+/g, '')}`} onClose={()=>setShowPreview(false)}/> }
      <div className="image-node-surface">
        {data.isLoading || uploadingImage ? <span>Loading image…</span> : data.errorMsg ? <span className="image-node-error">{data.errorMsg}</span> : displayImage ? <img className="nodrag nopan image-node-preview-trigger" role="button" tabIndex={0} aria-label="Enlarge image" onClick={e=>{e.stopPropagation();setShowPreview(true);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();setShowPreview(true);}}} src={displayImage} alt={`Image ${id.replace(/^\D+/g, '')}`} draggable={false} onLoad={e=>{const {naturalWidth:width,naturalHeight:height}=e.currentTarget;setImageMetadata(prev=>({...prev,width,height}));}}/> : <div className="image-node-empty"><IoImageOutline/><button type="button" className="image-node-empty-upload nodrag nopan" aria-label="Upload image to empty node" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();imageFileInput.current?.click();}}><FiUpload/>Upload</button></div>}
      </div>
      <UnifiedInput id={id} data={data} nodeType="imageNode"/>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="imageOutput" 
        style={{ 
          top: "50%",
          width: 12,
          height: 12,
          transition: 'all 0.2s ease-in-out',
        }} 
        className={`!rounded-full !border-[3px] !right-[-8px] transition-all
          ${connectedOutputs.imageOutput 
            ? '!bg-emerald-600 !border-zinc-900 shadow-[0_0_15px_rgba(16,185,129,0.8)]' 
            : '!bg-zinc-900 !border-emerald-600/50 hover:!border-emerald-600 shadow-sm'
          }
        `}
        data-type="green"
      />
      <p 
        style={{top: "50%", transform: "translateY(-50%)"}}
          className={`absolute -right-10 text-xs text-green-500 transition-opacity duration-200 ${
          data.activeHandleColor === "green"
            ? "opacity-100" 
            : "opacity-0 group-hover:opacity-100"
        }`}
      > 
        Image 
      </p>
    </div>
  );
};

export default ImageGeneration;
