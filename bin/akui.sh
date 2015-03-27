#!/usr/bin/env bash
# -*- bash -*-
#
#
set -u -e -o pipefail

action="$1"
shift

case "$action" in

  "help")
    echo " ====================================================="
    echo ""
    echo " $  akui   watch"
    echo ""
    echo " $  akui   Public"
    echo ""
    echo " $  akui   test"
    echo " $  akui   test   name"
    echo ""
    echo " ====================================================="
    echo ""
    exit 0
    ;;  # === start

  "start")
    bundle exec thin -R specs/lib/config.ru  start
    ;;

  "watch")
    echo "=== Watching: "
    inotifywait -q --exclude .git/ -e close_write,close -m -r .  | while read CHANGE
    do
      dir=$(echo "$CHANGE" | cut -d' ' -f 1)
      op=$(echo "$CHANGE" | cut -d' ' -f 2)
      file=$(echo "$CHANGE" | cut -d' ' -f 3)
      path="${dir}$file"

      if [[ ( ! "$op" =~ "NOWRITE" ) && ( "$op" =~ "CLOSE" || "$op" =~ "WRITE" )  && ! -z "$file" ]]
      then
        echo ""
        if [[ "$file" == *.js* ]]; then
          echo ""
          echo "=== Runninig jshint on $path: $CHANGE"
          (jshint "$path" && echo "No errors.") || true
        fi

        if [[ "$path" == *bin/akui* ]]; then
          echo ""
          echo "=== Restarting:"
          exec $path "watch"
        fi
      fi # === if file op

    done

    ;; # === watch

  "Public")
    Public_Folder="$(dirname $(dirname $(readlink -f $0)))/lib/Public/akui"
    new_folder="Public/akui"
    mkdir -p Public
    cp -i -r $Public_Folder $new_folder
    echo "=== copied: ${Public_Folder} -> ${new_folder}"
    ;; # === Public

  "test")
    files=""
    if [[ ! -z "$@" ]]; then
      files="$(echo -n specs/*-$1.rb)"
      if [[ -f "$files" ]]; then
        shift
      else
        files=""
      fi
    fi

    if [[ -z "$files" ]]; then
      files="$(echo -n specs/*.rb | tr ' ' '\n' | sort)"
    fi

    if [[ -z "$files" ]]; then
      colorize yellow "No tests found." 1>&2
      exit 0
    else
      bundle exec bacon specs/lib/helpers.rb $files "$@"
    fi
    ;; # === test

  *)
    echo "=== Unknown action: $action" 1>&2
    exit 1
    ;;

esac
