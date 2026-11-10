import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaSyncAlt, FaInbox, FaMagic, FaFileAlt } from 'react-icons/fa';
import { useEmails } from '@hooks/useEmails';
import EmailInbox from '@components/emails/EmailInbox';
import EmailThread from '@components/emails/EmailThread';
import EmailComposer from '@components/emails/EmailComposer';
import EmailFilters from '@components/emails/EmailFilters';
import Modal from '@components/ui/Modal';
import EmptyState from '@components/ui/EmptyState';
import SmartReplies from '@components/communication/SmartReplies';
import DocumentIntelligence from '@components/ai/DocumentIntelligence';

const Emails = () => {
  const { emails, loading, sendEmail, markAsRead, toggleStar, deleteEmail, refreshEmails } = useEmails();
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [activeFilter, setActiveFilter] = useState('inbox');
  const [showTools, setShowTools] = useState(null); // 'replies' | 'document' | null

  useEffect(() => {
    document.title = 'Inbox — SchedAI';
  }, []);

  const counts = useMemo(() => {
    const list = Array.isArray(emails) ? emails : [];
    return {
      inbox: list.filter((email) => (email.type || 'inbox') === 'inbox' && !email.trash).length,
      starred: list.filter((email) => email.starred && !email.trash).length,
      sent: list.filter((email) => email.type === 'sent').length,
      trash: list.filter((email) => email.trash).length,
    };
  }, [emails]);

  const filtered = useMemo(() => {
    const list = Array.isArray(emails) ? emails : [];
    switch (activeFilter) {
      case 'starred':
        return list.filter((email) => email.starred && !email.trash);
      case 'sent':
        return list.filter((email) => email.type === 'sent');
      case 'trash':
        return list.filter((email) => email.trash);
      default:
        return list.filter((email) => (email.type || 'inbox') === 'inbox' && !email.trash);
    }
  }, [emails, activeFilter]);

  const handleSelect = (email) => {
    setSelectedEmail(email);
    if (email && !email.read) markAsRead(email._id);
  };

  const handleReply = (email) => {
    setReplyTo(email);
    setShowComposer(true);
  };

  const handleSend = async (data) => {
    await sendEmail(data);
    setShowComposer(false);
    setReplyTo(null);
  };

  const handleUseDraft = (text) => {
    setReplyTo((current) => (current ? { ...current, draftBody: text } : current));
    setShowTools(null);
    setShowComposer(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Move this email to trash?')) {
      await deleteEmail(id);
      setSelectedEmail(null);
    }
  };

  const unread = filtered.filter((email) => !email.read).length;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inbox</h1>
          <p className="page-subtitle">
            {loading ? 'Fetching mail…' : `${filtered.length} messages · ${unread} unread`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => refreshEmails()} className="btn btn-outline btn-sm" aria-label="Refresh inbox">
            <FaSyncAlt size={9} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setShowTools(showTools === 'replies' ? null : 'replies')}
            className="btn btn-outline btn-sm"
            disabled={!selectedEmail}
            title={selectedEmail ? 'Draft a reply to the selected message' : 'Select a message first'}
          >
            <FaMagic size={9} /> Draft reply
          </button>
          <button
            type="button"
            onClick={() => setShowTools(showTools === 'document' ? null : 'document')}
            className="btn btn-outline btn-sm"
          >
            <FaFileAlt size={9} /> Analyse document
          </button>
          <button type="button" onClick={() => setShowComposer(true)} className="btn btn-primary btn-sm">
            <FaPlus size={9} /> Compose
          </button>
        </div>
      </div>

      {showTools === 'replies' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SmartReplies
            originalMessage={selectedEmail ? `${selectedEmail.subject || ''}\n\n${selectedEmail.body || ''}` : ''}
            onSend={(text) => handleUseDraft(text)}
            onEdit={(text) => handleUseDraft(text)}
          />
          <div className="card p-6 text-sm text-content-muted">
            <p className="font-semibold text-content">Drafting from the selected message</p>
            {selectedEmail ? (
              <>
                <p className="mt-2 text-xs uppercase tracking-wide text-content-subtle">Subject</p>
                <p className="mb-3 text-content">{selectedEmail.subject || '(no subject)'}</p>
                <p className="text-xs uppercase tracking-wide text-content-subtle">Message</p>
                <p className="mt-1 whitespace-pre-wrap">{selectedEmail.body || '(empty)'}</p>
              </>
            ) : (
              <p className="mt-2">Select a message in the list first — drafts are written against its contents.</p>
            )}
          </div>
        </div>
      )}

      {showTools === 'document' && (
        <DocumentIntelligence />
      )}

      <div className="grid gap-4 lg:grid-cols-[13rem_1fr_1.3fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <EmailFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />
          <div className="card mt-3 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">At a glance</p>
            <ul className="mt-2.5 space-y-1.5 text-xs text-content-muted">
              <li className="flex items-center justify-between">
                <span>Unread</span>
                <span className="font-semibold text-content">{unread}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Starred</span>
                <span className="font-semibold text-content">{counts.starred}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Sent</span>
                <span className="font-semibold text-content">{counts.sent}</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <EmailInbox
            emails={filtered}
            loading={loading}
            onSelectEmail={handleSelect}
            selectedEmail={selectedEmail}
            onToggleStar={toggleStar}
          />
        </div>

        <div className="hidden lg:block">
          {filtered.length === 0 && !loading ? (
            <div className="card flex h-full min-h-[28rem] items-center justify-center">
              <EmptyState
                icon={<FaInbox />}
                title="Nothing in this folder"
                description="Switch filters or compose a new message."
                action={
                  <button type="button" onClick={() => setShowComposer(true)} className="btn btn-primary btn-sm mt-1">
                    Compose email
                  </button>
                }
              />
            </div>
          ) : (
            <EmailThread
              email={selectedEmail}
              onReply={handleReply}
              onDelete={handleDelete}
              onToggleStar={toggleStar}
            />
          )}
        </div>
      </div>

      {/* Mobile reading pane */}
      {selectedEmail && (
        <div className="lg:hidden">
          <Modal isOpen={Boolean(selectedEmail)} onClose={() => setSelectedEmail(null)} title="Message" size="lg">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-content">{selectedEmail.subject}</p>
                <p className="text-xs text-content-muted">From {selectedEmail.from}</p>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-content-muted">{selectedEmail.body}</p>
            </div>
          </Modal>
        </div>
      )}

      <Modal
        isOpen={showComposer}
        onClose={() => {
          setShowComposer(false);
          setReplyTo(null);
        }}
        title={replyTo ? 'Reply' : 'New message'}
        size="lg"
      >
        <EmailComposer
          replyTo={replyTo}
          onSubmit={handleSend}
          onCancel={() => {
            setShowComposer(false);
            setReplyTo(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Emails;
