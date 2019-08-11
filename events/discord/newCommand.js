exports.onEvent = async (content, convo) => {
    try {
        let response = await convo.ask('How are you?');
        convo.send(`That's great that you're ${response}`);
    } catch(e) {
        
    }
}