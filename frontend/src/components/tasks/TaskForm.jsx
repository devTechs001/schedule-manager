import React, { useEffect, useState } from 'react';
import { FaSave, FaTimes, FaPlus, FaTimesCircle, FaFlag, FaRegCalendarAlt } from 'react-icons/fa';
import Input from '@components/ui/Input';
import { Field, Select, Textarea } from '@components/ui/Field';

const PRIORITIES = [
  { id: 'low', label: 'Low', tone: 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  { id: 'medium', label: 'Medium', tone: 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  { id: 'high', label: 'High', tone: 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300' },
];

const STATUSES = [
  { id: 'todo', label: 'To do' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
];

const emptyForm = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  dueDate: '',
  tags: [],
};

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
        tags: Array.isArray(task.tags) ? task.tags : [],
      });
    } else {
      setForm(emptyForm);
    }
  }, [task]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const addTag = () => {
    const value = tagInput.trim().replace(/^#/, '');
    if (!value) return;
    if (form.tags.includes(value)) {
      setTagInput('');
      return;
    }
    update('tags', [...form.tags, value]);
    setTagInput('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.title.trim().length < 3) {
      setErrors({ title: 'Give the task a title (at least 3 characters)' });
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Task title" htmlFor="task-title" required error={errors.title}>
        <Input
          id="task-title"
          name="title"
          value={form.title}
          onChange={(event) => update('title', event.target.value)}
          placeholder="e.g. Draft the Q4 planning doc"
          autoFocus
        />
      </Field>

      <Field label="Description" htmlFor="task-description" hint="Optional — context helps the AI prioritise better.">
        <Textarea
          id="task-description"
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="What does done look like?"
          rows={3}
        />
      </Field>

      <div>
        <p className="label">
          <FaFlag className="mr-1 inline" size={9} /> Priority
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITIES.map((priority) => (
            <button
              key={priority.id}
              type="button"
              onClick={() => update('priority', priority.id)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                form.priority === priority.id
                  ? priority.tone
                  : 'border-line text-content-muted hover:border-primary-300'
              }`}
              aria-pressed={form.priority === priority.id}
            >
              {priority.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Due date" htmlFor="task-due" hint="Leave empty for someday/maybe.">
          <div className="relative">
            <FaRegCalendarAlt className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
            <Input
              id="task-due"
              type="date"
              value={form.dueDate}
              onChange={(event) => update('dueDate', event.target.value)}
              className="pl-10"
            />
          </div>
        </Field>

        <Field label="Status" htmlFor="task-status">
          <Select
            id="task-status"
            value={form.status}
            onChange={(event) => update('status', event.target.value)}
          >
            {STATUSES.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div>
        <p className="label">Tags</p>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag and press Enter"
          />
          <button type="button" onClick={addTag} className="btn btn-secondary shrink-0" aria-label="Add tag">
            <FaPlus size={10} />
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-1 text-[0.68rem] font-medium text-content-muted"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => update('tags', form.tags.filter((t) => t !== tag))}
                  className="text-content-subtle hover:text-rose-500"
                  aria-label={`Remove ${tag}`}
                >
                  <FaTimesCircle size={9} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
            <FaTimes size={9} /> Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          <FaSave size={9} /> {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
