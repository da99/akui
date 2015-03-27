
SCRIPTS = <<-EOF
<script src="/bower_components/jquery/dist/jquery.min.js"></script>
<script src="/bower_components/lodash/lodash.min.js"></script>
<script src="/bower_components/fermata/fermata.js"></script>
<script src="/akui/akui.js"></script>
EOF

Cuba.define do

  on 'akui' do
    run Akui::Middleware
  end

  on get do
    on root do
      res.write <<-EOF.strip
      <html>
        <head><title>Root</title></head>
        <body>
          <div>Root</div>
          <a href="/1">one</a>
          #{ Akui.running? ? SCRIPTS : '<!-- Akui is not running -->'}
       </body>
      </html>
      EOF
    end

    vals = {1=>:one, 2=>:two, 3=>:three, 4=>:root}
    vals.each do |n, k|
      on "#{n}" do
        res.write <<-EOF.strip
        <html>
          <head><title>#{k}</title></head>
          <body>
            <a href="/#{n + 1 == 4 ? '' : n + 1}">#{vals[n+1]}</a>
            #{SCRIPTS}
          </body>
        </html>
        EOF
      end
    end
  end

end # === Cuba.define

Akui.define {

  describe :/, 'Root' do

    it 'has link to: /1', <<-EOF
      var link = $('a[href="/1"]');
      should.equal( link.text(), 'one' );
      link[0].click();
    EOF

  end # === describe

  describe '/1' do
    it 'has link to: /2', <<-EOF
      var link = $('a[href="/2"]');
      should.equal( link.text(), 'two' );
      link[0].click();
    EOF
  end

  describe '/2' do
    it 'has link to: /3', <<-EOF
      var link = $('a[href="/3"]');
      should.equal( link.text(), 'three' );
      link[0].click();
    EOF
  end

  describe '/3' do
    it 'has link to: /', <<-EOF
      var link = $('a[href="/"]');
      should.equal( link.text(), 'root' );
      link[0].click();
    EOF
  end

} # === Akui.define
