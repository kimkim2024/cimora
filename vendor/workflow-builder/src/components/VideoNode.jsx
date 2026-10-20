import UnifiedInput from "../cimora/UnifiedInput";
import EditableNodeName from "../cimora/EditableNodeName";
import { downloadFile, videoModels } from "./utility";
import React, { useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { BsArrowUpCircleFill } from '../../../../src/components/meika/CanvasIcons';
import { IoTimeOutline, IoVideocamOutline, IoTrashOutline, IoPlay, IoPause, IoVolumeHigh, IoVolumeMute } from '../../../../src/components/meika/CanvasIcons';
import { Handle, Position, useReactFlow, useStore, useUpdateNodeInternals } from "reactflow";
import { getRunId, getWorkflowId } from "./WorkflowStore";
import axios, { uploadAsset } from "../cimora/transport";
import { FiUpload, FiPlay } from '../../../../src/components/meika/CanvasIcons';
import { toast } from "react-hot-toast";
import UploadNode from "./UploadNode";
import { SlOptions } from '../../../../src/components/meika/CanvasIcons';
import { MdOutlineFileDownload } from '../../../../src/components/meika/CanvasIcons';
import NodeSendButton from "./NodeSendButton";
import { FaAngleLeft, FaAngleRight } from '../../../../src/components/meika/CanvasIcons';
import { useGenerationCost } from "./useGenerationCost";
import VideoPlayer from "./VideoPlayer";

const inputHandles = [
  "videoInput",   // prompt
  "videoInput2",  // image_url
  "videoInput3",  // last_image
  "videoInput4",  // video_url
  "videoInput5",  // audio_url
  "videoInput6",  // images_list
  "videoInput7",  // videos_list, video_files
  "videoInput8",  // audios_list, audio_files
];

const outputHandles = [
  "videoOutput",
];

const VideoGeneration = ({ id, data, selected }) => {
  const models = useMemo(() => {
    return data.nodeSchemas?.categories?.video?.models 
      ? Object.values(data.nodeSchemas.categories.video.models) 
      : [];
  }, [data.nodeSchemas]);
  
  const [selectedModel, setSelectedModel] = useState(data.selectedModel || models[1] || models[0] || {});
  const [connectedInputs, setConnectedInputs] = useState({});
  const [connectedOutputs, setConnectedOutputs] = useState({});
  const [formValues, setFormValues] = useState(data.formValues || {});
  const [dropDown, setDropDown] = useState(0);
  const [loading, setLoading] = useState(0);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const uploadInput = useRef(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const outputHistory = data.outputHistory || [];
  const prevHistoryLengthRef = useRef(outputHistory.length);
  const workflowId = getWorkflowId();
  const runId = data.runId ?? getRunId();
  const nodeSchemas = data.nodeSchemas || {};
  const { setNodes, setEdges } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const edges = useStore((state) => state.edges);
  const properties = nodeSchemas?.categories?.video?.models?.[selectedModel.id]?.input_schema?.schemas?.input_data?.properties;
  const { generationCost, isRefreshingCost } = useGenerationCost(selectedModel, formValues);
  
  useEffect(() => {
    if (data.cost !== generationCost) {
      data.onDataChange(id, { cost: generationCost });
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

    // const merged = { ...defaults, ...filteredFormValues };
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
    const UI_KEYS = ["make_output", "make_input"];
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
        setCurrentVideoIndex(0);
      } else if (data.outputHistory.length > prevHistoryLengthRef.current) {
        setCurrentHistoryIndex(data.outputHistory.length - 1);
        setCurrentVideoIndex(0);
      }
    }
    prevHistoryLengthRef.current = data.outputHistory ? data.outputHistory.length : 0;
  }, [data.selectedModel, data.triggerRun, data.outputHistory]);

  useEffect(() => {
    updateNodeInternals(id);
  }, [formValues, id, selectedModel]);

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
    if (data?.onDataChange && data?.selectedModel?.id !== "video-passthrough") {
      data.onDataChange(id, { selectedModel, formValues, loading });
    }
  }, [selectedModel, formValues, loading]);

  useEffect(() => {
    if (data.triggerRun) {
      handleRunSingleNode();

      data.onDataChange(id, { triggerRun: false });
    }
  }, [data.triggerRun]);
  
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
          setCurrentVideoIndex(0);
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
        toast.error(`Failed to get workflow status Video ${id.replace(/^\D+/g, "")}`);
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

      const modelSchema = nodeSchemas?.categories?.video?.models[selectedModel.id]?.input_schema?.schemas?.input_data;
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
        node_id: "AI Video"
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
  const hasVideosList = properties && ("videos_list" in properties || "video_files" in properties) && !data.selectedModel?.id.includes("passthrough");
  const hasLastImage = properties && "last_image" in properties && !data.selectedModel?.id.includes("passthrough");
  const hasImageUrl = properties && "image_url" in properties && !data.selectedModel?.id.includes("passthrough");
  const hasVideoUrl = properties && "video_url" in properties && !data.selectedModel?.id.includes("passthrough");
  const hasAudioUrl = properties && "audio_url" in properties && !data.selectedModel?.id.includes("passthrough");
  const hasAudiosList = properties && ("audios_list" in properties || "audio_files" in properties) && !data.selectedModel?.id.includes("passthrough");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const validHandles = [
        hasPrompt && "videoInput",
        hasImageUrl && "videoInput2",
        hasLastImage && "videoInput3",
        hasVideoUrl && "videoInput4",
        hasAudioUrl && "videoInput5",
        hasImagesList && "videoInput6",
        hasVideosList && "videoInput7",
        hasAudiosList && "videoInput8",
      ].filter(Boolean);

      setEdges((prevEdges) =>
        prevEdges.filter((edge) => {
          if (edge.target !== id) return true;
          return edge.targetHandle === 'groupReferenceInput' || validHandles.includes(edge.targetHandle);
        })
      );
    }, 2000);
    return () => clearTimeout(timeout);
  }, [hasPrompt, hasImageUrl, hasLastImage, hasVideoUrl, hasAudioUrl, hasImagesList, id, setEdges]);

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
      setCurrentVideoIndex(0);
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
      setCurrentVideoIndex(0);
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

  const visibleInputPorts = [hasPrompt && "videoInput", hasImageUrl && "videoInput2", hasImagesList && "videoInput6", hasLastImage && "videoInput3", hasVideoUrl && "videoInput4", hasVideosList && "videoInput7", hasAudiosList && "videoInput8", hasAudioUrl && "videoInput5"].filter(Boolean);
  const inputPortTop = handle => `${50 + (visibleInputPorts.indexOf(handle) - (visibleInputPorts.length - 1) / 2) * 12}%`;

  const currentOutputList = currentHistoryIndex !== -1 && outputHistory[currentHistoryIndex]
    ? outputHistory[currentHistoryIndex]?.result?.outputs || []
    : (data.outputs || []);

  const currentOutput = currentOutputList.length > 0
    ? currentOutputList[currentVideoIndex]?.value || currentOutputList[0]?.value || data.resultUrl
    : data.resultUrl;

  async function uploadVideo(file) {
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error('Choose a video file.'); return; }
    setUploadingVideo(true);
    try {
      const url = await uploadAsset(file);
      const next = {...formValues, video_url:url};
      setFormValues(next);
      setCurrentHistoryIndex(-1);
      setCurrentVideoIndex(0);
      data.onDataChange(id, {formValues:next,resultUrl:url,outputs:[{type:'video_url',value:url}]});
    } catch(error) { toast.error(error.message || 'Could not upload video.'); }
    finally {setUploadingVideo(false);if(uploadInput.current)uploadInput.current.value='';}
  }
  const displayVideo = currentOutput || formValues.video_url;
  const [videoSize, setVideoSize] = useState(null);
  const aspectRatio = data.formValues?.aspect_ratio || formValues.aspect_ratio || properties?.aspect_ratio?.default || 'Auto';
  const parts = aspectRatio.split(':').map(Number);
  const naturalRatio = videoSize && videoSize.url === displayVideo ? videoSize.width / videoSize.height : 1;
  const ratio = parts.length === 2 && parts.every(value => Number.isFinite(value) && value > 0) ? parts[0] / parts[1] : naturalRatio;
  // Keep roughly the same canvas footprint when switching between portrait and landscape.
  const nodeWidth = 320 * Math.sqrt(ratio);
  const nodeHeight = 320 / Math.sqrt(ratio);
  useLayoutEffect(() => {
    updateNodeInternals(id);
  }, [id, nodeWidth, nodeHeight, updateNodeInternals]);
  return (
    <div style={{width:nodeWidth,height:nodeHeight,minHeight:0}} className={`image-node-clean video-node-clean nowheel ${selected?'is-selected':''}`}>
      <div className="video-node-caption"><IoVideocamOutline/><EditableNodeName id={id} data={data} fallback={`Video ${id.replace(/^\D+/g, "")}`}/></div>
      <input hidden ref={uploadInput} type="file" accept="video/*" onChange={e=>void uploadVideo(e.target.files?.[0])}/>
      <div className="video-node-surface">
        {data.isLoading ? <span>Generating…</span> : data.errorMsg ? <span role="alert">{data.errorMsg}</span> : displayVideo ? <video className="nodrag nowheel" src={displayVideo} controls preload="metadata" onLoadedMetadata={event=>{
          const video=event.currentTarget;
          if(video.videoWidth && video.videoHeight)setVideoSize({url:displayVideo,width:video.videoWidth,height:video.videoHeight});
        }}/> : <div className="video-node-empty"><FiPlay/><button className="nodrag" type="button" disabled={uploadingVideo} onClick={()=>uploadInput.current?.click()}><FiUpload/>{uploadingVideo?'Uploading…':'Upload'}</button></div>}
      </div>
      <UnifiedInput id={id} data={data} nodeType="videoNode"/>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="videoOutput" 
        style={{ 
          top: "50%",
          width: 12,
          height: 12,
          transition: 'all 0.2s ease-in-out',
        }} 
        className={`!rounded-full !border-[3px] !right-[-8px] transition-all
          ${connectedOutputs.videoOutput 
            ? '!bg-orange-600 !border-zinc-900 shadow-[0_0_15px_rgba(249,115,22,0.8)]' 
            : '!bg-zinc-900 !border-orange-600/50 hover:!border-orange-600 shadow-sm'
          }
        `}
        data-type="orange"
      />
      <p 
        style={{top: "50%", transform: "translateY(-50%)"}}
          className={`absolute -right-10 text-xs text-orange-500 transition-opacity duration-200 ${
          data.activeHandleColor === "orange"
            ? "opacity-100" 
            : "opacity-0 group-hover:opacity-100"
        }`}
      > 
        Video 
      </p>
    </div>
  );
};

export default VideoGeneration;
