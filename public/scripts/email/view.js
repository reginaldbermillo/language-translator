/**
 * This script is focused on the HTML / displaying of data to the page
 */
function updateScroll(){
    let div = document.getElementById('agent-assist');
    div.scrollTop = div.scrollHeight;
}

function htmlToPlain(rawHtml){
    let finalText = rawHtml;
    finalText = finalText.replace(/<\/div>/ig, '\n');
    finalText = finalText.replace(/<\/li>/ig, '\n');
    finalText = finalText.replace(/<li>/ig, '  *  ');
    finalText = finalText.replace(/<\/ul>/ig, '\n');
    finalText = finalText.replace(/<\/p>/ig, '\n');
    finalText = finalText.replace(/<br\s*[\/]?>/gi, "\n");
    finalText = finalText.replace(/<[^>]+>/ig, '');
    finalText = finalText.replace(/&nbsp;/ig, ' ');
    finalText = finalText.replace(/&amp;/ig, '&');
    

    return finalText;
}

export default {

    addMessage(message, purpose){
        let chatMsg = document.createElement('p');
        chatMsg.textContent = message;

        let container = document.createElement('div');
        container.appendChild(chatMsg);
        container.className = 'chat-message ' + purpose;
        container.id = 'agent-message';
        document.getElementById('agent-assist').appendChild(container);

        updateScroll();
    },

    /**
     * Display list of libraries
     * @param {String} libraryId 
     * @param {String} libraryName 
     */
    displayLibraries(libraryId, libraryName){
        let libContainer = document.createElement('button');
        libContainer.textContent = libraryName;
        libContainer.id = 'library-' + libraryId;
        libContainer.className = 'collapsible';
        libContainer.addEventListener('click', function() {
            this.classList.toggle('active');
            let content = this.nextElementSibling;	
            if (content.style.display === 'block') {	
                content.style.display = 'none';	
            } else {	
                content.style.display = 'block';	
            }	
        });
        document.getElementById('libraries-container').appendChild(libContainer);

        let responsesContainer = document.createElement('div');
        responsesContainer.id = 'responses-container-' + libraryId;
        responsesContainer.className = 'content';
        document.getElementById('libraries-container').appendChild(responsesContainer);
    },

    /**
     * Display responses and group by libraries
     * @param {Object} response 
     */
    displayResponses(response, doResponseSubstitution){
        let responseId = response.id;

        // Collapsible response name
        let responseButton = document.createElement('button');
        responseButton.textContent = response.name;
        responseButton.id = 'response-' + response.id;
        responseButton.className = 'collapsible';
        responseButton.addEventListener('click', function() {
            this.classList.toggle('active');
            let content = this.nextElementSibling;	
            if (content.style.display === 'block') {	
                content.style.display = 'none';	
            } else {	
                content.style.display = 'block';	
            }	
        });
        document.getElementById('responses-container-' + response.libraries[0].id).appendChild(responseButton);

        // Response text content
        let responseText = document.createElement('p');
        
        responseText.innerHTML = response.texts[0].content;
        responseText.id = 'response-content-' + response.id;
        responseText.className = 'content';
        // let insertButton = document.createElement('button')
        // insertButton.innerHTML = 'Insert';
        // insertButton.id = 'response-content-button-' + response.id;
        // insertButton.className = 'content-button'
        responseText.addEventListener('click', function() {
            let text = htmlToPlain(response.texts[0].content);
            // doResponseSubstitution(text, responseId)
            // .then((finalText) => {
            //     document.getElementById('message-textarea').value = finalText;
            // })
            // .catch(e => console.error(e));
            document.getElementById('message-textarea').value = text;
        });
        document.getElementById('responses-container-' + response.libraries[0].id).appendChild(responseText);
    },

    /**
     * Displays all search results in a DIV
     * @param {object} results 
     */
    displaySearchResults(results, doResponseSubstitution){
        let responseId = results.id;

        // Collapsible response name
        let responseButton = document.createElement('button');
        responseButton.textContent = results.name;
        responseButton.id = 'response-' + results.id;
        responseButton.className = 'collapsible';
        responseButton.addEventListener('click', function() {
            this.classList.toggle('active');
            let content = this.nextElementSibling;	
            if (content.style.display === 'block') {	
                content.style.display = 'none';	
            } else {	
                content.style.display = 'block';	
            }	
        });
        document.getElementById('search-result-container').appendChild(responseButton);

        // Response text content
        let responseText = document.createElement('p');
        responseText.innerHTML = results.texts[0].content;
        responseText.id = 'response-content-' + results.id;
        responseText.className = 'content';
        responseText.addEventListener('click', function() {
            let text = htmlToPlain(results.texts[0].content);
            doResponseSubstitution(text, responseId)
            .then((finalText) => {
                document.getElementById('message-textarea').value = finalText;
            })
            .catch(e => console.error(e));
        });
        document.getElementById('search-result-container').appendChild(responseText);
    },

    /**
     * This toggles between showing Canned Responses or Search Results
     */
    toggleDIVs(){
        let cannedDIV = document.getElementById('libraries-container');
        let searchDIV = document.getElementById('search-result-container');

        if(cannedDIV.style.display === 'block'){
            cannedDIV.style.display = 'none';
            searchDIV.style.display = 'block';
        } else {
            cannedDIV.style.display = 'block';
            searchDIV.style.display = 'none';
        }

        // Clear DIV of previous search results
        let searchContainer = document.getElementById("search-result-container");
        if(searchContainer.children.length > 1) clearSearchResults();
    }
}