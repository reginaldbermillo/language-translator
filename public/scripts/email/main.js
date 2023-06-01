import view from './view.js';
import translate from './translate-service.js';
import config from './config.js';

// Obtain a reference to the platformClient object
const platformClient = require('platformClient');
const client = platformClient.ApiClient.instance;

// API instances
const conversationsApi = new platformClient.ConversationsApi();
const responseManagementApi = new platformClient.ResponseManagementApi();

let currentConversationId = '';
let translationData = null;
let genesysCloudLanguage = 'en-us';
let messageId = '';
let customerEmail = '';
let customerName = '';
let agentEmail = '';
let agentName = '';
let subject = '';

function getEmailDetails(data){
    let emailBody = data.textBody;

    // Get email details
    customerEmail = data.from.email;
    customerName = data.from.name;
    agentEmail  = data.to[0].email;
    agentName = data.to[0].name;
    subject = data.subject;

    translateMessage(emailBody, genesysCloudLanguage, 'customer')
    .then((translatedData) => {
        translationData = translatedData;
    });
}

function translateMessage(message, language, purpose){
    return new Promise((resolve, reject) => {
        translate.translateText(message, language, function(data) {
            if (data) {
                console.log('TRANSLATED DATA: ' + JSON.stringify(data));

                view.addMessage(data.translated_text, purpose);
                resolve(data);
            }
        });
    });
}

function sendMessage(){
    let message = document.getElementById('message-textarea').value;

    translateMessage(message, getSourceLanguage(), 'agent')
    .then((translatedData) => {
        let body = {
            'to': [{
                'email': customerEmail,
                'name': customerName
            }],
            'from': {
                'email': agentEmail,
                'name': agentName
            },
            'subject': subject,
            'textBody': translatedData.translated_text,
            'historyIncluded': true
        }
    
        conversationsApi.postConversationsEmailMessages(currentConversationId, body);

        console.log('Translated email sent to customer!');
    });    
}

function copyToClipboard(){
    let message = document.getElementById('message-textarea').value;

    translateMessage(message, getSourceLanguage(), 'agent')
    .then((translatedData) => {
        var dummy = document.createElement('textarea');
        document.body.appendChild(dummy);
        dummy.value = translatedData.translated_text;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);

        document.getElementById('message-textarea').value = 'Translated message copied to clipboard!';
    });
}

function getSourceLanguage(){
    let sourceLang;

    // Default language to english if no source_language available    
    if(translationData === null) {
        sourceLang = 'en';
    } else {
        sourceLang = translationData.source_language;
    }

    return sourceLang;
}

/**	
 * This toggles between translator and canned response iframe	
 */	
function toggleIframe(){	
    let label = document.getElementById('toggle-iframe').textContent;	

    if(label === 'Open Email Translator'){	
        document.getElementById('toggle-iframe').textContent = 'Open Canned Responses';
        document.getElementById('agent-assist').style.display = 'block';
        document.getElementById('canned-response-container').style.display = 'none';
    } else {	
        document.getElementById('toggle-iframe').textContent = 'Open Email Translator';
        document.getElementById('agent-assist').style.display = 'none';
        document.getElementById('canned-response-container').style.display = 'block';
        
        // Only call getLibraries function if element does not have a child
        if(document.getElementById('libraries-container').childNodes.length == 0) getLibraries();
    }	
}

/** --------------------------
 *  CANNED RESPONSE FUNCTIONS
 * ------------------------ */
/**
 * Get all libraries in the org
 */
 function getLibraries(){    
    return responseManagementApi.getResponsemanagementLibraries()
    .then((libraries) => {
        libraries.entities.forEach((library) => {
            getResponses(library.id, library.name);
        });
    });
}

/**
 * Get all responses of each library
 * @param {String} libraryId 
 * @param {String} libraryName 
 */
function getResponses(libraryId, libraryName){
    return responseManagementApi.getResponsemanagementResponses(libraryId)
    .then((responses) => {
        view.displayLibraries(libraryId, libraryName);

        responses.entities.forEach((response) => {
            view.displayResponses(response, doResponseSubstitution);
        });
    });
}

