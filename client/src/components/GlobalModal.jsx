import React, { useEffect, useRef } from 'react';

const GlobalModal = ({ show, title, message, onClose }) => {
  const modalRef = useRef(null);
  const modalInstance = useRef(null);

  useEffect(() => {
    // 解決 Windows / Browser 環境下物件名稱大寫修正問題 (bootstrap.Modal)
    import('bootstrap/dist/js/bootstrap.bundle.min.js').then((bootstrap) => {
      if (show && modalRef.current) {
        modalInstance.current = new bootstrap.Modal(modalRef.current);
        modalInstance.current.show();

        // 5秒後自動關閉邏輯
        const timer = setTimeout(() => {
          handleClose();
        }, 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [show]);

  const handleClose = () => {
    if (modalInstance.current) {
      modalInstance.current.hide();
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalModal;