let myUploads;
let messages;
let modaID = 0;
let deleteID = 0;

let getID = "";
let uploadIndex;
let uploadList;
let filename = "";
let shared = [];

let selectedUpload;


/*-------------------------------------------------------------------------------------------------------------------------------
        @REGISTER.HTML VALIDATION
--------------------------------------------------------------------------------------------------------------------------------- */
function validateRegistration(e) {
    e.preventDefault();

    var inputName = document.getElementById("fullname").value;
    var inputEmail = document.getElementById("email").value;
    var inputPassword = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;


    var apos = inputEmail.indexOf("@"); // checking for @ existence at beginning
    var dotPos = inputEmail.lastIndexOf("."); //checking for .existence at last

    if (inputName == "") {
        alert("Please enter fullname");
        return false;
    } else if (inputEmail == "") {
        alert("Please enter Email Address");
        return false;
    } else if (apos < 1 || (dotPos - apos) < 2) {
        alert("Please enter valid Email Address");
        return false;
    } else if (inputPassword == "") {
        alert("Please enter password");
        return false;
    } else if (confirmPassword == "") {
        alert("Please confirm password");
        return false;
    } else if (inputPassword !== confirmPassword) {
        alert("Passwords do not match");
        return false;
    }

    let newUser = {
        id: Number(new Date()),
        name: inputName,
        email: inputEmail,
        password: inputPassword
    }
    console.log(newUser);

    $.ajax({
        type: "POST", // method is post
        url: 'http://localhost:3000/users', // calling php in javascript code
        data: newUser, // data
        success: function (response) { // success is happen
            console.log("Added new User");
            window.location = "registration-success.html";
        }
    })
}


/*-------------------------------------------------------------------------------------------------------------------------------
        @LOGIN.HTML VALIDATION
--------------------------------------------------------------------------------------------------------------------------------- */
function validateLogin() {
    var inputEmail = document.getElementById("email").value;
    var inputPassword = document.getElementById("password").value;

    var apos = inputEmail.indexOf("@");                                                 // checking for @ existence at beginning
    var dotPos = inputEmail.lastIndexOf(".");                                           //checking for .existence at last

    if (inputEmail == "") {                                                             // check input Email value
        alert("Please enter Email Address");
        return false;
    } else if (apos < 1 || (dotPos - apos) < 2) {                                       // check @ and (.) dot on email
        alert("Please enter a valid Email Address");
        return false;
    } else if (inputPassword == "") {                                                   // check input Password value
        alert("Please enter password");
        return false;
    }

    authenticate(inputEmail, inputPassword)


    function authenticate(email, pass) {
        $.ajax({
            type: "GET",
            url: "http://localhost:3000/users",
            dataType: 'json',
            async: false,
            data: {
                email: email,
                password: pass
            },
            success: function (data) {
                matchedUser = data.filter(mongodb => {                             // Filtering Data
                    return email === mongodb.email && pass === mongodb.password;
                })
                console.log("ajax =>", matchedUser);
                if (matchedUser.length) {
                    document.cookie = "userLoggedIn = true; path=/";
                    sessionStorage.setItem("session", JSON.stringify(matchedUser));
                    window.location.href = "login-success.html";
                    return true;
                } else {
                    alert('Invalid Email or Password')
                }
            }
        });
    };
}


/*-------------------------------------------------------------------------------------------------------------------------------
        AUTHENTICATON
--------------------------------------------------------------------------------------------------------------------------------- */
function authentication() {
    const status = sessionStorage.getItem("session");

    if (status === null) {
        location.href = "./index.html"
    } else {
        session = JSON.parse(status);
        session_id = session[0]._id;
        session_name = session[0].name;
        session_email = session[0].email;
    }
}


/*-------------------------------------------------------------------------------------------------------------------------------
        @LOGOUT.HTML (LOGOUT)
--------------------------------------------------------------------------------------------------------------------------------- */
function logout() {
    sessionStorage.removeItem('session');
    location.href = "./logout.html";
}


