import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail, Calendar } from 'lucide-react';
import { authService } from '../../lib/authService';
import { formatDate } from '../../lib/utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertModal, ConfirmModal } from '../ui/Modal';

export function PendingRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const data = await authService.getPendingRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalClick = (registrationId, action) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (!registration) return;

    setPendingAction({ registrationId, action, registration });
    setShowConfirmModal(true);
  };

  const handleConfirmApproval = async () => {
    if (!pendingAction) return;

    const { registrationId, action, registration } = pendingAction;

    try {
      setProcessingId(registrationId);

      const approval_status = action === 'approve' ? 'approved' : 'rejected';
      await authService.updateRegistrationStatus(registrationId, approval_status);

      // Refresh the list so counts and status badges reflect the change
      await fetchPendingRegistrations();

      setModalMessage(
        `Registration for ${registration.full_name} has been ${action === 'approve' ? 'approved' : 'rejected'} successfully!`
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error(`Error ${action}ing registration:`, error);
      setModalMessage(`Error ${action}ing registration: ${error.message}`);
      setShowErrorModal(true);
    } finally {
      setProcessingId(null);
      setPendingAction(null);
    }
  };

  const getStatusIcon = (approval_status) => {
    switch (approval_status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusColor = (approval_status) => {
    switch (approval_status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-orange-600 bg-orange-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={modalMessage}
        type="success"
      />

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={modalMessage}
        type="error"
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmApproval}
        title={`${pendingAction?.action === 'approve' ? 'Approve' : 'Reject'} Registration`}
        message={
          pendingAction
            ? `Are you sure you want to ${pendingAction.action} the registration for ${pendingAction.registration.full_name}?`
            : ''
        }
        confirmText={pendingAction?.action === 'approve' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        type={pendingAction?.action === 'approve' ? 'success' : 'danger'}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Registrations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve new user account requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Review
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {registrations.filter(r => r.approval_status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Approved
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {registrations.filter(r => r.approval_status === 'approved').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rejected
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {registrations.filter(r => r.approval_status === 'rejected').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registrations table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Applicant</th>
                <th className="table-header">Email</th>
                <th className="table-header">Role</th>
                <th className="table-header">Applied</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {registration.full_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{registration.email}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {registration.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDate(registration.created_at, 'MMM d, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(registration.approval_status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(registration.approval_status)}`}>
                        {registration.approval_status}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    {registration.approval_status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApprovalClick(registration.id, 'approve')}
                          disabled={processingId === registration.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {processingId === registration.id ? (
                            <LoadingSpinner size="sm" className="mr-1" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleApprovalClick(registration.id, 'reject')}
                          disabled={processingId === registration.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {registrations.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No registrations</h3>
            <p className="mt-1 text-sm text-gray-500">
              No pending account registrations at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}