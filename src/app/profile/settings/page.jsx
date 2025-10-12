"use client";

export default function ProfileSettings() {
  return (
    <div className="flex-1 p-6 overflow-y-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Account Settings
      </h1>

      <form className="space-y-6">
        {/* Email Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Notifications
          </label>
          <select className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>All Notifications</option>
            <option>Only Important Updates</option>
            <option>No Emails</option>
          </select>
        </div>

        {/* Change Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <input
            type="password"
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            type="password"
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        {/* Save Button */}
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