/*-------------------------------------------------------------------------------------------------------------------------------
        NAVIGATION (HEADER)
--------------------------------------------------------------------------------------------------------------------------------- */
function navbar(active) {

    document.write(`
    <div class="header">
        <table class="nav-table" border="1" width="100%">
            <tr class="nav-buttons">
                <td align="center" width="25%">
                    <a href="groupchat.html">
                        <button id="groupChatNav">Group Chat</button>
                    </a>
                </td>
                <td align="center" width="25%">
                    <a href="usermgt.html">
                        <button id="manageUsersNav">Manage Users</button>
                    </a>
                </td>
                <td align="center" width="25%">
                    <a href="docmgt.html">
                        <button id="manageDocumentsNav">Manage Documents</button>
                    </a>
                </td>
                <td align="center" width="25%">
                <button onclick="logout()">Logout</button>
                </td>
            </tr>
        </table>
    </div>
    `)
    if (active == "groupChatNav") {
        document.getElementById('groupChatNav').style = 'background: white;color: black';
    }
    if (active == "manageUsersNav") {
        document.getElementById('manageUsersNav').style = 'background: white;color: black';

    }
    if (active == "manageDocumentsNav") {
        document.getElementById('manageDocumentsNav').style = 'background: white;color: black';
    }

}


/*-------------------------------------------------------------------------------------------------------------------------------
        @GROUPCHAT.HTML (GROUP CHAT PAGE)
--------------------------------------------------------------------------------------------------------------------------------- */
function parseFullname(id) {
    let users;
    $.ajax({
        type: "GET",
        url: 'http://localhost:3000/users',
        success: function (response) {
            users = response;
        },
        async: false
    });
    let getIndex = users.map((el) => el._id).indexOf(id);
    return getIndex != -1 ? users[getIndex].name : "Deleted user";
}

function fillChat() {
    var chatMessages;

    $.ajax({
        type: "GET",
        url: 'http://localhost:3000/chats',
        success: function (response) {
            chatMessages = response;
        },
        async: false
    });
    console.log("------------------------")
    console.log("Chat Messages: ", chatMessages)
    console.log("Chat Messages: ", chatMessages[2].timestamp)
    console.log("Chat Messages: ", chatMessages[2].sender)
    console.log("Chat Messages: ", chatMessages[2].chat)
    console.log("------------------------")

    for (let index = 0; index < chatMessages.length; index++) {
        const result = chatMessages[index];
        document.write(`
            <div>[${result.timestamp}]${parseFullname(result.sender)}: ${result.chat}</div>
        `)
    }
}

function addMessage() {
    let today = new Date();
    let parse_date = today.toISOString().replace('T', ' ').replace('Z', '').slice(0, 19)
    let message = document.getElementById('inputChat').value;
    if (message == '') {
        alert('Input is required')
        return false
    }
    if (messages == null) {
        messages = [];
    }
    let newMessage = {
        id: Number(new Date()),
        chat: message,
        timestamp: parse_date,
        sender: session_id
    }
    messages.push(newMessage);
    $.ajax({
        type: "POST",
        url: 'http://localhost:3000/chats',
        data: newMessage,
        success: function (response) {
            return false
        },
    });
    return true;
}


/*-------------------------------------------------------------------------------------------------------------------------------
        @USERMGT.HTML (USERS PAGE)
--------------------------------------------------------------------------------------------------------------------------------- */
function usersTableAjax() { // DISPLAYING USERS TABLE 
    let data;

    $.ajax({
        type: "GET",
        url: "http://localhost:3000/users",
        success: function (response) {
            data = response;
            console.log("display Users =>", response);
        }
        ,
        async: false,
    });


    for (let i = 0; i < data.length; i++) {
        document.write(`
      <tr>
        <td class="primary-td">${data[i].name}</td>
        <td align="center">${data[i].email}</td>
        <td align="center">
            <a href="./edit.html?id=${data[i]._id}">Edit</a> |
            <button type="button" class="btn-plain" data-bs-toggle="modal" data-bs-target="#exampleModal"
            onclick="deleteUserModal('${data[i]._id}')">
            Delete
            </button>
        </td>
      </tr>
      `);
    }
}

let deleteUserID = 0;
function deleteUserModal(id) {
    deleteUserID = id;
}

function deleteUser(methodType) {
    console.log("clicked => ", `http://localhost:3000/users/${deleteUserID}`);
    $.ajax({
        url: `http://localhost:3000/users/${deleteUserID}`,
        type: methodType,
        async: false, // <- this turns it into synchronous
        success: function (response) {
            location.href = 'usermgt.html';
            return true
        }
    });
}


/*-------------------------------------------------------------------------------------------------------------------------------
        @EDIT.HTML (EDIT)
--------------------------------------------------------------------------------------------------------------------------------- */
var userDetails;
function editUser() {
    var completeUrl = location.href;
    var completeUrlSplit = completeUrl.split("?");
    var splittedResult = completeUrlSplit[1];
    var url = splittedResult.split("=");
    urlID = url[1];
    console.log("urlID =>", urlID);

    $.ajax({
        type: "GET",
        url: `http://localhost:3000/users/${urlID}`,
        async: false,
        success: function (response) {
            userDetails = response.data;
            document.getElementById("name").value = response.data.name;
            document.getElementById("email").value = response.data.email;
        }
    });

    console.log("userDetails =>", userDetails)
}

