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
var selected_date = new CalendarDate(today.getDate(), today.getMonth(), today.getFullYear());

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

function displayDayNumbersOnCalendarSquares() {
    // Counts the current day that will be written to the calendar
    var day_counter = 0;
    // Remove the previous unused dates from previous month
    unusedSquares = [];
    const TOTAL_SQUARES_IN_CALENDAR = 37;
    // Writes blank spaces for days that do not belong to the current month the user is looking at
    for (var i = 1; i <= TOTAL_SQUARES_IN_CALENDAR; i++) {
        if (i >= firstWeekDay && i < daysInCurrentMonth + firstWeekDay) {
            day_counter += 1;
            document.getElementById(String(i)).innerHTML = String(day_counter);
        } else {
            document.getElementById(String(i)).innerHTML = '&nbsp;';
            document.getElementById(String(i)).classList.add("unusedSquare");
            unusedSquares.push(String(i));
        }
    }
}

// Update the calendar to the current date the user has moved to
async function updateCalendar() {
    // Update text at top of calendar of homepage to the current month and year
    document.getElementById("monthAndYear").innerHTML = String(months[selected_date.getCalendarMonth()]) + ' ' + String(selected_date.getCalendarYear());
    daysInCurrentMonth = daysInMonth(selected_date.getCalendarMonth() + 1, selected_date.getCalendarYear(), 0);
    firstWeekDay = new Date(selected_date.getCalendarYear(), selected_date.getCalendarMonth(), 1).getDay() + 1;
    updateTotalTimeOnCalendar();
    updateSavedSquares();
    
    displayDayNumbersOnCalendarSquares();
    addDateEventListeners();
}

// TODO: Make local storage key in the format like 2026-01-03 so the length is even for all dates
function updateSavedSquares() {
    for (var i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).includes(String(selected_date.year) + "-" + String(selected_date.month + 1))) {
            document.getElementById(Number(localStorage.key(i).substring(7)) + firstWeekDay - 1).classList.add("savedSquare");
        }
    }
}

function updateTotalTimeOnCalendar() {
    var time = calculateTotalTimeForCurrentMonth();
    document.getElementById("TotalMonthHours").innerHTML = '<p id="TotalMonthHours">Total Hours This Month: ' + time["hours"] + '</p>';
    document.getElementById("TotalMonthMinutes").innerHTML = '<p id="TotalMonthMinutes">Total Minutes This Month: ' + time["minutes"] + '</p>';
}

function calculateTotalTimeForCurrentMonth() {
    var time = {
        "hours": 0,
        "minutes": 0,
    };
    for (var i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).includes(String(selected_date.year) + "-" + String(selected_date.month + 1))) {
            var current_date = JSON.parse(localStorage.getItem(localStorage.key(i)));
            time["hours"] += current_date["totalHours"];
            time["minutes"] += current_date["totalMinutes"];
        }
    }
    return time;
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
                
                updateForm();
                // Update the prevously selected day to the current
                previous_selected = date.target.id;
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

    var dateHours = [];
    // If current day selected has data already stored in local storage, display that information
    if (localStorage.getItem(selected_date.getCalendarDate()) !== null) {
        // Get the hours and minutes for each catagory
        dateHours = JSON.parse(localStorage.getItem(selected_date.getCalendarDate()));
        updateFormDisplayedTime(dateHours);
    } else {
        // If there is no data for this day, display 0 hours and minutes for all categories
        updateFormDisplayedTime(dateHours);
    }
}

function updateFormDisplayedTime(dateHours) {
    if (dateHours.length != 0) {
        // Display all of the data stored in local storage for these categories
        displayFormLabel(dateHours, "Listening", "listening");
        displayFormLabel(dateHours, "Reading", "reading");
        displayFormLabel(dateHours, "Writing", "writing");
        displayFormLabel(dateHours, "Speaking", "speaking");
        displayCardLabel(dateHours["cardReviews"]);
        document.getElementById("totalTimeRecorded").innerHTML = "<p>Total: " + dateHours["totalHours"] + " Hour(s) and " + dateHours["totalMinutes"] + " Minute(s)<\p>";

    } else {
        displayEmptyLabel("Listening", "listening");
        displayEmptyLabel("Reading", "reading");
        displayEmptyLabel("Writing", "writing");
        displayEmptyLabel("Speaking", "speaking");
        displayCardLabel("0");
        document.getElementById("totalTimeRecorded").innerHTML = "<p>Total: 0 Hour(s) and 0 Minute(s)<\p>";
    }
}

function displayCardLabel(cards) {
    document.getElementById("card").innerHTML = '<label for="Cards" id="card">Cards Reviewed Today: ' + cards + ' card(s)</label><br>';
}

function displayFormLabel(dateHours, label, id) {
    var hours = dateHours[id + "Hours"];
    var minutes = dateHours[id + "Minutes"];
    if (hours == "") {
        hours = "0";
    }
    if (minutes == "") {
        minutes = "0";
    }
    document.getElementById(id).innerHTML = '<label for="' + label + '" id="' + id + '">' + label + ': ' + hours + " hour(s) and " + minutes + " minute(s)</label><br>";
}

