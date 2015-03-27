
Akui.define {

  describe 'Root' do

    it 'has link to: /1' do
      js_eval <<-EOF
        var link = $('a[href="/1"]');
        should_equal( link.text(), 'one' );
        link.click();
      EOF
    end

    on '/1' do
      it 'has link to: /2' do
        var link = $('a[href="/2"]');
        should_equal( link.text(), 'two' );
        link.click();
      end
    end

    on '/2' do
      it 'has link to: /3' do
        var link = $('a[href="/3"]');
        should_equal( link.text(), 'three' );
        link.click();
      end
    end

    on '/3' do
      it 'has link to: /' do
        var link = $('a[href="/"]');
        should_equal( link.text(), 'root' );
        link.click();
      end
    end

  end

} # === Akui.define
