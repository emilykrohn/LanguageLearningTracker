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
            current_day = date.target.id;
            current_day_edited = current_day;
            document.getElementById("form").style.display = "block";
            document.getElementById("formDate").innerHTML = "Date: " + String(current_month + 1) + "-" + String(current_day) + "-" + String(current_year);
            var hours = localStorage.getItem(current_year + "-" + (current_month + 1) + "-" + current_day);
            if (hours == null) {
                hours = 0;
            }
            document.getElementById("hoursRecorded").innerHTML = "<p>Hour(s) Recorded: " + hours + "<\p>";
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

function closeForm() {
    //var hoursInput = document.getElementById("hours");
    //localStorage.setItem(current_year + "-" + (current_month + 1) + "-" + current_day_edited, hoursInput.value)
    document.getElementById("form").style.display = "none";
}