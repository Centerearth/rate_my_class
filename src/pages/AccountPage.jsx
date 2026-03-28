import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { deleteAccount as deleteAccountApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, clearUser } = useAuth();

  async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;

    try {
      await deleteAccountApi();
      clearUser();
      navigate('/');
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <Layout>
      <div id="account-main" className="pt-4">
        <h1>Account</h1>
        {user && (
          <div className="mt-4 text-start">
            <p className="fs-5"><strong>Name:</strong> {user.name}</p>
            <p className="fs-5"><strong>Email:</strong> {user.email}</p>
            <button className="btn btn-danger mt-3" onClick={deleteAccount}>
              Delete Account
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}