function saveEdit() { // USERS - EDIT BUTTON
    var fullName = document.getElementById("name").value;
    var email = document.getElementById("email").value;

    $.ajax({
        type: "PUT",
        url: `http://localhost:3000/users/${urlID}`,
        data: {
            ...userDetails,
            name: fullName,
            email: email
        },
        async: false,
        success: function (response) {
            return true
        }
    });
}


/*-------------------------------------------------------------------------------------------------------------------------------
        @DOCMGT.HTML (DOCUMENT MANAGEMENT PAGE)
--------------------------------------------------------------------------------------------------------------------------------- */
function setFunction(id) { // GET MODAL ID 
    modaID = id;                                                            // Get's ID from the Modal into the global variable modaID
    findUsersBasedOnId = myUploads.find(x => x._id == modaID);                       // returns user object based on the ID you clicked
    console.log("clicked edit (value) =>", findUsersBasedOnId);                // console logs myUploads
    document.getElementById("inputLabel").value = findUsersBasedOnId.label;          // output the label as placeholder

}

function uploadFile() {

    let formData = new FormData();
    let inputLabel = document.getElementById('file_description').value;
    let filename;

    if (inputLabel == '') {
        alert('File description is required');
        return false;
    }
    if (!filetoupload.files[0]) {
        alert('File is required')
        return false;
    }
    if (filetoupload.files[0].size > 10000000) {
        alert('File too large (Max 10MB)')
        return false;
    }
    formData.append("file", filetoupload.files[0]);

    $.ajax({
        type: "POST",
        url: 'http://localhost:3000/uploads/files',
        data: formData,
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        cache: false,
        success: function (response) {
            filename = response.file_uploaded
        },
        async: false
    });

    let newUpload = {
        id: Number(new Date()),
        label: inputLabel,
        filename: filename,
        parent: session_id,
        uploader_name: session_name,
        uploader_email: session_email,
        shared: []
    };
    $.ajax({
        type: "POST",
        url: 'http://localhost:3000/uploads',
        data: newUpload,
        success: function (response) {
            return true
        },
    });
    return true

}

function addFile() {

    let formData = new FormData();
    let file_desc = document.getElementById('file_desc').value;
    let filename

    if (file_desc == '') {
        alert('File description is required');
        return false;
    }
    if (!fileinput.files[0]) {
        alert('File is required')
        return false;
    }
    if (fileinput.files[0].size > 10000000) {
        alert('File too large (Max 10MB)')
        return false;
    }
    formData.append("file", fileinput.files[0]);

    $.ajax({
        type: "POST",
        url: 'http://localhost:3000/uploads/files',
        data: formData,
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        cache: false,
        success: function (response) {
            filename = response.file_uploaded
        },
        async: false
    });

    let newUpload = {
        id: Number(new Date()),
        label: file_desc,
        filename: filename,
        parent: auth._id,
        shared: []
    };
    $.ajax({
        type: "POST",
        url: 'http://localhost:3000/uploads',
        data: newUpload,
        success: function (response) {
            return true
        },
    });
    return true
}

/* MY UPLOADS TABLE */
function myUploadsTable() { // READ - MY UPLOADS TABLE DATA 

    $.ajax({
        type: "GET",
        url: "http://localhost:3000/uploads",
        success: function (response) {
            myUploads = response;
            console.log("display Uploads ITO TALAGA =>", response);
        },
        async: false,
    });

    for (let i = 0; i < myUploads.length; i++) {
        const result = myUploads[i];
        if (result.parent == session_id) {
            // <!-- Button trigger modal -->
            document.write(`
                    <tr>
                    <td>${result.label}</td>
                    <td align="center">${result.filename}</td>
                    <td align="center">
                        <button type="button" class="btn-plain" data-bs-toggle="modal" data-bs-target="#editModal"
                            onclick="setFunction('${result._id}')">  
                        Edit | 
                        </button>
                        <button type="button" class="btn-plain" data-bs-toggle="modal" data-bs-target="#deleteModal"
                            onclick="setFunction('${result._id}')">
                        Delete |
                        </button>
                        <a href="./share.html?id=${result._id}">Share</a> 
                    </td>
                </tr>
                    `)
        }
    }
}

function saveEditBtn() { // UPDATE - EDIT UPLOAD 
    let inputLabel = document.getElementById("inputLabel").value;                            // inputLabel has value of input text Label
    const getIndex = myUploads.map(element => element._id).indexOf(modaID);

    $.ajax({
        type: "PUT",
        url: `http://localhost:3000/uploads/${modaID}`,
        data: {
            ...myUploads[getIndex],
            label: inputLabel,
        },
        async: false,
        success: function (response) {
            return true;
        }
    });
    location.href = 'docmgt.html';
}

function deleteFile() { // DELETE - MY UPLOAD FILE 
    $.ajax({
        type: "DELETE",
        url: `http://localhost:3000/uploads/${modaID}`,
        success: function (response) {
            console.log("File is Deleted!");
        }
    })
    location.href = 'docmgt.html';
}

// SHARED UPLOADS 
function sharedUploadsTable() { // READ - SHARED UPLOADS TABLE DATA 
    if (myUploads == undefined) {
        myUploads = [];
    }
    for (let i = 0; i < myUploads.length; i++) {
        const shareUploads = myUploads[i];
        if (shareUploads.id != session_id && shareUploads.shared.map(shared => parseInt(shared)).indexOf(session_id) != -1) {
            console.log("Shared File >", shareUploads)
            document.write(`
            <tr>
                <td>${shareUploads.label}</td>
                <td align="center">${shareUploads.fileName}</td>
                <td align="center">
                ${shareUploads.uploader_email}
                </td>
            </tr>`);
        }
    }
}

/*-------------------------------------------------------------------------------------------------------------------------------
        @SHARE.HTML (UPLOAD SHARING AND ADD SHARING)
--------------------------------------------------------------------------------------------------------------------------------- */
//TABLE#1 - UPLOAD SHARING - SHARED USER (READ)

// function uploadSharingTable() {
//     let getID = 0;
//     let myUrl = new URL(window.location.href);
//     let params = myUrl.searchParams;

//     if (params.has('id')) {
//         getID = parseInt(params.get('id'))
//         uploadedFileDetails = myUploads.find(x => x.id === getID)
//         uploadIndex = myUploads.map(myUpload => myUpload.id).indexOf(getID) // index position of uploaded file
//         fileLabel = myUploads[uploadIndex].label // myUploads[i].label
//         shared = myUploads[uploadIndex].shared  // myUploads[i].shared
//     }

//     // I made sharedNames to convert shared number value in myUploads into the name value from users ID
//     var sharedNames = shared.map(id => users.find(obj => obj.id === id)); // mapped shared ID numbers in users ID

//     for (let i = 0; i < sharedNames.length; i++) {
//         const result = sharedNames[i];

//         document.write(`
//             <tr>
//               <td>${result.name}</td>  
//               <td align="center">
//                   <button type="button" class="btn-plain" data-bs-toggle="modal" data-bs-target="#deleteModal"
//                      onclick="deleteSharedModal(${result.id})">
//                      Delete
//                   </button>
//               </td>
//             </tr>
//         `);
//     }
// }



// ----------------START WORKING ON THIS------------------
function userAssign() {
    let selectedOption = document.getElementById('selectOption').value;
    shared.push(selectedOption);

    let uploadObj = {
        ...selectedUpload,
        shared: JSON.stringify(shared),
    };

    $.ajax({
        type: "PUT",
        url: `http://localhost:3000/uploads/${getID}`, //set Sharing ID -- TO EDIT
        data: uploadObj,
        async: false,
        success: function (response) {
            return true;
        }
    });

    location.href = 'share.html?id=' + getID;

}

function setSharing() {
    let url = new URL(window.location.href);
    let search_params = url.searchParams;

    $.ajax({
        type: "GET",
        url: 'http://localhost:3000/uploads/' + search_params.get("id"),
        success: function (response) {
            selectedUpload = response.data;
            console.log(response);
            getID = search_params.get("id");
            filename = response.data.label;
            shared = JSON.parse(response.data.shared);
        },
        async: false
    });
}

function fillDropdown() {
    let users;

    $.ajax({
        type: "GET",
        url: 'http://localhost:3000/users',
        success: function (response) {
            users = response;
        },
        async: false
    });

    $.ajax({
        type: "GET",
        url: 'http://localhost:3000/uploads',
        success: function (response) {
            uploads = response;
        },
        async: false
    });


    for (let i = 0; i < users.length; i++) {
        const user = users[i];

        let getIndex = shared.indexOf(user._id.toString());
        if (getIndex == -1 && user._id != session_id) {
            document.write(`
                <option class="text-align-center" value="${user._id}">
                    ${user.name}
                </option>`);
        }
    }

    // for (let i = 0; i < users.length; i++) {
    //     const user = users[i];
    //     let shared = myUploads[uploadIndex].shared.indexOf(user.id)
    //     console.log(user.id);
    //     console.log(session_id);
    //     console.log(shared);
    //     console.log(shared);
    //     if (shared < 0 && user.id != session_id) {
    //         document.write(`
    //         <option class="text-align-center" value="${user.id}">
    //             ${user.name}
    //         </option>`);
    //     }
    // }

}

