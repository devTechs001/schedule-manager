import React, { useState } from 'react';
import { useEmails } from '@hooks/useEmails';
import EmailInbox from '@components/emails/EmailInbox';
import EmailThread from '@components/emails/EmailThread';
import EmailComposer from '@components/emails/EmailComposer';
import EmailFilters from '@components/emails/EmailFilters';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import { FaPlus } from 'react-icons/fa';

const Emails = () => {
  const { emails, loading, sendEmail, markAsRead, toggleStar, deleteEmail } = useEmails();
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [activeFilter, setActiveFilter] = useState('inbox');

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    if (!email.read) {
      markAsRead(email._id);
    }
  };

  const handleReply = (email) => {
    setReplyTo(email);
    setShowComposer(true);
  };

  const handleSendEmail = async (emailData) => {
    await sendEmail(emailData);
    setShowComposer(false);
    setReplyTo(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      await deleteEmail(id);
      setSelectedEmail(null);
    }
  };

  const filteredEmails = emails.filter(email => {
    switch (activeFilter) {
      case 'starred':
        return email.starred;
      case 'sent':
        return email.type === 'sent';
      case 'trash':
        return email.trash;
      default:
        return !email.trash;
    }
  });

  const filterCounts = {
    inbox: emails.filter(e => !e.trash).length,
    starred: emails.filter(e => e.starred).length,
    sent: emails.filter(e => e.type === 'sent').length,
    trash: emails.filter(e => e.trash).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Emails</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your email communications
          </p>
        </div>
        <Button
          variant="primary"
          icon={<FaPlus />}
          onClick={() => setShowComposer(true)}
        >
          Compose
        </Button>
      </div>

      {/* Email Layout */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
        {/* Filters Sidebar */}
        <div className="col-span-12 lg:col-span-2">
          <EmailFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={filterCounts}
          />
        </div>

        {/* Email List */}
        <div className="col-span-12 lg:col-span-4">
          <EmailInbox
            emails={filteredEmails}
            onSelectEmail={handleSelectEmail}
            selectedEmail={selectedEmail}
          />
        </div>

        {/* Email Content */}
        <div className="col-span-12 lg:col-span-6">
          <EmailThread
            email={selectedEmail}
            onReply={handleReply}
            onDelete={handleDelete}
            onToggleStar={toggleStar}
          />
        </div>
      </div>

      {/* Email Composer Modal */}
      <Modal
        isOpen={showComposer}
        onClose={() => {
          setShowComposer(false);
          setReplyTo(null);
        }}
        title={replyTo ? 'Reply to Email' : 'Compose Email'}
        size="xl"
      >
        <EmailComposer
          onSend={handleSendEmail}
          onClose={() => {
            setShowComposer(false);
            setReplyTo(null);
          }}
          replyTo={replyTo}
        />
      </Modal>
    </div>
  );
};

export default Emails;