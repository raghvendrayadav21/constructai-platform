import { useState, useCallback } from 'react';

/**
 * Generic hook for API calls with loading/error/data state management
 */
export function useApi(apiFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFn(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        'An unexpected error occurred';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Hook for file upload state management
 */
export function useFileUpload(acceptedTypes = ['image/*']) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);

  return { file, preview, handleFile, clearFile };
}

/**
 * Hook for managing tag inputs
 */
export function useTagInput() {
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState('');

  const addTag = useCallback((tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setInput('');
  }, [tags]);

  const removeTag = useCallback((tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input) {
      setTags((prev) => prev.slice(0, -1));
    }
  }, [input, addTag]);

  return { tags, input, setInput, addTag, removeTag, handleKeyDown, setTags };
}