function displayEmptyLabel(label, id) {
    document.getElementById(id).innerHTML = '<label for="' + label + '" id="' + id + '">' + label + ': 0 hour(s) and 0 minute(s)</label><br>';
}

// Given a month and year, return the number of days in that month
function daysInMonth(month, year) { // 1 - January
    return new Date(year, month , 0).getDate();
}

document.getElementById("previous").addEventListener("click", previousMonth);
// Update current month to the previous month for the previous month button
function previousMonth() {
    const FIRST_MONTH_IN_YEAR = 1;
    var current_month = selected_date.getCalendarMonth() + 1;
    if (current_month > FIRST_MONTH_IN_YEAR) {
        selected_date.setCalendarMonth(selected_date.getCalendarMonth() - 1);
    } else { // If the month is January, change the current month to December
        selected_date.setCalendarMonth(11); // Index starts from 0 so 11 represents December
        selected_date.setCalendarYear(selected_date.getCalendarYear() - 1); // Update to previous year
    }
    updateCalendar(); // Update calendar to reflect changes
}

document.getElementById("next").addEventListener("click", nextMonth);
function nextMonth() {
    const LAST_MONTH_IN_YEAR = 12;
    var current_month = selected_date.getCalendarMonth() + 1;
    if (current_month < LAST_MONTH_IN_YEAR) {
        selected_date.setCalendarMonth(selected_date.getCalendarMonth() + 1);
    } else { // If the month is December, change the current month to January
        selected_date.setCalendarMonth(0); // Index starts at 0 so 0 represents January
        selected_date.setCalendarYear(selected_date.getCalendarYear() + 1); // Update to next year
    }
    updateCalendar(); // Update calendar to reflect changes
}

class InputAmount {
    constructor(hours, minutes) {
        this._hours = hours;
        this._minutes = minutes;
    }
    
    get hours() {
        return this._hours;
    }
    set hours(hours) {
        this._hours = hours;
    }

    get minutes() {
        return this._minutes;
    }
    set minutes(minutes) {
        this._minutes = minutes;
    }
}

function getCardReviewsAmount() {
    // If month is a single digit, this adds a zero in front of the day to work with how the data has been stored
    var date = selected_date.getCalendarYear();
    const LARGEST_SINGLE_DIGIT_NUMBER = 9;
    if ((selected_date.getCalendarMonth() + 1) <= LARGEST_SINGLE_DIGIT_NUMBER) {
        date += "-0" + (selected_date.getCalendarMonth() + 1);
    } else {
        date += "-" + (selected_date.getCalendarMonth() + 1);
    }

    if (selected_date.getCalendarDay() <= LARGEST_SINGLE_DIGIT_NUMBER) {
        date += "-0" + selected_date.getCalendarDay();
    } else {
        date += "-" + selected_date.getCalendarDay();
    }
    
    return cardReviewsByDay[date];
}

document.getElementById("saveButton").addEventListener("click", saveForm);
// Function is run when the save button from the form is pressed
function saveForm() {
    // Get the input from each of the document elements for each category hours and minutes
    var listeningAmount = new InputAmount(document.getElementById("listeningHours"), document.getElementById("listeningMinutes"));
    var readingAmount = new InputAmount(document.getElementById("readingHours"), document.getElementById("readingMinutes"));
    var writingAmount = new InputAmount(document.getElementById("writingHours"), document.getElementById("writingMinutes"));
    var speakingAmount = new InputAmount(document.getElementById("speakingHours"), document.getElementById("speakingMinutes"));
    
    var cardReviews = 0;

    if (isConnectedToAnki) {
        cardReviews = getCardReviewsAmount();
    } else {
        cardReviews = document.getElementById("cardsReviewed").value;
    }

    // Add all hour and minute amounts
    var totalHours = Number(listeningAmount.hours.value) + Number(readingAmount.hours.value) + Number(writingAmount.hours.value) + Number(speakingAmount.hours.value);
    var totalMinutes = Number(listeningAmount.minutes.value) + Number(readingAmount.minutes.value) + Number(writingAmount.minutes.value) + Number(speakingAmount.minutes.value);

    // Create dictionary of all input that will be stored in local storage
    var hours = {"listeningHours": listeningAmount.hours.value,
                 "listeningMinutes": listeningAmount.minutes.value,
                 "readingHours": readingAmount.hours.value,
                 "readingMinutes": readingAmount.minutes.value,
                 "writingHours": writingAmount.hours.value,
                 "writingMinutes": writingAmount.minutes.value,
                 "speakingHours": speakingAmount.hours.value,
                 "speakingMinutes": speakingAmount.minutes.value,
                 "totalHours": totalHours,
                 "totalMinutes": totalMinutes,
                 "cardReviews": cardReviews,};

    // Store the year and dictionary of hours to local storage
    localStorage.setItem(selected_date.getCalendarYear() + "-" + (selected_date.getCalendarMonth() + 1) + "-" + current_day_edited, JSON.stringify(hours));
    document.getElementById(String(selected_date.day + firstWeekDay - 1)).classList.add("savedSquare");
    updateTotalTimeOnCalendar();
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
    document.getElementById(String(selected_date.day + firstWeekDay - 1)).classList.remove("savedSquare");
    updateTotalTimeOnCalendar();
    updateForm();
}