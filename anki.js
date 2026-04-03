// Using Anki-Connect API: https://git.sr.ht/~foosoft/anki-connect#statistic-actions
var cardReviewsByDay = []
function invoke(action, version, params={}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('error', () => reject('failed to issue request'));
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw 'response has an unexpected number of fields';
                }
                if (!response.hasOwnProperty('error')) {
                    throw 'response is missing required error field';
                }
                if (!response.hasOwnProperty('result')) {
                    throw 'response is missing required result field';
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open('POST', 'http://127.0.0.1:8765');
        xhr.send(JSON.stringify({action, version, params}));
    });
}

export async function main() {
    var result;
    try {
        // Get the date and number of cards reviewed each day
        result = await invoke('getNumCardsReviewedByDay', 6);
        // Make this a map where the date is the key and the card count is the value
        cardReviewsByDay = Object.fromEntries(result);
    } catch (err) {
        console.log("Error: " + err);
    }
    console.log(cardReviewsByDay);
}

// Export the map for card reviews to be used in calendar.js
export { cardReviewsByDay };