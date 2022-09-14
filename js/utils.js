/* A better method as suggested by Dan, StackOverFlow: https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number?page=1&tab=scoredesc#tab-top  */
var is_numeric = function(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

/* A better method as suggested by nnnnnn, StackOverFlow: https://stackoverflow.com/questions/7171483/simple-way-to-get-element-by-id-within-a-div-tag  */
var get_element_constrain_container = function(containerID, childID) {
    var elm = document.getElementById(childID)
    var parent = elm ? elm.parentNode : {}
    return (parent.id && parent.id === containerID) ? elm : {}
}

/* A better method as suggested by 0x000f, StackOverFlow: https://stackoverflow.com/questions/1066452/easiest-way-to-open-a-download-window-without-navigating-away-from-the-page  */
var download_file_silently = function(file_path) {
    var a = document.createElement('A');
    a.href = file_path;
    a.download = file_path.substr(file_path.lastIndexOf('/') + 1);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

var navigate_link = function(file_path) {
    var a = document.createElement('A');
    a.href = file_path;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}