import { syncLinkedInputs } from '../cimora/linkedInputs.mjs';
import { connectionOptions, detachOutsideGroupNodes, getGroupMembers, getGroupReferences, getDesignInputs, defaultInputPort, getInputPorts } from "../cimora/unifiedInputs.mjs";
import { transferEdgeTypes } from "../cimora/TransferEdge";
import { flushSync } from "react-dom";
import SceneDesignNode from "../cimora/SceneDesignNode";
import CharacterDesignNode from "../cimora/CharacterDesignNode";
import CanvasNodeMenu from "../cimora/CanvasNodeMenu";
import CanvasGroupNode from "../cimora/CanvasGroupNode";
import NodeComposer from "../cimora/NodeComposer";
import CanvasBottomToolbar from "../cimora/CanvasBottomToolbar";
import { FiImage, FiFileText, FiList, CanvasBoardIcon, CanvasTasksIcon } from '../../../../src/components/meika/CanvasIcons';
import CanvasHeading from "../cimora/CanvasHeading";
import { presets } from "../cimora/presets";
"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { getCanvasContext } from "../cimora/navigation";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "reactflow";
// import "reactflow/dist/style.css";
import { BsArrowUpCircleFill } from '../../../../src/components/meika/CanvasIcons';
import { FiZoomIn, FiZoomOut } from '../../../../src/components/meika/CanvasIcons';
import { TfiText } from '../../../../src/components/meika/CanvasIcons';
import { MdLockOutline, MdOutlineZoomOutMap, MdSave } from '../../../../src/components/meika/CanvasIcons';
import { LuLayoutTemplate, LuMousePointer2, LuListChecks } from '../../../../src/components/meika/CanvasIcons';
import { FaAngleDown, FaAngleLeft, FaCheck, FaPlay, FaPlus, FaRegHand, FaToolbox, FaUpload } from '../../../../src/components/meika/CanvasIcons';
import { FaRegEdit, FaTelegramPlane } from '../../../../src/components/meika/CanvasIcons';
import { IoDuplicateOutline, IoImageOutline, IoVideocamOutline } from '../../../../src/components/meika/CanvasIcons';
import { Toaster, toast } from "react-hot-toast";
import { FiSun, FiMoon } from '../../../../src/components/meika/CanvasIcons';
import axios, { uploadAsset } from "../cimora/transport";
import TextGeneration from "./TextNode";
import ImageGeneration from "./ImageNode";
import VideoGeneration from "./VideoNode";
import { setWorkflowIds } from "./WorkflowStore";
import { apiNodeModels, audioModels, concatModels, imageModels, textModels, videoModels, videoCombinerModels } from "./utility";
import { backUrl, Link } from "../cimora/navigation";
import RenderField from "./RenderField";
import PromptConcate from "./PromptConcate";
import { TbArrowMerge } from '../../../../src/components/meika/CanvasIcons';
import { RiInputMethodLine } from '../../../../src/components/meika/CanvasIcons';
import ApiNode from "./ApiNode";
import RenderApiField from "./RenderApiField";
import AudioGeneration from "./AudioNode";
import ChatWidget from "./ChatWidget";
import { AiOutlineAudio } from '../../../../src/components/meika/CanvasIcons';
import VideoCombiner from "./VideoCombiner";
import { useGenerationCost } from "./useGenerationCost";

const nodeTypes = {
  characterNode: CharacterDesignNode,
  sceneNode: SceneDesignNode,
  groupNode: CanvasGroupNode,
  textNode: TextGeneration,
  imageNode: ImageGeneration,
  videoNode: VideoGeneration,
  audioNode: AudioGeneration,
  concatNode: PromptConcate,
  vidConcatNode: VideoCombiner,
  apiNode: ApiNode
}

const initialNodes = [
  { id: "text1", position: { x: 0, y: 100 }, data: {}, type: "textNode" },
  { id: "image1", position: { x: 300, y: 100 }, data: {}, type: "imageNode" },
];

const initialEdges = [];

const edgeStyles = {
  blue: {
    stroke: '#3b82f6', // blue-500
    strokeWidth: 2,
    // animated: true,
  },
  green: {
    stroke: '#22c55e', // green-500
    strokeWidth: 2,
    // animated: true,
  },
  orange: {
    stroke: '#f97316', // orange-500
    strokeWidth: 2,
    // animated: true,
  },
  gray: {
    stroke: '#6b7280', // gray-500
    strokeWidth: 2,
  },
  yellow: {
    stroke: '#eab308', // yellow-500
    strokeWidth: 2,
  },
  white: {
    stroke: '#ffffff',
    strokeWidth: 2,
  }
};

const getEdgeColor = (sourceHandle, targetHandle, sourceNode = null, targetNode = null) => {
  if (sourceHandle === "apiOutput" && sourceNode) {
    const output = sourceNode.data.outputs?.[0];
    const modelType = sourceNode.data.formValues?.model_type;

    if (output?.type === 'text' || modelType === 'chat') return "blue";
    if (output?.type === 'video_url' || modelType === 'video') return "orange";
    if (output?.type === 'audio_url' || modelType === 'audio') return "yellow";
    return "green";
  }

  if (["textOutput", "concatOutput"].includes(sourceHandle)) return "blue";
  if (["imageOutput"].includes(sourceHandle)) return "green";
  if (["videoOutput"].includes(sourceHandle)) return "orange";
  if (["audioOutput"].includes(sourceHandle)) return "yellow";

  if (["textInput", "textInput4", "imageInput", "videoInput", "audioInput2", "concatInput", "apiInput"].includes(targetHandle)) return "blue";
  if (["textInput2", "textInput3", "imageInput2", "imageInput3", "videoInput2", "videoInput3", "videoInput6", "audioInput3", "apiInput2", "apiInput3"].includes(targetHandle)) return "green";
  if (["videoInput4", "audioInput4", "videoInput7"].includes(targetHandle)) return "orange";
  if (["audioInput", "videoInput5", "videoInput8"].includes(targetHandle)) return "yellow";

  if (sourceNode) {
    const type = sourceNode.type;
    if (type === 'textNode' || type === 'concatNode') return "blue";
    if (type === 'imageNode') return "green";
    if (type === 'videoNode' || type === 'vidConcatNode') return "orange";
    if (type === 'audioNode') return "yellow";
  }

  return "white";
};

const iconMap = {
  "plus": <FaPlus size={20} />,
  "image": <IoImageOutline size={20} />,
  "video": <IoVideocamOutline size={20} />,
  "audio": <AiOutlineAudio size={20} />,
  "text": <TfiText size={20} />,
};

const SPECIAL_MODEL_NAMES = {
  "text-passthrough": "Input Text",
  "image-passthrough": "Input Image",
  "video-passthrough": "Input Video",
  "audio-passthrough": "Input Audio",
};

const formatName = (id) => id.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const getModelObjStatic = (category, modelId, nodeSchemas) => {
  if (category === "api") {
    // We can't easily access filteredApiNodeModels statically without passing it, 
    // but we can compute it on the fly or just return null and let useEffect handle it if needed.
    // For now, let's just use the shared logic.
    useEffect(() => {
    let timer;
    const resize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => fitView({ padding: 0.4, minZoom: 0.2 }), 150);
    };
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); clearTimeout(timer); };
  }, [fitView]);

  const apiModelsFromBackend = nodeSchemas?.categories?.api?.models ? Object.keys(nodeSchemas.categories.api.models) : [];
    const filtered = apiNodeModels.filter(model => apiModelsFromBackend.includes(model.id));
    return filtered.find(m => m.id === modelId) || null;
  }
  if (!modelId || !nodeSchemas?.categories) return null;
  const rawModel = nodeSchemas.categories[category]?.models?.[modelId];
  if (!rawModel) return null;

  return {
    ...rawModel,
    id: modelId,
    name: SPECIAL_MODEL_NAMES[modelId] || formatName(modelId)
  };
};

