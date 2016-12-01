_mem_autocomplete_script()
{

  COMPREPLY=()
      cur="${COMP_WORDS[COMP_CWORD]}"
      subcommands_1=$(/usr/bin/env mem _commands-shortlist) #возможные подкоманды первого уровня
      subcommands_list=$(/usr/bin/env mem _list-shortlist)

      if [[ ${COMP_CWORD} == 1 ]] ; then # цикл определения автодополнения при вводе подкоманды первого уровня
          COMPREPLY=( $(compgen -W "${subcommands_1}" -- ${cur}) )
          return 0
      fi



      subcmd_1="${COMP_WORDS[1]}"
      case "${subcmd_1}" in
      forget|run|remind|rm|r)

          if [[ ${COMP_CWORD} == 2 ]] ; then
              COMPREPLY=( $(compgen -W "${subcommands_list}" -- ${cur}) )
              return 0
          fi

          subcmd_2="${COMP_WORDS[2]}"

          if [[ ${COMP_CWORD} == 3 ]] ; then
              COMPREPLY=($(compgen -W "`ls ${HOME}/projects`" -- ${cur}))
              return 0
          fi
          ;;

      esac
      return 0

}
complete -o nospace -F _mem_autocomplete_script mem
