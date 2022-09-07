let doc = document;
var root = "csweat03.com"

let primary_color = "rgb(0, 146, 19)";
let second_color = "rgb(186, 245, 194)";
let third_color = "rgb(245, 245, 245)";

var hist = []

var input_element;

var debug_mode = false;

class TextAdapter {
    prefix = ": ";
    current_output = "";

    constructor() {}

    append(string, overwrite) {
        return this.current_output = (overwrite ? string : this.current_output + string)
    }

    get() {
        return this.current_output;
    }

    post() {
        var post = get_element_constrain_container("current", "output").innerHTML = this.prefix + this.current_output;
        this.current_output = ""
        return post;
    }

}

let text_adapter = new TextAdapter();

// role: [PERMISSION: 0, NAME: "guest"]
var USR_LIST = {
    guest: [0, "guest"],
    user: [1, "user"],
    mod: [2, "mod"],
    root: [3, "root"]
};
// cmd: [NAME: "cmd", ALIAS: ["alias1", "alias2"], PERMISSION: "", DESCRIPTION: "", EVENT: (args) => {blah-blah}]
var CMD_LIST = [
    help = {
        NAME: "help", 
        ALIAS: ["hlp", "?"], 
        PERMISSION: USR_LIST.guest, 
        DESCRIPTION: "Get a list of all qualified commands.", 
		EVENT: (args) => display_help(args)
    },
    whois = {
        NAME: "whois", 
        ALIAS: ["me", "whoami", "about", "author"], 
        PERMISSION: USR_LIST.guest, 
        DESCRIPTION: "A small segment about me.", 
        EVENT: (args) => text_adapter.append("Hi &#x1F44B, I'm Christian<br>A passionate full-stack developer from the United States.<br>", true)
    },
    traditional = {
        NAME: "traditional", 
        ALIAS: ["trad", "leave", "simple", "exit"], 
        PERMISSION: USR_LIST.guest, 
        DESCRIPTION: "(WIP) Exit the terminal, and view a more traditional website.", 
        EVENT: (args) => text_adapter.append("&#x1F6AB&#x1F6A7&#x1F6AB Under Construction &#x1F6AB&#x1F6A7&#x1F6AB", true)
    },
    scale = {
        NAME: "scale", 
        ALIAS: ["zoom", "translate", "size"], 
        PERMISSION: USR_LIST.guest, 
        DESCRIPTION: "Change the scale of the terminal.", 
        EVENT: (args) => scale_emulator(args)
    },
    debug = {
        NAME: "debug",
        ALIAS: ["dbg", "verbose", "test"],
        PERMISSION: USR_LIST.guest,
        DESCRIPTION: "Print verbose output in the console.",
        EVENT: (args) => toggle_debug(args)
    },
	clear = {
		NAME: "clear",
		ALIAS: ["clr", "cls", "delete", "erase"],
		PERMISSION: USR_LIST.guest,
		DESCRIPTION: "Clears the screen.",
		EVENT: (args) => {
			const packed = document.querySelectorAll('.packed');
			packed.forEach(pack => {
			  pack.remove();
			});
			document.getElementById("current").remove;
		}
	}
];

var user = USR_LIST.guest;

/* A better method as suggested by Dan, StackOverFlow: https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number?page=1&tab=scoredesc#tab-top  */
function is_numeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

/* A better method as suggested by nnnnnn, StackOverFlow: https://stackoverflow.com/questions/7171483/simple-way-to-get-element-by-id-within-a-div-tag  */
function get_element_constrain_container(containerID, childID) {
    var elm = doc.getElementById(childID);
    var parent = elm ? elm.parentNode : {};
    return (parent.id && parent.id === containerID) ? elm : {};
}

function present_interface() {
    const selectors = document.querySelectorAll('#current #pointer > span');

    selectors[0].style.color = second_color;
    selectors[1].style.color = third_color;
    selectors[2].style.color = primary_color;
    selectors[3].style.color = third_color;

    selectors[0].textContent = user[1];
    selectors[2].textContent = root;

    input_element = get_element_constrain_container("current", "input");
    hist[hist.length] = input_element.value;
}

