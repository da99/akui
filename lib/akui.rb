
require 'cuba'

class Akui

  def initialize app
    @app
  end

  def call env
    dup._call env
  end

  def _call env
    status, headers, body = @app.call env
    is_html  = headers['Content-Type'] && headers['Content-Type']['html']
    end_body = is_html && body.detect { |b| b['</body>'] }
    return [status, headers, body] unless is_html && end_body
    end_body.sub!('</body>', <<-EOF.strip)
      <script src="/akui/akui.js"></script></body>
    EOF
    [status, headers, body]
  end

  class << self

    def define
      instance_eval(&Proc.new)
    end

    def tests
      @tests ||= []
      @current = nil
    end

    def describe name
      @tests << {
        :name => name,
        :its  => []
      }
      @current = @tests.last
      yield
    end

    def it name, &blok
      if @current
        @current[:its] << {
          :name => name,
          :blok => blok
        }
      end
    end

  end # === class << self

end # === class Akui ===
