var root = "csweat03.com"

let primary_color = "rgb(0, 146, 19)"
let second_color = "rgb(186, 245, 194)"
let third_color = "rgb(245, 245, 245)"

var hist = []

var input_element

var repositories = []
fetch("https://api.github.com/users/csweat03/repos")
      .then((response) => response.text())
      .then((text) => eval(text))
      .then((response) => {
        for (const index in response) {
            const repository = response[index]
            repositories.push(repository.name)
        }
      })

class TextAdapter {
    prefix = ": "

    async send(string) {
        get_element_constrain_container("current", "output").innerHTML = this.prefix + string
    }
}

let text_adapter = new TextAdapter()

class Command {
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
    help: new Command("help",           ["h", "hlp", "?"], UserList.guest, "Get a list of all qualified commands.",                 event_help),
    whois: new Command("whois",         ["w", "me", "whoami", "about", "author"], UserList.guest, "A small segment about me.",      event_whois),
    theme: new Command("theme",         ["t", "change"], UserList.guest, "Change the theme to gui.",                                event_theme),
    scale: new Command("scale",         ["s", "zoom"], UserList.guest, "Change the scale of the terminal.",                         event_scale),
    download: new Command("download",   ["d", "dl"], UserList.guest, "Download a file from the website.",                           event_download),
    clear: new Command("clear",         ["c", "clr", "cls"], UserList.guest, "Clears the screen.",                                  event_clear),
    resume: new Command("resume",       ["r", "cv", "recruit"], UserList.guest, "Downloads my latest resume and CV.",               event_resume),
    github: new Command("github",       ["g", "git", "source"], UserList.guest, "Use 'github ?' for more information.",             event_github),
}

function event_help(args) {
    list = Object.values(CommandList)
    str = ""
    list.forEach((cmd, ind) => {
        str += `${cmd.name}` + ((args[0] == "verbose") ? (`: ${cmd.description}` + (ind == list.length - 1 ? `` : `<br>`)) : 
                        (ind == list.length - 1 ? `<br>-> Try "help verbose" for more information.` : `, `))
    })
	text_adapter.send("Available Commands:<br>" + str)
}
function event_whois() {
    text_adapter.send("Hi &#x1F44B, I'm Christian<br>A passionate full-stack developer from the United States.<br>")
}
function event_theme() {
    text_adapter.send("&#x1F6AB&#x1F6A7&#x1F6AB Under Construction &#x1F6AB&#x1F6A7&#x1F6AB")
}
function event_scale(args) {
    const argOne = validate_args(text_adapter, args, ["0"])[0];

    flagStr = `The scale of the emulator cannot be set to ${args[0]}. This value needs to be a number between 0.2 and 5.0!`

    // Checking that the first argument is a number.
    if (!is_numeric(argOne)) return text_adapter.send(flagStr)

    // Casting the first argument to a float and constraining the value to 0.2 - 5.0
    cast = parseFloat(argOne)
    if (cast < 0.2 || cast > 5) return text_adapter.send(flagStr)

    document.getElementById("emulator").style = `transform-origin: top left; zoom: ${cast.toString()}; -moz-transform: scale(${cast.toString()});`
    document.getElementById('current').scrollIntoView({ behavior: 'smooth' })

    text_adapter.send(`The scale of the emulator has been set to ${n}.`)
}
function event_download(args) {
    if (args.length < 1) return;
    
    return text_adapter.send(`Downloading file: ${args[0]}.`).then(download_file_silently(`assets/${args[0]}`))
}
function event_clear() {
    document.querySelectorAll('.packed').forEach(pack => pack.remove());
    document.getElementById("current").remove;
}
function event_resume() {
    text_adapter.send(`Downloading resume.docx and cv.docx.`)
    .then(download_file_silently(`assets/resume.docx`))
    .then(download_file_silently(`assets/cv.docx`))
}
function event_github(args) {
    if (args.length < 1) return text_adapter.send("Opening my github profile...").then(navigate_link("https://github.com/csweat03/"))

    if (args[0] == "?") {
        var str = ""
        for (var index in repositories) {
            repo = repositories[index]
            str += repo + (index == repositories.length - 1 ? `` : `, `)
        }
        text_adapter.send("GitHub Commands.<br>github: Go to my github profile.<br>github {repository}: Go to any of the github repositories below.<br><br>" + str)
    }

    for (var index in repositories) {
        repo = repositories[index]
        if (args[0].toLowerCase() == repo.toLowerCase()) {
            navigate_link("https://github.com/csweat03/" + repo)
            return
        }
    }
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

    text_adapter.send("Try 'help' instead!").then(pack_div())
}

function pack_div() {
    const div = document.getElementById('current')
    const finalize = div.cloneNode(true)

    finalize.removeAttribute("id")
    finalize.className = "packed"
    div.className = "loading"

    finalize.childNodes.forEach((children) => children.nodeType == 1 ? children.setAttribute("readonly", "readonly") & (children.id = "") : null)

    setTimeout(() => (div.className = ""), 250)
        
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