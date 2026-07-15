import React, { useEffect, useRef } from 'react';

const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  const modalRef = useRef(null);
  const modalInstance = useRef(null);

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js').then((bootstrap) => {
      if (show && modalRef.current) {
        modalInstance.current = new bootstrap.Modal(modalRef.current);
        modalInstance.current.show();
      }
    });
  }, [show]);

  const handleClose = () => {
    if (modalInstance.current) {
      modalInstance.current.hide();
    }
    onCancel();
  };

  const handleConfirm = () => {
    if (modalInstance.current) {
      modalInstance.current.hide();
    }
    onConfirm();
  };

  if (!show) return null;

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-danger">{title}</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              取消
            </button>
            <button type="button" className="btn btn-danger" onClick={handleConfirm}>
              確定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;