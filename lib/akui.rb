
require 'cuba'
require 'escape_escape_escape'

class Akui

  # def initialize app
    # @app
  # end

  # def call env
    # dup._call env
  # end

  # def _call env
    # status, headers, body = @app.call env
    # is_html  = headers['Content-Type'] && headers['Content-Type']['html']
    # end_body = is_html && body.detect { |b| b['</body>'] }
    # return [status, headers, body] unless is_html && end_body
    # end_body.sub!('</body>', <<-EOF.strip)
      # <script src="/akui/akui.js"></script></body>
    # EOF
    # [status, headers, body]
  # end

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
