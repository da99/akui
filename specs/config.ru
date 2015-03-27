
require 'cuba'
require 'rack/contrib'
require 'akui'

Cuba.use Rack::CommonLogger

# === From:
# https://github.com/rack/rack-contrib/blob/master/lib/rack/contrib/try_static.rb
class Custom_Try_Static

  def initialize(app, options)
    @app = app
    @try = ['', *options[:try]]
    @static = ::Rack::Static.new(
      lambda { |_| [404, {}, []] },
      options)
  end

  def call(env)
    return @app.call(env) unless %w[GET HEAD].include?(env['REQUEST_METHOD'])
    orig_path = env['PATH_INFO']
    found = nil
    @try.each do |path|
      resp = @static.call(env.merge!({'PATH_INFO' => orig_path + path}))
      break if !(403..405).include?(resp[0]) && found = resp
    end
    found or @app.call(env.merge!('PATH_INFO' => orig_path))
  end

end # === class Custom_Try_Static

Cuba.use Custom_Try_Static, :root => "Public", :urls=>%w[/]

require "./specs/#{ENV['SPEC_FILE']}/spec"
run Cuba
