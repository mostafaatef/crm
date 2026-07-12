import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

interface AIEmailDrafterProps {
  contactName: string;
  jobTitle?: string | null;
  organization?: string | null;
}

const AIEmailDrafter: React.FC<AIEmailDrafterProps> = ({ contactName, jobTitle, organization }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState('');

  const generateDraft = async () => {
    setIsGenerating(true);
    setDraft('');
    try {
      const res = await fetch('/api/ai/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          jobTitle,
          organization
        })
      });
      
      if (res.ok) {
        const data: any = await res.json();
        setDraft(data.draft);
      } else {
        setDraft('Failed to generate draft. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setDraft('An error occurred while generating the draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!draft) {
      generateDraft();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    alert('Copied to clipboard!');
  };

  return (
    <>
      <Button 
        onClick={handleOpen} 
        style={{ 
          backgroundColor: 'var(--color-primary)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        AI Email Draft
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="AI Email Draft">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Powered by Meta Llama 3 via Cloudflare Workers AI. You can edit the text below.
          </p>
          
          <textarea
            value={isGenerating ? 'Generating your personalized email...' : draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isGenerating}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '1rem',
              lineHeight: '1.5',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" onClick={generateDraft} disabled={isGenerating}>
              Regenerate
            </Button>
            <Button onClick={handleCopy} disabled={isGenerating || !draft}>
              Copy to Clipboard
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AIEmailDrafter;
