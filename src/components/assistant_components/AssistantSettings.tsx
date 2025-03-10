import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Bot, Search, Image as ImageIcon, Info, Loader2, RefreshCw } from 'lucide-react';
import { db } from '../../db';
import { OllamaClient } from '../../utils';

interface ModelConfig {
  name: string;
  supportsImages: boolean;
  digest: string;
}

interface AssistantSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  isStreaming: boolean;
  setIsStreaming: (value: boolean) => void;
}

const AssistantSettings: React.FC<AssistantSettingsProps> = ({
  isOpen,
  onClose,
  isStreaming,
  setIsStreaming
}) => {
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModels = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const config = await db.getAPIConfig();
      if (!config?.ollama_base_url) {
        setError('Ollama URL not configured. Please configure it in settings.');
        return;
      }

      const client = new OllamaClient(config.ollama_base_url);
      const modelList = await client.listModels();

      // Get existing configs
      const existingConfigs = localStorage.getItem('model_image_support');
      const existingModelConfigs = existingConfigs ? JSON.parse(existingConfigs) : [];

      // Merge existing configs with new models
      const updatedConfigs = modelList.map((model: any) => {
        const existing = existingModelConfigs.find((c: ModelConfig) => c.name === model.name);
        return {
          name: model.name,
          digest: model.digest,
          supportsImages: existing ? existing.supportsImages : 
            model.name.toLowerCase().includes('llava') || 
            model.name.toLowerCase().includes('bakllava')
        };
      });

      setModelConfigs(updatedConfigs);
      localStorage.setItem('model_image_support', JSON.stringify(updatedConfigs));
    } catch (err) {
      setError('Failed to load models. Is Ollama running?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const handleModelConfigChange = (modelName: string, supportsImages: boolean) => {
    const updatedConfigs = modelConfigs.map(config =>
      config.name === modelName ? { ...config, supportsImages } : config
    );
    setModelConfigs(updatedConfigs);
    localStorage.setItem('model_image_support', JSON.stringify(updatedConfigs));
  };

  const filteredModels = modelConfigs.filter(config =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glassmorphic rounded-2xl p-8 max-w-2xl w-full mx-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-sakura-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Assistant Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-sakura-50 dark:hover:bg-sakura-100/5"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Response Settings
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isStreaming}
                onChange={(e) => {
                  setIsStreaming(e.target.checked);
                  localStorage.setItem('assistant_streaming', e.target.checked.toString());
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sakura-300 dark:peer-focus:ring-sakura-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sakura-500"></div>
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Streaming Responses
              </span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Model Image Support Configuration
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Configure which models can process images
                </p>
              </div>
              <button
                onClick={loadModels}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-sakura-500 text-white hover:bg-sakura-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh Models
              </button>
            </div>

            {error ? (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/50 border border-gray-200 focus:outline-none focus:border-sakura-300 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-sakura-500" />
                    </div>
                  ) : filteredModels.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No models found
                    </div>
                  ) : (
                    filteredModels.map((config) => (
                      <div
                        key={config.name}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <Bot className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {config.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {config.digest.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            Image Support
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={config.supportsImages}
                              onChange={(e) => handleModelConfigChange(config.name, e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sakura-300 dark:peer-focus:ring-sakura-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-sakura-500"></div>
                            <ImageIcon className={`ml-2 w-4 h-4 ${config.supportsImages ? 'text-sakura-500' : 'text-gray-400'}`} />
                          </label>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantSettings;