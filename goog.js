const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

/*
token - per group save
credentials - secrets -> also keep in memory (totally safe)
oAuth2Client - create new per group each time needed
*/

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']; // IMPORTANT
const TOKEN_PATH = 'token.json';

fs.readFile('credentials.json', (err, content) => {
  if(err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), listEvents);
});

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed; // IMPORTANT
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]); // IMPORTANT

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if(err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token)); // IMPORTANT
    callback(oAuth2Client);
  });
}

// called once per guild create / command for change (rare TODO)
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if(err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if(err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if(err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if(events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}