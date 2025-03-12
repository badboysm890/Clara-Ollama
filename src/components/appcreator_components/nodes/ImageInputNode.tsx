import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useTheme } from '../../../hooks/useTheme';
import { Image, Upload } from 'lucide-react';

const ImageInputNode = ({ data, isConnectable, isRunnerMode = false }: any) => {
  const { isDark } = useTheme();
  const tool = data.tool;
  const Icon = tool.icon;
  const nodeColor = isDark ? tool.darkColor : tool.lightColor;
  
  // Initialize with either runtime image or config image
  const [image, setImage] = useState(data.runtimeImage || data.config?.image || null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event bubbling
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageData = event.target.result;
          setImage(imageData);
          
          // Store in the appropriate location based on mode
          if (isRunnerMode) {
            // In runner mode, store in runtimeImage
            data.runtimeImage = imageData;
            console.log("Updated runtime image:", data.id);
          } else {
            // In editor mode, store in config
            if (!data.config) data.config = {};
            data.config.image = imageData;
          }
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div 
      className={`p-3 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } ${isRunnerMode ? 'border-blue-400 dark:border-blue-600' : ''} shadow-md w-64`}
      onClick={(e) => e.stopPropagation()} // Stop event propagation
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg" style={{ background: nodeColor }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="font-medium text-sm">
          {isRunnerMode ? `${data.label} (Click to change)` : data.label}
        </div>
      </div>
      
      <div className="mb-2" onClick={(e) => e.stopPropagation()}>
        {image ? (
          <div className="relative">
            <img 
              src={image as string} 
              alt="Uploaded"
              className="w-full h-32 object-cover rounded border"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className="absolute top-1 right-1 bg-red-500 p-1 rounded-full text-white"
              onClick={(e) => {
                e.stopPropagation();
                setImage(null);
                
                if (isRunnerMode) {
                  data.runtimeImage = null;
                } else {
                  data.config.image = null;
                }
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <label 
            className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-500'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm">Upload Image</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
              onClick={(e) => e.stopPropagation()}
            />
          </label>
        )}
      </div>
      
      {isRunnerMode && (
        <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
          {image ? "Click × to replace with another image" : "Upload an image"}
        </p>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="image-out"
        isConnectable={isConnectable}
        className="!bg-pink-500 !w-3 !h-3"
        style={{ bottom: -6 }}
      />
    </div>
  );
};

export default ImageInputNode;
