
require 'cuba'
require 'rack/contrib'
require 'akui'

Cuba.use Rack::CommonLogger
# Cuba.use Rack::TryStatic, :root => "Public", :urls=>%w[/]

require "./specs/#{ENV['SPEC_FILE']}/spec"
run Cuba
