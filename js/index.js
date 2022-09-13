var root = "csweat03.com"

let primary_color = "rgb(0, 146, 19)"
let second_color = "rgb(186, 245, 194)"
let third_color = "rgb(245, 245, 245)"

var hist = []

var input_element

class TextAdapter {
    prefix = ": "
    current_output = ""

    append(string, overwrite) {
        return this.current_output = (overwrite ? string : this.current_output + string)
    }

    post() {
        var post = get_element_constrain_container("current", "output").innerHTML = this.prefix + this.current_output
        this.current_output = ""
        return post
    }
}

let text_adapter = new TextAdapter()

class User {
    name = "name"
    minimum = 0

    constructor(name, minimum) {
        this.name = name
        this.minimum = minimum
    }

    validate(min) {
        return this.minimum >= min.minimum
    }
}

const UserList = {
    guest: new User("guest", 0),
    user: new User("user", 1),
    root: new User("root", 5)
}

var user = UserList.guest

class Command {
    name = "command"
    alias = ["cmd"]
    permission = UserList.guest;
    description = "A command executes a series of logic."
    event = () => {}

    constructor(name, alias, permission, description, event) {
        this.name = name
        this.alias = alias
        this.permission = permission
        this.description = description
        this.event = event
    }

    execute = function() {
        const clean = input_element.value.trim().toLowerCase()
        const command = clean.split(" ")[0]
        const args = clean.split(" ").slice(1)

        let found = false

        // Verifying legal name in alias list
        this.alias.forEach((a) => a == command ? found = true : null)

        // Verifying a valid name or alias has been found
        if (command !== this.name && !found) return false

        // Check for sufficient permission
        if (!user.validate(this.permission)) {
            text_adapter.append("You do not have sufficient permission to use this command.")
            text_adapter.post()
            return false
        }

        this.event(args)
		
		if (this.name == "clear") {
			input_element.value = ""
		} else {
			pack_div()
		}
        return true
    }
}

const CommandList = {
    help: new Command("help", ["hlp", "?"], UserList.guest, "Get a list of all qualified commands.",                event_help),
    whois: new Command("whois", ["me", "whoami", "about", "author"], UserList.guest, "A small segment about me.",   event_whois),
    theme: new Command("theme", ["change"], UserList.guest, "Change the theme to gui.",                             event_theme),
    scale: new Command("scale", ["zoom"], UserList.guest, "Change the scale of the terminal.",                      event_scale),
    clear: new Command("clear", ["clr", "cls"], UserList.guest, "Clears the screen.",                               event_clear),
    resume: new Command("resume", ["cv", "recruit"], UserList.guest, "Downloads my latest résumé.",                 event_resume),
    github: new Command("github", ["git", "source"], UserList.guest, "Navigates to my github page.",                event_github)
}

function event_help(args) {
    list = Object.values(CommandList)
    str = ""
    list.forEach((cmd, ind) => {
        str += `${cmd.name}` + ((args[0] == "verbose") ? (`: ${cmd.description}` + (ind == list.length - 1 ? `` : `<br>`)) : 
                        (ind == list.length - 1 ? `<br>-> Try "help verbose" for more information.` : `, `))
    })
	text_adapter.append("Available Commands:<br>" + str, true)
}
function event_whois() {
    text_adapter.append("Hi &#x1F44B, I'm Christian<br>A passionate full-stack developer from the United States.<br>", true)
}
function event_theme() {
    text_adapter.append("&#x1F6AB&#x1F6A7&#x1F6AB Under Construction &#x1F6AB&#x1F6A7&#x1F6AB", true)
}
function event_scale(args) {
    if (args.length < 1) {
        text_adapter.append(`This command requires one argument. This value needs to be a number between 0.2 and 5.0!`)
        return
    }
    if (!is_numeric(args[0])) {
        text_adapter.append(`The scale of the emulator cannot be set to ${args[0]}. This value needs to be a number between 0.2 and 5.0!`)
        return
    }
    n = parseFloat(args[0])
    if (n < 0.2 || n > 5) {
        text_adapter.append(`The scale of the emulator cannot be set to ${args[0]}. This value needs to be between 0.2 and 5.0!`)
        return
    }
    document.getElementById("emulator").style = `transform-origin: top left; zoom: ${n.toString()}; -moz-transform: scale(${n.toString()});`
    text_adapter.append(`The scale of the emulator has been set to ${n}.`)
    document.getElementById('current').scrollIntoView({ behavior: 'smooth' })
}
function event_clear() {
    document.querySelectorAll('.packed').forEach(pack => pack.remove());
    document.getElementById("current").remove;
}
function event_resume() {
    text_adapter.append(`Downloading the most recent resume...`)
    download_file_silently('assets/resume.docx')
}
function event_github() {
    text_adapter.append("&#x1F6AB&#x1F6A7&#x1F6AB Under Construction &#x1F6AB&#x1F6A7&#x1F6AB", true)
}

function present_interface() {
    const selectors = document.querySelectorAll('#current #pointer > span')

    selectors[0].style.color = second_color
    selectors[1].style.color = third_color
    selectors[2].style.color = primary_color
    selectors[3].style.color = third_color

    selectors[0].textContent = user.name
    selectors[2].textContent = root

    input_element = get_element_constrain_container("current", "input")
    hist[hist.length] = input_element.value
}

function process_interface() {
    present_interface()

    var found = false

    if (input_element.value.trim().toLowerCase() == "") return;

    for (const command of Object.values(CommandList)) {
        if (command.execute()) found = true
    }

    if (found) return;

    text_adapter.append("Try 'help' instead!", false)
    pack_div()
}

function pack_div() {
    const div = document.getElementById('current')
    text_adapter.post()
    const finalize = div.cloneNode(true)

    finalize.removeAttribute("id")
    finalize.className = "packed"
    div.className = "loading"

    finalize.childNodes.forEach((children) => children.nodeType == 1 ? children.setAttribute("readonly", "readonly") & (children.id = "") : null)

    setTimeout(() => (div.className = ""), 125)
        
    document.getElementById("emulator").insertBefore(finalize, div)

    get_element_constrain_container(div.id, "output").textContent = ""
    div.scrollIntoView({ behavior: 'smooth' })

    input_element.value = ""
}

setTimeout(present_interface, 1)

document.addEventListener('mouseup', (event) => {
    get_element_constrain_container("current", "input").focus()
})

document.addEventListener('keydown', (event) => {
    document.getElementById('current').scrollIntoView({ behavior: 'smooth' })

    if (event.defaultPrevented) return

    if (event.keyCode == 13) {
        process_interface()
        event.preventDefault()
    }
}, true)