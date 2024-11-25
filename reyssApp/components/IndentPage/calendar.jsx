import React from "react";
import { Calendar } from "react-native-calendars";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const CalendarComponent = ({ selectedDate, handleDatePress }) => {
  return (
    <Calendar
      onDayPress={handleDatePress}
      markedDates={{ [selectedDate]: { selected: true } }}
      theme={{
        selectedDayBackgroundColor: "#ffcc00",
        todayTextColor: "#ffcc00",
      }}
      renderArrow={(direction) => (
        <MaterialIcons
          name={direction === "left" ? "arrow-back" : "arrow-forward"}
          size={24}
          color="#ffcc00"
        />
      )}
    />
  );
};

export default CalendarComponent;