/**
 * Search all responses in the org
 * @param {String} query 
 */
function searchResponse(query){
    return responseManagementApi.postResponsemanagementResponsesQuery({'queryPhrase': query})
    .then((responses) => {
        responses.results.entities.forEach((response) => {
            view.toggleDIVs();
            view.displaySearchResults(response, doResponseSubstitution);
        });
    });
}

/**
 * Replaces the dynamic variables in canned responses with appropriate
 * values. This function is used in the view when an agent clicks a response.
 * @param {String} text 
 * @param {String} responseId 
 */
function doResponseSubstitution(text, responseId){
    let finalText = text;

    // Do the default substitutions first
    finalText = finalText.replace(/{{AGENT_NAME}}/g, agentName);
    finalText = finalText.replace(/{{CUSTOMER_NAME}}/g, customerName);
    finalText = finalText.replace(/{{AGENT_ALIAS}}/g, agentAlias);
    

    let participantData = currentConversation.participants
                            .find(p => p.purpose == 'customer').attributes;

    // Do the custom substitutions
    return responseManagementApi.getResponsemanagementResponse(responseId)
    .then((responseData) => {
        let subs = responseData.substitutions;
        subs.forEach(sub => {
            let subRegex = new RegExp(`{{${sub.id}}}`, 'g');
            let val = `{{${sub.id}}}`;

            // Check if substitution exists on the participant data, if not
            // use default value
            if(participantData[sub.id]){
                val = participantData[sub.id];
            } else {
                val = sub.defaultValue ? sub.defaultValue : val;
            }

            finalText = finalText.replace(subRegex, val);
        });

        return finalText;
    })
    .catch(e => console.error(e));
}

/** --------------------------------------------------------------
 *                       EVENT HANDLERS
 * -------------------------------------------------------------- */
// document.getElementById('btn-send')
//     .addEventListener('click', () => sendMessage());

document.getElementById('btn-copy')
    .addEventListener('click', () => copyToClipboard());

    document.getElementById('toggle-iframe')	
    .addEventListener('click', () => toggleIframe());

// document.getElementById('chat-form')
//     .addEventListener('submit', () => sendChat());

// document.getElementById('btn-send-message')
//     .addEventListener('click', () => sendChat());

// document.getElementById('message-textarea')
//     .addEventListener('keypress', function (e) {
//         if (e.key === 'Enter') {
//             sendMessage();
//             if(e.preventDefault) e.preventDefault(); // prevent new line
//             return false; // Just a workaround for old browsers
//         }
//     });

document.getElementById('find-response-btn')
    .addEventListener('click', function(){
        let query = document.getElementById('find-response').value;
        searchResponse(query);
    });

document.getElementById('find-response')
    .addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            let query = document.getElementById('find-response').value;
            searchResponse(query);
        }
    });

document.getElementById('toggle-search')
    .addEventListener('click', () => view.toggleDIVs());

/** --------------------------------------------------------------
 *                       INITIAL SETUP
 * -------------------------------------------------------------- */
const urlParams = new URLSearchParams(window.location.search);
currentConversationId = urlParams.get('conversationid');
genesysCloudLanguage = urlParams.get('language');

client.setPersistSettings(true, 'chat-translator');
client.setEnvironment(config.genesysCloud.region);
client.loginImplicitGrant(
    config.clientID,
    config.redirectUri,
    { state: JSON.stringify({
        conversationId: currentConversationId,
        language: genesysCloudLanguage
    }) })
.then(data => {
    console.log(data);

    // Assign conversation id
    let stateData = JSON.parse(data.state);
    currentConversationId = stateData.conversationId;
    genesysCloudLanguage = stateData.language;
    
    // Get messageId
    return conversationsApi.getConversationsEmail(currentConversationId);
}).then(data => {
    console.log(data);

    messageId = data.participants.find(p => p.purpose == 'customer').messageId;

    // Get email details
    return conversationsApi.getConversationsEmailMessage(currentConversationId, messageId);
}).then((data) => { 
    console.log(data);

    return getEmailDetails(data);
}).then(data => {
    console.log('Finished Setup');

// Error Handling
}).catch(e => console.log(e));
