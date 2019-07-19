import decode from "jwt-decode";

export default class authHelperMethods{
  // Initializing important variables
  constructor(domain) {
    //THIS LINE IS ONLY USED WHEN YOU'RE IN PRODUCTION MODE!
    this.domain = domain || "http://localhost:3000"; // API server domain
  }

  login = (username, password) =>{

    //Get a token from api server using the fetch api
    return this.fetch(`/log-in`, {
        method: 'POST',
        body: JSON.stringify({
            username,
            password
        })
     }).then (res =>{
         this.setToken(res.token) //setting token in localStorage
         return Promise.resolve(res);
     })
}

loggedIn = () =>{
    //check if there is a saved valid token and still valid
    const token = this.getToken()// getting token from local storage

    //The double exclamation is a way to cast the variable to a boolean, allowing you to easily check if the token exists. 
    return !!token &&! this.isTokenExpaired(token) //handwaiving here
}

isTokenExpired = (token) => {
    try {
        const decoded = decode(token);
        if (decoded.exp < Date.now() / 1000) { // Checking if token is expired.
            return true;
        }
        else
            return false;
    }
    catch (err) {
        console.log("expired check failed! Line 42: AuthService.js");
        return false;
    }
}

setToken = (idToken) =>{
    //saves user token to localStorage
    localStorage.setItem('id_token', idToken)
}

getToken = () => {
    // Retrieves the user token from localStorage
    return localStorage.getItem('id_token');
}

logout = () => {
    // Clear user token and profile data from localStorage
    localStorage.removeItem('id_token');
}

getConfirm = () => {
    //using jwt-decode npm package to decode the token
    let answer = decode(this.getToken());
    console.log("Recieved answer!");
    return answer;
}
fetch = (url, options) =>{
     // performs api calls sending the required authentication headers
     const headers = {
         'Accept': 'application/json',
         'Content-Type': 'application/json'

     }
     //setting Authorization header
     // Authorization: Bearer xxxxxxx.xxxxxxxx.xxxxxx
     if (this.loggedIn()) {
         headers['Authorization'] = 'Bearer' + this.getToken()
     }

    return fetch (url, {
         headers,
         ...options
     })
         .then(this._checkStatus)
         .then(response => response.json())
    }

    _checkStatus = (response) => {
        // raises an error in case response status is not a success
        if (response.status >= 200 && response.status < 300) { // Success status lies between 200 to 300
            return response
        } else {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    }
}   