function process_interface() {
    present_interface()

    const clean = input_element.value.trim().toLowerCase()
    
    const cmd = clean.split(" ")[0];
    const args = clean.split(" ").slice(1);

    for (const [key, value] of Object.entries(CMD_LIST)) {
        // name, alias [], permission, description, event(args)
        const name          = value.NAME;
        const aliases       = value.ALIAS;
        const permission    = value.PERMISSION;
        const description   = value.DESCRIPTION;
        const event         = value.EVENT;

        let found = false;

        // Verifying legal name in alias list
        aliases.forEach((alias) => alias == cmd ? found = true : null);

        // Verifying a valid name has been found
        if (cmd !== name && !found) continue;

        // Check for sufficient permission
        if (permission[0] > user[0]) {
            text_adapter.append("You do not have sufficient permission to use this command."); 
            continue;
        }

        event(args)
		
		if (name == "clear") {
			input_element.value = "";
		} else {
			pack_div()
		}
        return;
    }

    input_element.value = "";
    text_adapter.append("Try 'help' instead!", true)
    pack_div()
}

function pack_div() {
    const div = doc.getElementById('current');
    text_adapter.post();
    const finalize = div.cloneNode(true);

    finalize.removeAttribute("id");
    finalize.className = "packed";
    div.className = "loading"

    finalize.childNodes.forEach((children) => children.nodeType == 1 ? children.setAttribute("readonly", "readonly") & (children.id = "") : null)

    setTimeout(() => (div.className = ""), 125);
        
    doc.getElementById("emulator").insertBefore(finalize, div);

    get_element_constrain_container(div.id, "output").textContent = "";
    div.scrollIntoView({ behavior: 'smooth' });

    input_element.value = "";
}

function display_help(args) {
	str = "";
	if (args[0] == "verbose") {
		CMD_LIST.forEach((cmd, ind) => str += `${cmd.NAME}: ${cmd.DESCRIPTION}` + (ind == CMD_LIST.length - 1 ? `` : `<br>`))
	} else {
		CMD_LIST.forEach((cmd, ind) => str += `${cmd.NAME}` + (ind == CMD_LIST.length - 1 ? `<br>-> Try "help verbose" for more information.` : `, `))
	}
	text_adapter.append("Available Commands:<br>" + str, true)
}

// This breaks things. TODO: Fix element scaling problems.
function scale_emulator(args) {
    if (args.length < 1) {
        text_adapter.append(`This command requires one argument. This value needs to be a number between 0.2 and 5.0!`);
        return false;
    }
    if (!is_numeric(args[0])) {
        text_adapter.append(`The scale of the emulator cannot be set to ${args[0]}. This value needs to be a number between 0.2 and 5.0!`);
        return false;
    }
    n = parseFloat(args[0]);
    if (n < 0.2 || n > 5) {
        text_adapter.append(`The scale of the emulator cannot be set to ${args[0]}. This value needs to be between 0.2 and 5.0!`);
        return false;
    }
    emulator = doc.getElementById("emulator");
    var de = n.toString()
    emulator.style = `transform-origin: top left; zoom: ${de}; -moz-transform: scale(${de});`;
    text_adapter.append(`The scale of the emulator has been set to ${n}.`)
    doc.getElementById('current').scrollIntoView({ behavior: 'smooth' });
    return true;
}

function toggle_debug(args) {
    const old_state = debug_mode;
    if (args.length < 1) {
        text_adapter.append(`Debug has been toggled from ${old_state} to ${!old_state}.`);
        debug_mode = !old_state
        return true;
    }
    if (args[0] !== 'true' && args[0] !== 'false') {
        text_adapter.append(`The debug status cannot be set to ${args[0]}. This value needs to be true or false.`);
        return false;
    }
    const new_state = args[0] === 'true' ? true : false

    text_adapter.append(`Debug has been set to ${args[0]}.`);
    debug_mode = new_state;
}

setTimeout(present_interface, 1);

document.addEventListener('mouseup', (event) => {
    get_element_constrain_container("current", "input").focus()
})

document.addEventListener('keydown', (event) => {
    doc.getElementById('current').scrollIntoView({ behavior: 'smooth' });

    if (event.defaultPrevented) return;

    let handled = false;

    if (event.keyCode == 13) {
        process_interface();
        handled = true;
    }

    if (handled) event.preventDefault();
}, true);



















































































































































// var index = 0;

// function initializeList(listTitle, listContent, parentId) { 
//     var pID = "list-" + index;
    
//     initializeNode("ul", listTitle, parentId, pID);
    
//     for (var i = 0; i < listContent.length; i++) {
//         initializeNode("li", listContent[i], pID, "element-" + i)
//     }
    
//     index++;
// }

// function initializeNode(nodeType, nodeContent, parentId, nodeId) {
//     var node    = document.createElement(nodeType);
//     var content = document.createTextNode(nodeContent);
    
//     node.appendChild(content);
//     node.id = nodeId;
    
//     var parent = document.getElementById(parentId);
    
//     console.log(parent)
    
//     parent.appendChild(node);
    
//     console.log(parent)
// }
