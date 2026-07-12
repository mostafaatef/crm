import React, { useEffect, useState } from 'react';

interface Attachment {
  id: number;
  file_name: string;
  size: number;
  created_at: string;
}

interface AttachmentsSectionProps {
  dealId?: number;
  contactId?: number;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({ dealId, contactId }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchAttachments = async () => {
    let url = '';
    if (dealId) url = `/api/attachments/deals/${dealId}`;
    else if (contactId) url = `/api/attachments/contacts/${contactId}`;
    else return;

    const res = await fetch(url);
    if (res.ok) {
      setAttachments(await res.json());
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [dealId, contactId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('file', file);
    if (dealId) formData.append('deal_id', String(dealId));
    if (contactId) formData.append('contact_id', String(contactId));

    setIsUploading(true);
    try {
      const res = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        await fetchAttachments();
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    const res = await fetch(`/api/attachments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAttachments(prev => prev.filter(a => a.id !== id));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Attachments</h3>
        <div>
          <input 
            type="file" 
            id={`file-upload-${dealId || contactId}`} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <label htmlFor={`file-upload-${dealId || contactId}`} className="btn btn-primary" style={{ cursor: 'pointer' }}>
            {isUploading ? 'Uploading...' : 'Upload File'}
          </label>
        </div>
      </div>

      {attachments.length === 0 ? (
        <p className="table-empty">No files attached yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Size</th>
              <th>Uploaded At</th>
              <th style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attachments.map(file => (
              <tr key={file.id}>
                <td>
                  <a 
                    href={`/api/attachments/${file.id}/download`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    {file.file_name}
                  </a>
                </td>
                <td>{formatSize(file.size)}</td>
                <td>{new Date(file.created_at).toLocaleString()}</td>
                <td>
                  <button className="btn btn-ghost" style={{ color: '#ef4444' }} onClick={() => handleDelete(file.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttachmentsSection;
