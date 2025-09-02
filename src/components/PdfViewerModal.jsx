import React, { useState } from 'react';

const PdfViewerModal = ({ fileUrl, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle iframe load events
  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load PDF. Please try again later.');
    setLoading(false);
  };

  if (!fileUrl) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose} // Close modal on backdrop click
    >
      <div 
        style={{
          backgroundColor: 'white',
          height: '90vh',
          width: '80vw',
          maxWidth: '1200px',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <button 
          onClick={onClose} 
          style={{
            alignSelf: 'flex-end',
            padding: '8px 12px',
            marginBottom: '10px',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#f0f0f0',
            fontWeight: 'bold'
          }}
        >
          Close
        </button>
        <div style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
          {error && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
              <h3>Error Loading PDF</h3>
              <p>{error}</p>
              <p>Please try again or contact support if the issue persists.</p>
            </div>
          )}
          
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 10 }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}
          
          <iframe
            src={fileUrl}
            title="PDF Viewer"
            width="100%"
            height="100%"
            style={{ border: 'none', flexGrow: 1 }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
