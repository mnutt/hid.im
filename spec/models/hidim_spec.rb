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
  end
end
