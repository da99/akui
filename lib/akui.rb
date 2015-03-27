
require 'cuba'
require 'escape_escape_escape'

class Akui

  class Middleware < Cuba

    define {
      on get do
        on(root) {
          res.write 'Not done'
        }

        on('inspect') {
          res['Content-Type'] = 'application/json'
          res.write Escape_Escape_Escape.json_encode({tests: ::Akui.tests})
        }
      end
    }

  end # === class Middleware

  class << self

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
