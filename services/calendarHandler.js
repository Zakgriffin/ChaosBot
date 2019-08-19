const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

let credentials = require('../secrets').credentials;

module.exports.newToken = async function(email, convo) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    let question = `Authorize me to use your email by visiting this url: ${authUrl} and then send me the generated code with "code [Your Code]"`;
    let code = await convo.ask(question, (res, resolve) => {
        let words = res.split(' ');
        if(words[0] === 'code' && words[1]) return resolve(words[1]);
        convo.ask(`Sorry, I didn't understand that. Remember, I need "code [Your Code]"`);
    });

    convo.send('Thanks! You might want to delete that message now. You know, for security bla bla bla');
    let token = await new Promise(resolve, reject, () => {
        oAuth2Client.getToken(code, (err, token) => {
            if(err) reject(err);
            else resolve(token);
        });
    }).catch(err => {
        return console.error('Error retrieving access token', err);
    });
    return token;
}