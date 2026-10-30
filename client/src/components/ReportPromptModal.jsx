import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Download,
  Printer,
  X,
  HelpCircle,
} from 'lucide-react';
import './ReportPromptModal.css';

/**
 * ReportPromptModal
 *
 * Provides a 2-step confirmation and format selection modal:
 * 1. "Do you want to generate report?"
 * 2. "Select Report Format: Excel (.xlsx) or PDF (.pdf)"
 * 3. Generates report in the selected format
 */
export default function ReportPromptModal({
  isOpen,
  onClose,
  reportTitle = 'Funding Overview Report',
  reportSubtitle = 'Official Financial Analysis & Progress Report',
  reportDetails = '',
  onGenerate,
  onPrintPreview = null,
  defaultFormat = 'excel', // 'excel' | 'pdf'
}) {
  const [step, setStep] = useState('confirm'); // 'confirm' | 'format'
  const [selectedFormat, setSelectedFormat] = useState(defaultFormat);
  const [isGenerating, setIsGenerating] = useState(false);

  // Always reset to confirmation step and default format when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setSelectedFormat(defaultFormat || 'excel');
      setIsGenerating(false);
    }
  }, [isOpen, defaultFormat]);

  if (!isOpen) return null;

  const handleProceedToFormat = () => {
    setStep('format');
  };

  const handleBackToConfirm = () => {
    setStep('confirm');
  };

  const handleExecuteGenerate = async () => {
    setIsGenerating(true);
    try {
      if (onGenerate) {
        await onGenerate(selectedFormat);
      }
      // Reset & close after brief moment
      setTimeout(() => {
        setIsGenerating(false);
        setStep('confirm');
        onClose();
      }, 400);
    } catch (err) {
      console.error('Error generating report:', err);
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    onClose();
  };

  return (
    <div className="report-prompt-backdrop" onClick={handleClose}>
      <div
        className="report-prompt-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="report-prompt-header">
          <div className="header-badge-group">
            <span className="step-badge">
              {step === 'confirm' ? 'පියවර 1 / 2 : තහවුරු කිරීම' : 'පියවර 2 / 2 : ආකෘතිය තේරීම'}
            </span>
          </div>
          <button
            type="button"
            className="prompt-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* STEP 1: CONFIRMATION */}
        {step === 'confirm' && (
          <div className="report-prompt-body animate-fade-in">
            <div className="prompt-icon-ring">
              <HelpCircle size={38} className="prompt-main-icon" />
            </div>

            <div className="prompt-text-block">
              <h3 className="prompt-headline">Do you want to generate this report?</h3>
              <p className="prompt-sinhala-text">
                ඔබට මෙම වාර්තාව ජනනය කර ලබා ගැනීමට අවශ්‍යද?
              </p>
            </div>

            {/* Target Report Info Pill */}
            <div className="report-info-pill">
              <div className="report-info-left">
                <FileText size={20} className="report-pill-icon" />
                <div>
                  <h4 className="report-pill-title">{reportTitle}</h4>
                  <p className="report-pill-subtitle">{reportSubtitle}</p>
                </div>
              </div>
              {reportDetails && (
                <div className="report-pill-tag">
                  <span>{reportDetails}</span>
                </div>
              )}
            </div>

            <p className="prompt-explanation">
              Confirm below to choose your desired download format (Excel spreadsheet or PDF document).
            </p>

            {/* Action Buttons for Step 1 */}
            <div className="prompt-footer-actions">
              <button
                type="button"
                className="btn-prompt-secondary"
                onClick={handleClose}
              >
                No, Cancel / නැත
              </button>
              <button
                type="button"
                className="btn-prompt-primary"
                onClick={handleProceedToFormat}
                autoFocus
              >
                <span>Yes, Continue / ඔව්</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FORMAT SELECTION */}
        {step === 'format' && (
          <div className="report-prompt-body animate-fade-in">
            <div className="prompt-text-block compact">
              <h3 className="prompt-headline">Select Report Format</h3>
              <p className="prompt-sinhala-text">
                වාර්තාව ලබා ගැනීමට අවශ්‍ය Format එක තෝරන්න (Excel or PDF):
              </p>
            </div>

            {/* Format Selection Cards Grid */}
            <div className="format-cards-grid">
              {/* Option 1: Excel */}
              <div
                className={`format-card ${selectedFormat === 'excel' ? 'selected' : ''}`}
                onClick={() => setSelectedFormat('excel')}
                role="button"
                tabIndex={0}
              >
                <div className="format-card-header">
                  <div className="format-icon-box excel-icon">
                    <FileSpreadsheet size={26} />
                  </div>
                  <div className="format-badge excel-badge">.XLSX</div>
                </div>

                <div className="format-card-content">
                  <h4 className="format-card-title">Excel Spreadsheet</h4>
                  <p className="format-card-sinhala">එක්සෙල් ගොනුව (.xlsx)</p>
                  <p className="format-card-desc">
                    Clean data table format for Microsoft Excel, WPS Office, and Google Sheets.
                  </p>
                </div>

                <div className="format-card-footer">
                  <div className={`radio-dot ${selectedFormat === 'excel' ? 'active' : ''}`}>
                    {selectedFormat === 'excel' && <CheckCircle2 size={16} />}
                  </div>
                  <span className="format-select-label">
                    {selectedFormat === 'excel' ? 'Selected' : 'Select Excel'}
                  </span>
                </div>
              </div>

              {/* Option 2: PDF */}
              <div
                className={`format-card ${selectedFormat === 'pdf' ? 'selected' : ''}`}
                onClick={() => setSelectedFormat('pdf')}
                role="button"
                tabIndex={0}
              >
                <div className="format-card-header">
                  <div className="format-icon-box pdf-icon">
                    <FileText size={26} />
                  </div>
                  <div className="format-badge pdf-badge">.PDF</div>
                </div>

                <div className="format-card-content">
                  <h4 className="format-card-title">PDF Document</h4>
                  <p className="format-card-sinhala">පී.ඩී.එෆ් ගොනුව (.pdf)</p>
                  <p className="format-card-desc">
                    Clean printable data table in PDF document format.
                  </p>
                </div>

                <div className="format-card-footer">
                  <div className={`radio-dot ${selectedFormat === 'pdf' ? 'active' : ''}`}>
                    {selectedFormat === 'pdf' && <CheckCircle2 size={16} />}
                  </div>
                  <span className="format-select-label">
                    {selectedFormat === 'pdf' ? 'Selected' : 'Select PDF'}
                  </span>
                </div>
              </div>
            </div>

            {/* Optional Print Preview Link */}
            {onPrintPreview && (
              <div className="print-preview-row">
                <button
                  type="button"
                  className="btn-print-preview-link"
                  onClick={() => {
                    handleClose();
                    onPrintPreview();
                  }}
                >
                  <Printer size={15} />
                  <span>Or open official printable web view</span>
                </button>
              </div>
            )}

            {/* Action Buttons for Step 2 */}
            <div className="prompt-footer-actions">
              <button
                type="button"
                className="btn-prompt-secondary"
                onClick={handleBackToConfirm}
                disabled={isGenerating}
              >
                <ArrowLeft size={16} />
                <span>Back / ආපසු</span>
              </button>
              <button
                type="button"
                className="btn-prompt-primary btn-generate"
                onClick={handleExecuteGenerate}
                disabled={isGenerating}
                autoFocus
              >
                <Download size={18} />
                <span>
                  {isGenerating
                    ? 'Generating Report...'
                    : `Generate ${selectedFormat.toUpperCase()} / වාර්තාව ලබාගන්න`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
