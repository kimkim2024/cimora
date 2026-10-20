import { useId } from 'react';
import type { IconBaseProps, IconType } from 'react-icons';
import { AiOutlineAudio as OriginalAiOutlineAudio } from 'react-icons/ai';
import { BsArrowUpCircleFill as OriginalBsArrowUpCircleFill } from 'react-icons/bs';
import { FaAngleDown as OriginalFaAngleDown } from 'react-icons/fa6';
import { FaAngleLeft as OriginalFaAngleLeft } from 'react-icons/fa6';
import { FaAngleRight as OriginalFaAngleRight } from 'react-icons/fa6';
import { FaCheck as OriginalFaCheck } from 'react-icons/fa6';
import { FaPause as OriginalFaPause } from 'react-icons/fa';
import { FaPlay as OriginalFaPlay } from 'react-icons/fa';
import { FaPlus as OriginalFaPlus } from 'react-icons/fa6';
import { FaRegEdit as OriginalFaRegEdit } from 'react-icons/fa';
import { FaRegHand as OriginalFaRegHand } from 'react-icons/fa6';
import { FaTelegramPlane as OriginalFaTelegramPlane } from 'react-icons/fa';
import { FaToolbox as OriginalFaToolbox } from 'react-icons/fa6';
import { FaUpload as OriginalFaUpload } from 'react-icons/fa6';
import { FaVolumeMute as OriginalFaVolumeMute } from 'react-icons/fa';
import { FaVolumeUp as OriginalFaVolumeUp } from 'react-icons/fa';
import { FiAlignLeft as OriginalFiAlignLeft } from 'react-icons/fi';
import { FiArrowLeft as OriginalFiArrowLeft } from 'react-icons/fi';
import { FiArrowRight as OriginalFiArrowRight } from 'react-icons/fi';
import { FiArrowUp as OriginalFiArrowUp } from 'react-icons/fi';
import { FiBookOpen as OriginalFiBookOpen } from 'react-icons/fi';
import { FiBookmark as OriginalFiBookmark } from 'react-icons/fi';
import { FiCheck as OriginalFiCheck } from 'react-icons/fi';
import { FiChevronDown as OriginalFiChevronDown } from 'react-icons/fi';
import { FiChevronUp as OriginalFiChevronUp } from 'react-icons/fi';
import { FiCompass as OriginalFiCompass } from 'react-icons/fi';
import { FiCopy as OriginalFiCopy } from 'react-icons/fi';
import { FiCpu as OriginalFiCpu } from 'react-icons/fi';
import { FiCrosshair as OriginalFiCrosshair } from 'react-icons/fi';
import { FiEdit2 as OriginalFiEdit2 } from 'react-icons/fi';
import { FiEdit3 as OriginalFiEdit3 } from 'react-icons/fi';
import { FiFile as OriginalFiFile } from 'react-icons/fi';
import { FiFileText as OriginalFiFileText } from 'react-icons/fi';
import { FiFilm as OriginalFiFilm } from 'react-icons/fi';
import { FiFolderPlus as OriginalFiFolderPlus } from 'react-icons/fi';
import { FiGrid as OriginalFiGrid } from 'react-icons/fi';
import { FiHelpCircle as OriginalFiHelpCircle } from 'react-icons/fi';
import { FiImage as OriginalFiImage } from 'react-icons/fi';
import { FiInfo as OriginalFiInfo } from 'react-icons/fi';
import { FiLayers as OriginalFiLayers } from 'react-icons/fi';
import { FiList as OriginalFiList } from 'react-icons/fi';
import { FiMaximize as OriginalFiMaximize } from 'react-icons/fi';
import { FiMaximize2 as OriginalFiMaximize2 } from 'react-icons/fi';
import { FiMenu as OriginalFiMenu } from 'react-icons/fi';
import { FiMinimize2 as OriginalFiMinimize2 } from 'react-icons/fi';
import { FiMonitor as OriginalFiMonitor } from 'react-icons/fi';
import { FiMoon as OriginalFiMoon } from 'react-icons/fi';
import { FiMousePointer as OriginalFiMousePointer } from 'react-icons/fi';
import { FiMusic as OriginalFiMusic } from 'react-icons/fi';
import { FiPlay as OriginalFiPlay } from 'react-icons/fi';
import { FiPlus as OriginalFiPlus } from 'react-icons/fi';
import { FiRotateCcw as OriginalFiRotateCcw } from 'react-icons/fi';
import { FiRotateCw as OriginalFiRotateCw } from 'react-icons/fi';
import { FiSave as OriginalFiSave } from 'react-icons/fi';
import { FiSearch as OriginalFiSearch } from 'react-icons/fi';
import { FiSettings as OriginalFiSettings } from 'react-icons/fi';
import { FiSidebar as OriginalFiSidebar } from 'react-icons/fi';
import { FiSliders as OriginalFiSliders } from 'react-icons/fi';
import { FiStar as OriginalFiStar } from 'react-icons/fi';
import { FiSun as OriginalFiSun } from 'react-icons/fi';
import { FiTag as OriginalFiTag } from 'react-icons/fi';
import { FiTrash2 as OriginalFiTrash2 } from 'react-icons/fi';
import { FiUpload as OriginalFiUpload } from 'react-icons/fi';
import { FiUser as OriginalFiUser } from 'react-icons/fi';
import { FiVideo as OriginalFiVideo } from 'react-icons/fi';
import { FiX as OriginalFiX } from 'react-icons/fi';
import { FiZap as OriginalFiZap } from 'react-icons/fi';
import { FiZoomIn as OriginalFiZoomIn } from 'react-icons/fi';
import { FiZoomOut as OriginalFiZoomOut } from 'react-icons/fi';
import { HiOutlineViewGrid as OriginalHiOutlineViewGrid } from 'react-icons/hi';
import { IoClose as OriginalIoClose } from 'react-icons/io5';
import { IoDuplicateOutline as OriginalIoDuplicateOutline } from 'react-icons/io5';
import { IoImageOutline as OriginalIoImageOutline } from 'react-icons/io5';
import { IoPause as OriginalIoPause } from 'react-icons/io5';
import { IoPlay as OriginalIoPlay } from 'react-icons/io5';
import { IoTimeOutline as OriginalIoTimeOutline } from 'react-icons/io5';
import { IoTrashOutline as OriginalIoTrashOutline } from 'react-icons/io5';
import { IoVideocamOutline as OriginalIoVideocamOutline } from 'react-icons/io5';
import { IoVolumeHigh as OriginalIoVolumeHigh } from 'react-icons/io5';
import { IoVolumeMute as OriginalIoVolumeMute } from 'react-icons/io5';
import { LuEraser as OriginalLuEraser } from 'react-icons/lu';
import { LuGraduationCap as OriginalLuGraduationCap } from 'react-icons/lu';
import { LuHand as OriginalLuHand } from 'react-icons/lu';
import { LuLayoutTemplate as OriginalLuLayoutTemplate } from 'react-icons/lu';
import { LuListChecks as OriginalLuListChecks } from 'react-icons/lu';
import { LuMousePointer2 as OriginalLuMousePointer2 } from 'react-icons/lu';
import { LuPalette as OriginalLuPalette } from 'react-icons/lu';
import { MdLockOutline as OriginalMdLockOutline } from 'react-icons/md';
import { MdOutlineFileDownload as OriginalMdOutlineFileDownload } from 'react-icons/md';
import { MdOutlineZoomOutMap as OriginalMdOutlineZoomOutMap } from 'react-icons/md';
import { MdSave as OriginalMdSave } from 'react-icons/md';
import { RiInputMethodLine as OriginalRiInputMethodLine } from 'react-icons/ri';
import { SlOptions as OriginalSlOptions } from 'react-icons/sl';
import { TbArrowMerge as OriginalTbArrowMerge } from 'react-icons/tb';
import { TfiText as OriginalTfiText } from 'react-icons/tfi';

