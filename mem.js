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
                "if nothing defined is eqaul with ".white.bold + "mem save [cmd]".cmd + "\n" +
                "remind|r [cmd_name]".cmd + " - and i will remind you the command which you ask me to remember\n" +
                "forget|rm [cmd_name]".cmd + " - and i will forget command which i remembered before\n" +
                "run [cmd_name]".cmd + " - and i will run the command for you\n" +
                "save [cmd]".cmd + " - and i will remember the command for you\n" +
                "list|l [names|commands]".cmd + "- and i will show you everything i remember, " +
                "\nif `names` then i will print only names, \nif commands then only commands, " +
                "by default i will print all \n\n" +
                "Usage:\n".warn +
                "mem ps axu".cmd + " or " + "mem save 'ps axu'".cmd + " - will save command 'ps axu' to the memory\n" +
                "mem 'ps axu | grep proc | ls -la && cd /tmp'".cmd + " - to save a long command just put it in single braces\n" +
                "mem l names".cmd + " - will show the names for all memorized commands\n" +
                "mem rm my super command".cmd + " - will remove from memory command with name 'my super command'\n\n" +
                "Now you know!".white);
    process.exit(0);
}

const action = process.argv[2];
const argvs = process.argv.splice(3, Number.MAX_VALUE);

const fs = require('fs');
const actions = ['remind', 'r', 'forget', 'rm', 'run', 'list', 'l'];
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

if (!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir, '0700');
}

if (fs.existsSync(dbPath)) {
    content = require(dbPath);
} else {
    content = [];
}

if (actions.indexOf(action) === -1 || action === 'save') {
    let command = action + " " + argvs.join(' '),
        sameItem = findSame();

    if (sameItem) {
        console.log("Alaredy stored item:\n".warn);
        console.log(sameItem.name.warn + "\n\t" + sameItem.cmd.cmd + "\n\n");
    } else {
        rl.question('How do you want to name this command ? ', (cmdName) => {
            let item = checkIsNameExistsInDb(cmdName);
            if (item) {
                console.log("Command already exists".warn,
                            item.cmd.cmd);
                rl.close();
                return;
            }
            content.push({'name': cmdName, 'cmd': command});
            saveContent(content);
            console.log("Command stored to memory:\n".suc, command.cmd);
            rl.close();
        });
    }
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

        let cmdName = argvs.join(' '),
            item = findSame(cmdName, 'name');

        if (!item) {
            let simillarItems = didYouMean(cmdName, getAllKeys('name'), {'returnType': 'all-matches'});
            console.log(simillarItems);
            if (simillarItems.length) {
                console.log("Did you mean: " + simillarItems.join(" or ").cmd + " ?");
            } else {
                console.log("Sorry but command not found".err);
            }
        } else {
            console.log(item.name.warn + "\n >> " + item.cmd.cmd);
        }
        process.exit(0);
    } else if (action === 'list'|| action == 'l') {
        let cond = argvs.join(' ');
        console.log("Here are what we have:");
        content.forEach((item) => {
            if (cond === 'names' || cond === 'name') {
                console.log(item.name.warn);
            } else {
                console.log(item.name.warn + "\n >> " + item.cmd.cmd + "\n\n");
            }
        });
        process.exit(0);
    } else if (action === 'forget' || action == 'rm') {
        if (!argvs.length) {
            console.log('cmd_name not defined'.err);
            process.exit(0);
        }
        let forgotten,
            cmdName = argvs.join(' ');
        for (let item in content) {
            if (content[item].name === cmdName.trim()) {
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
        if (!argvs.length) {
            console.log('cmd_name not defined'.err);
            process.exit(0);
        }
        let cmdName = argvs.join(' '),
            item = findSame(cmdName, 'name');
        if (!item) {
            let simillarItems = didYouMean(cmdName, getAllKeys('name'), {'returnType': 'all-matches'});
            if (simillarItems.length) {
                console.log("Did you mean: " + simillarItems.join(" or ").cmd + " ?");
            } else {
                console.log("Sorry but command not found".err);
            }
        } else {
            var exec = require('child_process').exec;
            exec(item.cmd, (error, stdout, stderr) => {
                [error, stdout, stderr].forEach((data) => {
                    data && data.length && console.log(data);
                });
                process.exit(0);
            });
        }
    }
}
