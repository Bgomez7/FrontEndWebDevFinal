function createElemWithText(htmlElem = "p", txtCont = "", className) {
    let newHTMLElem = document.createElement(htmlElem);
    newHTMLElem.textContent = txtCont;
    if (className != undefined) {
        newHTMLElem.classList.add('class', className);
    }
    return newHTMLElem;
}

function createSelectOptions(dataJSON) {
    if (dataJSON == null) return dataJSON;
    let optionsData = [];
    for(let i = 0; i < dataJSON.length; i++) {
        let option = document.createElement("option");
        option.value = dataJSON[i].id;
        option.textContent = dataJSON[i].name;
        optionsData.push(option);
    }

    return optionsData;
}

function toggleCommentSection(postId) {
    if(postId == null) return postId;
    let sectionElem = document.querySelector(`section[data-post-id="${postId}"]`);
    
    if (sectionElem != undefined) {
        if(sectionElem.classList.contains('hide')) {
            sectionElem.classList.remove('hide');
        } else sectionElem.classList.add('hide');
    } 

    return sectionElem;
}

function toggleCommentButton(postId) {
    if(postId == null) return postId;
    let buttonElem = document.querySelector(`button[data-post-id="${postId}"]`);
    
    if (buttonElem != undefined) {
        if(buttonElem.textContent == 'Show Comments') buttonElem.textContent = 'Hide Comments'
        else buttonElem.textContent = 'Show Comments';
    } 

    return buttonElem;
}

function deleteChildElements(parentElement) {
    if(!(parentElement instanceof HTMLElement)) return undefined;

    let childElem = parentElement.lastElementChild;

    //should cycle through all child elems deleting them
    while(childElem != undefined) {
        parentElement.removeChild(childElem);
        childElem = parentElement.lastElementChild;
    }

    return parentElement;
}

//Need further testing after toggleComments
function addButtonListeners() {
    let buttons = document.querySelectorAll("main button");
    if(buttons == undefined) return undefined;

    let clickedButtons = [];
    for(let button of buttons) {
        let postIDS = button.dataset.postId;
        //Per button add eventListener that triggers the toggle comments
        button.addEventListener("click", (event) => {
            toggleComments(event, postIDS);
        })
        //Add button to array
        clickedButtons.push(button);
    }

    return clickedButtons;
}

function removeButtonListeners() {
    let buttons = document.querySelectorAll("main button");
    if(buttons == undefined) return undefined;

    let unclickedButtons = [];
    for(let button of buttons) {
        let postIDS = button.dataset.postId;
        
        //Remove all event listeners, toggling comments back to original
        button.removeEventListener("click", (event) => {
            toggleComments(event, postIDS);
        })

        unclickedButtons.push(button);
    }
    return unclickedButtons;
}

function createComments(jsonComments) {
    if(jsonComments == undefined) return undefined;
    let fragment = document.createDocumentFragment();

    for(let comment of jsonComments) {
        let article = document.createElement("article");
        let h3 = createElemWithText('h3', comment.name);
        let p = createElemWithText('p', comment.body);
        let p1 = createElemWithText('p', `From: ${comment.email}`);
        
        article.appendChild(h3);
        article.appendChild(p);
        article.appendChild(p1);

        fragment.appendChild(article);
    }
    return fragment;
}

function populateSelectMenu(jsonUsers) {
    if(jsonUsers == undefined) return undefined;

    let selectMenu = document.getElementById("selectMenu");
    //options should be an array
    let options = createSelectOptions(jsonUsers);

    for(let option of options) {
        selectMenu.appendChild(option);
    }
    return selectMenu;
}

async function getUsers() {
    try {
        return await fetch("https://jsonplaceholder.typicode.com/users").then((response) => response.json());
    } catch (e) {
        return undefined;
    }
}

async function getUserPosts(userId) {
    if(userId == undefined) return undefined;
    try {
        return await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`).then((response) => response.json());
    } catch (e) {
        return undefined;
    }
}

async function getUser(userId) {
    if(userId == undefined) return undefined;
    try {
        return await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`).then((response) => response.json());
    } catch (e) {
        return undefined;
    }
}

async function getPostComments(postId) {
    if(postId == undefined) return undefined;

    try {
        return await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`).then((response) => response.json());
    } catch (e) {
        return undefined;
    }
}

async function displayComments(postId) {
    if(postId == undefined) return undefined;

    let section = document.createElement("section");
    section.dataset.postId = postId;
    section.classList.add("comments", "hide");

    let comments = await getPostComments(postId);
    let fragment = createComments(comments);

    section.appendChild(fragment);

    return section;
}

async function createPosts(posts){
    if (posts == undefined) return undefined;
    
    let fragment = document.createDocumentFragment();
    
    for (let post of posts) {
      let article = document.createElement("article");
  
      let h2 = document.createElement("h2");
      h2.textContent = post.title;
  
      let p1 = document.createElement("p");
      p1.textContent = post.body;
  
      let p2 = document.createElement("p");
      p2.textContent = `Post ID: ${post.id}`
  
      let author = await getUser(post.userId);
  
      let p3 = document.createElement("p");
      p3.textContent = `Author: ${author.name} with ${author.company.name}`;
  
      let p4 = document.createElement("p");
      p4.textContent = `${author.company.catchPhrase}`;
  
      let button = document.createElement("button");
      button.textContent = "Show Comments";
      button.dataset.postId = post.id;
  
      let section = await displayComments(post.id);
  
      article.append(h2, p1, p2, p3, p4, button, section);
  
      fragment.append(article);
    }
  
    return fragment;
}  

async function displayPosts(postsData) {
    let main = document.querySelector("main");

    let element = undefined;
    if(postsData != undefined) element = await createPosts(postsData);
    else element = createElemWithText("p", "Select an Employee to display their posts.", "default-text");

    main.append(element);
    return element;
}

function toggleComments(event, postId) {
    if(event == undefined || postId == undefined) return undefined;

    event.target.listener = true;
    let sectionToggle = toggleCommentSection(postId);
    let buttonToggle = toggleCommentButton(postId);

    return [sectionToggle, buttonToggle];
}

async function refreshPosts(jsonPosts) {
    if(jsonPosts == undefined) return undefined;

    let buttonsR = removeButtonListeners();
    let main = deleteChildElements(document.querySelector("main"));
    let fragment = await displayPosts(jsonPosts);
    let buttonsL = addButtonListeners();

    return [buttonsR, main, fragment, buttonsL];
}

async function selectMenuChangeEventHandler(event) {
    if(event == undefined) return undefined;

    let selectMenu = document.getElementById("selectMenu");
    selectMenu.disabled = true;
    let userId = event.target.value || 1;
    let posts = await getUserPosts(userId);
    let refresh = await refreshPosts(posts);
    selectMenu.disabled = false;

    return [userId, posts, refresh];
}

async function initPage() {
    let users = await getUsers();
    let popSelectMenu = populateSelectMenu(users);

    return [users, popSelectMenu];
}

function initApp() {
    let page = initPage();
    let selectMenu = document.getElementById("selectMenu");

    selectMenu.addEventListener("change", selectMenuChangeEventHandler);
}

document.addEventListener("DOMContentLoaded", initApp);