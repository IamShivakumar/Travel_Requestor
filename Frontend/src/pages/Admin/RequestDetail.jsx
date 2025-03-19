import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApiClient from '../../apiclient/apiclient'
const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiclient=useApiClient()
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const response = await apiclient.get(`users/travel-requests/${id}/`,navigate);
      setRequest(response.data);
      setNewStatus(response.data.status);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch travel request details try again After Sometime');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdateError(null);
      setUpdateSuccess(false);
      const response = await apiclient.patch(`users/travel-requests/${id}/`, {
        status: newStatus
      });
      setRequest(response.data);
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      setUpdateError('Failed to update status. Only admins can update travel requests.');
      console.error('Update error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">There are no New Requests Currently</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Travel Request Details</h2>
            <button
              onClick={() => navigate('/requests')}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Back to List
            </button>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Project Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.project_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Requested User</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.username}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Purpose of Travel</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.travel_purpose}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(request.start_date).toLocaleDateString()}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Travel Mode</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {request.travel_mode.charAt(0).toUpperCase() + request.travel_mode.slice(1)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Booking Mode</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {request.booking_mode.charAt(0).toUpperCase() + request.booking_mode.slice(1)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Start Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.start_location}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">End Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.end_location}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(request.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Update Status:
                </label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Update Status
                </button>
              </div>
              
              {updateError && (
                <div className="text-sm text-red-600">
                  {updateError}
                </div>
              )}
              
              {updateSuccess && (
                <div className="text-sm text-green-600">
                  Status updated successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail; 