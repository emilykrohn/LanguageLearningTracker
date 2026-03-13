const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const today = new Date();

current_month = today.getMonth();
current_year = today.getFullYear()
current_day = today.getDay();
updateCalendar();

var current_day_edited = 0;

function updateCalendar() {
    document.getElementById("monthAndYear").innerHTML = String(months[current_month]) + ' ' + String(current_year);
    
    function daysInMonth(month, year) { // 1 - January
        return new Date(year, month , 0).getDate();
    }
    daysInCurrentMonth = daysInMonth(current_month + 1, current_year, 0);
    firstWeekDay = new Date(current_year, current_month, 1).getDay() + 1
    day_counter = 0
    for (var i = 1; i <= 37; i++) {
        if (i >= firstWeekDay && i < daysInCurrentMonth + firstWeekDay) {
            day_counter += 1;
            document.getElementById(String(i)).innerHTML = String(day_counter);
        } else {
            document.getElementById(String(i)).innerHTML = '&nbsp;';
        }
    }
    const dates = document.getElementsByClassName("squares");
    var current_day = 0;
    for (var i = 0; i < dates.length; i++) {
        dates[i].addEventListener("click", (date) => {
            current_day = date.target.id - firstWeekDay + 1;
            current_day_edited = current_day;
            if (current_day > 0 && current_day <= daysInCurrentMonth) {
                document.getElementById("form").style.display = "block";
                document.getElementById("formDate").innerHTML = "Date: " + String(current_month + 1) + "-" + String(current_day) + "-" + String(current_year);
            }

            if (localStorage.getItem(String(current_year) + "-" + String(current_month + 1) + "-" + String(current_day)) !== null) {
                var dateHours = JSON.parse(localStorage.getItem(current_year + "-" + (current_month + 1) + "-" + current_day));
                document.getElementById("listening").innerHTML = '<label for="Listening" id="listening">Listening: ' + dateHours["listeningHours"] + " hour(s) and " + dateHours["listeningMinutes"] + " minute(s)</label><br>";
                document.getElementById("reading").innerHTML = '<label for="Reading" id="reading">Reading: ' + dateHours["readingHours"] + " hour(s) and " + dateHours["readingMinutes"] + " minute(s)</label><br>";
                document.getElementById("writing").innerHTML = '<label for="Writing" id="writing">Writing: ' + dateHours["writingHours"] + " hour(s) and " + dateHours["writingMinutes"] + " minute(s)</label><br>";
                document.getElementById("speaking").innerHTML = '<label for="Speaking" id="speaking">Speaking: ' + dateHours["speakingHours"] + " hour(s) and " + dateHours["speakingMinutes"] + " minute(s)</label><br>";
                document.getElementById("totalTimeRecorded").innerHTML = "<p>Total: " + dateHours["totalHours"] + " Hour(s) and " + dateHours["totalMinutes"] + " Minute(s)<\p>";
            } else {
                document.getElementById("listening").innerHTML = "<p>Listening: 0 hour(s) and 0 minute(s)</p>";
                document.getElementById("reading").innerHTML = "<p>Reading: 0 hour(s) and 0 minute(s)</p>";
                document.getElementById("writing").innerHTML = "<p>Writing: 0 hour(s) and 0 minute(s)</p>";
                document.getElementById("speaking").innerHTML = "<p>Speaking: 0 hour(s) and 0 minute(s)</p>";
                document.getElementById("totalTimeRecorded").innerHTML = "<p>Total: 0 Hour(s) and 0 Minutes</p>";
            }
        });
    }
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

function closeForm() {
    updateCalendar();
    document.getElementById("form").style.display = "none";
}