type Kind = 'canvas' | 'tasks' | 'image' | 'video' | 'audio' | 'text' | 'user' | 'group' | 'upload' | 'download' | 'save' | 'play' | 'palette' | 'generic';

// Solid silhouettes with transparent cutouts, matching the Meika navigation reference.
function makeIcon(Original: IconType, kind: Kind = 'generic') {
  return function CanvasIcon({ size = '1em', className = '', title, ...props }: IconBaseProps) {
    const id = useId().replace(/:/g, '');
    return <svg {...props} width={size} height={size} viewBox="0 0 32 32"
      className={`mk-canvas-icon ${className}`} aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined} focusable="false">
      {title && <title>{title}</title>}
      {kind === 'generic' ? <g><Original x="3" y="3" size={26} color="currentColor" style={{ width:26,height:26 }} aria-hidden="true"/></g> : <>
      <defs><mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
      <g fill="white" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'canvas' && <><path d="M2 8h4v20h20v3H2ZM8 2h22v23H8Z"/><path d="M12 7h6v6h-6Zm10 0h4v6h-4ZM12 17h14v4H12Z" fill="black"/></>}
        {kind === 'tasks' && <><path d="M6 5h20l3 3v22H3V8ZM11 2h10v6H11Z"/><path d="m8 13 2 2 4-4m-6 11 2 2 4-4M18 13h6m-6 9h6" fill="none" stroke="black" strokeWidth="2.5"/></>}
        {kind === 'image' && <><path d="M4 4h24v24H4Z"/><path d="M7 7h18v18H7Z" fill="black"/><circle cx="21" cy="11" r="2"/><path d="m7 25 6-10 6 7 3-5 3 8Z"/></>}
        {kind === 'video' && <><path d="M3 7h19l2 3v13l-2 3H3ZM25 12l5-4v17l-5-4Z"/><path d="m10 12 8 4-8 5Z" fill="black"/></>}
        {kind === 'audio' && <><path d="M12 24V7l15-4v19" fill="none" stroke="white" strokeWidth="4"/><path d="m12 7 15-4v7l-15 4Z"/><ellipse cx="8" cy="25" rx="5" ry="4"/><ellipse cx="23" cy="23" rx="5" ry="4"/></>}
        {kind === 'text' && <><path d="M6 3h14l7 7v19H6Z"/><path d="M20 3v8h7M11 15h11M11 20h11M11 25h7" fill="none" stroke="black" strokeWidth="2"/></>}
        {kind === 'user' && <><path d="m7 7 9-4 9 4 1 9-5 5 7 3 2 6H2l2-6 7-3-5-5Z"/><path d="m10 12 6 3 6-3-2 7-4 3-4-3Zm2 12 4 3 4-3-4 6Z" fill="black"/></>}
        {kind === 'group' && <>{[[3,3],[18,3],[3,18],[18,18]].map(([x,y])=><path key={`${x}-${y}`} d={`M${x} ${y}h11v11H${x}Z`}/>)}</>}
        {(kind === 'upload' || kind === 'download') && <><path d="M3 21h5v5h16v-5h5v9H3Z"/><path d={kind === 'upload' ? 'M13 23V12H6L16 2l10 10h-7v11Z' : 'M13 2h6v12h7L16 24 6 14h7Z'}/></>}
        {kind === 'save' && <><path d="M4 3h20l5 5v21H4Z"/><path d="M9 3h13v10H9ZM9 20h15v9H9Z" fill="black"/><path d="M18 5h2v6h-2Z"/></>}
        {kind === 'play' && <path d="m8 3 22 13L8 29Z"/>}
        {kind === 'palette' && <><path d="M29 13C29 3 17 0 8 5S0 27 12 29c9 2 4-8 8-9 5-1 9-1 9-7Z"/><g fill="black"><circle cx="10" cy="10" r="2.5"/><circle cx="19" cy="8" r="2.5"/><circle cx="25" cy="14" r="2.5"/><circle cx="6" cy="19" r="2.5"/></g></>}
      </g></mask></defs>
      <path d="M0 0h32v32H0Z" fill="currentColor" mask={`url(#${id})`}/>
      </>}
    </svg>;
  };
}

