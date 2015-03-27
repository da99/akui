# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

Gem::Specification.new do |spec|
  spec.name          = "akui"
  spec.version       = `cat VERSION`
  spec.authors       = ["da99"]
  spec.email         = ["i-hate-spam-1234567@mailinator.com"]
  spec.summary       = %q{My way of testing browser/client-side code.}
  spec.description   = %q{
    Automate testing code on the browser by using Rack
    middleware to include JS testing code files
    into your rendered HTML.
  }
  spec.homepage      = "https://github.com/da99/akui"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").reject { |file|
    file.index('bin/') == 0 && file != "bin/#{File.basename Dir.pwd}"
  }
  spec.executables   = spec.files.grep("bin/#{spec.name}") { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.required_ruby_version = '>= 2.2.0'

  spec.add_dependency "cuba", "> 3.3"

  spec.add_development_dependency "pry"           , "~> 0.9"
  spec.add_development_dependency "www_app"       , "> 2.0"
  spec.add_development_dependency "bundler"       , "~> 1.5"
  spec.add_development_dependency "bacon"         , "~> 1.0"
  spec.add_development_dependency "Bacon_Colored" , "~> 0.1"
  spec.add_development_dependency "thin" , "> 1.6"
  spec.add_development_dependency "rack-contrib" , "> 0.1"
end
