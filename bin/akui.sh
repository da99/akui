#!/usr/bin/env bash
# -*- bash -*-
#
#
set -u -e -o pipefail

action="$1"
shift

port="4567"
thin_cmd="bundle exec thin --port $port --log tmp/log.log --pid tmp/pid.pid -R specs/config.ru"

case "$action" in

  "help")
    echo " ====================================================="
    echo ""
    echo " $  akui   watch"
    echo ""
    echo " $  akui   js_install"
    echo ""
    echo " $  akui   test"
    echo " $  akui   test   name"
    echo ""
    echo " === Default: args are used to start the server"
    echo " $  akui -d start"
    echo " $  akui start"
    echo " ====================================================="
    echo ""
    exit 0
    ;;  # === start

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
        echo "$op -> $path"

        if [[ "$path" == *lib/browser* && "$file" == *.js* ]]; then
          echo ""
          echo "=== Runninig jshint on $path: $CHANGE"
          (jshint "$path" && echo "No errors.") || true
          mkdir -p Public/akui
          cp $path Public/akui/$file
        fi

        if [[ "$path" == *bin/akui* ]]; then
          echo ""
          echo "=== Restarting:"
          exec $path "watch"
        fi
      fi # === if file op

    done

    ;; # === watch

  "js_install")
    dir="$(dirname $(dirname $(readlink -f $0)))/lib/browser/akui"
    echo cp -i -r $dir/ .
    cp -i -r $dir/ .
    echo "=== copied: ${dir} -> $(pwd)/$(basename $dir)"
    ;; # === Public

  "test")
    files=""
    if [[ ! -z "$@" ]]; then
      files="$(echo -n specs/*-$1/spec.rb)"
      if [[ -f "$files" ]]; then
        shift
      else
        files=""
      fi
    fi

    if [[ -z "$files" ]]; then
      files="$(echo -n specs/*-* | tr ' ' '\n' | sort)"
    fi

    if [[ -z "$files" ]]; then
      colorize yellow "No tests found." 1>&2
      exit 0
    else
      mkdir -p Public
      cd Public
      ../bin/akui js_install
      cd ..

      counter=1
      for i in $files
      do

        rm -f tmp/log.log
        echo ""
        echo "=== SPEC: $(basename $i)"
        SPEC_FILE="$(basename $i)" $thin_cmd -d start

        curl_i=0
        code="0000"
        while [[ curl_i -lt 7 && "$code" -lt 100 ]]
        do
          curl_i=$(( $curl_i + 1 ))
          code="$(curl --silent -o /dev/null -w "%{http_code}" http://localhost:$port/ || echo "0")"
          sleep 0.1
        done

        if [[ -f tmp/pid.pid ]]; then
          google-chrome "http://localhost:$port/akui/run"
        fi

        while [[ -f tmp/pid.pid && $counter -lt 60 &&  ! -f Public/finished.txt ]];
        do
          counter=$(( $counter + 1 ))
          sleep 0.1
        done

        if [[ -f tmp/pid.pid ]]; then
          SPEC_FILE="$i" $thin_cmd -d stop
        else
          tree tmp
          grep --color -E 'Exiting|from |$' tmp/log.log
          exit 1
        fi

      done

      rm -rf Public/akui
    fi
    ;; # === test

  "stop")
    $thin_cmd $@ stop
    rm -f tmp/log.log
    ;;

  *)
    rm -f tmp/log.log
    echo "=== Server is starting"
    SPEC_FILE="0000-it-runs" $thin_cmd $action $@

    if [[ -f tmp/pids.pid ]]; then

      while [ ! -f tmp/log.log ]
      do
        echo -n '.'
        sleep 0.1
      done

      echo ""

      grep --color -E 'Exiting|from |$' tmp/log.log
      if [[ "$@" == *start* && "$(cat tmp/log.log)" != *Exiting* ]]
      then
        google-chrome http://localhost:$port
      fi

    fi # === if pid exists

    ;;

esac
