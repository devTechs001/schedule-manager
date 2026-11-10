import React, { useCallback, useState } from 'react';
import {
  FaUsers,
  FaClipboardList,
  FaClock,
  FaRobot,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa';
import aiAPI from '@services/api/aiAPI';

/**
 * Meeting notes → summary and action items.
 *
 * The previous version "recorded" nothing (it toggled a boolean), then after
 * 1.5 seconds produced three hard-coded action items assigned to John, Sarah
 * and You, plus a fixed paragraph about "feature X" and "Q2". None of it
 * related to the transcript on screen.
 *
 * There is also no speech capture here: browser transcription would need a
 * speech-to-text provider, so the field is for pasted notes and says so. The
 * summary and action items come from POST /ai/meeting, and the component
 * reports when that service is unavailable instead of fabricating output.
 */
const MeetingAssistant = ({ meeting, onActionItemsExtracted, onSummaryGenerated }) => {
  const [transcript, setTranscript] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [hasRun, setHasRun] = useState(false);

  const run = useCallback(async () => {
    const text = transcript.trim();
    if (!text || isProcessing) return;

    setIsProcessing(true);
    setError('');

    try {
      const result = await aiAPI.summariseMeeting(text);
      const items = Array.isArray(result?.actionItems) ? result.actionItems : [];
      setSummary(result?.summary || '');
      setActionItems(items);
      setHasRun(true);
      onSummaryGenerated?.(result?.summary || '');
      onActionItemsExtracted?.(items);
    } catch (err) {
      setError(
        err?.status === 503
          ? 'Meeting analysis is unavailable: the server has no AI provider configured.'
          : err?.message || 'Could not analyse this transcript.'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [transcript, isProcessing, onSummaryGenerated, onActionItemsExtracted]);

  return (
    <div className="card p-6">
      <div className="mb-5 flex items-center gap-3">
        <FaUsers className="text-lg text-primary-600" />
        <div>
          <h3 className="font-semibold text-content">Meeting assistant</h3>
          <p className="text-xs text-content-muted">Paste your notes, get a summary and next steps.</p>
        </div>
      </div>

      {meeting && (
        <div className="mb-4 rounded-lg bg-surface-sunken p-3">
          <h4 className="font-medium text-content">{meeting.title}</h4>
          <p className="mt-1 flex items-center gap-2 text-sm text-content-muted">
            <FaClock size={10} />
            {new Date(meeting.start).toLocaleString()}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="label">Transcript or notes</span>
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="Paste the meeting transcript, bullet points, or rough notes…"
            rows={6}
            className="input min-h-[8rem] resize-y"
          />
        </label>

        <button
          type="button"
          onClick={run}
          disabled={!transcript.trim() || isProcessing}
          className="btn btn-primary w-full justify-center disabled:opacity-50"
        >
          {isProcessing ? <FaSpinner className="animate-spin" /> : <FaClipboardList />}
          {isProcessing ? 'Reading the transcript…' : hasRun ? 'Run again' : 'Summarise and extract actions'}
        </button>

        <p className="text-xs text-content-subtle">
          Audio is not recorded — this analyses text you provide.
        </p>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {hasRun && !error && !summary && actionItems.length === 0 && (
          <p className="text-sm text-content-subtle">
            Nothing was extracted. The transcript may be too short, or the model returned no usable output.
          </p>
        )}

        {actionItems.length > 0 && (
          <div>
            <h4 className="mb-2 font-medium text-content">Action items</h4>
            <ul className="divide-y divide-line">
              {actionItems.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-2">
                  <span className="text-sm text-content">{item.text}</span>
                  <span className="shrink-0 text-xs text-content-subtle">
                    {item.assignee ? `@${item.assignee}` : 'unassigned'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary && (
          <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-500/10">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-content">
              <FaRobot size={12} /> Summary
            </h4>
            <p className="text-sm text-content-muted">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingAssistant;
