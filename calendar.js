// Import from anki.js to get anki data to display to user
import { main, cardReviewsByDay } from './anki.js';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const today = new Date();

// Set date to the present day the user is accessing the application on
var current_month = today.getMonth();
var current_year = today.getFullYear()
var current_day = today.getDay();

// Keeps track of the day that has been just edited, used in saveForm()
var current_day_edited = 0;
// Keeps track of day already selected so it can be unselected when another day is selected
var previous_selected = null;
// Create initial calendar
updateCalendar();


// Update the calendar to the current date the user has moved to
async function updateCalendar() {
    // Wait for main to run so that the data for anki has loaded
    await main();
    // Update text at top of calendar of homepage to the current month and year
    document.getElementById("monthAndYear").innerHTML = String(months[current_month]) + ' ' + String(current_year);
    
    var daysInCurrentMonth = daysInMonth(current_month + 1, current_year, 0);
    var firstWeekDay = new Date(current_year, current_month, 1).getDay() + 1
    // Counts the current day that will be written to the calendar
    var day_counter = 0
    // Writes blank spaces for days that do not belong to the current month the user is looking at
    for (var i = 1; i <= 37; i++) {
        if (i >= firstWeekDay && i < daysInCurrentMonth + firstWeekDay) {
            day_counter += 1;
            document.getElementById(String(i)).innerHTML = String(day_counter);
        } else {
            document.getElementById(String(i)).innerHTML = '&nbsp;';
        }
    }

    const nextButton = document.getElementsByClassName("next");
    const previousButton = document.getElementsByClassName("previous");
    // Remove the change in color from the currently pressed date on the calendar when the next or previous button is pressed
    nextButton[0].addEventListener("click", () => {
        if (previous_selected !== null) {
            document.getElementById(String(previous_selected)).classList.remove("currentSquare");
        }
        previous_selected = null;
    });
    
    previousButton[0].addEventListener("click", () => {
        if (previous_selected !== null) {
            document.getElementById(String(previous_selected)).classList.remove("currentSquare");
        }
        previous_selected = null;
    });

    // Store all dates of the current month in dates
    const dates = document.getElementsByClassName("squares");
    // Display form when day is pressed on calendar
    for (var i = 0; i < dates.length; i++) {
        // Add event listeners to all dates on calendar
        dates[i].addEventListener("click", (date) => {
            current_day = date.target.id - firstWeekDay + 1;
            current_day_edited = current_day;
            // Only shows form if day clicked is in the current month being viewed
            if (current_day > 0 && current_day <= daysInCurrentMonth) {
                // Make form visible
                document.getElementById("form").style.display = "block";
                // Change the formDate Label to display the current date of the day selected
                document.getElementById("formDate").innerHTML = "Date: " + String(current_month + 1) + "-" + String(current_day) + "-" + String(current_year);

                // If a previous day has been selected, remove the currentSquare class that makes that square a different color
                if (previous_selected !== null) {
                    document.getElementById(String(previous_selected)).classList.remove("currentSquare");
                }

                // Add the currentSquare class to the current day
                document.getElementById(String(date.target.id)).classList.add("currentSquare");
                // Update the prevously selected day to the current
                previous_selected = date.target.id;

                // If current day selected has data already stored in local storage, display that information
                if (localStorage.getItem(String(current_year) + "-" + String(current_month + 1) + "-" + String(current_day)) !== null) {
                    console.log("test");
                    var dateHours = JSON.parse(localStorage.getItem(current_year + "-" + (current_month + 1) + "-" + current_day));
                    document.getElementById("listening").innerHTML = '<label for="Listening" id="listening">Listening: ' + dateHours["listeningHours"] + " hour(s) and " + dateHours["listeningMinutes"] + " minute(s)</label><br>";
                    document.getElementById("reading").innerHTML = '<label for="Reading" id="reading">Reading: ' + dateHours["readingHours"] + " hour(s) and " + dateHours["readingMinutes"] + " minute(s)</label><br>";
                    document.getElementById("writing").innerHTML = '<label for="Writing" id="writing">Writing: ' + dateHours["writingHours"] + " hour(s) and " + dateHours["writingMinutes"] + " minute(s)</label><br>";
                    document.getElementById("speaking").innerHTML = '<label for="Speaking" id="speaking">Speaking: ' + dateHours["speakingHours"] + " hour(s) and " + dateHours["speakingMinutes"] + " minute(s)</label><br>";
                    if ((current_month + 1) <= 9) {
                        if (current_day <= 9) {
                            document.getElementById("card").innerHTML = '<label for="Cards" id="card">Cards Reviewed Today: ' + cardReviewsByDay[current_year + "-0" + (current_month + 1) + "-0" + current_day] + " card(s)</label><br>";
                        } else {
                            document.getElementById("card").innerHTML = '<label for="Cards" id="card">Cards Reviewed Today: ' + cardReviewsByDay[current_year + "-0" + (current_month + 1) + "-" + current_day] + " card(s)</label><br>";
                        }
                    } else {
                        if (current_day <= 9) {
                            document.getElementById("card").innerHTML = '<label for="Cards" id="card">Cards Reviewed Today: ' + cardReviewsByDay[current_year + "-" + (current_month + 1) + "-0" + current_day] + " card(s)</label><br>";
                        } else {
                            document.getElementById("card").innerHTML = '<label for="Cards" id="card">Cards Reviewed Today: ' + cardReviewsByDay[current_year + "-" + (current_month + 1) + "-" + current_day] + " card(s)</label><br>";
                        }
                    }
                    document.getElementById("totalTimeRecorded").innerHTML = "<p>Total: " + dateHours["totalHours"] + " Hour(s) and " + dateHours["totalMinutes"] + " Minute(s)<\p>";
                } else {
                    document.getElementById("listening").innerHTML = "<p>Listening: 0 hour(s) and 0 minute(s)</p>";
                    document.getElementById("reading").innerHTML = "<p>Reading: 0 hour(s) and 0 minute(s)</p>";
                    document.getElementById("writing").innerHTML = "<p>Writing: 0 hour(s) and 0 minute(s)</p>";
                    document.getElementById("speaking").innerHTML = "<p>Speaking: 0 hour(s) and 0 minute(s)</p>";
                    document.getElementById("card").innerHTML = '<label for="Cards" id="card">Cards Reviewed Today: 0 card(s)</label><br>';
                    document.getElementById("totalTimeRecorded").innerHTML = "<p>Total: 0 Hour(s) and 0 Minutes</p>";
                }
            }
        });
    }
}

function daysInMonth(month, year) { // 1 - January
    return new Date(year, month , 0).getDate();
}

function previousMonth() {
    if (current_month >= 1) {
        current_month -= 1;
    } else {
        current_month = 11;
        current_year -= 1;
    }
    updateCalendar();
}

function nextMonth() {
    if (current_month <= 10) {
        current_month += 1;
    } else {
        current_month = 0;
        current_year += 1;
    }
    updateCalendar();
}

document.getElementById("saveButton").addEventListener("click", saveForm);

function saveForm() {
    var listeningHoursInput = document.getElementById("listeningHours");
    var listeningMinutesInput = document.getElementById("listeningMinutes");
    var readingHoursInput = document.getElementById("readingHours");
    var readingMinutesInput = document.getElementById("readingMinutes");
    var writingHoursInput = document.getElementById("writingHours");
    var writingMinutesInput = document.getElementById("writingMinutes");
    var speakingHoursInput = document.getElementById("speakingHours");
    var speakingMinutesInput = document.getElementById("speakingMinutes");
    var totalHours = Number(listeningHoursInput.value) + Number(readingHoursInput.value) + Number(writingHoursInput.value) + Number(speakingHoursInput.value);
    var totalMinutes = Number(listeningMinutesInput.value) + Number(readingMinutesInput.value) + Number(writingMinutesInput.value) + Number(speakingMinutesInput.value);

    var hours = {"listeningHours": listeningHoursInput.value,
                 "listeningMinutes": listeningMinutesInput.value,
                 "readingHours": readingHoursInput.value,
                 "readingMinutes": readingMinutesInput.value,
                 "writingHours": writingHoursInput.value,
                 "writingMinutes": writingMinutesInput.value,
                 "speakingHours": speakingHoursInput.value,
                 "speakingMinutes": speakingMinutesInput.value,
                 "totalHours": totalHours,
                 "totalMinutes": totalMinutes,};

    localStorage.setItem(current_year + "-" + (current_month + 1) + "-" + current_day_edited, JSON.stringify(hours));
}

document.getElementById("cancelButton").addEventListener("click", closeForm);

function closeForm() {
    updateCalendar();
    document.getElementById("form").style.display = "none";
}