
require 'cuba'
require 'escape_escape_escape'

class Akui

  VERSION = `cat #{File.dirname __FILE__}/../VERSION`.strip
  MOVED_TEMP    = 302

  class Middleware < Cuba

    define {
      on get do
        on(root) {
          res.write <<-EOF
          <html>
            <head>
              <title>Akui v#{::Akui::VERSION}</title>
              <style type="text/css">
                body, pre {
                  background: #F2F2F2;
                  font-family: Ubuntu Mono, monospace;
                }
                a:link {
                  padding: 4px;
                }
                a:hover {
                  background: green;
                  color: #fff;
                }
              </style>
            </head>
            <body>
              <a href="#{File.join req.env['REQUEST_PATH'], '/run'}">Run all</a>
              <pre>#{::Akui.print}</pre>
            </body>
          </html>
          EOF
        }

        on('inspect') {
          res['Content-Type'] = 'application/json'
          res.write Escape_Escape_Escape.json_encode({tests: ::Akui.tests})
        }

        on('run') {
          Akui.reset
          Akui.pop
          res.redirect Akui.current[:path].to_s, ::Akui::MOVED_TEMP
        }
      end # === on get


      on post do
        on('run') {
          res['Content-Type'] = 'application/json'
          res.write Akui.pop.inspect
        }
      end # === on pot
    }

  end # === class Middleware

  class << self

    def reset
      @current_tests = tests.map { |d|
        d[:its].map { |i|
          i = i.dup
          i[:parent] = d
        }
      }.flatten
      @current_tests.unshift false
      @past    = []
    end

    def pop
      @current_tests.shift
    end

    def current
      @current_tests.first
    end

    def running?
      @current_tests.first != false
    end

    def print *args
      type, o = args
      case type

      when nil, :all
        tests.map { |desc|
          print :desc, desc
        }.join "\n".freeze

      when :describe, :desc
        %^DESC #{o[:path]} #{o[:name] && o[:name].inspect}\n^ +
          %^#{o[:its].map { |it| print :it, it }.join "\n"}^

      when :it
        %^  it #{o[:name].inspect}\n#{o[:script]}^

      else
        fail ArgumentError, "Unknown args: #{args.inspect}"
      end
    end

    def define
      instance_eval(&Proc.new)
    end

    def tests
      @tests ||= []
    end

    def describe path, name = nil
      if @current
        fail <<-EOF.strip
         NOTE:
         Do not use DESCRIBE in nested fashion.
         You can try, but it was not designed
         to work like this, in order to make
         my life easier w/ a simple implementation.

         Use it like this:
           describe {
           }

           describe {
           }

           describe {
           }
        EOF
      end

      tests.<<(
        @current = {
          :path => path,
          :name => name,
          :its  => []
        }
      )
      yield
      @current = nil
    end

    def it name, script_str
      if @current
        @current[:its] << {
          :name => name,
          :script => script_str
        }
      end
    end

  end # === class << self

end # === class Akui ===
