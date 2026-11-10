import React, { useCallback, useState } from 'react';
import { FaFileAlt, FaUpload, FaSearch, FaTags, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import aiAPI from '@services/api/aiAPI';

/**
 * Analyse a document's text with the AI service.
 *
 * Nothing is simulated here: the component uploads the pasted/selected text to
 * `POST /ai/document` and renders whatever comes back. Word count and reading
 * time are computed server-side from the input. When the server has no AI
 * provider configured the response carries no summary/topics, and we say so
 * instead of showing placeholder prose.
 */
const DocumentIntelligence = ({ onAnalyze }) => {
  const [document, setDocument] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocument(file);
    setError('');

    // Only plain-text formats can be read in the browser. Binary formats
    // (docx, pdf) would need server-side extraction, so we say so rather than
    // feeding mojibake to the model.
    const isText = /\.(txt|md|csv|json)$/i.test(file.name) || file.type.startsWith('text/');
    if (!isText) {
      setTextInput('');
      setError(`${file.name} needs to be converted to text first — paste its contents instead.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => setTextInput(String(event.target?.result || ''));
    reader.onerror = () => setError(`Could not read ${file.name}.`);
    reader.readAsText(file);
  }, []);

  const runAnalysis = async () => {
    const text = textInput.trim();
    if (!text || isAnalyzing) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await aiAPI.analyzeDocument(text, document?.name);
      setAnalysis(result);
      onAnalyze?.(result);
    } catch (err) {
      setAnalysis(null);
      setError(
        err?.status === 503
          ? 'Document analysis is unavailable: the server has no AI provider configured.'
          : err?.message || 'Could not analyse this document.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasSummary = Boolean(analysis?.summary);
  const keyTopics = Array.isArray(analysis?.keyTopics) ? analysis.keyTopics : [];
  const actionItems = Array.isArray(analysis?.actionItems) ? analysis.actionItems : [];
  const entities = analysis?.entities || {};

  return (
    <div className="card p-6">
      <div className="mb-6 flex items-center gap-3">
        <FaFileAlt className="text-xl text-primary-600" />
        <h3 className="text-lg font-semibold text-content">Document intelligence</h3>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border-2 border-dashed border-line p-6 text-center">
          <input
            type="file"
            id="doc-upload"
            accept=".txt,.md,.csv,.json,text/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="doc-upload" className="cursor-pointer">
            <FaUpload className="mx-auto mb-2 text-3xl text-content-subtle" />
            <p className="text-content-muted">Drop a text file or click to upload</p>
            {document && <p className="mt-2 text-sm text-primary-600">{document.name}</p>}
          </label>
        </div>

        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Or paste your document text here…"
          rows={5}
          className="input min-h-[7rem] resize-y"
        />

        <button
          type="button"
          onClick={runAnalysis}
          disabled={!textInput.trim() || isAnalyzing}
          className="btn btn-primary w-full justify-center disabled:opacity-50"
        >
          {isAnalyzing ? <FaSpinner className="animate-spin" /> : <FaSearch />}
          {isAnalyzing ? 'Analysing…' : 'Analyse document'}
        </button>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {analysis && (
          <div className="mt-6 space-y-4">
            {hasSummary ? (
              <div className="rounded-lg bg-surface-sunken p-4">
                <h4 className="mb-2 font-medium text-content">Summary</h4>
                <p className="text-content-muted">{analysis.summary}</p>
              </div>
            ) : (
              <p className="text-sm text-content-subtle">
                No summary was generated — the document is too short to summarise, or the AI service returned nothing usable.
              </p>
            )}

            {keyTopics.length > 0 && (
              <div className="rounded-lg bg-surface-sunken p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-content">
                  <FaTags /> Key topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {keyTopics.map((topic) => (
                    <span key={topic} className="rounded bg-primary-100 px-2 py-1 text-sm text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {actionItems.length > 0 && (
              <div className="rounded-lg bg-surface-sunken p-4">
                <h4 className="mb-2 font-medium text-content">Action items</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-content-muted">
                  {actionItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {['people', 'organizations', 'dates'].some((k) => (entities[k] || []).length > 0) && (
              <div className="rounded-lg bg-surface-sunken p-4">
                <h4 className="mb-2 font-medium text-content">Detected entities</h4>
                <dl className="space-y-1 text-sm">
                  {Object.entries({ People: entities.people, Organisations: entities.organizations, Dates: entities.dates })
                    .filter(([, list]) => Array.isArray(list) && list.length > 0)
                    .map(([label, list]) => (
                      <div key={label} className="flex gap-2">
                        <dt className="w-28 shrink-0 text-content-subtle">{label}</dt>
                        <dd className="text-content-muted">{list.join(', ')}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20">
                <p className="text-2xl font-bold text-blue-600">{analysis.wordCount}</p>
                <p className="text-sm text-content-muted">Words</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600">{analysis.readingTime} min</p>
                <p className="text-sm text-content-muted">Read time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentIntelligence;
