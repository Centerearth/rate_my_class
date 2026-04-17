import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { deleteAccount as deleteAccountApi, deleteReview } from '../services/api';
import { getReviewsByEmail } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Review } from '../services/api';

function ConfirmModal({ title, message, onConfirm, onCancel }: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0, 5, 20, 0.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', background: 'rgba(0, 15, 45, 0.95)', border: '1px solid rgba(0, 90, 200, 0.35)', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 700 }}>{title}</h3>
        <p style={{ color: 'var(--text-bright)', marginBottom: '1.75rem', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(160,195,230,0.2)', borderRadius: '8px', color: 'var(--text-bright)', padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ background: 'rgba(160, 30, 30, 0.4)', border: '1px solid rgba(200, 60, 60, 0.45)', borderRadius: '8px', color: 'rgba(230, 110, 110, 0.95)', padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, clearUser } = useAuth();
  const [reviews, setReviews] = useState([] as Review[]);
  const [modal, setModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  function confirm(title: string, message: string, onConfirm: () => void) {
    setModal({ title, message, onConfirm });
  }

  async function deleteAccount() {
    confirm('Delete Account', 'Are you sure you want to delete your account? This cannot be undone.', async () => {
      setModal(null);
      try {
        await deleteAccountApi();
        clearUser();
        navigate('/');
      } catch (e) {
        alert((e as Error).message);
      }
    });
  }

  async function loadUserReviews() {
    if (!user) return [];
    try {
      const reviewsData : Review[] = await getReviewsByEmail(user.email);
      setReviews(reviewsData);
    } catch (e) {
      console.error('Failed to load user reviews', e);
      return [];
    }
  }

  useEffect(() => {
    if (user) {
      loadUserReviews();
    }
  }, [user]);

  async function handleDeleteReview(id: string) {
    confirm('Delete Review', 'Are you sure you want to delete this review?', async () => {
      setModal(null);
      try {
        await deleteReview(id);
        loadUserReviews();
      } catch (e) {
        console.error('Failed to delete review', e);
      }
    });
  }

  const card: React.CSSProperties = {
    background: 'rgba(0, 20, 60, 0.45)',
    border: '1px solid rgba(0, 90, 200, 0.25)',
    borderRadius: '12px',
    padding: '1.75rem 2rem',
    backdropFilter: 'blur(8px)',
  };

  const reviewItem: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderBottom: '1px solid rgba(0, 90, 200, 0.15)',
  };

  return (
    <Layout>
      {modal && <ConfirmModal title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
      <div className="page-col" style={{ maxWidth: '800px' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '1.75rem' }}>Account</h1>
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div className="card-hover" style={card}>
              <p style={{ color: 'var(--text-bright)', margin: '0 0 0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Name:</strong> {user.name}</p>
              <p style={{ color: 'var(--text-bright)', margin: 0 }}><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {user.email}</p>
            </div>

            <div className="card-hover" style={card}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Your Reviews</h4>
              {reviews.length > 0 ? (
                <div>
                  {reviews.map((review, i) => (
                    <div key={review.date} style={{ ...reviewItem, ...(i === reviews.length - 1 ? { borderBottom: 'none', paddingBottom: 0 } : {}) }}>
                      <div>
                        <p style={{ color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                          <strong>{review.name}</strong> — {new Date(review.date).toLocaleDateString()}
                        </p>
                        <p style={{ color: 'var(--text-bright)', margin: 0 }}>
                          Grade: {review.grade} &nbsp;·&nbsp; Rating: {review.rating?.toString() || 'N/A'} &nbsp;·&nbsp; Class: {review.class.toLocaleUpperCase()}
                        </p>
                        <p style={{ color: 'var(--text-bright)', margin: '0.25rem 0 0' }}>{review.review}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(review._id!)}
                        style={{ background: 'transparent', border: '1px solid rgba(200, 60, 60, 0.5)', color: 'rgba(220, 100, 100, 0.9)', borderRadius: '6px', padding: '0.3rem 0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '1.5rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>You have no reviews yet.</p>
              )}
            </div>

            <button
              onClick={deleteAccount}
              style={{ alignSelf: 'flex-start', background: 'rgba(160, 30, 30, 0.35)', border: '1px solid rgba(200, 60, 60, 0.4)', color: 'rgba(230, 110, 110, 0.95)', borderRadius: '8px', padding: '0.55rem 1.5rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Delete Account
            </button>

          </div>
        )}
      </div>
    </Layout>
  );
}

/*
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startRegistration } from '@simplewebauthn/browser';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { deleteAccount as deleteAccountApi, postAuthRequest, getPasskeys, deletePasskey, updatePassword } from '../services/api';

const CONFIRM_CLOSED = { show: false, title: '', body: '', onConfirm: null };
const INFO_CLOSED    = { show: false, title: '', body: '', variant: 'success' };

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, clearUser } = useAuth();
  const [passkeys, setPasskeys] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [confirmModal, setConfirmModal] = useState(CONFIRM_CLOSED);
  const [infoModal, setInfoModal] = useState(INFO_CLOSED);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);

  function showInfo(title, body, variant = 'success') {
    setInfoModal({ show: true, title, body, variant });
  }

  function showConfirm(title, body, onConfirm) {
    setConfirmModal({ show: true, title, body, onConfirm });
  }

  async function loadPasskeys() {
    try {
      const passkeyData = await getPasskeys();
      setPasskeys(passkeyData);
    } catch (e) {
      console.error('Failed to load passkeys', e);
    }
  }

  useEffect(() => {
    if (user) {
      loadPasskeys();
    }
  }, [user]);

  function deleteAccount() {
    showConfirm(
      'Delete Account',
      'Are you sure you want to delete your account? This cannot be undone.',
      async () => {
        setAccountLoading(true);
        try {
          await deleteAccountApi();
          clearUser();
          navigate('/');
        } catch (e) {
          showInfo('Error', e.message, 'danger');
        } finally {
          setAccountLoading(false);
        }
      }
    );
  }

  function handleDeletePasskey(id) {
    showConfirm(
      'Delete Passkey',
      'Are you sure you want to delete this passkey?',
      async () => {
        setPasskeyLoading(true);
        try {
          await deletePasskey(id);
          loadPasskeys();
        } catch (e) {
          showInfo('Error', e.message, 'danger');
        } finally {
          setPasskeyLoading(false);
        }
      }
    );
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      if (!newPassword || newPassword.length < 8) {
        setPasswordMsg({ type: 'danger', text: 'Password must be at least 8 characters long.' });
        return;
      }
      await updatePassword(newPassword);
      setNewPassword('');
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
    } catch (err) {
      setPasswordMsg({ type: 'danger', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function addPasskey() {
    setPasskeyLoading(true);
    try {
      const options = await postAuthRequest('/api/auth/register-options', {});
      const attResp = await startRegistration(options);
      await postAuthRequest('/api/auth/register-verify', attResp);
      showInfo('Passkey Added', 'Passkey registered successfully!');
      loadPasskeys();
    } catch (e) {
      showInfo('Error', `Error registering passkey: ${e.message}`, 'danger');
    } finally {
      setPasskeyLoading(false);
    }
  }

  return (
    <Layout>
      <div id="account-main" className="pt-4">
        <h1>Account</h1>
        <div className="mt-4 text-start">
          <p className="fs-5"><strong>Name:</strong> {user.name}</p>
          <p className="fs-5"><strong>Email:</strong> {user.email}</p>

          <h4 className="mt-5">Your Passkeys</h4>
          {passkeys.length > 0 ? (
            <ul className="list-group mt-3">
              {passkeys.map((key) => (
                <li key={key.credentialID} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    {key.credentialID} was registered on {new Date(key.created_at).toLocaleDateString()}
                    {key.transports && ` (via ${key.transports.join(', ')})`}
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    disabled={passkeyLoading}
                    onClick={() => handleDeletePasskey(key.credentialID)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have no passkeys registered.</p>
          )}

          <div className="mt-4">
            <button className="btn btn-primary mt-3" disabled={passkeyLoading} onClick={addPasskey}>
              {passkeyLoading ? <><span className="spinner-border spinner-border-sm me-2" />Adding...</> : 'Add passkey'}
            </button>
          </div>

          <h4 className="mt-5">Update Password</h4>
          <form className="mt-3" onSubmit={handleChangePassword}>
            <div className="mb-3" style={{ maxWidth: '400px' }}>
              <label htmlFor="new-password" className="form-label">New Password</label>
              <input
                id="new-password"
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(null); }}
                placeholder="Enter new password"
              />
            </div>
            {passwordMsg && (
              <div role="alert" className={`alert alert-${passwordMsg.type} py-2`} style={{ maxWidth: '400px' }}>
                {passwordMsg.text}
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
              {passwordLoading ? <><span className="spinner-border spinner-border-sm me-2" />Updating...</> : 'Update Password'}
            </button>
          </form>

          <button className="btn btn-danger mt-5" disabled={accountLoading} onClick={deleteAccount}>
            Delete Account
          </button>
        </div>
      </div>

      {/* Confirmation modal *//*}
      {confirmModal.show && (
        <>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{confirmModal.title}</h5>
                  <button type="button" className="btn-close" onClick={() => setConfirmModal(CONFIRM_CLOSED)} />
                </div>
                <div className="modal-body">
                  <p>{confirmModal.body}</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setConfirmModal(CONFIRM_CLOSED)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => { setConfirmModal(CONFIRM_CLOSED); confirmModal.onConfirm(); }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {/* Info / error modal *//*}
      {infoModal.show && (
        <>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className={`modal-header text-bg-${infoModal.variant}`}>
                  <h5 className="modal-title">{infoModal.title}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setInfoModal(INFO_CLOSED)} />
                </div>
                <div className="modal-body">
                  <p>{infoModal.body}</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setInfoModal(INFO_CLOSED)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </Layout>
  );
}
*/