const processWorkflowData = (workflowData, nodeSchemas, id) => {
  if (!workflowData || !nodeSchemas?.categories) return null;

  const workflow = workflowData?.data;
  if (!workflow?.nodes) return null;

  const restoredNodes = workflow.nodes.map(n => ({
    id: n.id,
    type: n.category === "utility" 
      ? (n.model === "video-combiner" ? "vidConcatNode" : "concatNode") 
      : `${n.category}Node`,
    parentNode:n.parentNode, extent:undefined, style:n.style,
    position: {
      x: n.position?.x ?? 350,
      y: n.position?.y ?? 0
    },
    data: {
      nodeSchemas,
      label:n.label,
      ...(["character","scene"].includes(n.category) ? n.designData || {} : {}),
      modelId: n.model,
      selectedModel: getModelObjStatic(n.category, n.model, nodeSchemas),
      outputs: n.output_params?.outputs || [],
      resultUrl: n.output_params?.resultUrl || null,
      formValues: n.localFormValues || n.input_params || {},
      linkedInputs:n.linkedInputs,
      outputHistory: (workflowData.run_history?.[n.id] || [])
        .sort((a, b) => new Date(a.started_at) - new Date(b.started_at)),
    }
  }));

  const restoredEdges = (workflowData.edges || []).map((e) => {
    const sourceNode = restoredNodes.find(n => n.id === e.source);
    const targetNode = restoredNodes.find(n => n.id === e.target);
    let edgeColor = getEdgeColor(e.sourceHandle, e.targetHandle, sourceNode, targetNode);

    return {
      id: e.id || `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle || null,
      targetHandle: e.targetHandle || null,
      style: edgeStyles[edgeColor],
    }
  });

  return {
    nodes: restoredNodes,
    edges: restoredEdges,
    metadata: {
      workflowId: id,
      runId: workflowData?.run_id,
      workflowName: workflowData.name,
      interactionMode: workflowData.is_owner,
      publishWorkflow: workflowData.is_published,
      template: {
        showTemplateBtn: workflowData.show_temp_button,
        isPublishedTemplate: workflowData.is_template,
      },
      category: workflowData?.category || "General"
    }
  };
};

const NodeFlow = ({
  initialNodeSchemas,
  initialWorkflowData,
  onGenerationStart,
  onGenerationEnd,
  onGenerationComplete,
  onGenerationError,
}) => {
  const params = getCanvasContext();
  const { id } = params;

  // Pre-calculate initial state if data is provided
  const initialState = useMemo(() => {
    return processWorkflowData(initialWorkflowData, initialNodeSchemas, id);
  }, [initialWorkflowData, initialNodeSchemas, id]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialState?.nodes || []);
  useEffect(() => {
    const detached=detachOutsideGroupNodes(nodes);
    if(detached!==nodes) setNodes(previous=>detachOutsideGroupNodes(previous));
  }, [nodes, setNodes]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialState?.edges || initialEdges);
  const previousInputGraph = useRef(null);
  useEffect(() => {
    const previous = previousInputGraph.current;
    previousInputGraph.current = {nodes,edges};
    const synced = syncLinkedInputs(nodes,edges,previous);
    if (synced !== nodes) setNodes(current => syncLinkedInputs(current,edges,previous));
  }, [nodes,edges,setNodes]);

  const [activeHandleColor, setActiveHandleColor] = useState(null);
  const [loadingNodes, setLoadingNodes] = useState({});
  const [isRunning, setIsRunning] = useState(0);
  const [dropDown, setDropDown] = useState(0);
  const [headingOpen, setHeadingOpen] = useState(() => {
    try {
      return localStorage.getItem(`cimora.canvas.v1:${getCanvasContext().id}`) ? null : 'panel';
    } catch {
      return 'panel';
    }
  });
  const [resourceTab, setResourceTab] = useState('Prompt Library');
  const [workflowName, setWorkflowName] = useState(initialState?.metadata?.workflowName || "Untitled");
  const [workflowId, setWorkflowId] = useState(id);
  const [runId, setRunId] = useState(initialState?.metadata?.runId || null);
  const [hasFit, setHasFit] = useState(!!initialWorkflowData?.viewport);
  const [nodeSchemas, setNodeSchemas] = useState(initialNodeSchemas || {});
  const [contextMenu, setContextMenu] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [draggedEdgeInfo, setDraggedEdgeInfo] = useState(null);
  const [edgePicker, setEdgePicker] = useState(null);
  const connectionMadeRef = useRef(false);
  const onConnectRef = useRef(null);
  const [interactionMode, setInteractionMode] = useState(initialState?.metadata?.interactionMode || false);
  const [publishWorkflow, setPublishWorkflow] = useState(initialState?.metadata?.publishWorkflow || false);
  const [template, setTemplate] = useState(initialState?.metadata?.template || {
    showTemplateBtn: false,
    isPublishedTemplate: false
  });
  const [isDragging, setIsDragging] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [gridStyle, setGridStyle] = useState("lines");
  const [modelSearch, setModelSearch] = useState("");
  const [isPresetsDismissed, setIsPresetsDismissed] = useState(true);
  const [isRestoring, setIsRestoring] = useState(!initialState);
  const [totalWorkflowCost, setTotalWorkflowCost] = useState(0);

  useEffect(() => {
    const total = nodes.reduce((sum, node) => {
      const cost = parseFloat(node.data?.cost) || 0;
      return sum + cost;
    }, 0);
    setTotalWorkflowCost(total.toFixed(3));
  }, [nodes]);

  // Sync global store with initial data if provided
  useEffect(() => {
    if (initialState?.metadata) {
      setWorkflowIds(id, initialState.metadata.runId);
    }
  }, [id, initialState]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [workflowCategory, setWorkflowCategory] = useState(initialState?.metadata?.category || "General");
  const [categoryInput, setCategoryInput] = useState(initialState?.metadata?.category || "General");
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelDropdownUp, setIsModelDropdownUp] = useState(false);
  const modelDropdownTriggerRef = useRef(null);

  const { zoomIn, zoomOut, fitView, getNodes, getViewport, screenToFlowPosition } = useReactFlow();

  const apiModelsFromBackend =
    nodeSchemas?.categories?.api?.models
      ? Object.keys(nodeSchemas.categories.api.models)
      : [];

  const filteredApiNodeModels = apiNodeModels.filter(model =>
    apiModelsFromBackend.includes(model.id)
  );

  const loadPreset = (preset) => {
    setIsPresetsDismissed(true);
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setTimeout(() => fitView({ padding: 0.4, duration: 500 }), 100);
  };

  // Moved SPECIAL_MODEL_NAMES, formatName and getModelObj logic to static helpers above

  useEffect(() => {
    if (!initialNodeSchemas) {
      axios.get(`/api/workflow/${id}/node-schemas`)
        .then(res => setNodeSchemas(res.data || {}))
        .catch(err => console.error("Failed to load node schemas", err));
    }

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useLayoutEffect(() => {
    if (dropDown === 3 && modelDropdownTriggerRef.current) {
      const rect = modelDropdownTriggerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      setIsModelDropdownUp(spaceBelow < 250);
    }
  }, [dropDown]);

  useEffect(() => {
    if (!nodeSchemas?.categories) return;
    setNodes((prev) => {
      const needsUpdate = prev.some((n) => n.data.nodeSchemas !== nodeSchemas);
      if (!needsUpdate) return prev;

      return prev.map((n) => ({
        ...n,
        data: {
          ...n.data,
          nodeSchemas,
        },
      }));
    });
  }, [nodeSchemas]);
  const getModelObj = useCallback((category, modelId) => {
    return getModelObjStatic(category, modelId, nodeSchemas);
  }, [nodeSchemas]);

  const restoreWorkflow = useCallback((workflowData) => {
    const workflow = workflowData?.data;
    if (!workflow?.nodes) return;

    const restoredNodes = workflow.nodes.map(n => ({
      id: n.id,
      type: n.category === "utility" 
        ? (n.model === "video-combiner" ? "vidConcatNode" : "concatNode") 
        : `${n.category}Node`,
      parentNode:n.parentNode, extent:undefined, style:n.style,
      position: {
        x: n.position?.x ?? 350,
        y: n.position?.y ?? 0
      },
      data: {
        nodeSchemas,
        label:n.label,
      ...(["character","scene"].includes(n.category) ? n.designData || {} : {}),
      modelId: n.model,
        selectedModel: getModelObj(n.category, n.model),
        outputs: n.output_params?.outputs || [],
        resultUrl: n.output_params?.resultUrl || null,
        formValues: n.localFormValues || n.input_params || {},
      linkedInputs:n.linkedInputs,
        outputHistory: (workflowData.run_history?.[n.id] || [])
          .sort((a, b) => new Date(a.started_at) - new Date(b.started_at)),
      }
    }));

    const restoredEdges = (workflowData.edges || []).map((e) => {
      const sourceNode = restoredNodes.find(n => n.id === e.source);
      const targetNode = restoredNodes.find(n => n.id === e.target);
      let edgeColor = getEdgeColor(e.sourceHandle, e.targetHandle, sourceNode, targetNode);

      return {
        id: e.id || `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || null,
        targetHandle: e.targetHandle || null,
        style: edgeStyles[edgeColor],
      }
    });

    setNodes(restoredNodes);
    setEdges(restoredEdges);
    setWorkflowId(id);
    setRunId(workflowData?.run_id);
    setWorkflowName(workflowData.name);
    setWorkflowCategory(workflowData?.category || "General");
    setWorkflowIds(workflowData.workflow_id, workflowData?.run_id);
    setInteractionMode(workflowData.is_owner);
    setPublishWorkflow(workflowData.is_published);
    setTemplate(prev => ({
      ...prev,
      showTemplateBtn: workflowData.show_temp_button,
      isPublishedTemplate: workflowData.is_template,
    }));
    setIsRestoring(false);
  }, [id, nodeSchemas, getModelObj, setNodes, setEdges]);

  useEffect(() => {
    if (initialWorkflowData && nodeSchemas?.categories) {
      return;
    }

    if (!id || !nodeSchemas?.categories) return;

    axios.get(`/api/workflow/get-workflow-def/${id}`)
      .then(res => {
        restoreWorkflow(res.data);
      })
      .catch((error) => {
        console.log(error);
        setInteractionMode(false);
        setIsRestoring(false);
      });
  }, [id, nodeSchemas, initialWorkflowData, restoreWorkflow]);

  useEffect(() => {
    if (isRestoring) return;

    if (nodes.length > 0 && !hasFit) {
      const timeout = setTimeout(() => {
        fitView({ padding: 0.4, duration: 500, minZoom: 0.2 });
        setHasFit(true);
      }, 100);
      return () => clearTimeout(timeout);
    } else if (nodes.length === 0) {
      setIsPresetsDismissed(false);
    };
  }, [nodes, hasFit, fitView, isRestoring]);

  const arrangeNodesInRow = useCallback(() => {
    const spacing = 350;
    const y = 100;
    setNodes((nds) =>
      nds.map((node, index) => ({
        ...node,
        position: { x: index * spacing, y },
      }))
    );
  }, [setNodes]);

  useEffect(() => {
    if (workflowId) return;
    arrangeNodesInRow();
  }, [arrangeNodesInRow]);

  useEffect(() => {
    setNodes((prevNodes) => {
      const edgesBySource = {};
      edges.forEach((edge) => {
        if (!edgesBySource[edge.source]) edgesBySource[edge.source] = [];
        edgesBySource[edge.source].push(edge);
      });

      const needsUpdate = prevNodes.some((node) => {
        const currentEdges = node.data.connectedEdges || [];
        const newEdges = edgesBySource[node.id] || [];
        if (currentEdges.length !== newEdges.length) return true;
        const currentIds = currentEdges.map(e => e.id).sort().join(',');
        const newIds = newEdges.map(e => e.id).sort().join(',');
        return currentIds !== newIds;
      });

      if (!needsUpdate) return prevNodes;

      return prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          connectedEdges: edgesBySource[node.id] || [],
        },
      }));
    });
  }, [edges, setNodes]);

  const onDataChange = (id, newData) => {
    setNodes(previous => previous.map(node =>
      node.id.toLowerCase().replace(/\s+/g, '') === id.toLowerCase().replace(/\s+/g, '')
        ? {...node,data:{...node.data,...newData}} : node
    ));

    if (newData.hasOwnProperty('isLoading')) {
      setLoadingNodes(prev => {
        const newLoadingNodes = { ...prev };
        if (newData.isLoading) {
          newLoadingNodes[id] = true;
        } else {
          delete newLoadingNodes[id];
        }
        return newLoadingNodes;
      });
    }
  };

  const onConnect = useCallback(
    (params) => {
      if (params.targetHandle === 'unifiedInput') {
        const options = connectionOptions(params, nodes);
        connectionMadeRef.current = true;
        setEdgePicker(null);
        if (!options.length) { toast.error('This node does not accept that input type.'); return; }
        const port = defaultInputPort(params,nodes,edges);
        if (!port) { toast.error('Input slots are full. Adjust connections in node settings.'); return; }
        params = {...params, targetHandle:port[0]};
      }
      const targetNodeExists = nodes.some(n => n.id === params.target);
      if (targetNodeExists) {
        connectionMadeRef.current = true;
      }
      setEdges((eds) => {
        const sourceNode = nodes.find((n) => n.id === params.source) || {};
        const targetNode = nodes.find((n) => n.id === params.target) || {};
        let color = getEdgeColor(params.sourceHandle, params.targetHandle, sourceNode, targetNode);

        if (color === "blue" && targetNode?.type !== "concatNode" && targetNode.type !== "apiNode") {
          const hasExistingBlueConnection = eds.some(edge => {
            if (edge.target !== params.target) return false;
            // // Allow different handles to coexist even if they are both blue
            if (edge.targetHandle !== params.targetHandle) return false;

            const edgeColor =
              ["textInput", "imageInput", "videoInput", "audioInput2", "concatInput", "textInput4", "designPromptInput"].includes(edge.targetHandle) ||
                ["textOutput", "concatOutput"].includes(edge.sourceHandle)
                ? "blue"
                : "other";

            return edgeColor === "blue";
          });

          if (hasExistingBlueConnection) {
            return eds;
          }
        }

        const newEdges = addEdge({ ...params, style: edgeStyles[color] }, eds);
        return newEdges;
      });
    },
    [nodes, edges]
  );

  const pollArchitectStatus = (request_id) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/workflow/poll-architect/${request_id}/result`);
        const finalData = response.data;
        const status = finalData.status;

        if (status === "completed") {
          clearInterval(interval);
          const { message, suggestions, workflow } = finalData;

          const newAgentMessage = {
            role: "agent",
            content: message || "Tasks complete. Your workflow has been updated.",
            suggestions: suggestions || [],
            timestamp: new Date().toISOString()
          };
          setChatMessages((prev) => [...prev, newAgentMessage]);

          if (workflow && workflow.nodes) {
            const idMapping = {};
            const counts = { text: 0, image: 0, video: 0, audio: 0 };

            const newNodes = workflow.nodes.map((n) => {
              let newId = n.id;
              const category = n.category;

              if (["user_text", "prompt_gen"].includes(n.id) || category === "text") {
                counts.text++;
                newId = `text${counts.text}`;
              } else if (n.id === "image_gen" || category === "image") {
                counts.image++;
                newId = `image${counts.image}`;
              } else if (category === "video") {
                counts.video++;
                newId = `video${counts.video}`;
              } else if (category === "audio") {
                counts.audio++;
                newId = `audio${counts.audio}`;
              }

              idMapping[n.id] = newId;
              const existingNode = nodes.find((en) => en.id === newId);

              return {
                id: newId,
                type: n.category === "utility" ? (n.model === "video-combiner" ? "vidConcatNode" : "concatNode") : `${n.category}Node`,
                position: existingNode?.position || {
                  x: n.position?.x ?? 350,
                  y: n.position?.y ?? 0
                },
                data: {
                  ...existingNode?.data,
                  nodeSchemas,
                  label:n.label,
      ...(["character","scene"].includes(n.category) ? n.designData || {} : {}),
      modelId: n.model,
                  selectedModel: getModelObj(n.category, n.model),
                  outputs: n.output_params?.outputs || [],
                  resultUrl: n.output_params?.resultUrl || null,
                  formValues: n.input_params || n.params || {},
                  outputHistory: existingNode?.data?.outputHistory || [],
                }
              };
            });

            setNodes(newNodes);

            if (workflow.edges && workflow.edges.length > 0) {
              const newEdges = workflow.edges.map((e) => {
                const source = idMapping[e.source] || e.source;
                const target = idMapping[e.target] || e.target;

                const sourceNode = newNodes.find(n => n.id === source);
                const targetNode = newNodes.find(n => n.id === target);

                let sourceHandle = e.sourceHandle;
                let targetHandle = e.targetHandle;

                if ((!sourceHandle || sourceHandle === 'output') && sourceNode) {
                  if (sourceNode.type === 'textNode') sourceHandle = 'textOutput';
                  else if (['imageNode','characterNode','sceneNode'].includes(sourceNode.type)) sourceHandle = 'imageOutput';
                  else if (sourceNode.type === 'videoNode') sourceHandle = 'videoOutput';
                  else if (sourceNode.type === 'audioNode') sourceHandle = 'audioOutput';
                  else if (sourceNode.type === 'concatNode') sourceHandle = 'concatOutput';
                }

                if ((!targetHandle || targetHandle === 'prompt') && targetNode) {
                  if (targetNode.type === 'textNode') targetHandle = 'textInput';
                  else if (targetNode.type === 'imageNode') targetHandle = 'imageInput';
                  else if (targetNode.type === 'videoNode') targetHandle = 'videoInput';
                  else if (targetNode.type === 'audioNode') targetHandle = 'audioInput2';
                  else if (targetNode.type === 'concatNode') targetHandle = 'concatInput';
                }

                let edgeColor = getEdgeColor(sourceHandle, targetHandle, sourceNode, targetNode);

                return {
                  id: `e-${source}-${target}`,
                  source,
                  target,
                  sourceHandle,
                  targetHandle,
                  style: edgeStyles[edgeColor],
                };
              });

              setEdges(newEdges);
            }
          }
          setIsChatLoading(false);
        } else if (status === "failed") {
          clearInterval(interval);
          throw new Error("Architect processing failed");
        }
      } catch (error) {
        clearInterval(interval);
        console.error("Polling error:", error);
        const errorMessage = {
          role: "agent",
          content: "Sorry, I encountered an error while updating your workflow.",
          timestamp: new Date().toISOString()
        };
        setChatMessages((prev) => [...prev, errorMessage]);
        setIsChatLoading(false);
      }
    }, 3000);
  };

  const handleSendMessage = async (content) => {
    const newMessage = {
      role: "user",
      content,
      timestamp: new Date().toISOString()
    };
    setChatMessages((prev) => [...prev, newMessage]);

    setIsChatLoading(true);
    try {
      const savedWorkflowId = await handleSaveWorkFlow();

      const history = chatMessages.map(msg => ({
        role: msg.role === "agent" ? "assistant" : msg.role,
        content: msg.content
      }));

      const response = await axios.post("/api/workflow/architect", {
        prompt: content,
        workflow_id: savedWorkflowId,
        history: history,
      });

      const { request_id, status } = response.data;
      pollArchitectStatus(request_id);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "agent",
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date().toISOString()
      };
      setChatMessages((prev) => [...prev, errorMessage]);
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    onConnectRef.current = onConnect;
  }, [onConnect]);

  const onEdgeClick = (event, edge) => {
    event.stopPropagation();
    setEdges(previous => previous.filter(item => item.id !== edge.id));
  };

  const buildWorkflowPayload = () => {
    const nodeData = nodes.map((node) => {
      if (['characterNode','sceneNode'].includes(node.type)) {
        const data = node.data;
        const form = data[node.type === 'characterNode' ? 'characterForm' : 'sceneForm'] || {};
        return {
          id:node.id, category:node.type.replace('Node',''), model:form.modelId || 'image-generation-preview',
          position:node.position, parentNode:node.parentNode, style:node.style, label:data.label,
          input_params:{...form,reference_assets:getGroupReferences(node.id,nodes,edges)}, params:{...form,reference_assets:getGroupReferences(node.id,nodes,edges)},
          output_params:{resultUrl:data.resultUrl || null,outputs:data.outputs || []},
          inputs:edges.filter(edge => edge.target === node.id).map(edge => edge.source),
          designData:{characterForm:data.characterForm,sceneForm:data.sceneForm,characterSheet:data.characterSheet,sceneSheet:data.sceneSheet,generatedForm:data.generatedForm,generationPrompt:data.generationPrompt,collapsed:data.collapsed},
        };
      }

      const connectedEdges = edges.filter((e) => e.target === node.id);
      const inputNodes = connectedEdges.map((e) => e.source);
      const category = node.type === "groupNode" ? "group" : node.type === "textNode" ? "text" : node.type === "imageNode" ? "image" : node.type === "videoNode" ? "video" : node.type === "apiNode" ? "api" : node.type === "audioNode" ? "audio" : "utility";
      const isVideoCombiner = node.type === "vidConcatNode";
      const model = node.data?.selectedModel?.id ? node.data?.selectedModel?.id : category === "utility" ? (isVideoCombiner ? "video-combiner" : "prompt-concatenator") : `${category}-passthrough`;
      const modelSchema = nodeSchemas?.categories?.[category]?.models?.[model]?.input_schema?.schemas?.input_data;
      const inputSchema = modelSchema?.properties || {};
      const wavespeedSchema = nodeSchemas?.categories?.api?.models?.[model]?.input_schema;
      const concatSchema = nodeSchemas?.categories?.utility?.models?.["prompt-concatenator"]?.input_schema;
      const videoCombinerSchema = nodeSchemas?.categories?.utility?.models?.["video-combiner"]?.input_schema?.schemas?.input_data?.properties;
      const formValues = node.data?.formValues || {};

      let dynamicPrompt = "";

      if (node.type === "concatNode") {
        const promptConnections = connectedEdges.filter((e) =>
          ["concatInput"].includes(e.targetHandle)
        );
        dynamicPrompt = promptConnections.length > 0
          ? promptConnections.map((conn) => `{{ ${conn.source}.outputs[0].value }}`)
          : [];
      } else {
        const promptConnections = connectedEdges.filter((e) =>
          ["textInput", "imageInput", "videoInput", "audioInput2", "apiInput"].includes(e.targetHandle)
        );
        dynamicPrompt = promptConnections.length > 0
          ? `{{ ${promptConnections[0].source}.outputs[0].value }}`
          : "";
      }

      const systemPromptConnections = connectedEdges.filter((e) =>
        e.targetHandle === "textInput4"
      );
      const dynamicSystemPrompt =
        systemPromptConnections.length > 0
          ? `{{ ${systemPromptConnections[0].source}.outputs[0].value }}`
          : formValues?.system_prompt || null;

      const imageListConnections = connectedEdges.filter((e) =>
        ["textInput3", "imageInput2", "videoInput6", "apiInput2"].includes(e.targetHandle)
      );

      const dynamicImagesList =
        imageListConnections.length > 0
          ? [...(node.data?.linkedInputs?.images_list?.manual || []), ...imageListConnections.map(
            (conn) => `{{ ${conn.source}.outputs[0].value }}`
          )]
          : formValues?.images_list || []; // || [node.data?.outputs?.[0]?.value] 

      const imageUrlConnections = connectedEdges.filter((e) =>
        ["textInput2", "videoInput2", "imageInput3", "audioInput3", "apiInput3"].includes(e.targetHandle)
      );

      const videoUrlConnections = connectedEdges.filter((e) =>
        ["videoInput4", "audioInput4"].includes(e.targetHandle)
      );

      const videoListConnections = connectedEdges.filter((e) =>
        e.targetHandle === "videoInput7"
      );

      const audioListConnections = connectedEdges.filter((e) =>
        e.targetHandle === "videoInput8"
      );

      const dynamicVideosKey = formValues?.video_files ? "video_files" : "videos_list";
      const dynamicVideosList =
        videoListConnections.length > 0
          ? [...(node.data?.linkedInputs?.[dynamicVideosKey]?.manual || []), ...videoListConnections.map((conn) => `{{ ${conn.source}.outputs[0].value }}`)]
          : formValues[dynamicVideosKey] || [];

      const dynamicAudiosKey = formValues?.audio_files ? "audio_files" : "audios_list";
      const dynamicAudiosList =
        audioListConnections.length > 0
          ? [...(node.data?.linkedInputs?.[dynamicAudiosKey]?.manual || []), ...audioListConnections.map((conn) => `{{ ${conn.source}.outputs[0].value }}`)]
          : formValues[dynamicAudiosKey] || [];

      const audioUrlConnections = connectedEdges.filter((e) =>
        ["audioInput", "videoInput5"].includes(e.targetHandle)
      );

      const dynamicImageUrl =
        imageUrlConnections.length > 0
          ? `{{ ${imageUrlConnections[0].source}.outputs[0].value }}`
          : formValues?.image_url || null;

      const lastImageConnections = connectedEdges.filter(
        (e) => e.targetHandle === "videoInput3"
      );

      const dynamicVideoUrl =
        videoUrlConnections.length > 0
          ? `{{ ${videoUrlConnections[0].source}.outputs[0].value }}`
          : formValues?.video_url || null;

      const dynamicAudioUrl =
        audioUrlConnections.length > 0
          ? `{{ ${audioUrlConnections[0].source}.outputs[0].value }}`
          : formValues?.audio_url || null;

      const dynamicLastImage =
        lastImageConnections.length > 0
          ? `{{ ${lastImageConnections[0].source}.outputs[0].value }}`
          : formValues?.last_image || null; // || node.data?.outputs?.[0]?.value 

      const localSources = {
        ...formValues,
        prompt: dynamicPrompt ? dynamicPrompt : formValues?.prompt,
        system_prompt: dynamicSystemPrompt,
        images_list: dynamicImagesList,
        images: dynamicImagesList,
        image_urls: dynamicImagesList,
        image_url: dynamicImageUrl,
        video_url: dynamicVideoUrl,
        audio_url: dynamicAudioUrl,
        image: dynamicImageUrl,
        last_image: dynamicLastImage,
        videos_list: dynamicVideosList,
        video_files: dynamicVideosList,
        audios_list: dynamicAudiosList,
        audio_files: dynamicAudiosList,
      };

      if (node.type === "apiNode") {
        const listFields = ["images", "image_urls", "images_list"];
        connectedEdges.forEach((edge) => {
          if (edge.target === node.id) {
            const val = `{{ ${edge.source}.outputs[0].value }}`;
            const isList = listFields.includes(edge.targetHandle) || wavespeedSchema?.[edge.targetHandle]?.type === "array";

            if (isList) {
              if (!Array.isArray(localSources[edge.targetHandle])) {
                localSources[edge.targetHandle] = [];
              }
              if (!localSources[edge.targetHandle].includes(val)) {
                localSources[edge.targetHandle].push(val);
              }
            } else {
              localSources[edge.targetHandle] = val;
            }
          }
        });
      }

      let params = {};
      const input_params = {...formValues};
      let output_params = {};

      if (node.type === "apiNode") {
        for (const [key, meta] of Object.entries(wavespeedSchema)) {
          if (localSources[key] !== undefined && localSources[key] !== null) {
            params[key] = localSources[key];
          } else {
            params[key] = meta.default ?? null;
          }
        }

        const filteredInputParams = Object.fromEntries(
          Object.entries(input_params).filter(([key]) =>
            key !== "model_url" && key !== "api_key" && key !== "model_name" && key !== "model_type"
          )
        );

        params["params"] = filteredInputParams;

        for (const [key, meta] of Object.entries(filteredInputParams)) {
          if (localSources[key] !== undefined && localSources[key] !== null) {
            params.params[key] = localSources[key];
          } else {
            params.params[key] = meta?.default ?? null;
          }
        }
      } else if (node.type === "vidConcatNode") {
        const vcSchema = videoCombinerSchema || { videos_list: { default: [] }, aspect_ratio: { default: "auto" } };
        for (const [key, meta] of Object.entries(vcSchema)) {
          if (localSources[key] !== undefined && localSources[key] !== null) {
            params[key] = localSources[key];
          } else {
            params[key] = meta.default ?? null;
          }
        }
      } else if (node.type === "concatNode") {
        for (const [key, meta] of Object.entries(concatSchema || {})) {
          if (localSources[key] !== undefined && localSources[key] !== null) {
            params[key] = localSources[key];
          } else {
            params[key] = meta.default ?? null;
          }
        }
      } else {
        for (const [key, meta] of Object.entries(inputSchema)) {
          if (localSources[key] !== undefined && localSources[key] !== null) {
            params[key] = localSources[key];
          } else {
            params[key] = meta.default ?? null;
          }
        }
      }

      const groupReferences = getGroupReferences(node.id,nodes,edges);
      if (groupReferences.length || input_params.reference_assets) {
        params.reference_assets = [...(node.data?.formValues?.reference_assets || []).filter(ref=>!ref.linked), ...groupReferences];
        input_params.reference_assets = params.reference_assets;
      }

      if (node.type === "textNode") {
        output_params = {
          resultUrl: node.data?.resultUrl || "",
          outputs: node.data?.outputs || [],
        }
      } else if (["imageNode", "videoNode", "audioNode", "apiNode", "concatNode", "vidConcatNode"].includes(node.type)) {
        output_params = {
          resultUrl: node.data?.resultUrl || null,
          outputs: node.data?.outputs || [],
        }
      }

      return {
        id: node.id,
        category,
        model,
        input_params,
        output_params,
        params,
        position: node.position,
        parentNode:node.parentNode, style:node.style, label:node.data?.label, linkedInputs:node.data?.linkedInputs, localFormValues:node.data?.formValues,
        ...(inputNodes.length > 0 ? { inputs: inputNodes } : {}),
      };
    });

    return {
      workflow_id: interactionMode ? workflowId || null : null,
      source_workflow_id: !interactionMode ? workflowId : null,
      name: workflowName || "Untitled",
      edges: edges,
      viewport: getViewport(),
      data: {
        nodes: nodeData
      },
      is_vadoo: false,
      category: workflowCategory,
    };
  };

  const handleSaveWorkFlow = async () => {
    if (!interactionMode) return;
    const workflowPayload = buildWorkflowPayload();

    try {
      const response = await axios.post("/api/workflow/create", workflowPayload);
      toast.success("Saved in this browser");
      setDropDown(0);
      setWorkflowIds(response.data.workflow_id, runId);
      setWorkflowId(response.data.workflow_id);
      return response.data.workflow_id;
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(`Failed: ${error.response.data.detail || "Server error"}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const handleDuplicateWorkflow = async () => {
    if (interactionMode) return;
    setIsRunning(3);
    const workflowPayload = buildWorkflowPayload();

    try {
      const response = await axios.post("/api/workflow/create", workflowPayload);
      console.log("Workflow created:", response.data);
      window.location.href = `/workflow/${response.data.workflow_id}`;
    } catch (error) {
      console.log(error);
      setIsRunning(0);
      if (error.response) {
        toast.error(`Failed: ${error.response.data.detail || "Server error"}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      handleSaveWorkFlow();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleSaveWorkFlow]);

  const pollRunIdStatus = (runId) => {
    const interval = setInterval(() => {
      axios.get(`/api/workflow/run/${runId}/status`)
        .then((response) => {
          const runData = response.data;
          const nodesStatus = runData?.nodes || {};
          setWorkflowIds(workflowId, runId);

          Object.entries(nodesStatus).forEach(([id, runs]) => {
            if (!runs || runs.length === 0) return;

            const latestRun = runs[runs.length - 1];
            const status = latestRun?.status;
            const result = latestRun?.result;
            const outputs = result?.outputs || [];
            const first = outputs?.[0]?.value || "";

            if (status === "processing" || status === "running") {
              setLoadingNodes((prev) => ({ ...prev, [id]: true }));
              return;
            } else {
              setLoadingNodes((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
              });
            }

            if (status === "succeeded" || status === "completed") {
              setLoadingNodes((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
              });

              setNodes((prevNodes) => {
                let updatedNodes = prevNodes.map((node) => {
                  const nodeIdMatch = id.toLowerCase().replace(/\s+/g, '') === node.id.toLowerCase().replace(/\s+/g, '');
                  if (!nodeIdMatch || !result) return node;

                  if (["textNode", "imageNode", "videoNode", "audioNode", "concatNode", "apiNode", "vidConcatNode"].includes(node.type)) {
                    const currentHistory = node.data.outputHistory || [];
                    const isAlreadyInHistory = currentHistory.some(h => h.result?.id === result.id);
                    const newHistory = isAlreadyInHistory
                      ? currentHistory.map(h => h.result?.id === result.id ? latestRun : h)
                      : [...currentHistory, latestRun];

                    return {
                      ...node,
                      data: {
                        ...node.data,
                        outputs,
                        resultUrl: first,
                        isLoading: false,
                        errorMsg: null,
                        outputHistory: newHistory,
                      },
                    };
                  }

                  return node;
                });

                updatedNodes = updatedNodes.map((node) => {
                  if (node.id === id) {
                    return node;
                  }
                  return node;
                });

                return updatedNodes;
              });

              onDataChange(id, { outputs, resultUrl: first, isLoading: false });
            } else if (status === "failed") {
              setLoadingNodes((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
              });
              setNodes((prevNodes) => prevNodes.map(n => {
                if (n.id === id) {
                  return { ...n, data: { ...n.data, isLoading: false, errorMsg: "Generation Failed" } };
                }
                return n;
              }));
            }
          });

          const allCompleted = Object.values(nodesStatus).every(
            (nodeRuns) => nodeRuns[0]?.status === "succeeded"
          );

          const anyFailed = Object.values(nodesStatus).some(
            (nodeRuns) => nodeRuns[0]?.status === "failed"
          );
          if (allCompleted) {
            clearInterval(interval);
            setLoadingNodes({});
            setIsRunning(0);
            onGenerationEnd?.();
            onGenerationComplete?.({ type: "workflow" });
          } else if (anyFailed) {
            const message = "Workflow failed on some nodes";
            if (onGenerationError) onGenerationError(message);
            else toast.error(message);
            clearInterval(interval);
            setLoadingNodes({});
            setIsRunning(0);
            onGenerationEnd?.();
          }
          console.log("run", runData);
        })
        .catch((error) => {
          console.log(error);
          clearInterval(interval);
          setLoadingNodes({});
          setIsRunning(0);
          onGenerationEnd?.();
          const message = "Failed to get workflow status";
          if (onGenerationError) onGenerationError(message);
          else toast.error(message);
        });
    }, 3000);
  };

  const handleRunWorkflow = async () => {
    if (!interactionMode) return;
    onGenerationStart?.();
    try {
      setIsRunning(1);
      setLoadingNodes({});
      const savedWorkflowId = await handleSaveWorkFlow();

      const response = await axios.post(`/api/workflow/${workflowId}/run`, {
        cost: totalWorkflowCost
      });
      console.log("run data:", response.data);
      const newRunId = response.data.run_id;
      setRunId(newRunId);
      setWorkflowIds(workflowId, newRunId);
      pollRunIdStatus(newRunId);
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(`Failed: ${error.response.data.detail || "Server error"}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
      setLoadingNodes({});
      setIsRunning(0);
      onGenerationEnd?.();
    }
  };

  const handlePublishWorkflow = async () => {
    if (!interactionMode) return;
    try {
      setIsRunning(2);
      const savedWorkflowId = await handleSaveWorkFlow();

      const response = await axios.post(`/api/workflow/workflow/${savedWorkflowId}/publish`, {
        publish: !publishWorkflow
      });
      setIsRunning(0);
      toast.success(response.data.publish ? "Published successfully" : "Unpublished successfully");
      setPublishWorkflow(response.data.publish);
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(`Failed: ${error.response.data.detail || "Server error"}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
      setLoadingNodes({});
      setIsRunning(0);
    }
  };

  const handleTemplatePublish = async () => {
    if (!interactionMode) return;
    try {
      setIsRunning(4);
      const savedWorkflowId = await handleSaveWorkFlow();

      const response = await axios.post(`/api/workflow/workflow/${savedWorkflowId}/template`, {
        is_template: !template.isPublishedTemplate
      });
      const is_template = response.data.is_template;
      setIsRunning(0);
      toast.success(is_template ? "Published successfully" : "Unpublished successfully");
      setTemplate(prev => ({ ...prev, isPublishedTemplate: is_template }));
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(`Failed: ${error.response.data.detail || "Server error"}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
      setIsRunning(0);
    }
  };

  const handleCategorySave = async () => {
    if (!workflowId) {
      toast.error("Workflow ID not found. Save the workflow first.");
      return;
    }

    try {
      const response = await axios.post(`/api/workflow/update-category/${workflowId}`, {
        category: categoryInput
      });
      console.log("Category updated:", response.data);
      setWorkflowCategory(categoryInput);
      setIsCategoryPopupOpen(false);
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      if (error.response) {
        toast.error(`Failed: ${error.response.data.detail || "Server error"}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const runNodeFromFlow = (nodeId) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, triggerRun: true } }
          : n
      )
    );
  };

  const runNodeInputsFromFlow = (nodeId) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, triggerInputs: true } }
          : n
      )
    );
  };

  const getNextId = (type) => {
    const baseType = type.replace("Node","");
    const existingIds = nodes.map(n => n.id);
    let count = 1;
    while (existingIds.includes(`${baseType}${count}`)) {
      count++;
    }
    return `${baseType}${count}`;
  };

  const duplicateNode = useCallback((nodeId) => {
    const nodeToDuplicate = nodes.find(n => n.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNodeId = getNextId(nodeToDuplicate.type);
    const newNode = {
      ...nodeToDuplicate,
      id: newNodeId,
      position: {
        x: nodeToDuplicate.position.x + 40,
        y: nodeToDuplicate.position.y + 40,
      },
      selected: true,
      data: {
        ...nodeToDuplicate.data,
      }
    };

    setNodes((nds) => nds.map(n => ({ ...n, selected: false })).concat(newNode));
    toast.success(`Duplicated node ${nodeId} to ${newNodeId}`);
  }, [nodes, setNodes]);

  const rangeHighlightedIds=new Set(nodes.filter(node=>node.type==='groupNode')
    .flatMap(group=>getGroupMembers(group.id,nodes).map(node=>node.id)));
  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    // Group membership must not clamp large design cards to the group bounds.
    extent: node.parentNode ? undefined : node.extent,
    zIndex:node.type==='groupNode'?-1001:Math.max(1,node.zIndex||0),
    className:[node.className,rangeHighlightedIds.has(node.id)?'group-range-highlight':''].filter(Boolean).join(' '),
    data: {
      ...node.data,
      nodeSchemas,
      groupReferences:getGroupReferences(node.id,nodes,edges),
      ...(['characterNode','sceneNode'].includes(node.type) ? {designInputs:getDesignInputs(node.id,nodes,edges)} : {}),
      onDataChange,
      onTextOutputClick: event => {
        if(!interactionMode)return;
        event.stopPropagation();
        setEdgePicker({sourceNodeId:node.id,sourceHandleId:'textOutput',handleColor:'blue',isOutput:true,cursorPos:{x:event.clientX,y:event.clientY}});
      },
      handleSaveWorkFlow,
      isLoading: loadingNodes[node.id] || false,
      activeHandleColor,
      triggerRun: node.data.triggerRun || false,
      triggerInputs: node.data.triggerInputs || false,
      runNodeFromFlow,
      runNodeInputsFromFlow,
      runId,
      duplicateNode,
      setNodes,
      setEdges,
      handleTypes: {
        groupOutput: 'reference', groupReferenceInput: 'reference',
        unifiedInput: "white", designPromptInput:"blue", designImageInput:"green",
        ...(node.type === 'apiNode' ? Object.keys(node.data?.formValues || {}).reduce((acc, key) => ({ ...acc, [key]: 'white' }), {}) : {}),
        concatInput: "blue", concatOutput: "blue",
        apiInput: "blue", apiInput2: "green", apiInput3: "green",
        apiOutput: (() => {
          if (node.type !== 'apiNode') return "green";
          const output = node.data?.outputs?.[0];
          const modelType = node.data?.formValues?.model_type;
          if (output?.type === 'text' || modelType === 'chat') return "blue";
          if (output?.type === 'video_url' || modelType === 'video') return "orange";
          if (output?.type === 'audio_url' || modelType === 'audio') return "yellow";
          return "green";
        })(),
        textInput: "blue", textInput2: "green", textInput3: "green", textInput4: "blue", textOutput: "blue",
        imageInput: "blue", imageInput2: "green", imageInput3: "green", imageOutput: "green",
        videoInput: "blue", videoInput2: "green", videoInput3: "green", videoInput4: "orange", videoInput5: "yellow", videoInput6: "green", videoInput7: "orange", videoInput8: "yellow", videoOutput: "orange",
        audioInput: "yellow", audioInput2: "blue", audioInput3: "green", audioInput4: "orange", audioOutput: "yellow",
      }
    },
  }));

  const isValidConnection = (connection) => {
    if (connection.targetHandle === 'groupReferenceInput') return connectionOptions(connection,nodes).length > 0;
    if (connection.targetHandle === 'unifiedInput') {
      return connectionOptions(connection, nodes).some(([handle]) => isValidConnection({...connection,targetHandle:handle}));
    }
    const { source, target, sourceHandle, targetHandle } = connection;
    if (!sourceHandle || !targetHandle) return false;
    if (source === target) return false;

    const sourceNode = nodesWithHandlers.find(n => n.id === source);
    const targetNode = nodesWithHandlers.find(n => n.id === target);

    if (!sourceNode || !targetNode) return false;

    const sourceType = sourceNode?.data?.handleTypes?.[sourceHandle];
    const targetType = targetNode?.data?.handleTypes?.[targetHandle];

    if (!sourceType || !targetType || (sourceType !== targetType && targetType !== 'white')) return false;

    const isSourceOutput = sourceHandle.toLowerCase().includes("output");
    const isTargetInput = targetHandle.toLowerCase().includes("input") || (targetNode.type === "apiNode" && targetHandle !== "apiOutput");
    if (!isSourceOutput || !isTargetInput) return false;

    const formValues = targetNode.data?.formValues || {};
    let validHandles = [];

    switch (targetNode.type) {
      case "characterNode":
      case "sceneNode":
        validHandles = ['designPromptInput','designImageInput'];
        break;
      case "textNode":
        const hasTextPrompt = "prompt" in formValues
        const hasTextImageUrl = "image_url" in formValues;
        const hasTextImagesList = "images_list" in formValues;
        const hasTextSystemPrompt = "system_prompt" in formValues;
        validHandles = [
          hasTextPrompt && "textInput",
          hasTextImageUrl && "textInput2",
          hasTextImagesList && "textInput3",
          hasTextSystemPrompt && "textInput4",
        ].filter(Boolean);
        break;

      case "imageNode":
        const hasImagePrompt = "prompt" in formValues;
        const hasImagesList = "images_list" in formValues;
        const hasImageImageUrl = "image_url" in formValues;
        validHandles = [
          hasImagePrompt && "imageInput",
          hasImagesList && "imageInput2",
          hasImageImageUrl && "imageInput3",
        ].filter(Boolean);
        break;

      case "videoNode":
        const hasVideoPrompt = "prompt" in formValues;
        const hasVideoImagesList = "images_list" in formValues;
        const hasVideoImageUrl = "image_url" in formValues;
        const hasLastImage = "last_image" in formValues;
        const hasVideoUrl = "video_url" in formValues;
        const hasVideoAudioUrl = "audio_url" in formValues;
        const hasVideosList = "videos_list" in formValues || "video_files" in formValues;
        const hasAudiosList = "audios_list" in formValues || "audio_files" in formValues;
        validHandles = [
          hasVideoPrompt && "videoInput",
          hasVideoImageUrl && "videoInput2",
          hasLastImage && "videoInput3",
          hasVideoUrl && "videoInput4",
          hasVideoAudioUrl && "videoInput5",
          hasVideoImagesList && "videoInput6",
          hasVideosList && "videoInput7",
          hasAudiosList && "videoInput8",
        ].filter(Boolean);
        break;

      case "audioNode":
        const hasAudioUrl = "audio_url" in formValues;
        const hasAudioPrompt = "prompt" in formValues;
        const hasAudioImageUrl = "image_url" in formValues;
        const hasAudioVideoUrl = "video_url" in formValues;
        validHandles = [
          hasAudioUrl && "audioInput",
          hasAudioPrompt && "audioInput2",
          hasAudioImageUrl && "audioInput3",
          hasAudioVideoUrl && "audioInput4",
        ].filter(Boolean);
        break;

      case "apiNode":
        const apiInputs = Object.keys(targetNode.data?.formValues || {});
        const exposedHandles = targetNode.data?.exposedHandles || [];
        validHandles = apiInputs.filter(k => k !== 'apiOutput' && exposedHandles.includes(k));
        break;

      case "vidConcatNode":
        validHandles = ["videoInput7"];
        break;

      default:
        return true;
    }

    if (!validHandles.includes(targetHandle)) {
      return false;
    }

    return true;
  };

  const onConnectStart = (event, params) => {
    const node = nodesWithHandlers.find(n => n.id === params.nodeId);
    const handleColor = node?.data?.handleTypes?.[params.handleId];
    setActiveHandleColor(handleColor);

    const isOutput = params.handleId.toLowerCase().includes("output");
    setDraggedEdgeInfo({
      nodeId: params.nodeId,
      handleId: params.handleId,
      handleColor: handleColor,
      isOutput: isOutput,
    });
  };

  const onConnectEnd = useCallback((event) => {
    setActiveHandleColor(null);

    if (draggedEdgeInfo && !connectionMadeRef.current) {
      const cursorX = event?.clientX || mousePos.x;
      const cursorY = event?.clientY || mousePos.y;

      setEdgePicker({
        sourceNodeId: draggedEdgeInfo.isOutput ? draggedEdgeInfo.nodeId : null,
        targetNodeId: draggedEdgeInfo.isOutput ? null : draggedEdgeInfo.nodeId,
        sourceHandleId: draggedEdgeInfo.isOutput ? draggedEdgeInfo.handleId : null,
        targetHandleId: draggedEdgeInfo.isOutput ? null : draggedEdgeInfo.handleId,
        handleColor: draggedEdgeInfo.handleColor,
        isOutput: draggedEdgeInfo.isOutput,
        cursorPos: { x: cursorX, y: cursorY }
      });
    }

    setDraggedEdgeInfo(null);
    connectionMadeRef.current = false;
  }, [draggedEdgeInfo, nodesWithHandlers, mousePos]);

  const handleSelectNodeFromEdgePicker = (nodeType, position = null, initialData = {}) => {
    if (!edgePicker) return;
    const newNodeId = getNextId(nodeType);

    const handleTypesMap = {
      designPromptInput:"blue", designImageInput:"green",
      concatInput: "blue", concatOutput: "blue",
      apiInput: "blue", apiInput2: "green", apiInput3: "green", apiOutput: "green",
      textInput: "blue", textInput2: "green", textInput3: "green", textInput4: "blue", textOutput: "blue",
      imageInput: "blue", imageInput2: "green", imageInput3: "green", imageOutput: "green",
      videoInput: "blue", videoInput2: "green", videoInput3: "green", videoInput4: "orange", videoInput5: "yellow", videoInput6: "green", videoInput7: "orange", videoInput8: "yellow", videoOutput: "orange",
      audioInput: "yellow", audioInput2: "blue", audioInput3: "green", audioInput4: "orange", audioOutput: "yellow",
    };

    const flowPosition = screenToFlowPosition({
      x: edgePicker.cursorPos.x,
      y: edgePicker.cursorPos.y,
    });

    const newNode = {
      id: newNodeId,
      type: nodeType,
      position: position || {
        x: flowPosition.x - 160,
        y: flowPosition.y - 100,
      },
      data: { ...initialData },
    };

    setNodes((prev) => [...prev, newNode]);
    let connection;

    if (edgePicker.isOutput) {
      const nodeTypeToHandles = {
        characterNode: ["designPromptInput", "designImageInput"],
        sceneNode: ["designPromptInput", "designImageInput"],
        textNode: ["textInput", "textInput2", "textInput3", "textInput4"],
        imageNode: ["imageInput", "imageInput2", "imageInput3"],
        videoNode: ["videoInput", "videoInput2", "videoInput3", "videoInput4", "videoInput5", "videoInput6", "videoInput7", "videoInput8"],
        audioNode: ["audioInput", "audioInput2", "audioInput3", "audioInput4"],
        apiNode: ["apiInput", "apiInput2", "apiInput3"],
        concatNode: ["concatInput"],
        vidConcatNode: ["videoInput7"],
      };

      const sourceHandleColor = handleTypesMap[edgePicker.sourceHandleId];
      const compatibleHandles = nodeTypeToHandles[nodeType] || [];
      const targetHandle = edgePicker.sourceHandleId === 'groupOutput' ? 'groupReferenceInput' : compatibleHandles.find(h =>
        handleTypesMap[h] === sourceHandleColor
      );

      if (targetHandle) {
        connection = {
          source: edgePicker.sourceNodeId,
          target: newNodeId,
          sourceHandle: edgePicker.sourceHandleId,
          targetHandle: ['textNode','imageNode','videoNode','audioNode','apiNode','characterNode','sceneNode'].includes(nodeType) ? 'unifiedInput' : targetHandle,
        };
      }
    } else {
      const nodeTypeToHandles = {
        characterNode: ["imageOutput"],
        sceneNode: ["imageOutput"],
        textNode: ["textOutput"],
        imageNode: ["imageOutput"],
        videoNode: ["videoOutput"],
        audioNode: ["audioOutput"],
        apiNode: ["apiOutput"],
        concatNode: ["concatOutput"],
        vidConcatNode: ["videoOutput"],
      };

      const targetHandleColor = handleTypesMap[edgePicker.targetHandleId];
      const compatibleHandles = nodeTypeToHandles[nodeType] || [];
      const sourceHandle = compatibleHandles.find(h =>
        edgePicker.targetHandleId === 'unifiedInput' || handleTypesMap[h] === targetHandleColor
      );

      if (sourceHandle) {
        connection = {
          source: newNodeId,
          target: edgePicker.targetNodeId,
          sourceHandle: sourceHandle,
          targetHandle: edgePicker.targetHandleId,
        };
      }
    }

    if (connection) {
      setTimeout(() => {
        connectionMadeRef.current = false;
        onConnectRef.current(connection);
      }, 100);
    }

    setEdgePicker(null);
    setDraggedEdgeInfo(null);
  };

  const getCompatibleNodeTypes = (handleColor, isOutput) => {
    if (handleColor === 'reference' && isOutput) return ['characterNode','sceneNode','textNode','imageNode','videoNode','audioNode'];
    if (handleColor === 'white') {
      const target=nodes.find(node=>node.id===edgePicker?.targetNodeId);
      const accepted=getInputPorts(target).map(port=>port[2]);
      if(accepted.includes('reference')) return ['textNode','imageNode','videoNode','audioNode','characterNode','sceneNode','vidConcatNode'];
      return ['textNode','imageNode','videoNode','audioNode','characterNode','sceneNode','vidConcatNode'].filter(type=>accepted.includes(
        ['characterNode','sceneNode'].includes(type)?'image':type==='vidConcatNode'?'video':type.replace('Node','')));
    }
    if (isOutput) {
      const compatibilityMap = {
        blue: ['characterNode', 'sceneNode', 'textNode', 'imageNode', 'videoNode', 'audioNode'],
        green: ['characterNode', 'sceneNode', 'imageNode', 'videoNode'],
        orange: ['videoNode', 'vidConcatNode'],
        yellow: ['audioNode', 'videoNode']
      };
      return compatibilityMap[handleColor] || [];
    } else {
      const compatibilityMap = {
        blue: ['textNode'],
        green: ['characterNode', 'sceneNode', 'imageNode'],
        orange: ['videoNode', 'vidConcatNode'],
        yellow: ['audioNode']
      };
      return compatibilityMap[handleColor] || [];
    }
  };

  const paneSelection = useRef([]);
  const handlePress = useRef(null);
  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      position,
      selectedIds: getNodes().filter(node=>node.selected).map(node=>node.id),
    });
  }, [screenToFlowPosition, getNodes]);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const getNewNodePosition = (lastNode) => {
    if (!lastNode) return { x: 250, y: 250 };

    const NODE_WIDTH = 320;
    const NODE_HEIGHT = 300;
    const GAP = 10;
    const MAX_ROW_WIDTH = 1200;

    // const offsetX = Math.random() * 200 - 100;
    // const offsetY = Math.random() * 200 - 100;

    // return {
    //   x: lastNode.position.x + offsetX,
    //   y: lastNode.position.y + offsetY
    // };
    const nextX = lastNode.position.x + NODE_WIDTH + GAP;

    if (nextX > MAX_ROW_WIDTH) {
      return {
        x: 250,
        y: lastNode.position.y + NODE_HEIGHT + GAP,
      };
    }

    return {
      x: nextX,
      y: lastNode.position.y,
    };
  };

  const addNode = (nodeType, position = null, initialData = {}) => {
    const isEmptyCanvas = nodes.length === 0;
    const id = getNextId(nodeType);
    let nodePosition;
    if (position) {
      nodePosition = position;
    } else {
      const lastNode = nodes[nodes.length - 1];
      nodePosition = getNewNodePosition(lastNode);
    }

    const newNode = {
      id,
      type: nodeType,
      position: nodePosition,
      data: { ...initialData },
    };

    setNodes((prev) => [...prev, newNode]);
    setDropDown(0);
    setContextMenu(null);
    if (!position) {
      setTimeout(() => fitView({ padding: isEmptyCanvas ? 1.2 : 0.8, duration: 500, minZoom: isEmptyCanvas ? 0.15 : 0.2 }), 0);
    }
  };

  const uploadMenuResource = async (file, menuPosition = contextMenu.position) => {
    const position={...menuPosition};
    const kind=/\.txt$/i.test(file.name)?'text':file.type.split('/')[0];
    if(!['text','image','video','audio'].includes(kind))throw new Error('Choose an image, video, audio or TXT file.');
    if(file.size>2*1024*1024)throw new Error('Local preview supports files up to 2 MB.');
    const value=kind==='text'?await file.text():await uploadAsset(file);
    const model=getModelObjStatic(kind,`${kind}-passthrough`,nodeSchemas);
    addNode(`${kind}Node`,position,{selectedModel:model,formValues:{[kind==='text'?'prompt':`${kind}_url`]:value},outputs:[{type:kind==='text'?'text':`${kind}_url`,value}],resultUrl:value});
  };

  const addMenuNode = (type, menu = contextMenu) => {
    if(type==='characterNode'){addNode(type,menu.position,{characterForm:{name:'',prompt:'',paletteRows:[{id:crypto.randomUUID(),attribute:'',color:'#688ca7'}]}});return;}
    if(type==='sceneNode'){addNode(type,menu.position,{sceneForm:{name:'',prompt:'',paletteRows:[{id:crypto.randomUUID(),attribute:'',color:'#688ca7'}]}});return;}
    if(type==='groupNode') {
      const members=nodes.filter(node=>menu.selectedIds?.includes(node.id)&&!node.parentNode&&node.type!=='groupNode');
      const x=members.length?Math.min(...members.map(node=>node.position.x))-28:menu.position.x;
      const y=members.length?Math.min(...members.map(node=>node.position.y))-56:menu.position.y;
      const width=members.length?Math.max(...members.map(node=>node.position.x+(node.width||320)))-x+28:520;
      const height=members.length?Math.max(...members.map(node=>node.position.y+(node.height||320)))-y+28:360;
      const id=getNextId('groupNode');
      setNodes(previous=>[{id,type:'groupNode',position:{x,y},style:{width,height},data:{label:'Group'},selected:true},...previous.map(node=>members.some(member=>member.id===node.id)?{...node,selected:true,parentNode:id,extent:undefined,position:{x:node.position.x-x,y:node.position.y-y}}:{...node,selected:false})]);
      setContextMenu(null);return;
    }
    const category=type.replace('Node','');
    const model=type==='vidConcatNode'?getModelObjStatic('utility','video-combiner',nodeSchemas):getModelObjStatic(category,`${category}-${type==='textNode'?'passthrough':'generation-preview'}`,nodeSchemas);
    addNode(type,menu.position,{selectedModel:model,formValues:{}});
  };

  const onKeyDown = useCallback((e) => {
    if (e.target.closest("input, textarea, select, [contenteditable=true]")) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      setNodes((nds) => {
        const selectedGroups = new Set(nds.filter(n=>n.selected&&n.type==='groupNode').map(n=>n.id));
        // Group selection also highlights its children; deleting the frame must preserve them.
        const deletedIds = nds.filter(n=>n.selected&&!selectedGroups.has(n.parentNode)).map(n=>n.id);
        const remainingNodes = nds.filter(n=>!deletedIds.includes(n.id)).map(n=>{
          const parent=nds.find(group=>group.id===n.parentNode&&deletedIds.includes(group.id));
          return parent?{...n,selected:false,parentNode:undefined,extent:undefined,position:{x:n.position.x+parent.position.x,y:n.position.y+parent.position.y}}:n;
        });
        setEdges((eds) => eds.filter(
          (e) => !e.selected && !deletedIds?.includes(e.source) && !deletedIds?.includes(e.target)
        ));
        return remainingNodes;
      });
    }
  }, []);

  const selectedNodes = nodes.filter(node => node.selected);
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const { generationCost, isRefreshingCost } = useGenerationCost(selectedNode?.data?.selectedModel, selectedNode?.data?.formValues);
  
  const updateNodeFromPanel = useCallback((key, value) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode?.id) {
          return {
            ...node,
            data: {
              ...node.data,
              formValues: {
                ...node.data.formValues,
                [key]: value,
              },
            },
          };
        }
        return node;
      })
    );
  }, [selectedNode, setNodes]);

  const videoInputConnections = selectedNode?.type === 'videoNode' ? edges.filter(edge => edge.target === selectedNode.id).map(edge => ({
    ...edge, label:nodes.find(node => node.id === edge.source)?.data?.label || edge.source,
    options:connectionOptions(edge,nodes),
  })).filter(edge => edge.options.length > 1) : [];
  const changeInputPurpose = (edgeId, handle) => {
    const edge = edges.find(item => item.id === edgeId);
    if (!edge || !connectionOptions(edge,nodes).some(port => port[0] === handle)) return;
    const target = nodes.find(node => node.id === edge.target);
    const ports = getInputPorts(target);
    const destination = ports.find(port => port[0] === handle);
    const isList = destination[1].endsWith('_list');
    const occupied = !isList && edges.find(item => item.target === edge.target && item.targetHandle === handle && item.id !== edgeId);
    const nextEdges = edges.map(item => item.id === edgeId ? {...item,targetHandle:handle} : occupied && item.id === occupied.id ? {...item,targetHandle:edge.targetHandle} : item);
    setEdges(nextEdges);
  };

  const updateModel = useCallback((model) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              selectedModel: model,
            },
          };
        }
        return node;
      })
    );
    setDropDown(0);
  }, [selectedNode, setNodes]);

  const getModelsForNode = (node) => {
    if (!node || !nodeSchemas?.categories) return [];

    const mapModels = (modelsMap) =>
      modelsMap ? Object.entries(modelsMap).map(([id, model]) => ({
        ...model,
        id,
        name: SPECIAL_MODEL_NAMES[id] || formatName(id)
      })) : [];

    if (node.type === "textNode") return mapModels(nodeSchemas.categories.text?.models);
    if (node.type === "imageNode") return mapModels(nodeSchemas.categories.image?.models);
    if (node.type === "videoNode") return mapModels(nodeSchemas.categories.video?.models);
    if (node.type === "audioNode") return mapModels(nodeSchemas.categories.audio?.models);
    if (node.type === "apiNode") return filteredApiNodeModels;
    return [];
  };

  const getFilteredModelsForNode = (node) => {
    const models = getModelsForNode(node);

    if (!modelSearch.trim()) return models;
    const normalize = (text = "") =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    const normalizedSearch = normalize(modelSearch);

    return models.filter((model) => {
      const name = normalize(model.name);
      const id = normalize(model.id);

      return (
        name.includes(normalizedSearch) ||
        id.includes(normalizedSearch)
      );
    });
  };

  const connectionLineStyle = {
    stroke: activeHandleColor === 'blue' ? '#3b82f6'
      : activeHandleColor === 'green' ? '#22c55e'
        : activeHandleColor === 'orange' ? '#f97316'
          : activeHandleColor === 'yellow' ? '#eab308'
            : '#ffffffff',
    strokeWidth: 2,
  };

  return (
    <div tabIndex={0} onKeyDown={onKeyDown} className="flex h-full w-full relative">
      {isRestoring && (
        <div className="fixed inset-0 flex items-center justify-center gap-2 bg-black w-full h-full z-20">
          <div className="w-6 h-6 rounded-full border-[4px] border-white border-t-transparent animate-spin"></div>
          <div className="text-white text-xl font-bold">Loading...</div>
        </div>
      )}
      <CanvasHeading open={headingOpen} setOpen={setHeadingOpen} tab={resourceTab} setTab={setResourceTab} name={workflowName} nodes={nodes} editable={interactionMode} running={isRunning === 1}
        onAddCharacter={(asset) => addNode('characterNode', null, {characterForm:{...asset.form,name:asset.title},generatedForm:asset.form,resultUrl:asset.url,characterSheet:asset.sheet,outputs:[{type:'image_url',value:asset.url}]})}
        onAddScene={(asset) => addNode('sceneNode', null, {sceneForm:{...asset.form,name:asset.title},generatedForm:asset.form,resultUrl:asset.url,sceneSheet:asset.sheet,outputs:[{type:'image_url',value:asset.url}]})}
        onAddPrompt={(prompt) => addNode('textNode', null, { selectedModel: getModelObjStatic('text', 'text-passthrough', nodeSchemas), formValues: { prompt } })}
        onRename={() => setDropDown(2)} onSave={handleSaveWorkFlow} onRun={handleRunWorkflow}
        onSelect={(id) => { setNodes(nds => nds.map(n => ({ ...n, selected: n.id === id }))); fitView({ nodes: [{ id }], padding: 0.6, duration: 300, maxZoom: 1 }); }} />
      <div className={`canvas-node-tools absolute left-4 self-center z-20 flex flex-col gap-2 bg-[#151618] p-1 rounded-full border border-gray-700 shadow-xl ${isRestoring && "hidden"}`}>
        <div className={`relative ${!interactionMode && "hidden"}`}>
          <button type="button" disabled={!interactionMode} aria-label="Add node"
            aria-expanded={contextMenu?.source === 'toolbar'}
            onClick={event => {
              const button = event.currentTarget.getBoundingClientRect();
              const canvas = event.currentTarget.closest('#cimora-canvas').getBoundingClientRect();
              setDropDown(0);
              setContextMenu({
                source: 'toolbar', x: button.right + 12, y: button.top,
                position: screenToFlowPosition({x: canvas.left + canvas.width / 2, y: canvas.top + canvas.height / 2}),
                selectedIds: getNodes().filter(node => node.selected).map(node => node.id),
              });
            }}><FaPlus size={18}/></button>
        </div>
        <div className="canvas-tools-divider" />
        {[{ name: 'Canvas', Icon: CanvasBoardIcon }, { name: 'Assets', Icon: FiImage }, { name: 'Prompt Library', Icon: FiFileText }, { name: 'Tasks', Icon: CanvasTasksIcon }].map(({ name, Icon }) => (
          <button key={name} type="button" title={name} aria-label={name}
            aria-pressed={headingOpen === 'panel' && resourceTab === name}
            onClick={() => {
              setDropDown(0);
              setResourceTab(name);
              setHeadingOpen(headingOpen === 'panel' && resourceTab === name ? null : 'panel');
            }}><Icon className="canvas-tool-glyph" /></button>
        ))}
      </div>
      <CanvasBottomToolbar nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} editable={interactionMode} hand={isDragging} setHand={setIsDragging} setSpace={setSpaceHeld} miniMap={showMiniMap} setMiniMap={setShowMiniMap} grid={gridStyle} setGrid={setGridStyle} />
      <div className="z-10 w-full h-full" onMouseDownCapture={event=>{
        handlePress.current=event.target.closest('.react-flow__handle.connectable')?{x:event.clientX,y:event.clientY}:null;
        const pressedId=event.target.closest('.react-flow__node')?.dataset.id;
        const pressedNode=getNodes().find(node=>node.id===pressedId);
        if(interactionMode&&!event.shiftKey&&pressedNode?.parentNode&&getNodes().some(node=>node.id===pressedNode.parentNode&&node.selected)){
          // React Flow skips child drag items while their parent is selected.
          flushSync(()=>setNodes(previous=>previous.map(node=>({...node,selected:node.id===pressedId}))));
        }
        if(event.target.classList.contains('react-flow__pane')&&event.detail===1)paneSelection.current=getNodes().filter(node=>node.selected).map(node=>node.id);
      }} onClickCapture={event=>{
        const handle=event.target.closest('.react-flow__handle.connectable');
        const press=handlePress.current;
        handlePress.current=null;
        if(!interactionMode||!handle||!press||Math.hypot(event.clientX-press.x,event.clientY-press.y)>5)return;
        event.preventDefault();event.stopPropagation();
        const nodeId=handle.dataset.nodeid;
        const handleId=handle.dataset.handleid;
        const node=nodesWithHandlers.find(item=>item.id===nodeId);
        if(!node||!handleId)return;
        const isOutput=handleId.toLowerCase().includes('output');
        setContextMenu(null);
        setEdgePicker({sourceNodeId:isOutput?nodeId:null,targetNodeId:isOutput?null:nodeId,
          sourceHandleId:isOutput?handleId:null,targetHandleId:isOutput?null:handleId,
          handleColor:node.data.handleTypes?.[handleId],isOutput,cursorPos:{x:event.clientX,y:event.clientY}});
      }} onDoubleClickCapture={event=>{
        if(!interactionMode||!event.target.classList.contains('react-flow__pane'))return;
        event.preventDefault();event.stopPropagation();
        setContextMenu({x:event.clientX,y:event.clientY,position:screenToFlowPosition({x:event.clientX,y:event.clientY}),selectedIds:paneSelection.current});
      }}>
        <ReactFlow
          className={spaceHeld ? 'canvas-pan-active' : isDragging ? 'canvas-hand-mode' : 'canvas-pointer-mode'}
          defaultViewport={initialWorkflowData?.viewport}
          nodes={nodesWithHandlers}
          edges={edges}
          onNodesChange={changes=>{
            const removed=new Set(changes.filter(change=>change.type==='remove').map(change=>change.id));
            if(removed.size)setNodes(previous=>previous.map(node=>{
              const parent=previous.find(group=>group.id===node.parentNode&&removed.has(group.id));
              return parent?{...node,parentNode:undefined,extent:undefined,position:{x:node.position.x+parent.position.x,y:node.position.y+parent.position.y}}:node;
            }));
            onNodesChange(changes);
            const groupSelections=changes.filter(change=>change.type==='select'&&nodes.some(node=>node.id===change.id&&node.type==='groupNode'));
            if(groupSelections.length)setNodes(previous=>previous.map(node=>{
              const groupChange=groupSelections.find(change=>change.id===node.parentNode);
              if(!groupChange)return node;
              // A direct click on a member still selects that member independently.
              const directSelection=changes.find(change=>change.type==='select'&&change.id===node.id&&change.selected);
              const selected=groupChange.selected||!!directSelection;
              return node.selected===selected?node:{...node,selected};
            }));
          }}
          onNodeClick={(event,node)=>{
            if(interactionMode&&!event.shiftKey&&node.parentNode&&getNodes().some(parent=>parent.id===node.parentNode&&parent.selected)){
              setNodes(previous=>previous.map(item=>({...item,selected:item.id===node.id})));
            }
          }}
          onEdgesChange={onEdgesChange}
          onConnect={interactionMode ? onConnect : null}
          isValidConnection={isValidConnection}
          connectionMode="loose"
          deleteKeyCode={null}
          connectOnClick={false}
          connectionRadius={28}
          onConnectStart={interactionMode ? onConnectStart : null}
          onConnectEnd={interactionMode ? onConnectEnd : null}
          nodeTypes={nodeTypes}
          edgeTypes={transferEdgeTypes}
          onEdgeClick={interactionMode ? onEdgeClick : null}
          onPaneContextMenu={interactionMode ? onPaneContextMenu : null}
          onPaneClick={interactionMode ? onPaneClick : null}
          nodesDraggable={interactionMode && !spaceHeld}
          nodesConnectable={interactionMode}
          elementsSelectable={interactionMode}
          zoomOnDoubleClick={false}
          minZoom={0.1}
          maxZoom={4}
          selectionOnDrag={!isDragging && !spaceHeld}
          panOnDrag={spaceHeld}
          panActivationKeyCode={null}
          selectionKeyCode={null}
          selectionMode={!isDragging ? "partial" : null}
          multiSelectionKeyCode="Shift"
          connectionLineStyle={connectionLineStyle}
          fitView={!initialWorkflowData?.viewport}
          proOptions={{ hideAttribution: false }}
        >
          {gridStyle !== 'blank' && <Background key={gridStyle} id={`canvas-${gridStyle}`} variant={gridStyle} gap={24} size={gridStyle === 'dots' ? 3 : 1} color={gridStyle === 'dots' ? 'var(--canvas-dots, #79756c99)' : 'var(--canvas-grid, #79756c30)'} />}
          {showMiniMap && <MiniMap className="canvas-mini-map" pannable zoomable nodeColor="#67938c" maskColor="#77777740" /> }
        </ReactFlow>
      </div>
      {selectedNode && !['groupNode','characterNode','sceneNode'].includes(selectedNode.type) && <NodeComposer key={selectedNode.id} node={selectedNode} groupReferences={getGroupReferences(selectedNode.id,nodes,edges)} models={getModelsForNode(selectedNode)} editable={interactionMode}
        inputConnections={videoInputConnections} onInputPurposeChange={changeInputPurpose}
        running={!!loadingNodes[selectedNode.id]} onChange={updateNodeFromPanel} onModelChange={updateModel}
        onDataChange={data => setNodes(nds => nds.map(n => n.id === selectedNode.id ? {...n, data: {...n.data, ...data}} : n))}
        onGenerate={() => runNodeFromFlow(selectedNode.id)}
        onLibrary={() => { setResourceTab('Prompt Library'); setHeadingOpen('panel'); }}
        onClose={() => setNodes(nds => nds.map(n => ({...n, selected: false})))} />}

      {edgePicker&&<CanvasNodeMenu
        onUpload={async file=>{await uploadMenuResource(file,screenToFlowPosition(edgePicker.cursorPos));setEdgePicker(null);}}
        x={edgePicker.cursorPos.x+12} y={edgePicker.cursorPos.y} onClose={()=>setEdgePicker(null)} onAdd={type=>{
        if(!getCompatibleNodeTypes(edgePicker.handleColor,edgePicker.isOutput).includes(type)){
          addMenuNode(type,{position:screenToFlowPosition(edgePicker.cursorPos)});
          setEdgePicker(null);
          return;
        }
        const category=type.replace('Node','');
        const model=type==='vidConcatNode'?getModelObjStatic('utility','video-combiner',nodeSchemas):getModelObjStatic(category,`${category}-generation-preview`,nodeSchemas);
        handleSelectNodeFromEdgePicker(type,null,{selectedModel:model,formValues:{}});
      }}/>}
      {contextMenu && <CanvasNodeMenu x={contextMenu.x} y={contextMenu.y} onAdd={addMenuNode} onUpload={uploadMenuResource} onClose={onPaneClick}/>}
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center z-50 overflow-auto bg-black/30 backdrop-blur transition-all duration-200 ease-in-out ${
          dropDown === 2 ? "opacity-100 scale-100 visible" : "opacity-0 scale-80 invisible"
        }`}
        onClick={() => setDropDown(0)}
      >
        <div className="bg-[#242629] rounded-lg p-4 w-72 shadow-lg flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-base text-center font-semibold text-white">Save Workflow</h3>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-start text-gray-300">Workflow Name</label>
            <input
              type="text"
              value={workflowName}
              autoFocus
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter Workflow Name"
              className="border border-gray-700 px-2 py-1.5 text-sm text-white rounded bg-transparent w-full"
            />
          </div>
          <div className="flex items-center w-full gap-2">
            <button
              type="button"
              suppressHydrationWarning={true}
              onClick={() => setDropDown(0)}
              className="px-4 py-2 bg-gray-700/50 text-white rounded-full text-sm hover:bg-gray-600/50 transition w-full cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              suppressHydrationWarning={true}
              onClick={handleSaveWorkFlow}
              className="px-4 py-2 bg-white text-black rounded-full hover:bg-blue-500 hover:text-white transition w-full text-sm cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      {nodes.length === 0 && !isPresetsDismissed && interactionMode && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300 transform scale-90 md:scale-100 overflow-y-auto custom-scrollbar max-w-[90%] max-h-[80%] p-10">
            <div className="flex flex-col items-center gap-2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-lg border border-white/10 shadow-xl">
              <h2 className="text-xl font-semibold text-white tracking-tight">Select a Workflow</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">or start from scratch</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {presets.map((preset) => (
                <button
                  type="button"
                  suppressHydrationWarning={true}
                  key={preset.id}
                  onClick={() => loadPreset(preset)}
                  className="group relative flex flex-col bg-[#151618] aspect-[4/3] border border-gray-700 hover:border-gray-500 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer transition-all duration-200 overflow-hidden text-left"
                >
                  <div className="z-10 p-2 bg-[#242629] border-b border-gray-700 flex items-center px-3 justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${preset.id === "empty-workflow" ? "bg-gray-400" : "bg-blue-500"}`}></div>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{preset.id === "empty-workflow" ? "NEW" : "PRESET"}</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                    </div>
                  </div>
                  <div className="z-0 p-4 flex flex-col gap-3 h-full">
                    <div className="flex items-center justify-center gap-2 z-10 w-full h-full">
                      <div className="text-white group-hover:text-blue-400 transition-colors">
                        {iconMap[preset.icon] || <RiInputMethodLine size={16} />}
                      </div>
                      <h3 className="text-sm font-medium text-white leading-tight group-hover:text-blue-400 transition-colors">
                        {preset.title}
                      </h3>
                    </div>
                    {preset.image && (
                      <div className="absolute inset-0 z-0 w-full h-full rounded overflow-hidden border border-gray-800">
                        <img src={preset.image} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 z-10 w-full h-full bg-black/60"></div>
                      </div>
                    )}
                    {preset.description && (
                      <p className="z-10 text-[11px] text-gray-300 leading-relaxed border-t border-gray-500 pt-2 mt-auto">
                        {preset.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              suppressHydrationWarning={true}
              onClick={() => setIsPresetsDismissed(true)}
              className="mt-4 px-5 py-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-xs text-gray-300 font-medium transition-colors border border-gray-700 hover:border-gray-500"
            >
              Dismiss & Enter Empty Canvas
            </button>
          </div>
        </div>
      )}
      {false && (
        <ChatWidget
          isOpen={isChatOpen}
          toggleChat={() => setIsChatOpen(!isChatOpen)}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isLoading={isChatLoading}
          onClearHistory={() => setChatMessages([])}
        />
      )}
      {isCategoryPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1b1e23] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Edit Workflow Category</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Category Name</label>
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="Enter category..."
                    className="w-full px-4 py-3 bg-[#151618] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-gray-600 transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#151618]/50 flex items-center justify-end gap-3 border-t border-gray-700/50">
              <button
                type="button"
                suppressHydrationWarning={true}
                onClick={() => setIsCategoryPopupOpen(false)}
                className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                suppressHydrationWarning={true}
                onClick={handleCategorySave}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              >
                <MdSave size={18} />
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default NodeFlow;

