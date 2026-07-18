"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const days = getDaysInMonth(currentMonth);
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth}>
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="font-semibold text-gray-800">
          {currentMonth.toLocaleString("default", { month: "long" })}{" "}
          {currentMonth.getFullYear()}
        </h2>
        <button onClick={nextMonth}>
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 text-sm font-medium text-text-4 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 text-sm text-gray-700">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}
        {Array.from({ length: days }).map((_, i) => (
          <div
            key={i}
            className="p-2 text-center rounded-lg hover:bg-blue-100 cursor-pointer"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
