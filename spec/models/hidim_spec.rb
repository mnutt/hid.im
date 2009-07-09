require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Hidim do
  describe "valid torrent" do
    before(:each) do
      Hidim.stub!(:save_attached_files).and_return(true)
      Hidim.stub!(:delete_attached_files).and_return(true)

      @valid_attributes = {
        :torrent => File.open("#{RAILS_ROOT}/spec/data/test.torrent")
      }
    end

    it "should create a new instance given valid attributes" do
      Hidim.create!(@valid_attributes)
    end

    it "should have a png" do
      @hidim = Hidim.create!(@valid_attributes)
      @hidim.png.should_not be_nil
    end

    it "should have a token" do
      @hidim = Hidim.create!(@valid_attributes)
      @hidim.token.size.should == 8
    end

    it "should not allow attributes to be set" do
      @hidim = Hidim.create!(@valid_attributes.merge(:featured => true, :token => "foo"))
      @hidim.featured.should_not be_true
      @hidim.token.should_not == "foo"
    end
  end

  describe "invalid torrent" do
    before(:each) do
      Hidim.stub!(:save_attached_files).and_return(true)
      Hidim.stub!(:delete_attached_files).and_return(true)

      @invalid_attributes = {
        :torrent => File.open("#{RAILS_ROOT}/spec/spec.opts")
      }
    end

    it "should not allow a bad torrent to be saved" do
      Hidim.create(@invalid_attributes).should be_new_record
    end

    it "should have an error message stating that the file was not a torrent" do
      @hidim = Hidim.new(@invalid_attributes)
      @hidim.save
      @hidim.errors[:torrent].should =~ /does not appear to be a torrent/
    end
  end

  describe "no torrent" do
    it "should not allow a hidim to be created without a torrent" do
      @hidim = Hidim.new
      @hidim.save.should be_false
      @hidim.errors[:torrent].should =~ /select a file/
    end
  end

  describe "fetching" do
    before(:each) do
      Hidim.stub!(:save_attached_files).and_return(true)
      Hidim.stub!(:delete_attached_files).and_return(true)

      # fixtures/factories not worth it, yet...
      @featured = Hidim.create!(:torrent => File.open("#{RAILS_ROOT}/spec/data/test.torrent"))
      @featured.featured = true; @featured.save!
      @not_featured = Hidim.create!(:torrent => File.open("#{RAILS_ROOT}/spec/data/test.torrent"))
      @stale = Hidim.create!(:torrent => File.open("#{RAILS_ROOT}/spec/data/test.torrent"))
      @stale.created_at = 1.day.ago; @stale.save!
    end
                          
    it "should get featured hidims" do
      Hidim.featured.should == [@featured]
    end

    it "should get non_featured hidims" do
      Hidim.not_featured.should == [@not_featured, @stale]
    end

    it "should get stale hidims" do
      Hidim.not_featured.stale.should == [@stale]
    end

    it "should remove stale hidims" do
      Hidim.clear_stale
      Hidim.all.should == [@featured, @not_featured]
    end
  end
end
