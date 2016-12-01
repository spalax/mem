#!/usr/local/bin/node --harmony
"use strict"
const colors = require('colors');
colors.setTheme({
    cmd: ['gray', 'bold', 'italic'],
    warn: ['yellow', 'underline'],
    err: ['red', 'underline'],
    suc: ['green', 'underline', 'bold', 'italic']
});

if (process.argv.length < 3 ||
    (process.argv.length == 3 &&
        (process.argv[2] == 'help' || process.argv[2] == '--help' || process.argv[2] == '-h'))) {
    let caption = "\nMy name is " + "Memory".rainbow + " but friends calls me MEM, and i'm \n" +
                  "application which will help you to memorize all the commands, \n" +
                  "or just create an aliases for this commands, or just call it \n" +
                  "shortcuts it is doesn't metter, the only one thing that metter \n" +
                  "is you should not have to remember all this list, because i will\n" +
                  "do it instead :)\n\n";
    console.log(caption.white.bold);
    console.log("Commands which i support are:\n".warn +
                "remind|r [cmd_name]".cmd + " - and i will remind you the command which you ask me to remember\n" +
                "forget|rm [cmd_name]".cmd + " - and i will forget command which i remembered before\n" +
                "run [cmd_name]|[cmd_name]".cmd + " - and i will run the command for you\n" +
                "save|s".cmd + " - and i will remember the command for you\n" +
                "list|l [names]".cmd + "- and i will show you everything i remember, " +
                                       "\nif `names` then i will print only names\n\n" +
                "Usage:\n".warn +
                "mem save".cmd + " - will open interactive dialog to save command 'ps axu' to the memory and to add an alias\n" +
                "mem l names".cmd + " - will show the names for all memorized commands\n" +
                "mem rm my super command".cmd + " - will remove from memory command with name 'my super command'\n" +
                "mem run ls".cmd + " or " + "mem ls" + " - will run previously saved ls command\n\n" +
                "Now you know!".white);
    process.exit(0);
}

const action = process.argv[2];
const argvs = process.argv.splice(3, Number.MAX_VALUE);

const fs = require('fs');
const actions = ['remind', 'r', 'forget', 'rm', 'run', 'list', 'l', 'save', 's'];
const longActons = ['remind', 'forget', 'run', 'list', 'save'];
const readline = require('readline');
const didYouMean = require('didyoumean2');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let content;
const dbFile = "memorized.commands.json";
const dbDir = process.env.HOME + "/.memdata";
const dbPath = dbDir + '/' + dbFile;

const findSame = (find, where) => {
    if (!where) {
        where = 'cmd';
    }

    for (let item in content) {
        if (content[item][where] === find) {
            return content[item];
        }
    }

    return false;
};

const getAllKeys = (key) => {
    let items = [];
    for (let item in content) {
        items.push(content[item][key]);
    }

    return items;
};

const saveContent = (content) => {
    fs.writeFileSync(dbPath, JSON.stringify(content), {encoding: 'utf8', mode: '0600', flag: 'w+'});
};

const checkIsNameExistsInDb = (name) => {
    for (let item in content) {
        if (content[item].name == name) {
            return content[item];
        }
    }
    return false;
};

const printItem = (item) => {
    console.log(item.name.warn + "\n >> " + item.cmd.cmd + "\n\n");
};

const actionRun = (argvs) => {
    if (!argvs.length) {
        console.log('cmd_name not defined'.err);
        process.exit(0);
    }
    let cmdName = argvs.join(' ').trim(),
        item = findSame(cmdName, 'name');
    if (!item) {
        let simillarItems = didYouMean(cmdName, getAllKeys('name'), {'returnType': 'all-matches'});
        if (simillarItems.length) {
            console.log("Did you mean: " + simillarItems.join(" or ").cmd + " ?");
        } else {
            console.log("[".err + cmdName.cmd + "] not found".err);
        }
        process.exit(0);
    } else {
        console.log(item.cmd.cmd, "\n");
        let exec = require('child_process').exec;
        console.log("RUN:\n".rainbow)
        let proc = exec(item.cmd, (error, stdout, stderr) => {
            if (error) {
                console.log("ERROR >>", error);
            }
            process.exit(0);
        });
        proc.stdout.on('data', function(data) {
            console.log(data.green);
        });
        proc.stderr.on('data', function(data) {
            console.log(data.err);
        });
    }
};


if (!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir, '0700');
}

if (fs.existsSync(dbPath)) {
    content = require(dbPath);
} else {
    content = [];
}

if (action === '_commands-shortlist') {
    console.log(longActons.join(' ') + getAllKeys('name').join(' '));
    process.exit(0);
}

if (action === '_list-shortlist') {
    console.log(getAllKeys('name').join(" "));
    process.exit(0);
}

if (action === 'save' || action === 's') {
    let command = action + " " + argvs.join(' ');
    rl.question('Insert command:\n>>', (command) => {
        let sameItem = findSame(command);
        if (sameItem) {
            console.log("Already stored item:\n".warn);
            printItem(sameItem);
            process.exit(1);
        }

        const nameTheCommand = () => {
            rl.question('Name your command:\n>>', (cmdName) => {
                let name = cmdName.trim().split(' ').join('-');

                if (name.length < 1) {
                    console.log("Command name couldn't be empty".err);
                    return nameTheCommand();
                }

                if (actions.indexOf(name) !== -1) {
                    console.log("Already reserved word [" + actions.join(',') + "], please " +
                                "use another name for command".err);
                    return nameTheCommand();
                }

                let item = checkIsNameExistsInDb(name);
                if (item) {
                    console.log("Command already exists".warn,
                        item.cmd.cmd);
                    return nameTheCommand();
                }
                content.push({'name': name, 'cmd': command});
                saveContent(content);
                console.log("Command stored to memory:\n".suc, command.cmd);
                rl.close();
            });
        };

        nameTheCommand();
    });
} else {
    if (content.length < 1) {
        console.log("Memory is clean! Please add something first .. :) ");
        process.exit(0);
    }

    if (action === 'remind' || action === 'r') {
        if (!argvs.length) {
            console.log('cmd_name not defined'.err);
            process.exit(0);
        }

        let cmdName = argvs.join(' ').trim(),
            item = findSame(cmdName, 'name');

        if (!item) {
            let simillarItems = didYouMean(cmdName, getAllKeys('name'), {'returnType': 'all-matches'});
            if (simillarItems.length) {
                console.log("Did you mean: " + simillarItems.join(" or ").cmd + " ?");
            } else {
                console.log("Sorry but command not found".err);
            }
        } else {
            printItem(item);
        }
        process.exit(0);
    } else if (action === 'list'|| action == 'l') {
        let cond = argvs.join(' ').trim();
        console.log("Here are what we have:");
        content.forEach((item) => {
            if (cond === 'names' || cond === 'name') {
                console.log(item.name.warn);
            } else {
                printItem(item);
            }
        });
        process.exit(0);
    } else if (action === 'forget' || action == 'rm') {
        if (!argvs.length) {
            console.log('cmd_name not defined'.err);
            process.exit(0);
        }
        let forgotten,
            cmdName = argvs.join(' ').trim();

        for (let item in content) {
            if (content[item].name === cmdName) {
                forgotten = content[item];
                content.splice(item, 1);
                console.log
                break;
            }
        }
        if (forgotten) {
            saveContent(content);
            console.log(("Item " + forgotten.name + " where forgot \n").suc, "Command was:\n", forgotten.cmd.cmd);
        }
        process.exit(0);
    } else if (action === 'run') {
        actionRun(argvs);
    } else {
        argvs.unshift(action);
        actionRun(argvs);
    }
}
