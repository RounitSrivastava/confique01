"use client";

export default function ProfileDetails() {
  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Details</h1>

      <form className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Organization
          </label>
          <input
            type="text"
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Google / IIT Delhi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="text"
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="+91 9876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Profile Avatar (URL)
          </label>
          <input
            type="text"
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
