#Memory

#Introduction

My name is Memory but friends calls me MEM, and i'm 
application which will help you to memorize all the commands, 
or just create an aliases for this commands, or just call it 
shortcuts it is doesn't metter, the only one thing that metter 
is you should not have to remember all this list, because i will
do it instead :)

##Installation guide
###On example you can execute this steps:
- `git clone https://github.com/spalax/mem.git`
- `cd mem`
- `npm i`
- ``p=`pwd` && cd /usr/bin && sudo ln -s $p/mem.js mem && cd -``
- `mem help`
###Or if you do not want install node and deps just copy binary 
 ( if arch will match [Mach-O 64-bit executable x86_64])
    
- `git clone https://github.com/spalax/mem.git`
- `cd mem/bin`
- `tar -xzvf mem.tgz`
- `sudo cp mem /usr/bin`
- `mem help`

##CLI
###Commands:
if nothing defined is eqaul with mem save [cmd]<br />
`remind|r [cmd_name]` - and i will remind you the command which you ask me to remember<br />
`forget|rm [cmd_name]` - and i will forget command which i remembered before<br />
`run [cmd_name]` - and i will run the command for you<br />
`save [cmd]` - and i will remember the command for you<br />
`list|l [names|commands]`- and i will show you everything i remember, 
if `names` then i will print only names, 
if commands then only commands, by default i will print all 

###Usage:
`mem ps axu` or `mem save 'ps axu'` - will save command 'ps axu' to the memory<br />
`mem 'ps axu | grep proc | ls -la && cd /tmp'` - to save a long command just put it in single braces<br />
`mem l names` - will show the names for all memorized commands<br />
`mem rm my super command` - will remove from memory command with name 'my super command'<br />

Now you know!
