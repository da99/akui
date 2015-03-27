
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
       </body>
      </html>
      EOF
    end

    vals = {1=>:one, 2=>:two, 3=>:three, 4=>:/}
    vals.each do |n, k|
      on "#{n}" do
        res.write <<-EOF.strip
        <html>
          <head><title>#{k}</title></head>
          <body>
            <a href="/#{n + 1 == 4 ? '/' : n + 1}">#{vals[n+1]}</a>
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
      should_equal( link.text(), 'one' );
      link.click();
    EOF

  end # === describe

  describe '/1' do
    it 'has link to: /2', <<-EOF
      var link = $('a[href="/2"]');
      should_equal( link.text(), 'two' );
      link.click();
    EOF
  end

  describe '/2' do
    it 'has link to: /3', <<-EOF
      var link = $('a[href="/3"]');
      should_equal( link.text(), 'three' );
      link.click();
    EOF
  end

  describe '/3' do
    it 'has link to: /', <<-EOF
      var link = $('a[href="/"]');
      should_equal( link.text(), 'root' );
      link.click();
    EOF
  end

} # === Akui.define