export const AiOutlineAudio = makeIcon(OriginalAiOutlineAudio, 'audio');
export const BsArrowUpCircleFill = makeIcon(OriginalBsArrowUpCircleFill, 'generic');
export const FaAngleDown = makeIcon(OriginalFaAngleDown, 'generic');
export const FaAngleLeft = makeIcon(OriginalFaAngleLeft, 'generic');
export const FaAngleRight = makeIcon(OriginalFaAngleRight, 'generic');
export const FaCheck = makeIcon(OriginalFaCheck, 'generic');
export const FaPause = makeIcon(OriginalFaPause, 'generic');
export const FaPlay = makeIcon(OriginalFaPlay, 'play');
export const FaPlus = makeIcon(OriginalFaPlus, 'generic');
export const FaRegEdit = makeIcon(OriginalFaRegEdit, 'generic');
export const FaRegHand = makeIcon(OriginalFaRegHand, 'generic');
export const FaTelegramPlane = makeIcon(OriginalFaTelegramPlane, 'generic');
export const FaToolbox = makeIcon(OriginalFaToolbox, 'generic');
export const FaUpload = makeIcon(OriginalFaUpload, 'upload');
export const FaVolumeMute = makeIcon(OriginalFaVolumeMute, 'generic');
export const FaVolumeUp = makeIcon(OriginalFaVolumeUp, 'generic');
export const FiAlignLeft = makeIcon(OriginalFiAlignLeft, 'generic');
export const FiArrowLeft = makeIcon(OriginalFiArrowLeft, 'generic');
export const FiArrowRight = makeIcon(OriginalFiArrowRight, 'generic');
export const FiArrowUp = makeIcon(OriginalFiArrowUp, 'generic');
export const FiBookOpen = makeIcon(OriginalFiBookOpen, 'generic');
export const FiBookmark = makeIcon(OriginalFiBookmark, 'generic');
export const FiCheck = makeIcon(OriginalFiCheck, 'generic');
export const FiChevronDown = makeIcon(OriginalFiChevronDown, 'generic');
export const FiChevronUp = makeIcon(OriginalFiChevronUp, 'generic');
export const FiCompass = makeIcon(OriginalFiCompass, 'generic');
export const FiCopy = makeIcon(OriginalFiCopy, 'generic');
export const FiCpu = makeIcon(OriginalFiCpu, 'generic');
export const FiCrosshair = makeIcon(OriginalFiCrosshair, 'generic');
export const FiEdit2 = makeIcon(OriginalFiEdit2, 'generic');
export const FiEdit3 = makeIcon(OriginalFiEdit3, 'generic');
export const FiFile = makeIcon(OriginalFiFile, 'text');
export const FiFileText = makeIcon(OriginalFiFileText, 'text');
export const FiFilm = makeIcon(OriginalFiFilm, 'video');
export const FiFolderPlus = makeIcon(OriginalFiFolderPlus, 'generic');
export const FiGrid = makeIcon(OriginalFiGrid, 'group');
export const FiHelpCircle = makeIcon(OriginalFiHelpCircle, 'generic');
export const FiImage = makeIcon(OriginalFiImage, 'image');
export const FiInfo = makeIcon(OriginalFiInfo, 'generic');
export const FiLayers = makeIcon(OriginalFiLayers, 'generic');
export const FiList = makeIcon(OriginalFiList, 'generic');
export const FiMaximize = makeIcon(OriginalFiMaximize, 'generic');
export const FiMaximize2 = makeIcon(OriginalFiMaximize2, 'generic');
export const FiMenu = makeIcon(OriginalFiMenu, 'generic');
export const FiMinimize2 = makeIcon(OriginalFiMinimize2, 'generic');
export const FiMonitor = makeIcon(OriginalFiMonitor, 'image');
export const FiMoon = makeIcon(OriginalFiMoon, 'generic');
export const FiMousePointer = makeIcon(OriginalFiMousePointer, 'generic');
export const FiMusic = makeIcon(OriginalFiMusic, 'audio');
export const FiPlay = makeIcon(OriginalFiPlay, 'play');
export const FiPlus = makeIcon(OriginalFiPlus, 'generic');
export const FiRotateCcw = makeIcon(OriginalFiRotateCcw, 'generic');
export const FiRotateCw = makeIcon(OriginalFiRotateCw, 'generic');
export const FiSave = makeIcon(OriginalFiSave, 'save');
export const FiSearch = makeIcon(OriginalFiSearch, 'generic');
export const FiSettings = makeIcon(OriginalFiSettings, 'generic');
export const FiSidebar = makeIcon(OriginalFiSidebar, 'generic');
export const FiSliders = makeIcon(OriginalFiSliders, 'generic');
export const FiStar = makeIcon(OriginalFiStar, 'generic');
export const FiSun = makeIcon(OriginalFiSun, 'generic');
export const FiTag = makeIcon(OriginalFiTag, 'generic');
export const FiTrash2 = makeIcon(OriginalFiTrash2, 'generic');
export const FiUpload = makeIcon(OriginalFiUpload, 'upload');
export const FiUser = makeIcon(OriginalFiUser, 'user');
export const FiVideo = makeIcon(OriginalFiVideo, 'video');
export const FiX = makeIcon(OriginalFiX, 'generic');
export const FiZap = makeIcon(OriginalFiZap, 'generic');
export const FiZoomIn = makeIcon(OriginalFiZoomIn, 'generic');
export const FiZoomOut = makeIcon(OriginalFiZoomOut, 'generic');
export const HiOutlineViewGrid = makeIcon(OriginalHiOutlineViewGrid, 'group');
export const IoClose = makeIcon(OriginalIoClose, 'generic');
export const IoDuplicateOutline = makeIcon(OriginalIoDuplicateOutline, 'generic');
export const IoImageOutline = makeIcon(OriginalIoImageOutline, 'image');
export const IoPause = makeIcon(OriginalIoPause, 'generic');
export const IoPlay = makeIcon(OriginalIoPlay, 'play');
export const IoTimeOutline = makeIcon(OriginalIoTimeOutline, 'generic');
export const IoTrashOutline = makeIcon(OriginalIoTrashOutline, 'generic');
export const IoVideocamOutline = makeIcon(OriginalIoVideocamOutline, 'video');
export const IoVolumeHigh = makeIcon(OriginalIoVolumeHigh, 'generic');
export const IoVolumeMute = makeIcon(OriginalIoVolumeMute, 'generic');
export const LuEraser = makeIcon(OriginalLuEraser, 'generic');
export const LuGraduationCap = makeIcon(OriginalLuGraduationCap, 'user');
export const LuHand = makeIcon(OriginalLuHand, 'generic');
export const LuLayoutTemplate = makeIcon(OriginalLuLayoutTemplate, 'group');
export const LuListChecks = makeIcon(OriginalLuListChecks, 'generic');
export const LuMousePointer2 = makeIcon(OriginalLuMousePointer2, 'generic');
export const LuPalette = makeIcon(OriginalLuPalette, 'palette');
export const MdLockOutline = makeIcon(OriginalMdLockOutline, 'generic');
export const MdOutlineFileDownload = makeIcon(OriginalMdOutlineFileDownload, 'download');
export const MdOutlineZoomOutMap = makeIcon(OriginalMdOutlineZoomOutMap, 'generic');
export const MdSave = makeIcon(OriginalMdSave, 'save');
export const RiInputMethodLine = makeIcon(OriginalRiInputMethodLine, 'text');
export const SlOptions = makeIcon(OriginalSlOptions, 'generic');
export const TbArrowMerge = makeIcon(OriginalTbArrowMerge, 'generic');
export const TfiText = makeIcon(OriginalTfiText, 'text');

export const CanvasBoardIcon = makeIcon(OriginalLuListChecks, 'canvas');
export const CanvasTasksIcon = makeIcon(OriginalFiList, 'tasks');