function fillSharing() {
    let users;
    $.ajax({
        type: "GET",
        url: 'http://localhost:3000/users',
        success: function (response) {
            users = response;
        },
        async: false
    });
    for (let i = 0; i < shared.length; i++) {
        const share = shared[i];
        const shared_index = users.map(el => el._id).indexOf(share);
        document.write(`
        <tr>
            <td width="50%">${users[shared_index].name}</td>
            <td width="50%" align="center">
            <button class="btn-plain" onclick="showModalShare('${getID}', '${share}')" class="btn-no-border">Remove</button>
            </td>
        </tr>`);
    }
}

function fillShared() {  // ilalim ng MyUploads TABLE sa DOCMGT
    let uploads;

    $.ajax({
        type: "GET",
        url: 'http://localhost:3000/uploads',
        success: function (response) {
            uploads = response;
        },
        async: false
    });

    for (let index = 0; index < uploads.length; index++) {
        const upload = uploads[index];

        if (upload.parent != session_id && JSON.parse(upload.shared).map(el => el).indexOf(session_id) != -1) {
            console.log(upload)
            document.write(`
            <tr>
              <td>${upload.label}</td>
              <td align="center">
                <a href="http://localhost:3000/${upload.filename}" target="_blank"> 
                    ${upload.filename}
                </a>
              </td>
              <td align="center" width="25%">
               ${parseEmail(upload.parent)}
               </td>
            </tr>`);
        }
    }
}

function parseEmail(id) {

    $.ajax({
        type: "GET",
        url: 'http://localhost:3000/users',
        success: function (response) {
            users = response;
        },
        async: false
    });

    let getIndex = users.map(el => el._id).indexOf(id);
    return getIndex != -1 ? users[getIndex].email : 'Deleted user';
}
//  ----------------END WORKING ON THIS--------------

function deleteSharedModal(id) {
    deleteID = id
}

function deleteShare() {
    console.log("Old array >", uploadedFileDetails)
    let getIndex = shared.indexOf(deleteID);
    shared.splice(getIndex, 1);

    console.log("delete index >", getIndex)
    console.log("New array >", uploadedFileDetails)

    console.log("LocalStorage >", myUploads)
    localStorage.setItem('myUploads', JSON.stringify(myUploads));
    location.reload();
}

//TABLE#2 - ADD SHARING (CREATE)
function selectOptionDropdown() {
    let key = users.find(x => x.id === session_id) // locating session ID in users ID
    let excludeIndex = users.indexOf(key); // getting indexValue

    for (let i = 0; i < users.length; i++) {
        const result = users[i];

        if (result === users[excludeIndex]) { // if result is equals to the session id index
            continue; // exclude the current user session id in the select option list and continue 
        }

        document.write(`
                  <option value=${result.id}>${result.name}</option>
                `);


    }
}

function shareUploadBtn() {
    var completeUrl = location.href; // complete url information
    var completeUrlSplit = completeUrl.split("?"); // convert in to array based on ?
    var splittedResult = completeUrlSplit[1];
    var url = splittedResult.split("=");
    var id = url[1]; // we are getting URL id here of SHARED FILE ID

    var uploads = JSON.parse(localStorage.getItem("myUploads"));
    file_id = uploads.find(x => x.id == id);


    var selectedOption = document.getElementById("selectOption");
    var selectValue = selectedOption.value; //ID OF SELECTED USER NAME

    file_id.shared.push(parseInt(selectValue));

    localStorage.setItem("myUploads", JSON.stringify(uploads));
    console.log("NEW:", uploads)
    location.reload();
}

/*-------------------------------------------------------------------------------------------------------------------------------
        @OTHERS
--------------------------------------------------------------------------------------------------------------------------------- */
/**
 * Print table row 
 * count - number of rows
*/
function emptyRow(count) {
    var row = "";
    for (let index = 1; index <= count; index++) {
        row += '<tr><td></td><td class="text-align-center"></td><td align="center" width="25%">&nbsp</td></tr>'
    }
    document.write(row);
}