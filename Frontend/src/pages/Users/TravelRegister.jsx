import React,{useState} from 'react';
import { useForm } from 'react-hook-form';
import { logout } from '../../redux/slices/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useApiClient from '../../apiclient/apiclient'
import { toast } from 'react-toastify';

const TravelRegister = () => {
  const apiClient = useApiClient()
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const fetchRequests = async () => {
    try {
      const response = await apiClient.get('users/travel-requests/',navigate);
      setRequests(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to fetch travel requests.');
    }
  };

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const response = await apiClient.post('users/travel-requests/', data,navigate)
      if (response.status === 201 || response.status === 200) {
        toast.success("Travel request submitted successfully!")
        reset()
      } else {
        toast.error(response.data?.message || 'Failed to submit travel request');
      }
    } catch (error) {
      console.error('Error submitting travel request:', error);
      toast.error(error.response?.data?.message || 'An error occurred while submitting the request.');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear()
    navigate("/login")
  }

  // Function to get tomorrow's date for min date validation
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Logout Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium"
        >
          Logout
        </button>
      </div>
      <button onClick={fetchRequests} className="mb-4 bg-green-600 text-white px-4 py-2 rounded-md">Show My Requests</button>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Travel Registration</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              id="project_name"
              {...register("project_name", { required: "Project name is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3"
            />
            {errors.project_name && (
              <p className="mt-1 text-sm text-red-600">{errors.project_name.message}</p>
            )}
          </div>

          {/* Purpose of Travel */}
          <div>
            <label htmlFor="travel_purpose" className="block text-sm font-medium text-gray-700">
              Purpose of Travel
            </label>
            <textarea
              id="travel_purpose"
              rows={3}
              {...register("travel_purpose", { required: "Purpose of travel is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3"
            />
            {errors.travel_purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.travel_purpose.message}</p>
            )}
          </div>

          {/* Travel Start Date and Travel Mode*/}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Travel Start Date
              </label>
              <input
                type="date"
                id="start_date"
                min={getTomorrowDate()}
                {...register("start_date", {
                  required: "Start date is required",
                  validate: (value) => {
                    const selectedDate = new Date(value);
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);
                    return selectedDate >= tomorrow || "Travel date must be a future date";
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3"
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="travelMode" className="block text-sm font-medium text-gray-700">
                Travel Mode
              </label>
              <select
                id="travel_mode"
                {...register("travel_mode", { required: "Travel mode is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3"
              >
                <option value="train">By Train</option>
                <option value="flight">By Flight</option>
              </select>
              {errors.travel_mode && (
                <p className="mt-1 text-sm text-red-600">{errors.travel_mode.message}</p>
              )}
            </div>
          </div>

          {/* Ticket Booking Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Booking Mode
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="self"
                  value="self"
                  {...register("booking_mode", { required: "Booking mode is required" })}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="self" className="ml-3 block text-base font-medium text-gray-700">
                  Self
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="travelDesk"
                  value="travelDesk"
                  {...register("booking_mode", { required: "Booking mode is required" })}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="travelDesk" className="ml-3 block text-base font-medium text-gray-700">
                  Travel Desk
                </label>
              </div>
            </div>
            {errors.booking_mode && (
              <p className="mt-1 text-sm text-red-600">{errors.booking_mode.message}</p>
            )}
          </div>

          {/* Travel Start Location and End Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700">
                Travel Start Location
              </label>
              <input
                type="text"
                id="start_location"
                {...register("start_location", { required: "Start location is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3"
              />
              {errors.start_location && (
                <p className="mt-1 text-sm text-red-600">{errors.start_location.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="end_location" className="block text-sm font-medium text-gray-700">
                Travel End Location
              </label>
              <input
                type="text"
                id="end_location"
                {...register("end_location", { required: "End location is required" })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3"
              />
              {errors.end_location && (
                <p className="mt-1 text-sm text-red-600">{errors.end_location.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-4/5 max-h-[80vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4">My Travel Requests</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Project Name</th>
                  <th className="border p-2">Purpose</th>
                  <th className="border p-2">Start Date</th>
                  <th className="border p-2">Travel Mode</th>
                  <th className="border p-2">Booking Mode</th>
                  <th className="border p-2">Start Location</th>
                  <th className="border p-2">End Location</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((req, index) => (
                    <tr key={index} className="border">
                      <td className="border p-2">{req.project_name}</td>
                      <td className="border p-2">{req.travel_purpose}</td>
                      <td className="border p-2">{req.start_date}</td>
                      <td className="border p-2">{req.travel_mode}</td>
                      <td className="border p-2">{req.booking_mode}</td>
                      <td className="border p-2">{req.start_location}</td>
                      <td className="border p-2">{req.end_location}</td>
                      <td className={`border p-2 ${
  req.status === 'Pending' ? 'bg-yellow-300 text-yellow-800' :
  req.status === 'Approved' ? 'bg-green-300 text-green-800' :
  req.status === 'Rejected' ? 'bg-red-300 text-red-800' :
  ''
}`}>{req.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-4 text-center">No travel requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button onClick={() => setShowModal(false)} className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-md">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelRegister;