// Import from anki.js to get anki data to display to user
import { main, cardReviewsByDay, isConnectedToAnki } from './anki.js';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const today = new Date();

var firstWeekDay = 0;
var daysInCurrentMonth = 0;

const nextButton = document.getElementsByClassName("next");
const previousButton = document.getElementsByClassName("previous");

var unusedSquares = [];

// Keeps track of the day that has been just edited, used in saveForm()
var current_day_edited = 0;
// Keeps track of day already selected so it can be unselected when another day is selected
var previous_selected = null;

class CalendarDate {
    constructor(day, month, year) {
        this.day = day;
        this.month = month;
        this.year = year;
    }

    getCalendarDay() {
        return this.day;
    }
    setCalendarDay(day) {
        this.day = day;
    }
    getCalendarMonth() {
        return this.month;
    }
    setCalendarMonth(month) {
        this.month = month;
    }
    getCalendarYear() {
        return this.year;
    }
    setCalendarYear(year) {
        this.year = year;
    }

    getCalendarDate() {
        return String(this.year) + "-" + String(this.month + 1) + "-" + String(this.day);
    }
}

// Set date to the present day the user is accessing the application on
var selected_date = new CalendarDate(today.getDay(), today.getMonth(), today.getFullYear());

// Check if the website is connected to anki
checkAnkiConnection();
// Create initial calendar
updateCalendar();
// Add event listeners so the previous and next buttons update selected square color
updateSelectedSquare(previousButton);
updateSelectedSquare(nextButton);


document.getElementById("reload").addEventListener("click", checkAnkiConnection);
async function checkAnkiConnection() {
    // Wait for main to run so that the data for anki has loaded
    await main();
    if (isConnectedToAnki) {
        document.getElementById("anki").innerHTML = '<p id="anki">Connected to anki</p>';
    } else {
        document.getElementById("anki").innerHTML = '<p id="anki">Not Connected to anki</p>';
    }
}

// Update the calendar to the current date the user has moved to
async function updateCalendar() {
    console.log(selected_date.getCalendarMonth());
    // Update text at top of calendar of homepage to the current month and year
    document.getElementById("monthAndYear").innerHTML = String(months[selected_date.getCalendarMonth()]) + ' ' + String(selected_date.getCalendarYear());
    
    daysInCurrentMonth = daysInMonth(selected_date.getCalendarMonth() + 1, selected_date.getCalendarYear(), 0);
    firstWeekDay = new Date(selected_date.getCalendarYear(), selected_date.getCalendarMonth(), 1).getDay() + 1;
    // Counts the current day that will be written to the calendar
    var day_counter = 0;
    // Remove the previous unused dates from previous month
    unusedSquares = [];
    // Writes blank spaces for days that do not belong to the current month the user is looking at
    for (var i = 1; i <= 37; i++) {
        if (i >= firstWeekDay && i < daysInCurrentMonth + firstWeekDay) {
            day_counter += 1;
            document.getElementById(String(i)).innerHTML = String(day_counter);
        } else {
            document.getElementById(String(i)).innerHTML = '&nbsp;';
            document.getElementById(String(i)).classList.add("unusedSquare");
            unusedSquares.push(String(i));
        }
    }

    addDateEventListeners();
}

function updateSelectedSquare(buttonType) {
    // Remove the change in color from the currently pressed date on the calendar when the next or previous button is pressed
    buttonType[0].addEventListener("click", () => {
        if (previous_selected !== null) {
            document.getElementById(String(previous_selected)).classList.remove("currentSquare");
        }
        previous_selected = null;
        for (var i = 0; i < unusedSquares.length; i++) {
            document.getElementById(unusedSquares[i]).classList.remove("unusedSquare");
        }
    });
}

function addDateEventListeners() {
    // Store all dates of the current month in dates
    const dates = document.getElementsByClassName("squares");
    for (var i = 0; i < dates.length; i++) {
        dates[i].addEventListener("click", (date) => {
            selected_date.setCalendarDay(date.target.id - firstWeekDay + 1);
            current_day_edited = selected_date.getCalendarDay();
            // Only shows form if day clicked is in the current month being viewed
            if (selected_date.getCalendarDay() > 0 && selected_date.getCalendarDay() <= daysInCurrentMonth) {
                // Add the currentSquare class to the current day
                document.getElementById(String(date.target.id)).classList.add("currentSquare");
                // Update the prevously selected day to the current
                previous_selected = date.target.id;
                updateForm();
            } else {
                // If there is no data for this day, display 0 hours and minutes for all categories
                document.getElementById("listening").innerHTML = "<p>Listening: 0 hour(s) and 0 minute(s)</p>";
                document.getElementById("reading").innerHTML = "<p>Reading: 0 hour(s) and 0 minute(s)</p>";
                document.getElementById("writing").innerHTML = "<p>Writing: 0 hour(s) and 0 minute(s)</p>";
                document.getElementById("speaking").innerHTML = "<p>Speaking: 0 hour(s) and 0 minute(s)</p>";
                document.getElementById("card").innerHTML = '<label for="Cards" id="card">Cards Reviewed Today: 0 card(s)</label><br>';
                document.getElementById("totalTimeRecorded").innerHTML = "<p>Total: 0 Hour(s) and 0 Minutes</p>";
            }
        });
    }
}

function updateForm() {
    // Make form visible
    document.getElementById("form").style.display = "block";
    // Change the formDate Label to display the current date of the day selected
    document.getElementById("formDate").innerHTML = "Date: " + selected_date.getCalendarDate();

    // If a previous day has been selected, remove the currentSquare class that makes that square a different color
    if (previous_selected !== null) {
        document.getElementById(String(previous_selected)).classList.remove("currentSquare");
    }

    // If current day selected has data already stored in local storage, display that information
    if (localStorage.getItem(selected_date.getCalendarDate()) !== null) {
        // Get the hours and minutes for each catagory
        var dateHours = JSON.parse(localStorage.getItem(selected_date.getCalendarDate()));
        // Display all of the data stored in local storage for these categories
        document.getElementById("listening").innerHTML = '<label for="Listening" id="listening">Listening: ' + dateHours["listeningHours"] + " hour(s) and " + dateHours["listeningMinutes"] + " minute(s)</label><br>";
        document.getElementById("reading").innerHTML = '<label for="Reading" id="reading">Reading: ' + dateHours["readingHours"] + " hour(s) and " + dateHours["readingMinutes"] + " minute(s)</label><br>";
        document.getElementById("writing").innerHTML = '<label for="Writing" id="writing">Writing: ' + dateHours["writingHours"] + " hour(s) and " + dateHours["writingMinutes"] + " minute(s)</label><br>";
        document.getElementById("speaking").innerHTML = '<label for="Speaking" id="speaking">Speaking: ' + dateHours["speakingHours"] + " hour(s) and " + dateHours["speakingMinutes"] + " minute(s)</label><br>";
        // If user is connected to anki, show anki stats
        if (isConnectedToAnki) {
            document.getElementById("card").innerHTML = '<label for="Cards" id="card">Cards Reviewed Today: ' + dateHours["cardReviews"] + " card(s)</label><br>";
        }
        document.getElementById("totalTimeRecorded").innerHTML = "<p>Total: " + dateHours["totalHours"] + " Hour(s) and " + dateHours["totalMinutes"] + " Minute(s)<\p>";
    } else {
        // If there is no data for this day, display 0 hours and minutes for all categories
        document.getElementById("listening").innerHTML = "<label for='Listening' id='listening'>Listening: 0 hour(s) and 0 minute(s)</label><br>";
        document.getElementById("reading").innerHTML = "<label for='Reading' id='reading'>Reading: 0 hour(s) and 0 minute(s)</label><br>";
        document.getElementById("writing").innerHTML = "<label for='Writing' id='writing'>Writing: 0 hour(s) and 0 minute(s)</label><br>";
        document.getElementById("speaking").innerHTML = "<label for='Speaking' id='speaking'>Speaking: 0 hour(s) and 0 minute(s)</label><br>";
        document.getElementById("card").innerHTML = '<label for="Cards" id="card">Cards Reviewed Today: 0 card(s)</label><br>';
        document.getElementById("totalTimeRecorded").innerHTML = "<label id='totalTimeRecorded'>Total: 0 Hour(s) and 0 Minutes</label>";
    }
}

// Given a month and year, return the number of days in that month
function daysInMonth(month, year) { // 1 - January
    return new Date(year, month , 0).getDate();
}

document.getElementById("previous").addEventListener("click", previousMonth);
// Update current month to the previous month for the previous month button
function previousMonth() {
    if (selected_date.getCalendarMonth() >= 1) {
        selected_date.setCalendarMonth(selected_date.getCalendarDay - 1);
    } else { // If the month is January, change the current month to December
        selected_date.setCalendarMonth(11); // Index starts from 0 so 11 represents December
        selected_date.seCalendartYear(selected_date.getCalendarYear() - 1); // Update to previous year
    }
    updateCalendar(); // Update calendar to reflect changes
}

document.getElementById("next").addEventListener("click", nextMonth);
function nextMonth() {
    if (selected_date.getCalendarMonth() <= 10) {
        selected_date.setCalendarMonth(selected_date.getCalendarMonth() + 1);
    } else { // If the month is December, change the current month to January
        selected_date.setCalendarMonth(0); // Index starts at 0 so 0 represents January
        selected_date.setCalendarYear(selected_date.getCalendarYear() + 1); // Update to next year
    }
    updateCalendar(); // Update calendar to reflect changes
}

document.getElementById("saveButton").addEventListener("click", saveForm);
// Function is run when the save button from the form is pressed
function saveForm() {
    // Get the input from each of the document elements for each category hours and minutes
    var listeningHoursInput = document.getElementById("listeningHours");
    var listeningMinutesInput = document.getElementById("listeningMinutes");
    var readingHoursInput = document.getElementById("readingHours");
    var readingMinutesInput = document.getElementById("readingMinutes");
    var writingHoursInput = document.getElementById("writingHours");
    var writingMinutesInput = document.getElementById("writingMinutes");
    var speakingHoursInput = document.getElementById("speakingHours");
    var speakingMinutesInput = document.getElementById("speakingMinutes");
    var cardReviews = 0;
    // If month is a single digit, this adds a zero in front of the day to work with how the data has been stored
    if ((selected_date.getCalendarMonth() + 1) <= 9) {
        if (selected_date.getCalendarDay() <= 9) {
            cardReviews = cardReviewsByDay[selected_date.getCalendarYear() + "-0" + (selected_date.getCalendarMonth() + 1) + "-0" + selected_date.getCalendarDay()];
        } else {
            cardReviews = cardReviewsByDay[selected_date.getCalendarYear() + "-0" + (selected_date.getCalendarMonth() + 1) + "-" + selected_date.getCalendarDay()];
        }
    } else {
        if (selected_date.getCalendarDay() <= 9) {
            cardReviews = cardReviewsByDay[selected_date.getCalendarYear() + "-" + (selected_date.getCalendarMonth() + 1) + "-0" + selected_date.getCalendarDay()];
        } else {
            cardReviews = cardReviewsByDay[selected_date.getCalendarYear() + "-" + (selected_date.getCalendarMonth() + 1) + "-" + selected_date.getCalendarDay()];
        }
    }

    // Add all hour and minute amounts
    var totalHours = Number(listeningHoursInput.value) + Number(readingHoursInput.value) + Number(writingHoursInput.value) + Number(speakingHoursInput.value);
    var totalMinutes = Number(listeningMinutesInput.value) + Number(readingMinutesInput.value) + Number(writingMinutesInput.value) + Number(speakingMinutesInput.value);

    // Create dictionary of all input that will be stored in local storage
    var hours = {"listeningHours": listeningHoursInput.value,
                 "listeningMinutes": listeningMinutesInput.value,
                 "readingHours": readingHoursInput.value,
                 "readingMinutes": readingMinutesInput.value,
                 "writingHours": writingHoursInput.value,
                 "writingMinutes": writingMinutesInput.value,
                 "speakingHours": speakingHoursInput.value,
                 "speakingMinutes": speakingMinutesInput.value,
                 "totalHours": totalHours,
                 "totalMinutes": totalMinutes,
                 "cardReviews": cardReviews,};

    // Store the year and dictionary of hours to local storage
    localStorage.setItem(selected_date.getCalendarYear() + "-" + (selected_date.getCalendarMonth() + 1) + "-" + current_day_edited, JSON.stringify(hours));
    updateForm();
}

document.getElementById("cancelButton").addEventListener("click", closeForm);
// Function run when the close form button is pressed
function closeForm() {
    updateForm();
    document.getElementById("form").style.display = "none"; // Change to display to none so the form is hidden
}

document.getElementById("clearButton").addEventListener("click", clearForm);
// Clears local storage data for currently selected day
function clearForm() {
    localStorage.removeItem(selected_date.getCalendarYear() + "-" + (selected_date.getCalendarMonth() + 1) + "-" + current_day_edited);
    updateForm();
}