import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { createItem, deleteItem } from '../services/api';
import { formatDate } from '../utils/helpers';
import ReportPromptModal from './ReportPromptModal';
import { generateItemsReport } from '../utils/reportGenerator';

export default function ItemList({ items, setItems, loading, error, onRefresh }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showReportPrompt, setShowReportPrompt] = useState(false);

  const handleGenerateItemsReport = (format) => {
    generateItemsReport(format, {
      items,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await createItem({ title, description });
      if (res.data) {
        setItems((prev) => [res.data, ...prev]);
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to save to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete item');
    }
  };

  return (
    <div className="item-section">
      <div className="card form-card">
        <h2>Add Document to MongoDB</h2>
        <p className="card-subtitle">
          Test inserting real documents into your MongoDB Cloud Atlas collection.
        </p>

        {actionError && <div className="alert alert-error">{actionError}</div>}

        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="desc">Description</label>
            <textarea
              id="desc"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving to MongoDB...' : 'Save Document'}
          </button>
        </form>
      </div>

      <div className="card list-card">
        <div className="list-header">
          <h2>Documents in Database ({items.length})</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {items.length > 0 && (
              <button
                onClick={() => setShowReportPrompt(true)}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="Generate Documents Report"
              >
                <FileText size={15} />
                <span>Generate Report</span>
              </button>
            )}
            <button onClick={onRefresh} className="btn btn-outline" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {loading && <p className="status-text">Loading documents from MongoDB Cloud...</p>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && items.length === 0 && (
          <div className="empty-state">
            <p>No documents found in your MongoDB collection.</p>
            <span>Use the form on the left to insert your first record!</span>
          </div>
        )}

        <div className="items-grid">
          {items.map((item) => (
            <div key={item._id} className="item-card">
              <div className="item-card-header">
                <h3>{item.title}</h3>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="btn-icon-danger"
                  title="Delete"
                >
                  &times;
                </button>
              </div>
              {item.description && <p className="item-desc">{item.description}</p>}
              <div className="item-footer">
                <span className="item-id">ID: {item._id}</span>
                <span className="item-date">{formatDate(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation & Format Selection Modal for Database Items */}
      <ReportPromptModal
        isOpen={showReportPrompt}
        onClose={() => setShowReportPrompt(false)}
        reportTitle="MongoDB Database Documents Report"
        reportSubtitle="Development initiatives & tracking records"
        reportDetails={`${items.length} Documents`}
        defaultFormat="excel"
        onGenerate={handleGenerateItemsReport}
      />
    </div>
  );
}
