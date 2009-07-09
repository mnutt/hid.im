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

    it "should not allow :featured to be set" do
      @hidim = Hidim.create!(@valid_attributes.merge(:featured => true))
      @hidim.featured.should_not be_true
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
end
