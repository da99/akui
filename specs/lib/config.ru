
require 'cuba'

Cuba.use Rack::CommonLogger

Cuba.define do

  on get do
    on root do
      res.write <<-EOF.strip
      <html>
        <head><title>Root</title></head>
        <body>
          <div>Root</div>
          <a href="/1">one</a>
       </body>
      </html>
      EOF
    end

    vals = {1=>:one, 2=>:two, 3=>:three}
    vals.each do |n, k|
      on "#{n}" do
        res.write <<-EOF.strip
        <html>
          <head><title>#{k}</title></head>
          <body>
            <a href="/#{n + 1}">#{vals[n+1]}</a>
          </body>
        </html>
        EOF
      end
    end
  end

end # === Cuba.define

run Cuba
